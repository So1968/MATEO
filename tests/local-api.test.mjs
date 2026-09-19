import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const ROOT = process.cwd();

function makeHome() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "vogue-marry-test-"));
}

async function waitFor(url, attempts = 40) {
  let lastError;
  for (let index = 0; index < attempts; index += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw lastError || new Error(`Service indisponible : ${url}`);
}

async function withServer(script, port, callback, healthPath = port === 8010 ? "health" : "transcription/health") {
  const home = makeHome();
  const child = spawn(process.execPath, [script], {
    cwd: ROOT,
    env: { ...process.env, HOME: home },
    stdio: ["ignore", "pipe", "pipe"]
  });

  let stderr = "";
  child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });

  try {
    await waitFor(`http://127.0.0.1:${port}/api/${healthPath}`);
    await callback(home);
  } catch (error) {
    if (stderr.trim()) error.message += `\nServeur : ${stderr.trim()}`;
    throw error;
  } finally {
    child.kill("SIGTERM");
    fs.rmSync(home, { recursive: true, force: true });
  }
}

async function withUnifiedServer(callback) {
  const home = makeHome();
  const env = { ...process.env, HOME: home, VOGUE_TRANSCRIPTION_PORT: "8011" };
  const children = [
    spawn(process.execPath, ["backend/transcription-server-v6.js"], {
      cwd: ROOT,
      env,
      stdio: ["ignore", "pipe", "pipe"]
    }),
    spawn(process.execPath, ["backend/server.js"], {
      cwd: ROOT,
      env,
      stdio: ["ignore", "pipe", "pipe"]
    })
  ];

  const stderr = new Map();
  children.forEach((child, index) => {
    stderr.set(index, "");
    child.stderr.on("data", (chunk) => stderr.set(index, `${stderr.get(index)}${chunk.toString()}`));
  });

  try {
    await waitFor("http://127.0.0.1:8010/api/transcription/health");
    await callback(home);
  } catch (error) {
    const details = Array.from(stderr.values()).filter(Boolean).join("\n");
    if (details) error.message += `\nServeurs : ${details}`;
    throw error;
  } finally {
    children.forEach((child) => child.kill("SIGTERM"));
    fs.rmSync(home, { recursive: true, force: true });
  }
}

test("API mémoire : santé locale, CORS local et refus des chemins dangereux", async () => {
  await withServer("backend/server.js", 8010, async () => {
    const health = await fetch("http://127.0.0.1:8010/api/health", {
      headers: { Origin: "http://localhost:5173" }
    });
    assert.equal(health.status, 200);
    assert.equal(health.headers.get("access-control-allow-origin"), "http://localhost:5173");
    const payload = await health.json();
    assert.equal(payload.host, "127.0.0.1");

    const rejectedOrigin = await fetch("http://127.0.0.1:8010/api/health", {
      headers: { Origin: "https://example.invalid" }
    });
    assert.notEqual(rejectedOrigin.status, 200);

    const traversal = await fetch("http://127.0.0.1:8010/api/meetings/read-report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:5173"
      },
      body: JSON.stringify({ projectSlug: "..", meetingDirName: ".." })
    });
    assert.equal(traversal.status, 400);
  });
});

