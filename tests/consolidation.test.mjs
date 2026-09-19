import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(ROOT, relativePath), "utf8");
const exists = (relativePath) => fs.existsSync(path.join(ROOT, relativePath));

test("les services locaux restent limités à la boucle locale", () => {
  for (const file of [
    "backend/server.js",
    "backend/transcription-server-v6.js"
  ]) {
    const source = read(file);
    assert.match(source, /app\.listen\([^\n]*"127\.0\.0\.1"/u, `${file} doit écouter uniquement sur 127.0.0.1`);
    assert.doesNotMatch(source, /app\.use\(cors\(\)\)/u, `${file} ne doit pas autoriser CORS sans restriction`);
  }
});

test("Multer reste verrouillé sur la version consolidée", () => {
  const packageJson = JSON.parse(read("package.json"));
  const packageLock = JSON.parse(read("package-lock.json"));
  assert.equal(packageJson.dependencies?.multer, "2.4.0");
  assert.equal(packageLock.packages?.[""]?.dependencies?.multer, "2.4.0");
  assert.equal(packageLock.packages?.["node_modules/multer"]?.version, "2.4.0");
});

test("les dépendances frontend critiques ne reviennent pas à latest", () => {
  const packageJson = JSON.parse(read("package.json"));
  for (const dependency of ["@vitejs/plugin-react", "lucide-react", "react", "react-dom", "vite"]) {
    const version = packageJson.dependencies?.[dependency];
    assert.ok(version && version !== "latest", `${dependency} doit rester explicitement versionnée`);
    assert.match(version, /^\d+\.\d+\.\d+(?:[-+].+)?$/u, `${dependency} doit utiliser une version exacte`);
  }
});

test("les anciennes versions du moteur ne restent pas dans le code actif", () => {
  for (const file of [
    "backend/transcription-server.js",
    "backend/transcription-server-v2.js",
    "backend/transcription-server-v3.js",
    "backend/transcription-server-v4.js",
    "backend/transcription-server-v5.js"
  ]) {
    assert.equal(exists(file), false, `${file} doit rester uniquement dans l'historique Git`);
  }
  assert.equal(exists("backend/transcription-server-v6.js"), true);
});

test("les pages de démonstration obsolètes ne sont plus publiées", () => {
  assert.equal(exists("public/transcription-test.html"), false);
  assert.equal(exists("public/notion-secure-demo.html"), false);
});

test("la synchronisation des interlocuteurs n'altère plus Storage.prototype", () => {
  assert.equal(exists("src/speaker-map-sync.js"), false);
  const main = read("src/main.jsx");
  assert.doesNotMatch(main, /speaker-map-sync/u);
  const view = read("src/TranscriptionView.jsx");
  assert.doesNotMatch(view, /SPEAKER_API/u);
  assert.equal(exists("backend/speaker-sync-server.js"), false);
  assert.match(read("backend/transcription-server-v6.js"), /\/api\/transcription\/:jobId\/speakers/u);
  assert.match(view, /Confirmer ces noms/u);
});

test("le mode cloud exige un consentement explicite", () => {
  const view = read("src/TranscriptionView.jsx");
  assert.match(view, /cloudConsent/u);
  assert.match(view, /mode !== "high" \|\| cloudConsent/u);
  assert.match(view, /seront envoyés à OpenAI/u);
});

test("le cache évite aussi les doubles lancements encore en cours", () => {
  const server = read("backend/transcription-server-v6.js");
  assert.match(server, /reusableStates/u);
  assert.match(server, /already-running/u);
});

test("le nombre de participants ne force pas le nombre de voix Pyannote", () => {
  const server = read("backend/transcription-server-v6.js");
  assert.doesNotMatch(server, /args\.push\("--num-speakers"/u);
});

test("un nom n'est auto-attribué qu'après une présentation explicite", () => {
  const server = read("backend/transcription-server-v6.js");
  assert.match(server, /if \(!selfCue\) return 0/u);
  assert.doesNotMatch(server, /confidence: "elimination"/u);
  assert.doesNotMatch(server, /helloCue/u);
});
