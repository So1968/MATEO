import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";
import os from "os";
import { randomUUID } from "crypto";
import { spawn } from "child_process";

const app = express();
const PORT = Number(process.env.VOGUE_TRANSCRIPTION_PORT || 8011);
const HOME = os.homedir();
const ROOT = path.join(HOME, "VOGUE-MERRY-DONNEES", "99_TRANSCRIPTION_TESTS");
const CONFIG_DIR = path.join(HOME, ".config", "vogue-merry");
const KEY_FILE = path.join(CONFIG_DIR, "openai_api_key");
const CHUNK_SECONDS = 600;

fs.mkdirSync(ROOT, { recursive: true });
fs.mkdirSync(CONFIG_DIR, { recursive: true });

app.use(cors());
app.use(express.json({ limit: "1mb" }));

function safeName(value) {
  return String(value || "audio")
    .replace(/[\\/]/g, "_")
    .replace(/[^a-zA-Z0-9._ -]/g, "_")
    .slice(0, 160);
}

function timestamp() {
  return new Date().toISOString();
}

function jobDir(jobId) {
  return path.join(ROOT, jobId);
}

function statusPath(jobId) {
  return path.join(jobDir(jobId), "status.json");
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2), "utf8");
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeStatus(jobId, patch) {
  const filePath = statusPath(jobId);
  const previous = fs.existsSync(filePath) ? readJson(filePath) : {};
  const next = { ...previous, ...patch, jobId, updatedAt: timestamp() };
  writeJson(filePath, next);
  return next;
}

function readApiKey() {
  if (process.env.OPENAI_API_KEY?.trim()) return process.env.OPENAI_API_KEY.trim();
  if (fs.existsSync(KEY_FILE)) return fs.readFileSync(KEY_FILE, "utf8").trim();
  return "";
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (data) => { stdout += data.toString(); });
    child.stderr.on("data", (data) => { stderr += data.toString(); });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(`${command} a échoué (${code}). ${stderr.slice(-1200)}`));
    });
  });
}

async function mediaDuration(filePath) {
  const { stdout } = await run("ffprobe", [
    "-v", "error",
    "-show_entries", "format=duration",
    "-of", "default=noprint_wrappers=1:nokey=1",
    filePath
  ]);
  const seconds = Number(stdout.trim());
  if (!Number.isFinite(seconds)) throw new Error("Durée audio illisible.");
  return seconds;
}

async function splitAudio(sourcePath, chunksDir) {
  fs.mkdirSync(chunksDir, { recursive: true });
  const pattern = path.join(chunksDir, "chunk_%03d.mp3");
  await run("ffmpeg", [
    "-y",
    "-i", sourcePath,
    "-vn",
    "-ac", "1",
    "-ar", "16000",
    "-b:a", "48k",
    "-f", "segment",
    "-segment_time", String(CHUNK_SECONDS),
    "-reset_timestamps", "1",
    pattern
  ]);

  return fs.readdirSync(chunksDir)
    .filter((name) => /^chunk_\d+\.mp3$/.test(name))
    .sort()
    .map((name) => path.join(chunksDir, name));
}

async function transcribeChunk(filePath, apiKey) {
  const buffer = fs.readFileSync(filePath);
  const form = new FormData();
  form.append("file", new Blob([buffer], { type: "audio/mpeg" }), path.basename(filePath));
  form.append("model", "gpt-4o-transcribe-diarize");
  form.append("response_format", "diarized_json");
  form.append("chunking_strategy", "auto");
  form.append("language", "fr");

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form
  });

  const bodyText = await response.text();
  let payload;
  try {
    payload = JSON.parse(bodyText);
  } catch {
    throw new Error(`Réponse de transcription illisible (${response.status}).`);
  }

  if (!response.ok) {
    const message = payload?.error?.message || `Erreur API de transcription (${response.status}).`;
    throw new Error(message);
  }

  return payload;
}

function formatClock(totalSeconds) {
  const value = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  const seconds = value % 60;
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
}

function buildMarkdown(meta, segments) {
  const lines = [
    "# Transcription — Vogue Marry",
    "",
    `- Fichier : ${meta.originalName}`,
    `- Durée : ${formatClock(meta.duration)}`,
    `- Générée : ${new Date().toLocaleString("fr-FR")}`,
    `- Segments : ${segments.length}`,
    "",
    "## Transcription",
    ""
  ];

  for (const segment of segments) {
    lines.push(`[${formatClock(segment.start)}] Intervenant ${segment.speaker || "?"} — ${String(segment.text || "").trim()}`);
    lines.push("");
  }

  return `${lines.join("\n").trim()}\n`;
}

