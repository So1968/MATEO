import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import os from "os";

const app = express();
const PORT = Number(process.env.VOGUE_SPEAKER_SYNC_PORT || 8012);
const HOME = os.homedir();
const DATA_ROOT = path.join(HOME, "VOGUE-MERRY-DONNEES");
const JOBS_ROOT = path.join(DATA_ROOT, "99_TRANSCRIPTION_TESTS");
const PROJECTS_ROOT = path.join(DATA_ROOT, "01_PROJETS");

app.use(cors());
app.use(express.json({ limit: "256kb" }));

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readJsonIfExists(filePath) {
  try {
    return fs.existsSync(filePath) ? readJson(filePath) : null;
  } catch {
    return null;
  }
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2), "utf8");
}

function formatClock(totalSeconds) {
  const value = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  const seconds = value % 60;
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
}

function safeJobDir(jobId) {
  if (!/^[A-Za-z0-9._-]+$/.test(jobId)) return null;
  const resolved = path.resolve(JOBS_ROOT, jobId);
  const root = path.resolve(JOBS_ROOT) + path.sep;
  return resolved.startsWith(root) ? resolved : null;
}

function meetingDataPath(meetingId) {
  const value = String(meetingId || "");
  const slash = value.indexOf("/");
  if (slash <= 0 || slash === value.length - 1) return null;
  const projectSlug = value.slice(0, slash);
  const meetingDir = value.slice(slash + 1);
  if (!/^[A-Za-z0-9._-]+$/.test(projectSlug) || !/^[A-Za-z0-9._-]+$/.test(meetingDir)) return null;
  const resolved = path.resolve(PROJECTS_ROOT, projectSlug, "01_escales_reunions", meetingDir, "donnees_escale.json");
  const root = path.resolve(PROJECTS_ROOT) + path.sep;
  return resolved.startsWith(root) ? resolved : null;
}

function cleanMapping(mapping, participants) {
  if (!mapping || typeof mapping !== "object" || Array.isArray(mapping)) return {};
  const allowed = new Set((participants || []).map((name) => String(name || "").trim()).filter(Boolean));
  const clean = {};
  for (const [sourceSpeaker, rawName] of Object.entries(mapping)) {
    const speaker = String(sourceSpeaker || "").trim();
    const name = String(rawName || "").trim();
    if (!speaker || !name) continue;
    if (allowed.size && !allowed.has(name)) continue;
    clean[speaker] = name;
  }
  return clean;
}

function buildCorrectedMarkdown(result) {
  const lines = [
    "# Transcription — Vogue Marry",
    "",
    `- Fichier : ${result.originalName || ""}`,
    result.duration ? `- Durée : ${formatClock(result.duration)}` : null,
    result.meeting?.title ? `- Escale : ${result.meeting.title}` : null,
    result.participants?.length ? `- Participants : ${result.participants.join(", ")}` : null,
    result.mode === "high" ? "- Mode : Dossier sensible · vérifié" : "- Mode : Local renforcé · gratuit",
    result.mode === "high" && Number.isFinite(Number(result.verification?.estimatedCostUsd))
      ? `- Coût API estimé : ${Number(result.verification.estimatedCostUsd).toFixed(2)} $`
      : "- Coût API : 0 $",
    result.speakerConfirmationsUpdatedAt ? `- Interlocuteurs confirmés : ${result.speakerConfirmationsUpdatedAt}` : null,
    result.warnings?.length ? `- Avertissements : ${result.warnings.join(" | ")}` : null,
    "",
    "## Transcription",
    ""
  ].filter(Boolean);

  for (const segment of result.segments || []) {
    lines.push(`[${formatClock(segment.start)}] ${segment.speaker || "Intervenant"} — ${segment.text || ""}`);
    lines.push("");
  }

  if (result.unresolvedSpeakers?.length) {
    lines.push("## Interlocuteurs restant à confirmer", "");
    for (const speaker of result.unresolvedSpeakers) lines.push(`- ${speaker}`);
    lines.push("");
  }

  if (result.verification?.reviewChunks?.length) {
    lines.push("## Passages à vérifier sur l'audio", "");
    for (const chunk of result.verification.reviewChunks) {
      lines.push(`- ${formatClock(chunk.start)} → ${formatClock(chunk.end)} · concordance locale/GPT ${Math.round((Number(chunk.similarity) || 0) * 100)} %`);
    }
    lines.push("");
  }

  return `${lines.join("\n").trim()}\n`;
}

