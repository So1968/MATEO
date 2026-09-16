import React, { useEffect, useMemo, useState } from "react";
import "./transcription-view.css";

const API = "http://localhost:8011";

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
  const [file, setFile] = useState(null);
  const [job, setJob] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API}/api/transcription/health`)
      .then((response) => response.json())
      .then((payload) => {
        if (!cancelled) setHealth(payload);
      })
      .catch(() => {
        if (!cancelled) setError("Le moteur local de transcription n’est pas démarré.");
      });
    return () => { cancelled = true; };
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
        setError("Vogue Marry n’arrive plus à joindre le moteur local.");
        setBusy(false);
      }
    }, 2000);

    return () => window.clearInterval(timer);
  }, [job?.jobId, job?.state]);

  const canStart = Boolean(file && health?.localEngineReady && !busy);
  const transcript = useMemo(() => {
    if (!result?.segments) return "";
    return result.segments
      .map((segment) => `[${formatClock(segment.start)}] ${segment.text}`)
      .join("\n\n");
  }, [result]);

  async function startTranscription() {
    if (!file || !canStart) return;
    setBusy(true);
    setError("");
    setResult(null);
    setJob({ state: "uploading", message: "Envoi de l’enregistrement…", progress: 1 });

    try {
      const form = new FormData();
      form.append("audio", file);
      const response = await fetch(`${API}/api/transcription`, { method: "POST", body: form });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Impossible d’envoyer l’enregistrement.");
      setJob({ jobId: payload.jobId, state: "queued", message: "Enregistrement reçu.", progress: 2 });
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
          <h1>Transcription locale</h1>
          <p>L’enregistrement reste sur ce PC. Aucun compte ni clé API n’est nécessaire.</p>
        </div>
      </header>

      <section className="transcription-panel">
        <div className="transcription-statusline">
          <strong>Moteur local</strong>
          <span className={health?.localEngineReady ? "ready" : "not-ready"}>
            {health?.localEngineReady ? `Prêt · Whisper ${health.model}` : "À installer"}
          </span>
        </div>

        {!health?.localEngineReady && health ? (
          <div className="transcription-callout">
            Lance une seule fois <code>npm run transcription:setup</code>, puis redémarre Vogue Marry.
          </div>
        ) : null}

        <label className="transcription-file">
          <span>Enregistrement à transcrire</span>
          <input
            type="file"
            accept="audio/*,.m4a,.mp3,.wav,.ogg,.webm,.mp4"
            onChange={(event) => {
              setFile(event.target.files?.[0] || null);
              setError("");
              setResult(null);
              setJob(null);
            }}
          />
        </label>

        <div className="transcription-filemeta">
          {file ? <><strong>{file.name}</strong><span>{formatSize(file.size)}</span></> : <span>Aucun fichier sélectionné.</span>}
        </div>

        <button type="button" className="transcription-start" disabled={!canStart} onClick={startTranscription}>
          {busy ? "Transcription en cours…" : "Transcrire avec Vogue Marry"}
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
              <small>TRANSCRIPTION TERMINÉE</small>
              <h2>{result.originalName}</h2>
            </div>
            <a href={`${API}/api/transcription/${result.jobId}/download`}>Télécharger le texte</a>
          </div>
          <pre>{transcript}</pre>
        </section>
      ) : null}
    </main>
  );
}
