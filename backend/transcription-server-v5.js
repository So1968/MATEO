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
const PRIMARY_MODEL = "gpt-transcribe";
const SPEAKER_MODEL = "gpt-4o-transcribe-diarize";
const SENSITIVE_CHUNK_SECONDS = 900;
const OVERLAP_SECONDS = 4;
const CONFIG_DIR = path.join(HOME, ".config", "vogue-merry");
const API_KEY_FILE = path.join(CONFIG_DIR, "openai_api_key");
const OPENAI_URL = "https://api.openai.com/v1/audio/transcriptions";

const DEFAULT_CONTEXT = [
  "Entretien professionnel en français.",
  "Transcrire fidèlement les paroles audibles sans les traduire.",
  "Ne pas inventer de contenu pour combler un passage incertain.",
  "Respecter les noms propres, sigles et termes professionnels entendus.",
  "Contexte possible : entretien disciplinaire, témoignages, employeur, salarié, direction, CSE, entretien préalable, sanction disciplinaire, avertissement."
].join(" ");

const DEFAULT_KEYWORDS = [
  "ARTAG",
  "Stanley",
  "Martine",
  "CSE",
  "entretien préalable",
  "sanction disciplinaire",
  "avertissement",
  "témoignage",
  "témoignages",
  "employeur",
  "salarié",
  "direction",
  "convention collective"
];

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
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
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

function localEngineReady() {
  return fs.existsSync(LOCAL_PYTHON) && fs.existsSync(LOCAL_SCRIPT);
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"], ...options });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (data) => { stdout += data.toString(); });
    child.stderr.on("data", (data) => { stderr += data.toString(); });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(`${command} a échoué (${code}). ${stderr.trim().slice(-2200)}`));
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
  const duration = Number(stdout.trim());
  return Number.isFinite(duration) ? duration : 0;
}

async function makeSensitiveChunk(sourcePath, destinationPath, start, duration) {
  await run("ffmpeg", [
    "-y",
    "-i", sourcePath,
    "-ss", String(start),
    "-t", String(duration),
    "-vn",
    "-ac", "1",
    "-ar", "48000",
    "-c:a", "libmp3lame",
    "-b:a", "96k",
    destinationPath
  ]);
}

function normalizeContext(value) {
  const user = String(value || "").trim();
  return user ? `${DEFAULT_CONTEXT} Contexte fourni : ${user}`.slice(0, 3500) : DEFAULT_CONTEXT;
}

function keywordsFromContext(value) {
  const userTerms = String(value || "")
    .split(/[\n,;|]+/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 2 && item.length <= 80 && !/[<>\r\n]/.test(item));
  return Array.from(new Set([...DEFAULT_KEYWORDS, ...userTerms])).slice(0, 60);
}

function runCurlJson(args) {
  return new Promise((resolve, reject) => {
    const marker = "\n__VOGUE_HTTP_STATUS__:";
    const child = spawn("curl", [
      "--silent",
      "--show-error",
      "--location",
      "--retry", "3",
      "--retry-delay", "2",
      "--retry-all-errors",
      "--connect-timeout", "20",
      "--max-time", "900",
      "--write-out", `${marker}%{http_code}`,
      ...args
    ], { stdio: ["ignore", "pipe", "pipe"] });

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (data) => { stdout += data.toString(); });
    child.stderr.on("data", (data) => { stderr += data.toString(); });
    child.on("error", (error) => reject(new Error(`Impossible de démarrer curl : ${error.message}`)));
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(stderr.trim() || `curl s'est arrêté avec le code ${code}.`));
        return;
      }
      const markerIndex = stdout.lastIndexOf(marker);
      if (markerIndex < 0) {
        reject(new Error("Réponse OpenAI illisible : code HTTP introuvable."));
        return;
      }
      const body = stdout.slice(0, markerIndex);
      const status = Number(stdout.slice(markerIndex + marker.length).trim()) || 0;
      let payload;
      try {
        payload = JSON.parse(body);
      } catch {
        reject(new Error(`Réponse OpenAI illisible (${status}).`));
        return;
      }
      if (status < 200 || status >= 300) {
        reject(new Error(payload?.error?.message || `Erreur OpenAI (${status}).`));
        return;
      }
      resolve(payload);
    });
  });
}

