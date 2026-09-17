import fs from "fs";
import os from "os";
import path from "path";
import { randomUUID } from "crypto";
import { spawn } from "child_process";

const OPENAI_TRANSCRIPTION_URL = "https://api.openai.com/v1/audio/transcriptions";
const nativeFetch = globalThis.fetch.bind(globalThis);

function safePartName(value) {
  return String(value || "part")
    .replace(/[\\/]/g, "_")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 120);
}

function collectHeaders(headers) {
  if (!headers) return [];
  if (headers instanceof Headers) return Array.from(headers.entries());
  if (Array.isArray(headers)) return headers;
  return Object.entries(headers);
}

function runCurl(args) {
  return new Promise((resolve, reject) => {
    const child = spawn("curl", args, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => { stdout += data.toString(); });
    child.stderr.on("data", (data) => { stderr += data.toString(); });
    child.on("error", (error) => reject(new Error(`Impossible de démarrer curl : ${error.message}`)));
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(stderr.trim() || `curl s’est arrêté avec le code ${code}.`));
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}

async function openAiCurlFetch(url, options = {}) {
  if (String(url) !== OPENAI_TRANSCRIPTION_URL) {
    return nativeFetch(url, options);
  }

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "vogue-openai-"));
  try {
    const args = [
      "--silent",
      "--show-error",
      "--location",
      "--retry", "3",
      "--retry-delay", "2",
      "--retry-all-errors",
      "--connect-timeout", "20",
      "--max-time", "900",
      "--request", String(options.method || "GET"),
      "--write-out", "\n__VOGUE_HTTP_STATUS__:%{http_code}"
    ];

    for (const [name, value] of collectHeaders(options.headers)) {
      if (String(name).toLowerCase() === "content-type") continue;
      args.push("--header", `${name}: ${value}`);
    }

    const body = options.body;
    if (body && typeof body.entries === "function") {
      let fileIndex = 0;
      for (const [name, value] of body.entries()) {
        if (typeof value === "string") {
          args.push("--form-string", `${name}=${value}`);
          continue;
        }

        if (value && typeof value.arrayBuffer === "function") {
          fileIndex += 1;
          const filename = safePartName(value.name || `${name}_${fileIndex}.bin`);
          const filePath = path.join(tempDir, `${fileIndex}_${randomUUID()}_${filename}`);
          const buffer = Buffer.from(await value.arrayBuffer());
          fs.writeFileSync(filePath, buffer);
          const mime = value.type || "application/octet-stream";
          args.push("--form", `${name}=@${filePath};type=${mime};filename=${filename}`);
          continue;
        }

        args.push("--form-string", `${name}=${String(value)}`);
      }
    }

    args.push(String(url));

    const { stdout } = await runCurl(args);
    const marker = "\n__VOGUE_HTTP_STATUS__:";
    const markerIndex = stdout.lastIndexOf(marker);
    if (markerIndex < 0) {
      throw new Error("Réponse curl illisible : code HTTP introuvable.");
    }

    const responseBody = stdout.slice(0, markerIndex);
    const status = Number(stdout.slice(markerIndex + marker.length).trim()) || 0;

    return {
      status,
      ok: status >= 200 && status < 300,
      async text() { return responseBody; }
    };
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

globalThis.fetch = openAiCurlFetch;
console.log("Vogue Marry — transport OpenAI via curl avec reprise automatique.");
await import("./transcription-server-v2.js");