async function processJob(jobId, sourcePath, originalName) {
  try {
    const apiKey = readApiKey();
    if (!apiKey) {
      throw new Error("Clé API de transcription absente. Ouvrez la page de test Vogue Marry et enregistrez une clé API une seule fois.");
    }

    writeStatus(jobId, { state: "preparing", message: "Préparation de l’audio…", progress: 2 });
    const duration = await mediaDuration(sourcePath);
    const chunksDir = path.join(jobDir(jobId), "chunks");
    const chunks = await splitAudio(sourcePath, chunksDir);
    if (!chunks.length) throw new Error("Aucun segment audio n’a été créé.");

    writeStatus(jobId, {
      state: "transcribing",
      message: `Transcription de ${chunks.length} segment(s)…`,
      progress: 8,
      duration,
      chunkCount: chunks.length
    });

    const mergedSegments = [];
    const chunkResults = [];
    let offset = 0;

    for (let index = 0; index < chunks.length; index += 1) {
      const chunkPath = chunks[index];
      writeStatus(jobId, {
        state: "transcribing",
        message: `Segment ${index + 1}/${chunks.length} en cours…`,
        currentChunk: index + 1,
        progress: Math.round(8 + (index / chunks.length) * 82)
      });

      const result = await transcribeChunk(chunkPath, apiKey);
      const chunkDuration = Number(result.duration) || await mediaDuration(chunkPath);
      const segments = Array.isArray(result.segments) ? result.segments : [];

      for (const segment of segments) {
        mergedSegments.push({
          id: `${index}-${segment.id || mergedSegments.length}`,
          start: offset + Number(segment.start || 0),
          end: offset + Number(segment.end || segment.start || 0),
          speaker: segment.speaker || "?",
          text: String(segment.text || "").trim()
        });
      }

      chunkResults.push({
        index,
        duration: chunkDuration,
        text: result.text || "",
        segments
      });
      writeJson(path.join(jobDir(jobId), `transcription_chunk_${String(index).padStart(3, "0")}.json`), result);
      offset += chunkDuration;
    }

    const result = {
      jobId,
      originalName,
      duration,
      createdAt: timestamp(),
      model: "gpt-4o-transcribe-diarize",
      segments: mergedSegments,
      text: mergedSegments.map((segment) => segment.text).filter(Boolean).join(" "),
      chunks: chunkResults.map(({ index, duration: chunkDuration }) => ({ index, duration: chunkDuration }))
    };

    writeJson(path.join(jobDir(jobId), "transcription.json"), result);
    fs.writeFileSync(
      path.join(jobDir(jobId), "transcription.md"),
      buildMarkdown({ originalName, duration }, mergedSegments),
      "utf8"
    );

    writeStatus(jobId, {
      state: "done",
      message: "Transcription terminée.",
      progress: 100,
      duration,
      segmentCount: mergedSegments.length,
      resultReady: true
    });
  } catch (error) {
    writeStatus(jobId, {
      state: "error",
      message: error.message || "Échec de la transcription.",
      progress: 0
    });
  }
}

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      const tempDir = path.join(ROOT, "_uploads");
      fs.mkdirSync(tempDir, { recursive: true });
      cb(null, tempDir);
    },
    filename(req, file, cb) {
      cb(null, `${Date.now()}_${randomUUID()}_${safeName(file.originalname)}`);
    }
  }),
  limits: { fileSize: 1024 * 1024 * 1024 }
});

app.get("/api/transcription/health", async (req, res) => {
  let ffmpeg = false;
  try {
    await run("ffmpeg", ["-version"]);
    ffmpeg = true;
  } catch {
    ffmpeg = false;
  }

  res.json({
    status: "ok",
    service: "vogue-marry-transcription",
    apiKeyConfigured: Boolean(readApiKey()),
    ffmpeg,
    port: PORT
  });
});

app.post("/api/transcription/config", (req, res) => {
  const apiKey = String(req.body?.apiKey || "").trim();
  if (!apiKey.startsWith("sk-")) {
    return res.status(400).json({ error: "La clé API ne semble pas valide." });
  }

  fs.writeFileSync(KEY_FILE, `${apiKey}\n`, { encoding: "utf8", mode: 0o600 });
  fs.chmodSync(KEY_FILE, 0o600);
  return res.json({ status: "ok", apiKeyConfigured: true });
});

app.post("/api/transcription", upload.single("audio"), (req, res) => {
  try {
    if (!req.file) throw new Error("Aucun enregistrement reçu.");
    const jobId = `${new Date().toISOString().replace(/[:.]/g, "-")}_${randomUUID().slice(0, 8)}`;
    const dir = jobDir(jobId);
    fs.mkdirSync(dir, { recursive: true });

    const extension = path.extname(req.file.originalname || "") || ".audio";
    const sourcePath = path.join(dir, `audio_original${extension}`);
    fs.renameSync(req.file.path, sourcePath);

    writeStatus(jobId, {
      state: "queued",
      message: "Enregistrement reçu.",
      progress: 0,
      originalName: req.file.originalname,
      size: req.file.size,
      createdAt: timestamp()
    });

    setImmediate(() => processJob(jobId, sourcePath, req.file.originalname));
    res.status(202).json({ status: "accepted", jobId });
  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(400).json({ error: error.message || "Impossible de recevoir l’audio." });
  }
});

app.get("/api/transcription/:jobId", (req, res) => {
  try {
    const filePath = statusPath(req.params.jobId);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: "Transcription inconnue." });
    return res.json(readJson(filePath));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get("/api/transcription/:jobId/result", (req, res) => {
  const filePath = path.join(jobDir(req.params.jobId), "transcription.json");
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: "Résultat pas encore disponible." });
  return res.json(readJson(filePath));
});

app.get("/api/transcription/:jobId/download", (req, res) => {
  const filePath = path.join(jobDir(req.params.jobId), "transcription.md");
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: "Résultat pas encore disponible." });
  return res.download(filePath, "transcription-vogue-marry.md");
});

app.listen(PORT, () => {
  console.log(`Vogue Marry — transcription : http://localhost:${PORT}`);
});