test("API mémoire : crée une escale, rattache un audio et la retrouve", async () => {
  await withServer("backend/server.js", 8010, async () => {
    const requestOptions = {
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:5173"
      }
    };
    const projectResponse = await fetch("http://127.0.0.1:8010/api/projects", {
      method: "POST",
      ...requestOptions,
      body: JSON.stringify({ name: "Projet démo" })
    });
    assert.equal(projectResponse.status, 201);
    const projectPayload = await projectResponse.json();
    assert.equal(projectPayload.project.slug, "projet_demo");
    assert.equal("path" in projectPayload.project, false);

    const meetingResponse = await fetch("http://127.0.0.1:8010/api/meetings/export", {
      method: "POST",
      ...requestOptions,
      body: JSON.stringify({
        projectName: "Projet démo",
        meetingDate: "2026-09-19",
        meetingType: "réunion",
        title: "Réunion test",
        participants: "Sofia, Pierre",
        context: "Test de rattachement",
        rawNotes: "décision à confirmer"
      })
    });
    assert.equal(meetingResponse.status, 201);
    const meetingPayload = await meetingResponse.json();
    assert.match(meetingPayload.meetingDirName, /^2026-09-19_reunion_reunion_test$/u);

    const audioForm = new FormData();
    audioForm.append("projectName", "Projet démo");
    audioForm.append("meetingDirName", meetingPayload.meetingDirName);
    audioForm.append("audio", new Blob(["audio-test"], { type: "audio/webm" }), "reunion.webm");
    const audioResponse = await fetch("http://127.0.0.1:8010/api/meetings/export-audio", {
      method: "POST",
      headers: { Origin: "http://localhost:5173" },
      body: audioForm
    });
    assert.equal(audioResponse.status, 201);

    const inboxResponse = await fetch("http://127.0.0.1:8010/api/inbox", {
      headers: { Origin: "http://localhost:5173" }
    });
    assert.equal(inboxResponse.status, 200);
    const inbox = await inboxResponse.json();
    assert.equal(inbox.items.length, 1);
    assert.equal(inbox.items[0].status, "Journal de bord à valider");
    assert.equal(inbox.items[0].hasAudio, true);
    assert.equal("path" in inbox.items[0], false);

    const reportResponse = await fetch("http://127.0.0.1:8010/api/meetings/read-report", {
      method: "POST",
      ...requestOptions,
      body: JSON.stringify({ projectSlug: "projet_demo", meetingDirName: meetingPayload.meetingDirName })
    });
    assert.equal(reportResponse.status, 200);
    const report = await reportResponse.json();
    assert.match(report.content, /Réunion test/u);

    const searchResponse = await fetch("http://127.0.0.1:8010/api/search?q=décision", {
      headers: { Origin: "http://localhost:5173" }
    });
    assert.equal(searchResponse.status, 200);
    const search = await searchResponse.json();
    assert.ok(search.count >= 1);
    assert.equal("filePath" in search.results[0], false);

    const validateResponse = await fetch("http://127.0.0.1:8010/api/meetings/validate", {
      method: "POST",
      ...requestOptions,
      body: JSON.stringify({ projectSlug: "projet_demo", meetingDirName: meetingPayload.meetingDirName })
    });
    assert.equal(validateResponse.status, 201);
  });
});

test("API Coffre : propose puis valide le classement d’un document local", async () => {
  await withServer("backend/server.js", 8010, async (home) => {
    const requestOptions = {
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:5173"
      }
    };
    const projectResponse = await fetch("http://127.0.0.1:8010/api/projects", {
      method: "POST",
      ...requestOptions,
      body: JSON.stringify({ name: "Projet coffre" })
    });
    assert.equal(projectResponse.status, 201);

    const form = new FormData();
    form.append("document", new Blob(["Décision validée à conserver"], { type: "text/plain" }), "decision.txt");
    const depositResponse = await fetch("http://127.0.0.1:8010/api/water-seven/deposit", {
      method: "POST",
      headers: { Origin: "http://localhost:5173" },
      body: form
    });
    assert.equal(depositResponse.status, 201);
    const depositPayload = await depositResponse.json();

    const pendingResponse = await fetch("http://127.0.0.1:8010/api/documents", {
      headers: { Origin: "http://localhost:5173" }
    });
    assert.equal(pendingResponse.status, 200);
    const pendingPayload = await pendingResponse.json();
    assert.equal(pendingPayload.pendingCount, 1);
    assert.equal(pendingPayload.documents[0].source, "Water Seven");
    assert.equal(pendingPayload.documents[0].reviewStatus, "à valider");
    assert.equal("filePath" in pendingPayload.documents[0], false);
    assert.equal(path.isAbsolute(pendingPayload.documents[0].relativePath), false);

    const validateResponse = await fetch("http://127.0.0.1:8010/api/documents/validate", {
      method: "POST",
      ...requestOptions,
      body: JSON.stringify({ sourceId: depositPayload.deposit.id, projectSlug: "projet_coffre" })
    });
    assert.equal(validateResponse.status, 201);
    const validatedPayload = await validateResponse.json();
    assert.equal(validatedPayload.document.projectSlug, "projet_coffre");
    assert.equal(validatedPayload.document.source, "Coffre");

    const targetPath = path.join(
      home,
      "VOGUE-MERRY-DONNEES",
      "01_PROJETS",
      "projet_coffre",
      "08_coffre_documents_sources",
      "decision.txt"
    );
    assert.equal(fs.existsSync(targetPath), true);

    const storedResponse = await fetch("http://127.0.0.1:8010/api/documents?projectSlug=projet_coffre", {
      headers: { Origin: "http://localhost:5173" }
    });
    const storedPayload = await storedResponse.json();
    assert.equal(storedPayload.pendingCount, 0);
    assert.equal(storedPayload.documents[0].reviewStatus, "classé");
    assert.equal(storedPayload.documents[0].relativePath, "01_PROJETS/projet_coffre/08_coffre_documents_sources/decision.txt");
  });
});