function persistToMeeting(result, status, mapping, updatedAt) {
  const meetingId = result.meeting?.id || status?.meetingId || "";
  const dataPath = meetingDataPath(meetingId);
  if (!dataPath || !fs.existsSync(dataPath)) return false;

  const data = readJsonIfExists(dataPath) || {};
  const confirmations = data.transcriptionSpeakerConfirmations && typeof data.transcriptionSpeakerConfirmations === "object"
    ? data.transcriptionSpeakerConfirmations
    : {};

  confirmations[result.jobId] = {
    updatedAt,
    originalName: result.originalName || "",
    mapping
  };

  data.transcriptionSpeakerConfirmations = confirmations;
  writeJson(dataPath, data);
  return true;
}

app.get("/api/speaker-sync/health", (req, res) => {
  res.json({ status: "ok", service: "vogue-marry-speaker-sync", port: PORT });
});

app.post("/api/transcription/:jobId/speakers", (req, res) => {
  try {
    const dir = safeJobDir(req.params.jobId);
    if (!dir) return res.status(400).json({ error: "Identifiant de transcription invalide." });

    const resultPath = path.join(dir, "transcription.json");
    const statusPath = path.join(dir, "status.json");
    if (!fs.existsSync(resultPath)) return res.status(404).json({ error: "Transcription introuvable ou inachevée." });

    const result = readJson(resultPath);
    const status = readJsonIfExists(statusPath) || {};
    const mapping = cleanMapping(req.body?.mapping, result.participants || []);
    if (!Object.keys(mapping).length) return res.status(400).json({ error: "Aucune correspondance d'interlocuteur valide." });

    const updatedAt = new Date().toISOString();
    const mergedOverrides = { ...(result.speakerOverrides || {}), ...mapping };

    result.segments = (result.segments || []).map((segment) => {
      const confirmed = mergedOverrides[segment.sourceSpeaker];
      return confirmed
        ? { ...segment, speaker: confirmed, speakerConfidence: "confirme-manuel" }
        : segment;
    });
    result.speakerOverrides = mergedOverrides;
    result.unresolvedSpeakers = Array.from(new Set(
      result.segments
        .filter((segment) => segment.speakerConfidence === "non-identifie")
        .map((segment) => segment.speaker)
        .filter(Boolean)
    ));
    result.speakerConfirmationsUpdatedAt = updatedAt;
    result.text = result.segments.map((segment) => `${segment.speaker || "Intervenant"} — ${segment.text || ""}`).join("\n");

    writeJson(resultPath, result);
    fs.writeFileSync(path.join(dir, "transcription.md"), buildCorrectedMarkdown(result), "utf8");

    const persistedToMeeting = persistToMeeting(result, status, mergedOverrides, updatedAt);
    writeJson(statusPath, {
      ...status,
      jobId: result.jobId,
      speakerConfirmationsUpdatedAt: updatedAt,
      speakerConfirmationsPersistedToMeeting: persistedToMeeting,
      updatedAt
    });

    return res.json({
      status: "ok",
      persistedToMeeting,
      mapping: mergedOverrides,
      unresolvedSpeakers: result.unresolvedSpeakers,
      result
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Impossible d'enregistrer les interlocuteurs." });
  }
});

app.listen(PORT, () => {
  console.log(`Vogue Marry — confirmation des interlocuteurs : http://localhost:${PORT}`);
});
