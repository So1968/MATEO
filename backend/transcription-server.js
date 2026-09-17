import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";
import os from "os";
import { randomUUID } from "crypto";
import { spawn } from "child_process";
import { fileURLToPath } from "url";

const app = express();
const PORT = Number(process.env.VOGUE_TRANSCRIPTION_PORT || 8011);
const HOME = os.homedir();
const ROOT = path.join(HOME, "VOGUE-MERRY-DONNEES", "99_TRANSCRIPTION_TESTS");
const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LOCAL_PYTHON = path.join(PROJECT_ROOT, ".venv-transcription", "bin", "python");
const LOCAL_SCRIPT = path.join(PROJECT_ROOT, "backend", "local_transcribe.py");
const LOCAL_MODEL = process.env.VOGUE_WHISPER_MODEL || "small";
const REMOTE_MODEL = "gpt-4o-transcribe-diarize";
const CONFIG_DIR = path.join(HOME, ".config", "vogue-merry");
const API_KEY_FILE = path.join(CONFIG_DIR, "openai_api_key");

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

function formatClock(totalSeconds) {
  const value = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  const seconds = value % 60;
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
}

function apiKey() {
  if (process.env.OPENAI_API_KEY?.trim()) return process.env.OPENAI_API_KEY.trim();
  if (!fs.existsSync(API_KEY_FILE)) return "";
  return fs.readFileSync(API_KEY_FILE, "utf8").trim();
}

function buildMarkdown(meta, segments) {
  const engineLabel = meta.mode === "high"
    ? `Haute précision API (${meta.model})`
    : `Whisper local (${meta.model})`;

  const lines = [
    "# Transcription — Vogue Marry",
    "",
    `- Fichier : ${meta.originalName}`,
    `- Durée : ${formatClock(meta.duration)}`,
    `- Moteur : ${engineLabel}`,
    `- Générée : ${new Date().toLocaleString("fr-FR")}`,
    "",
    "## Transcription",
    ""
  ];

  for (const segment of segments) {
    const speaker = segment.speaker ? ` Intervenant ${segment.speaker} —` : "";
    lines.push(`[${formatClock(segment.start)}]${speaker} ${String(segment.text || "").trim()}`);
    lines.push("");
  }

  return `${lines.join("\n").trim()}\n`;
}

function localEngineReady() {
  return fs.existsSync(LOCAL_PYTHON) && fs.existsSync(LOCAL_SCRIPT);
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
      else reject(new Error(`${command} a échoué (${code}). ${stderr.slice(-1500)}`));
    });
  });
}

async function mediaDuration(filePath) {
  try {
    const { stdout } = await run("ffprobe", [
      "-v", "error",
      "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1",
      filePath
    ]);
    const duration = Number(stdout.trim());
    return Number.isFinite(duration) ? duration : 0;
  } catch {
    return 0;
  }
}

async function compressForApi(sourcePath, destinationPath) {
  await run("ffmpeg", [
    "-y",
    "-i", sourcePath,
    "-vn",
    "-ac", "1",
    "-ar", "16000",
    "-b:a", "32k",
    destinationPath
  ]);
}