test("API mémoire : extrait puis valide actions et décisions des journaux", async () => {
  await withServer("backend/server.js", 8010, async (home) => {
    const requestOptions = {
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:5173"
      }
    };
    const projectResponse = await fetch("http://127.0.0.1:8010/api/projects", {
      method: "POST",
      ...requestOptions,
      body: JSON.stringify({ name: "Projet connaissance" })
    });
    assert.equal(projectResponse.status, 201);

    const meetingResponse = await fetch("http://127.0.0.1:8010/api/meetings/export", {
      method: "POST",
      ...requestOptions,
      body: JSON.stringify({
        projectName: "Projet connaissance",
        meetingDate: "2026-09-19",
        meetingType: "réunion",
        title: "Décisions et actions",
        decisions: "| Date | Cap validé / décision | Statut | Source | Impact |\n|---|---|---|---|---|\n| 2026-09-19 | Utiliser la mémoire locale | Acté | Réunion | Moins de doublons |",
        actions: "- Préparer la courte transcription locale\n- Vérifier le classement du Coffre",
        rawNotes: "[]"
      })
    });
    assert.equal(meetingResponse.status, 201);
    const meetingPayload = await meetingResponse.json();

    const beforeValidation = await fetch("http://127.0.0.1:8010/api/knowledge/action?projectSlug=projet_connaissance", {
      headers: { Origin: "http://localhost:5173" }
    });
    assert.equal(beforeValidation.status, 200);
    assert.equal((await beforeValidation.json()).count, 0);

    const journalValidation = await fetch("http://127.0.0.1:8010/api/meetings/validate", {
      method: "POST",
      ...requestOptions,
      body: JSON.stringify({ projectSlug: "projet_connaissance", meetingDirName: meetingPayload.meetingDirName })
    });
    assert.equal(journalValidation.status, 201);

    const actionsResponse = await fetch("http://127.0.0.1:8010/api/knowledge/action?projectSlug=projet_connaissance", {
      headers: { Origin: "http://localhost:5173" }
    });
    const actionsPayload = await actionsResponse.json();
    assert.equal(actionsPayload.pendingCount, 2);
    assert.equal(actionsPayload.items[0].reviewStatus, "à valider");
    assert.equal(actionsPayload.items[0].projectSlug, "projet_connaissance");

    const decisionsResponse = await fetch("http://127.0.0.1:8010/api/knowledge/decision?projectSlug=projet_connaissance", {
      headers: { Origin: "http://localhost:5173" }
    });
    const decisionsPayload = await decisionsResponse.json();
    assert.equal(decisionsPayload.pendingCount, 1);
    assert.equal(decisionsPayload.items[0].decision, "Utiliser la mémoire locale");

    const actionToValidate = actionsPayload.items.find((item) => item.action === "Préparer la courte transcription locale");
    const actionValidation = await fetch("http://127.0.0.1:8010/api/knowledge/action/validate", {
      method: "POST",
      ...requestOptions,
      body: JSON.stringify({
        itemId: actionToValidate.id,
        projectSlug: "projet_connaissance",
        item: {
          action: actionToValidate.action,
          responsable: "Sofia",
          echeance: "2026-09-20",
          statut: "À faire"
        }
      })
    });
    assert.equal(actionValidation.status, 201);

    const decisionToValidate = decisionsPayload.items[0];
    const decisionValidation = await fetch("http://127.0.0.1:8010/api/knowledge/decision/validate", {
      method: "POST",
      ...requestOptions,
      body: JSON.stringify({
        itemId: decisionToValidate.id,
        projectSlug: "projet_connaissance",
        item: {
          decision: decisionToValidate.decision,
          date: decisionToValidate.date,
          statut: "Validé",
          impact: decisionToValidate.impact
        }
      })
    });
    assert.equal(decisionValidation.status, 201);

    const storedActions = JSON.parse(fs.readFileSync(path.join(
      home,
      "VOGUE-MERRY-DONNEES",
      "01_PROJETS",
      "projet_connaissance",
      "03_manoeuvres_actions",
      "manoeuvres_actions.json"
    ), "utf8"));
    const storedDecisions = JSON.parse(fs.readFileSync(path.join(
      home,
      "VOGUE-MERRY-DONNEES",
      "01_PROJETS",
      "projet_connaissance",
      "02_caps_valides_decisions",
      "caps_valides.json"
    ), "utf8"));
    assert.equal(storedActions[0].responsable, "Sofia");
    assert.equal(storedDecisions[0].statut, "Validé");
  });
});

test("API unifiée : expose la transcription locale sur 8010", async () => {
  await withUnifiedServer(async () => {
    const response = await fetch("http://127.0.0.1:8010/api/transcription/health", {
      headers: { Origin: "http://127.0.0.1:5173" }
    });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("access-control-allow-origin"), "http://127.0.0.1:5173");
    const payload = await response.json();
    assert.equal(payload.host, "127.0.0.1");
    assert.equal(payload.version, 6);
    assert.equal(payload.paidSpeakerDiarization, false);
  });
});

