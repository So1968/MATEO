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

async function withServer(script, port, callback) {
  const home = makeHome();
  const child = spawn(process.execPath, [script], {
    cwd: ROOT,
    env: { ...process.env, HOME: home },
    stdio: ["ignore", "pipe", "pipe"]
  });

  let stderr = "";
  child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });

  try {
    await waitFor(`http://127.0.0.1:${port}/api/${port === 8010 ? "health" : port === 8011 ? "transcription/health" : "speaker-sync/health"}`);
    await callback(home);
  } catch (error) {
    if (stderr.trim()) error.message += `\nServeur : ${stderr.trim()}`;
    throw error;
  } finally {
    child.kill("SIGTERM");
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

test("API transcription : démarre sans secret et annonce son mode local", async () => {
  await withServer("backend/transcription-server-v6.js", 8011, async () => {
    const response = await fetch("http://127.0.0.1:8011/api/transcription/health", {
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

test("API interlocuteurs : est intégrée au moteur de transcription", async () => {
  await withServer("backend/transcription-server-v6.js", 8011, async () => {
    const response = await fetch("http://127.0.0.1:8011/api/transcription/job-inexistant/speakers", {
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