async function processLocalJob(jobId, sourcePath, originalName) {
  if (!localEngineReady()) {
    writeStatus(jobId, {
      state: "error",
      message: "Le moteur local n’est pas encore installé. Lance : npm run transcription:setup",
      progress: 0
    });
    return;
  }

  const segments = [];
  let duration = 0;
  let stderr = "";

  writeStatus(jobId, {
    state: "preparing",
    message: `Chargement de Whisper local (${LOCAL_MODEL})…`,
    progress: 2,
    model: LOCAL_MODEL,
    engine: "local"
  });

  const child = spawn(LOCAL_PYTHON, [
    LOCAL_SCRIPT,
    sourcePath,
    "--model", LOCAL_MODEL,
    "--language", "fr"
  ], {
    cwd: PROJECT_ROOT,
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"]
  });

  let buffer = "";

  function handleLine(line) {
    if (!line.trim()) return;
    let event;
    try {
      event = JSON.parse(line);
    } catch {
      return;
    }

    if (event.type === "audio_meta") {
      duration = Number(event.duration) || 0;
      writeStatus(jobId, {
        state: "preparing",
        message: `Préparation de l’enregistrement (${formatClock(duration)})…`,
        duration,
        progress: 3
      });
      return;
    }

    if (event.type === "engine_ready") {
      writeStatus(jobId, {
        state: "transcribing",
        message: "Transcription locale en cours…",
        progress: 5,
        duration
      });
      return;
    }

    if (event.type === "segment") {
      const segment = {
        id: event.id || segments.length + 1,
        start: Number(event.start) || 0,
        end: Number(event.end) || Number(event.start) || 0,
        text: String(event.text || "").trim()
      };
      segments.push(segment);
      const ratio = duration > 0 ? Math.min(1, segment.end / duration) : 0;
      writeStatus(jobId, {
        state: "transcribing",
        message: `Transcription locale… ${formatClock(segment.end)} / ${formatClock(duration)}`,
        progress: Math.max(5, Math.min(96, Math.round(5 + ratio * 91))),
        duration,
        segmentCount: segments.length
      });
      if (segments.length % 10 === 0) {
        writeJson(path.join(jobDir(jobId), "transcription_partielle.json"), { segments });
      }
      return;
    }

    if (event.type === "error") {
      writeStatus(jobId, {
        state: "error",
        message: event.message || "Erreur du moteur local.",
        progress: 0
      });
    }
  }

  child.stdout.on("data", (data) => {
    buffer += data.toString();
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    lines.forEach(handleLine);
  });

  child.stderr.on("data", (data) => {
    stderr += data.toString();
  });

  child.on("error", (error) => {
    writeStatus(jobId, {
      state: "error",
      message: `Impossible de démarrer Whisper local : ${error.message}`,
      progress: 0
    });
  });

  child.on("close", (code) => {
    if (buffer.trim()) handleLine(buffer);

    const current = readJson(statusPath(jobId));
    if (current.state === "error") return;

    if (code !== 0) {
      writeStatus(jobId, {
        state: "error",
        message: stderr.trim().slice(-1200) || `Whisper local s’est arrêté avec le code ${code}.`,
        progress: 0
      });
      return;
    }

    const result = {
      jobId,
      originalName,
      duration,
      createdAt: timestamp(),
      model: LOCAL_MODEL,
      engine: "faster-whisper-local",
      mode: "local",
      language: "fr",
      segments,
      text: segments.map((segment) => segment.text).filter(Boolean).join(" ")
    };

    writeJson(path.join(jobDir(jobId), "transcription.json"), result);
    fs.writeFileSync(
      path.join(jobDir(jobId), "transcription.md"),
      buildMarkdown({ originalName, duration, model: LOCAL_MODEL, mode: "local" }, segments),
      "utf8"
    );

    writeStatus(jobId, {
      state: "done",
      message: "Transcription locale terminée.",
      progress: 100,
      duration,
      segmentCount: segments.length,
      resultReady: true
    });
  });
}