test("API unifiée : confirme que les interlocuteurs passent par 8010", async () => {
  await withUnifiedServer(async () => {
    const response = await fetch("http://127.0.0.1:8010/api/transcription/job-inexistant/speakers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:5173"
      },
      body: JSON.stringify({ mapping: { SPEAKER_00: "Test" } })
    });
    assert.equal(response.status, 404);
    assert.equal(response.headers.get("access-control-allow-origin"), "http://localhost:5173");
  });
});

test("API unifiée : confirme et persiste une correspondance", async () => {
  await withUnifiedServer(async (home) => {
    const meetingId = "projet-demo/2026-09-19_escale_reunion";
    const meetingDir = path.join(
      home,
      "VOGUE-MERRY-DONNEES",
      "01_PROJETS",
      "projet-demo",
      "01_escales_reunions",
      "2026-09-19_escale_reunion"
    );
    const jobDir = path.join(home, "VOGUE-MERRY-DONNEES", "99_TRANSCRIPTION_TESTS", "job-fixture");
    fs.mkdirSync(meetingDir, { recursive: true });
    fs.mkdirSync(jobDir, { recursive: true });
    fs.writeFileSync(path.join(meetingDir, "donnees_escale.json"), JSON.stringify({
      projectName: "Projet démo",
      rawNotes: "Notes prises pendant la réunion"
    }));
    fs.writeFileSync(path.join(meetingDir, "journal_de_bord_exporte.md"), "# Journal de bord — Réunion de démonstration\n\nNotes initiales.\n", "utf8");
    fs.writeFileSync(path.join(jobDir, "status.json"), JSON.stringify({
      jobId: "job-fixture",
      state: "done",
      meetingId
    }));
    fs.writeFileSync(path.join(jobDir, "transcription.json"), JSON.stringify({
      jobId: "job-fixture",
      originalName: "reunion.wav",
      meeting: { id: meetingId, title: "Réunion de démonstration" },
      participants: ["Sofia", "Pierre"],
      segments: [
        {
          sourceSpeaker: "SPEAKER_00",
          speaker: "Intervenant 1",
          speakerConfidence: "non-identifie",
          start: 0,
          text: "Bonjour."
        },
        {
          sourceSpeaker: "SPEAKER_01",
          speaker: "Intervenant 2",
          speakerConfidence: "non-identifie",
          start: 2,
          text: "Bonjour."
        }
      ],
      unresolvedSpeakers: ["Intervenant 1", "Intervenant 2"]
    }));

    const response = await fetch("http://127.0.0.1:8010/api/transcription/job-fixture/speakers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:5173"
      },
      body: JSON.stringify({
        mapping: {
          SPEAKER_00: "Sofia",
          SPEAKER_01: "Nom qui ne fait pas partie des participants"
        }
      })
    });

    assert.equal(response.status, 200);
    assert.equal(response.headers.get("access-control-allow-origin"), "http://localhost:5173");
    const payload = await response.json();
    assert.equal(payload.persistedToMeeting, true);
    assert.deepEqual(payload.mapping, { SPEAKER_00: "Sofia" });
    assert.equal(payload.result.segments[0].speaker, "Sofia");
    assert.equal(payload.result.segments[0].speakerConfidence, "confirme-manuel");
    assert.deepEqual(payload.result.unresolvedSpeakers, ["Intervenant 2"]);

    const meetingData = JSON.parse(fs.readFileSync(path.join(meetingDir, "donnees_escale.json"), "utf8"));
    assert.deepEqual(meetingData.transcriptionSpeakerConfirmations["job-fixture"].mapping, { SPEAKER_00: "Sofia" });
    assert.equal(meetingData.transcription.status, "terminee");
    assert.equal(fs.existsSync(path.join(meetingDir, "transcription_v6.json")), true);
    assert.match(fs.readFileSync(path.join(meetingDir, "journal_de_bord_exporte.md"), "utf8"), /Transcription automatique V6/u);

    const inboxResponse = await fetch("http://127.0.0.1:8010/api/inbox", {
      headers: { Origin: "http://localhost:5173" }
    });
    assert.equal(inboxResponse.status, 200);
    const inbox = await inboxResponse.json();
    const meeting = inbox.items.find((item) => item.meetingDirName === "2026-09-19_escale_reunion");
    assert.equal(meeting.hasTranscription, true);
    assert.equal(meeting.status, "Transcription à relire");
  });
});
