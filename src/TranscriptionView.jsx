import React, { useEffect, useMemo, useState } from "react";
import "./transcription-view.css";

const API = "http://localhost:8011";
const STANLEY_CONTEXT = "Entretien professionnel en français à l’ARTAG concernant Stanley. Noms et termes possibles : ARTAG, Stanley, Martine, CSE, employeur, salarié, entretien préalable, sanction disciplinaire, avertissement, témoignages, direction, convention collective.";

function formatSize(bytes) {
  if (!Number.isFinite(bytes)) return "";
  const mib = bytes / 1024 / 1024;
  return `${mib.toFixed(1)} Mio`;
}

function formatClock(totalSeconds) {
  const value = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  const seconds = value % 60;
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
}

export default function TranscriptionView() {
  const [health, setHealth] = useState(null);
  const [mode, setMode] = useState("high");
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [contextHint, setContextHint] = useState(STANLEY_CONTEXT);
  const [file, setFile] = useState(null);
  const [job, setJob] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function refreshHealth() {
    try {
      const response = await fetch(`${API}/api/transcription/health`);
      const payload = await response.json();
      setHealth(payload);
      return payload;
    } catch {
      setError("Le moteur de transcription Vogue Marry n’est pas démarré.");
      return null;
    }
  }

  useEffect(() => {
    refreshHealth();
  }, []);

  useEffect(() => {
    if (!job?.jobId || job.state === "done" || job.state === "error") return undefined;

    const timer = window.setInterval(async () => {
      try {
        const response = await fetch(`${API}/api/transcription/${job.jobId}`);
        const state = await response.json();
        setJob(state);

        if (state.state === "done") {
          const resultResponse = await fetch(`${API}/api/transcription/${job.jobId}/result`);
          const payload = await resultResponse.json();
          setResult(payload);
          setBusy(false);
        }

        if (state.state === "error") {
          setError(state.message || "La transcription a échoué.");
          setBusy(false);
        }
      } catch {
        setError("Vogue Marry n’arrive plus à joindre le moteur de transcription.");
        setBusy(false);
      }
    }, 2000);

    return () => window.clearInterval(timer);
  }, [job?.jobId, job?.state]);

  const engineReady = mode === "high" ? health?.highPrecisionReady : health?.localEngineReady;
  const canStart = Boolean(file && engineReady && !busy);

  const transcript = useMemo(() => {
    if (!result?.segments) return "";
    return result.segments
      .map((segment) => {
        const speaker = segment.speaker ? ` Intervenant ${segment.speaker} —` : "";
        return `[${formatClock(segment.start)}]${speaker} ${segment.text}`;
      })
      .join("\n\n");
  }, [result]);

  function resetRun() {
    setError("");
    setResult(null);
    setJob(null);
  }

  async function saveApiKey() {
    setError("");
    try {
      const response = await fetch(`${API}/api/transcription/config/api-key`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: apiKeyInput })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Impossible d’enregistrer la clé.");
      setApiKeyInput("");
      await refreshHealth();
    } catch (err) {
      setError(err.message || "Impossible d’enregistrer la clé API.");
    }
  }

  async function removeApiKey() {
    setError("");
    try {
      await fetch(`${API}/api/transcription/config/api-key`, { method: "DELETE" });
      await refreshHealth();
    } catch {
      setError("Impossible d’effacer la clé API.");
    }
  }

  async function startTranscription() {
    if (!file || !canStart) return;
    setBusy(true);
    setError("");
    setResult(null);
    setJob({ state: "uploading", message: "Envoi de l’enregistrement…", progress: 1 });

    try {
      const form = new FormData();
      form.append("audio", file);
      form.append("mode", mode);
      if (mode === "high") form.append("context", contextHint);
      const response = await fetch(`${API}/api/transcription`, { method: "POST", body: form });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Impossible d’envoyer l’enregistrement.");
      setJob({ jobId: payload.jobId, state: "queued", message: "Enregistrement reçu.", progress: 2, mode });
    } catch (err) {
      setBusy(false);
      setError(err.message || "Échec de l’envoi.");
    }
  }

  return (
    <main className="transcription-page">
      <header className="transcription-topbar">
        <a href="/" className="transcription-back">← Vogue Marry</a>
        <div>
          <small>TRACES AUDIO</small>
          <h1>Transcription audio</h1>
          <p>Choisir le niveau de précision selon l’enjeu du dossier.</p>
        </div>
      </header>

      <section className="transcription-panel">
        <div className="transcription-mode-grid" aria-label="Mode de transcription">
          <button
            type="button"
            className={`transcription-mode${mode === "local" ? " active" : ""}`}
            onClick={() => { setMode("local"); resetRun(); }}
          >
            <small>QUOTIDIEN</small>
            <strong>Local · gratuit</strong>
            <span>Whisper sur ce PC. L’audio ne quitte pas l’ordinateur.</span>
          </button>
          <button
            type="button"
            className={`transcription-mode high${mode === "high" ? " active" : ""}`}
            onClick={() => { setMode("high"); resetRun(); }}
          >
            <small>DOSSIER SENSIBLE</small>
            <strong>Double vérification</strong>
            <span>Texte haute précision puis second passage pour repérer les intervenants.</span>
          </button>
        </div>

        <div className="transcription-statusline">
          <strong>{mode === "high" ? "Moteur dossier sensible" : "Moteur local"}</strong>
          <span className={engineReady ? "ready" : "not-ready"}>
            {mode === "high"
              ? (health?.highPrecisionReady ? "Prêt · double vérification active" : "Clé API à enregistrer")
              : (health?.localEngineReady ? `Prêt · Whisper ${health.localModel}` : "À installer")}
          </span>
        </div>

        {mode === "local" && !health?.localEngineReady && health ? (
          <div className="transcription-callout">
            Lance une seule fois <code>npm run transcription:setup</code>, puis redémarre Vogue Marry.
          </div>
        ) : null}

        {mode === "high" && !health?.highPrecisionReady && health ? (
          <div className="transcription-api-config">
            <strong>Activer le mode dossier sensible</strong>
            <p>Colle une clé API OpenAI. Elle reste enregistrée uniquement sur ce PC dans <code>~/.config/vogue-merry/</code>.</p>
            <div>
              <input
                type="password"
                value={apiKeyInput}
                onChange={(event) => setApiKeyInput(event.target.value)}
                placeholder="sk-…"
                autoComplete="off"
              />
              <button type="button" onClick={saveApiKey} disabled={!apiKeyInput.trim()}>Enregistrer</button>
            </div>
          </div>
        ) : null}

        {mode === "high" && health?.highPrecisionReady ? (
          <div className="transcription-callout api-warning">
            <div>
              <strong>Dossier sensible · double vérification</strong>
              <span>Le texte principal est produit par GPT-Transcribe. Un second passage sert uniquement à repérer qui parle. L’original reste conservé sur ce PC.</span>
            </div>
            <button type="button" className="transcription-link-button" onClick={removeApiKey}>Effacer la clé</button>
          </div>
        ) : null}

        {mode === "high" ? (
          <label className="transcription-context">
            <span>Contexte et mots à reconnaître</span>
            <textarea
              value={contextHint}
              onChange={(event) => setContextHint(event.target.value)}
              rows={4}
              placeholder="Noms propres, sigles, vocabulaire métier, contexte de la réunion…"
            />
            <small>Ces indications servent à éviter les erreurs sur les noms, sigles et termes sensibles. Elles ne sont pas ajoutées au texte final si elles ne sont pas entendues.</small>
          </label>
        ) : null}

        <label className="transcription-file">
          <span>Enregistrement à transcrire</span>
          <input
            type="file"
            accept="audio/*,.m4a,.mp3,.wav,.ogg,.webm,.mp4"
            onChange={(event) => {
              setFile(event.target.files?.[0] || null);
              resetRun();
            }}
          />
        </label>

        <div className="transcription-filemeta">
          {file ? <><strong>{file.name}</strong><span>{formatSize(file.size)}</span></> : <span>Aucun fichier sélectionné.</span>}
        </div>

        <button type="button" className="transcription-start" disabled={!canStart} onClick={startTranscription}>
          {busy
            ? "Transcription en cours…"
            : mode === "high"
              ? "Transcrire en dossier sensible"
              : "Transcrire en local"}
        </button>

        {job ? (
          <div className="transcription-progress">
            <div><strong>{job.message || job.state}</strong><span>{job.progress || 0}%</span></div>
            <progress max="100" value={job.progress || 0} />
            {job.duration ? <small>{formatClock(job.duration)} d’audio · {job.segmentCount || 0} segments produits</small> : null}
          </div>
        ) : null}

        {error ? <div className="transcription-error">{error}</div> : null}
      </section>

      {result ? (
        <section className="transcription-result">
          <div className="transcription-result-head">
            <div>
              <small>{result.mode === "high" ? "DOSSIER SENSIBLE · DOUBLE VÉRIFICATION TERMINÉE" : "TRANSCRIPTION LOCALE TERMINÉE"}</small>
              <h2>{result.originalName}</h2>
              {result.warnings?.length ? <p className="transcription-result-warning">{result.warnings.join(" · ")}</p> : null}
            </div>
            <a href={`${API}/api/transcription/${result.jobId}/download`}>Télécharger le texte</a>
          </div>
          <pre>{transcript}</pre>
        </section>
      ) : null}
    </main>
  );
}