async function transcribePrimary(key, chunkPath, context) {
  const args = [
    "--header", `Authorization: Bearer ${key}`,
    "--form", `file=@${chunkPath};type=audio/mpeg;filename=${path.basename(chunkPath)}`,
    "--form-string", `model=${PRIMARY_MODEL}`,
    "--form-string", "response_format=json",
    "--form-string", "languages[]=fr",
    "--form-string", "temperature=0",
    "--form-string", `prompt=${normalizeContext(context)}`
  ];
  for (const keyword of keywordsFromContext(context)) {
    args.push("--form-string", `keywords[]=${keyword}`);
  }
  args.push(OPENAI_URL);
  return runCurlJson(args);
}

async function transcribeSpeakers(key, chunkPath) {
  return runCurlJson([
    "--header", `Authorization: Bearer ${key}`,
    "--form", `file=@${chunkPath};type=audio/mpeg;filename=${path.basename(chunkPath)}`,
    "--form-string", `model=${SPEAKER_MODEL}`,
    "--form-string", "response_format=diarized_json",
    "--form-string", "chunking_strategy=auto",
    "--form-string", "language=fr",
    OPENAI_URL
  ]);
}

function normalizedWord(word) {
  return String(word || "").toLocaleLowerCase("fr-FR").replace(/[^a-zà-öø-ÿ0-9'-]/gi, "");
}

function removeRepeatedOverlap(previousText, currentText) {
  const prev = String(previousText || "").trim();
  const current = String(currentText || "").trim();
  if (!prev || !current) return current;
  const prevWords = prev.split(/\s+/);
  const currentWords = current.split(/\s+/);
  const max = Math.min(50, prevWords.length, currentWords.length);
  for (let count = max; count >= 5; count -= 1) {
    const left = prevWords.slice(-count).map(normalizedWord).join(" ");
    const right = currentWords.slice(0, count).map(normalizedWord).join(" ");
    if (left && left === right) return currentWords.slice(count).join(" ").trim();
  }
  return current;
}

function buildPrimaryMarkdown(meta, segments) {
  const lines = [
    "# Transcription — Vogue Marry",
    "",
    `- Fichier : ${meta.originalName}`,
    `- Durée : ${formatClock(meta.duration)}`,
    `- Texte principal : ${PRIMARY_MODEL}`,
    `- Repérage des locuteurs : ${SPEAKER_MODEL} (fichier séparé, utilisé uniquement comme aide de vérification)`,
    `- Découpage : tranches de ${Math.round(SENSITIVE_CHUNK_SECONDS / 60)} min avec ${OVERLAP_SECONDS} s de recouvrement`,
    "- Important : le texte principal n'est pas artificiellement attribué à un locuteur. Les horaires indiquent les bornes des tranches, pas l'instant exact de chaque phrase.",
    meta.context ? `- Contexte fourni : ${meta.context}` : null,
    meta.warnings?.length ? `- Avertissements : ${meta.warnings.join(" | ")}` : null,
    `- Générée : ${new Date().toLocaleString("fr-FR")}`,
    "",
    "## Transcription haute précision",
    ""
  ].filter(Boolean);

  for (const segment of segments) {
    lines.push(`### ${formatClock(segment.start)} → ${formatClock(segment.end)}`);
    lines.push("");
    lines.push(String(segment.text || "").trim());
    lines.push("");
  }
  return `${lines.join("\n").trim()}\n`;
}

function buildSpeakerMarkdown(meta, speakerSegments) {
  const lines = [
    "# Repérage des locuteurs — Vogue Marry",
    "",
    `- Fichier : ${meta.originalName}`,
    `- Moteur : ${SPEAKER_MODEL}`,
    "- Ce document sert uniquement à repérer les changements de voix. Son texte n'est pas la transcription de référence.",
    "- Les lettres de locuteurs sont locales à chaque tranche : T1-A et T2-A ne garantissent pas qu'il s'agit de la même personne.",
    "",
    "## Repérage",
    ""
  ];
  for (const segment of speakerSegments) {
    lines.push(`[${formatClock(segment.start)}] Intervenant ${segment.speaker} — ${segment.text}`);
    lines.push("");
  }
  return `${lines.join("\n").trim()}\n`;
}

async function processLocalJob(jobId, sourcePath, originalName) {
  if (!localEngineReady()) {
    writeStatus(jobId, { state: "error", message: "Le moteur local n'est pas installé. Lance : npm run transcription:setup", progress: 0 });
    return;
  }

  const segments = [];
  let duration = 0;
  let stderr = "";
  writeStatus(jobId, { state: "preparing", message: `Chargement de Whisper local (${LOCAL_MODEL})…`, progress: 2, model: LOCAL_MODEL, mode: "local" });

  const child = spawn(LOCAL_PYTHON, [LOCAL_SCRIPT, sourcePath, "--model", LOCAL_MODEL, "--language", "fr"], {
    cwd: PROJECT_ROOT,
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"]
  });
  let buffer = "";

  function handleLine(line) {
    if (!line.trim()) return;
    let event;
    try { event = JSON.parse(line); } catch { return; }
    if (event.type === "audio_meta") {
      duration = Number(event.duration) || 0;
      writeStatus(jobId, { state: "preparing", message: `Préparation (${formatClock(duration)})…`, duration, progress: 3 });
      return;
    }
    if (event.type === "engine_ready") {
      writeStatus(jobId, { state: "transcribing", message: "Transcription locale en cours…", duration, progress: 5 });
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
    }
  }

  child.stdout.on("data", (data) => {
    buffer += data.toString();
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    lines.forEach(handleLine);
  });
  child.stderr.on("data", (data) => { stderr += data.toString(); });
  child.on("error", (error) => {
    writeStatus(jobId, { state: "error", message: `Impossible de démarrer Whisper local : ${error.message}`, progress: 0 });
  });
  child.on("close", (code) => {
    if (buffer.trim()) handleLine(buffer);
    if (readJson(statusPath(jobId)).state === "error") return;
    if (code !== 0) {
      writeStatus(jobId, { state: "error", message: stderr.trim().slice(-1200) || `Whisper local s'est arrêté avec le code ${code}.`, progress: 0 });
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
    const lines = ["# Transcription — Vogue Marry", "", `- Fichier : ${originalName}`, `- Durée : ${formatClock(duration)}`, `- Moteur : Whisper local (${LOCAL_MODEL})`, "", "## Transcription", ""];
    for (const segment of segments) {
      lines.push(`[${formatClock(segment.start)}] ${segment.text}`, "");
    }
    fs.writeFileSync(path.join(jobDir(jobId), "transcription.md"), `${lines.join("\n").trim()}\n`, "utf8");
    writeStatus(jobId, { state: "done", message: "Transcription locale terminée.", progress: 100, duration, segmentCount: segments.length, resultReady: true });
  });
}

async function processSensitiveJob(jobId, sourcePath, originalName, context) {
  const key = apiKey();
  if (!key) {
    writeStatus(jobId, { state: "error", message: "Clé API absente.", progress: 0 });
    return;
  }

  const warnings = [];
  const verificationDir = path.join(jobDir(jobId), "verification");
  fs.mkdirSync(verificationDir, { recursive: true });

  try {
    const duration = await mediaDuration(sourcePath);
    if (!duration) throw new Error("Impossible de déterminer la durée de l'enregistrement.");

    const starts = [];
    let cursor = 0;
    while (cursor < duration - 0.25) {
      starts.push(cursor);
      if (duration - cursor <= SENSITIVE_CHUNK_SECONDS) break;
      cursor += SENSITIVE_CHUNK_SECONDS - OVERLAP_SECONDS;
    }

    writeStatus(jobId, {
      state: "preparing",
      message: `Dossier sensible : préparation de ${starts.length} tranches…`,
      progress: 3,
      duration,
      chunkCount: starts.length,
      mode: "high",
      engine: "double-verification-v5",
      primaryModel: PRIMARY_MODEL,
      speakerModel: SPEAKER_MODEL
    });

    const segments = [];
    const speakerSegments = [];
    let previousPrimaryText = "";

    for (let index = 0; index < starts.length; index += 1) {
      const start = starts[index];
      const chunkDuration = Math.min(SENSITIVE_CHUNK_SECONDS, duration - start);
      const chunkNumber = index + 1;
      const chunkPath = path.join(jobDir(jobId), `sensitive_chunk_${String(chunkNumber).padStart(2, "0")}.mp3`);

      writeStatus(jobId, {
        state: "preparing",
        message: `Tranche ${chunkNumber}/${starts.length} · préparation audio haute qualité…`,
        progress: Math.round(5 + (index / starts.length) * 10),
        duration,
        chunkCount: starts.length,
        currentChunk: chunkNumber,
        segmentCount: segments.length
      });
      await makeSensitiveChunk(sourcePath, chunkPath, start, chunkDuration);

      writeStatus(jobId, {
        state: "transcribing",
        message: `Tranche ${chunkNumber}/${starts.length} · texte haute précision (${PRIMARY_MODEL})…`,
        progress: Math.round(15 + (index / starts.length) * 60),
        duration,
        chunkCount: starts.length,
        currentChunk: chunkNumber,
        segmentCount: segments.length
      });

      const primary = await transcribePrimary(key, chunkPath, context);
      writeJson(path.join(verificationDir, `tranche_${String(chunkNumber).padStart(2, "0")}_texte.json`), primary);
      let primaryText = String(primary?.text || "").trim();
      if (!primaryText) throw new Error(`La tranche ${chunkNumber} n'a produit aucun texte.`);
      if (index > 0) primaryText = removeRepeatedOverlap(previousPrimaryText, primaryText);

      segments.push({
        id: segments.length + 1,
        start,
        end: Math.min(duration, start + chunkDuration),
        text: primaryText,
        chunk: chunkNumber,
        textModel: PRIMARY_MODEL,
        timestampPrecision: "chunk"
      });
      previousPrimaryText = String(primary?.text || "").trim();

      try {
        writeStatus(jobId, {
          state: "verifying",
          message: `Tranche ${chunkNumber}/${starts.length} · second passage, repérage des locuteurs…`,
          progress: Math.round(25 + (index / starts.length) * 65),
          duration,
          chunkCount: starts.length,
          currentChunk: chunkNumber,
          segmentCount: segments.length
        });
        const diarized = await transcribeSpeakers(key, chunkPath);
        writeJson(path.join(verificationDir, `tranche_${String(chunkNumber).padStart(2, "0")}_locuteurs.json`), diarized);
        const localSegments = Array.isArray(diarized?.segments) ? diarized.segments : [];
        for (const source of localSegments) {
          const localStart = Number(source.start) || 0;
          const localEnd = Number(source.end) || localStart;
          if (index > 0 && localEnd <= OVERLAP_SECONDS) continue;
          speakerSegments.push({
            id: speakerSegments.length + 1,
            start: Math.min(duration, start + localStart),
            end: Math.min(duration, start + localEnd),
            speaker: `T${chunkNumber}-${String(source.speaker || "?").trim()}`,
            text: String(source.text || "").trim(),
            chunk: chunkNumber
          });
        }
      } catch (error) {
        warnings.push(`Repérage des locuteurs tranche ${chunkNumber} indisponible : ${error.message}`);
      }

      writeJson(path.join(jobDir(jobId), "transcription_partielle.json"), {
        jobId,
        originalName,
        duration,
        completedChunks: chunkNumber,
        chunkCount: starts.length,
        primaryModel: PRIMARY_MODEL,
        speakerModel: SPEAKER_MODEL,
        segments,
        speakerSegments,
        warnings
      });

      fs.rmSync(chunkPath, { force: true });
    }

    const result = {
      jobId,
      originalName,
      duration,
      createdAt: timestamp(),
      mode: "high",
      engine: "double-verification-v5",
      model: PRIMARY_MODEL,
      primaryModel: PRIMARY_MODEL,
      speakerModel: SPEAKER_MODEL,
      language: "fr",
      context,
      warnings,
      timestampPrecision: "chunk",
      speakerLabelsScope: "chunk",
      segments,
      speakerSegments,
      text: segments.map((segment) => segment.text).filter(Boolean).join("\n\n")
    };

    writeJson(path.join(jobDir(jobId), "transcription.json"), result);
    fs.writeFileSync(
      path.join(jobDir(jobId), "transcription.md"),
      buildPrimaryMarkdown({ originalName, duration, context, warnings }, segments),
      "utf8"
    );
    fs.writeFileSync(
      path.join(jobDir(jobId), "reperage-locuteurs.md"),
      buildSpeakerMarkdown({ originalName }, speakerSegments),
      "utf8"
    );

    writeStatus(jobId, {
      state: "done",
      message: warnings.length ? "Transcription dossier sensible terminée avec avertissement." : "Transcription dossier sensible terminée.",
      progress: 100,
      duration,
      segmentCount: segments.length,
      speakerSegmentCount: speakerSegments.length,
      chunkCount: starts.length,
      warnings,
      resultReady: true
    });
  } catch (error) {
    writeStatus(jobId, { state: "error", message: error.message || "Échec de la transcription dossier sensible.", progress: 0 });
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
    version: 5,
    localEngineReady: localEngineReady(),
    localModel: LOCAL_MODEL,
    highPrecisionReady: Boolean(apiKey()),
    highPrecisionModel: PRIMARY_MODEL,
    speakerModel: SPEAKER_MODEL,
    sensitiveDoubleCheck: true,
    primaryResponseFormat: "json",
    primaryLanguageHints: ["fr"],
    highPrecisionAutoChunking: true,
    highPrecisionChunkSeconds: SENSITIVE_CHUNK_SECONDS,
    audioPreparation: "48kHz mono 96kbps",
    speakerTranscriptSeparated: true,
    port: PORT
  });
});

app.post("/api/transcription/config/api-key", (req, res) => {
  const key = String(req.body?.apiKey || "").trim();
  if (!/^sk-/.test(key) || key.length < 20) return res.status(400).json({ error: "Cette clé API ne semble pas valide." });
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
    if (mode === "high" && !apiKey()) throw new Error("Clé API absente pour le mode dossier sensible.");

    const jobId = `${new Date().toISOString().replace(/[:.]/g, "-")}_${randomUUID().slice(0, 8)}`;
    const dir = jobDir(jobId);
    fs.mkdirSync(dir, { recursive: true });
    const extension = path.extname(req.file.originalname || "") || ".audio";
    const sourcePath = path.join(dir, `audio_original${extension}`);
    fs.renameSync(req.file.path, sourcePath);
    const context = String(req.body?.context || "").trim();

    writeStatus(jobId, {
      state: "queued",
      message: "Enregistrement reçu.",
      progress: 0,
      originalName: req.file.originalname,
      size: req.file.size,
      createdAt: timestamp(),
      mode,
      engine: mode === "high" ? "double-verification-v5" : "local",
      context
    });

    setImmediate(() => {
      if (mode === "high") processSensitiveJob(jobId, sourcePath, req.file.originalname, context);
      else processLocalJob(jobId, sourcePath, req.file.originalname);
    });

    res.status(202).json({ status: "accepted", jobId, mode });
  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(400).json({ error: error.message || "Impossible de recevoir l'audio." });
  }
});

app.get("/api/transcription/:jobId", (req, res) => {
  const filePath = statusPath(req.params.jobId);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: "Transcription inconnue." });
  return res.json(readJson(filePath));
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

app.get("/api/transcription/:jobId/download-speakers", (req, res) => {
  const filePath = path.join(jobDir(req.params.jobId), "reperage-locuteurs.md");
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: "Repérage des locuteurs indisponible." });
  return res.download(filePath, "reperage-locuteurs-vogue-marry.md");
});

app.listen(PORT, () => {
  console.log(`Vogue Marry — transcription v5 : http://localhost:${PORT}`);
  console.log(`Dossier sensible : texte ${PRIMARY_MODEL} (JSON) + repérage séparé ${SPEAKER_MODEL}.`);
  console.log(`Audio : tranches de ${SENSITIVE_CHUNK_SECONDS}s, 48 kHz mono, 96 kb/s.`);
});