async function processHighPrecisionJob(jobId, sourcePath, originalName) {
  try {
    const key = apiKey();
    if (!key) throw new Error("Clé API absente. Enregistre-la dans Vogue Marry avant de lancer le mode haute précision.");

    const duration = await mediaDuration(sourcePath);
    const apiAudioPath = path.join(jobDir(jobId), "audio_api_16khz_32k.mp3");

    writeStatus(jobId, {
      state: "preparing",
      message: "Préparation de l’audio haute précision…",
      progress: 5,
      duration,
      model: REMOTE_MODEL,
      engine: "openai-api",
      mode: "high"
    });

    await compressForApi(sourcePath, apiAudioPath);

    writeStatus(jobId, {
      state: "transcribing",
      message: "Transcription haute précision et séparation des intervenants…",
      progress: 25,
      duration
    });

    const audioBuffer = fs.readFileSync(apiAudioPath);
    const form = new FormData();
    form.append("file", new Blob([audioBuffer], { type: "audio/mpeg" }), "audio-vogue-marry.mp3");
    form.append("model", REMOTE_MODEL);
    form.append("response_format", "diarized_json");
    form.append("chunking_strategy", "auto");
    form.append("language", "fr");

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      body: form
    });

    const raw = await response.text();
    let payload;
    try {
      payload = JSON.parse(raw);
    } catch {
      throw new Error(`Réponse de transcription illisible (${response.status}).`);
    }

    if (!response.ok) {
      throw new Error(payload?.error?.message || `Erreur du service de transcription (${response.status}).`);
    }

    const sourceSegments = Array.isArray(payload.segments) ? payload.segments : [];
    const segments = sourceSegments.map((segment, index) => ({
      id: segment.id ?? index + 1,
      start: Number(segment.start) || 0,
      end: Number(segment.end) || Number(segment.start) || 0,
      speaker: String(segment.speaker || "?").trim(),
      text: String(segment.text || "").trim()
    }));

    if (!segments.length && payload.text) {
      segments.push({ id: 1, start: 0, end: duration, speaker: "?", text: String(payload.text).trim() });
    }

    const result = {
      jobId,
      originalName,
      duration: Number(payload.duration) || duration,
      createdAt: timestamp(),
      model: REMOTE_MODEL,
      engine: "openai-api",
      mode: "high",
      language: "fr",
      segments,
      text: String(payload.text || segments.map((segment) => segment.text).join(" ")).trim()
    };

    writeJson(path.join(jobDir(jobId), "transcription.json"), result);
    fs.writeFileSync(
      path.join(jobDir(jobId), "transcription.md"),
      buildMarkdown({ originalName, duration: result.duration, model: REMOTE_MODEL, mode: "high" }, segments),
      "utf8"
    );

    if (fs.existsSync(apiAudioPath)) fs.unlinkSync(apiAudioPath);

    writeStatus(jobId, {
      state: "done",
      message: "Transcription haute précision terminée.",
      progress: 100,
      duration: result.duration,
      segmentCount: segments.length,
      resultReady: true
    });
  } catch (error) {
    writeStatus(jobId, {
      state: "error",
      message: error.message || "Échec de la transcription haute précision.",
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

app.get("/api/transcription/health", (req, res) => {
  res.json({
    status: "ok",
    service: "vogue-marry-transcription",
    localEngineReady: localEngineReady(),
    localModel: LOCAL_MODEL,
    highPrecisionReady: Boolean(apiKey()),
    highPrecisionModel: REMOTE_MODEL,
    port: PORT
  });
});

app.post("/api/transcription/config/api-key", (req, res) => {
  const key = String(req.body?.apiKey || "").trim();
  if (!/^sk-/.test(key) || key.length < 20) {
    return res.status(400).json({ error: "Cette clé API ne semble pas valide." });
  }
  fs.writeFileSync(API_KEY_FILE, `${key}\n`, { encoding: "utf8", mode: 0o600 });
  fs.chmodSync(API_KEY_FILE, 0o600);
  return res.json({ status: "ok", highPrecisionReady: true });
});

app.delete("/api/transcription/config/api-key", (req, res) => {
  if (fs.existsSync(API_KEY_FILE)) fs.unlinkSync(API_KEY_FILE);
  return res.json({ status: "ok", highPrecisionReady: false });
});

app.post("/api/transcription", upload.single("audio"), (req, res) => {
  try {
    if (!req.file) throw new Error("Aucun enregistrement reçu.");
    const mode = req.body?.mode === "high" ? "high" : "local";
    if (mode === "high" && !apiKey()) throw new Error("Clé API absente pour le mode haute précision.");

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
      createdAt: timestamp(),
      engine: mode === "high" ? "openai-api" : "local",
      mode,
      model: mode === "high" ? REMOTE_MODEL : LOCAL_MODEL
    });

    setImmediate(() => {
      if (mode === "high") processHighPrecisionJob(jobId, sourcePath, req.file.originalname);
      else processLocalJob(jobId, sourcePath, req.file.originalname);
    });

    res.status(202).json({ status: "accepted", jobId, mode });
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
