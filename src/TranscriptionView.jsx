import React, { useEffect, useMemo, useState } from "react";
import "./transcription-view.css";

const API = "http://localhost:8011";
const LAST_JOB_KEY = "vogue-marry:last-transcription-job";
const DEFAULT_CONTEXT = "Réunion professionnelle en français. Respecter les noms propres, sigles, termes métier et décisions entendues. Ne rien inventer si un passage est incertain.";
const GPT_COST_PER_MINUTE_USD = 0.0045;
const SENSITIVE_CHUNK_SECONDS = 900;
const SENSITIVE_OVERLAP_SECONDS = 4;

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

function formatUsd(value) {
  if (!Number.isFinite(value)) return "—";
  return `${value.toFixed(2)} $`;
}

function processedSeconds(duration) {
  const total = Number(duration) || 0;
  if (total <= 0) return 0;
  let cursor = 0;
  let processed = 0;
  while (cursor < total - 0.25) {
    const chunkDuration = Math.min(SENSITIVE_CHUNK_SECONDS, total - cursor);
    processed += chunkDuration;
    if (total - cursor <= SENSITIVE_CHUNK_SECONDS) break;
    cursor += SENSITIVE_CHUNK_SECONDS - SENSITIVE_OVERLAP_SECONDS;
  }
  return processed;
}

function estimateSensitiveCost(duration) {
  return (processedSeconds(duration) / 60) * GPT_COST_PER_MINUTE_USD;
}

function parseParticipantText(value) {
  return Array.from(new Set(
    String(value || "")
      .split(/[\n;,|]+/)
      .map((item) => item.replace(/^[-•]\s*/, "").trim())
      .filter(Boolean)
  ));
}

export default function TranscriptionView() {
  const [health, setHealth] = useState(null);
  const [escales, setEscales] = useState([]);
  const [meetingId, setMeetingId] = useState("");
  const [manualParticipants, setManualParticipants] = useState("");
  const [mode, setMode] = useState("local");
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [hfTokenInput, setHfTokenInput] = useState("");
  const [contextHint, setContextHint] = useState(DEFAULT_CONTEXT);
  const [file, setFile] = useState(null);
  const [audioDuration, setAudioDuration] = useState(null);
  const [job, setJob] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const selectedMeeting = useMemo(
    () => escales.find((item) => item.id === meetingId) || null,
    [escales, meetingId]
  );

  const participants = useMemo(
    () => selectedMeeting?.participants?.length ? selectedMeeting.participants : parseParticipantText(manualParticipants),
    [selectedMeeting, manualParticipants]
  );

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

  async function loadEscales() {
    try {
      const response = await fetch(`${API}/api/transcription/escales`);
      if (!response.ok) return;
      const payload = await response.json();
      setEscales(Array.isArray(payload.escales) ? payload.escales : []);
    } catch {
      // L'absence d'escales ne bloque pas l'import manuel d'un audio.
    }
  }

  async function loadResult(jobId) {
    const resultResponse = await fetch(`${API}/api/transcription/${jobId}/result`);
    if (!resultResponse.ok) return null;
    const payload = await resultResponse.json();
    setResult(payload);
    return payload;
  }

  useEffect(() => {
    refreshHealth();
    loadEscales();

    const savedJobId = window.localStorage.getItem(LAST_JOB_KEY);
    if (!savedJobId) return;
    (async () => {
      try {
        const response = await fetch(`${API}/api/transcription/${savedJobId}`);
        if (!response.ok) return;
        const state = await response.json();
        setJob(state);
        if (state.state === "done") {
          await loadResult(savedJobId);
          setBusy(false);
        } else if (state.state !== "error") {
          setBusy(true);
        }
      } catch {
        // Le moteur sera récupéré au prochain rafraîchissement.
      }
    })();
  }, []);

  useEffect(() => {
    setAudioDuration(null);
    if (!file) return undefined;

    const url = URL.createObjectURL(file);
    const audio = new Audio();
    audio.preload = "metadata";
    audio.src = url;
    const handleLoaded = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) setAudioDuration(audio.duration);
    };
    audio.addEventListener("loadedmetadata", handleLoaded);
    audio.load();

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoaded);
      audio.src = "";
      URL.revokeObjectURL(url);
    };
  }, [file]);

  useEffect(() => {
    if (!job?.jobId || job.state === "done" || job.state === "error") return undefined;
    window.localStorage.setItem(LAST_JOB_KEY, job.jobId);

    const timer = window.setInterval(async () => {
      try {
        const response = await fetch(`${API}/api/transcription/${job.jobId}`);
        const state = await response.json();
        setJob(state);
        if (state.state === "done") {
          await loadResult(job.jobId);
          setBusy(false);
        }
        if (state.state === "error") {
          setError(state.message || "La transcription a échoué.");
          setBusy(false);
        }
      } catch {
        setError("Vogue Marry n’arrive plus à joindre le moteur. Le travail déjà terminé reste conservé.");
      }
    }, 2000);

    return () => window.clearInterval(timer);
  }, [job?.jobId, job?.state]);

  const engineReady = mode === "high" ? health?.highPrecisionReady : health?.localEngineReady;
  const canStart = Boolean(file && engineReady && !busy);
  const estimatedCost = mode === "high" && audioDuration ? estimateSensitiveCost(audioDuration) : 0;
  const completedCost = result?.mode === "high" ? Number(result?.verification?.estimatedCostUsd || 0) : 0;

  const transcript = useMemo(() => {
    if (!result?.segments) return "";
    return result.segments
      .map((segment) => `[${formatClock(segment.start)}] ${segment.speaker || "Intervenant"} — ${segment.text}`)
      .join("\n\n");
  }, [result]);

  function resetRun() {
    setError("");
    setResult(null);
    setJob(null);
    setBusy(false);
    window.localStorage.removeItem(LAST_JOB_KEY);
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
      if (!response.ok) throw new Error(payload.error || "Impossible d’enregistrer la clé OpenAI.");
      setApiKeyInput("");
      await refreshHealth();
    } catch (err) {
      setError(err.message || "Impossible d’enregistrer la clé OpenAI.");
    }
  }

  async function saveHfToken() {
    setError("");
    try {
      const response = await fetch(`${API}/api/transcription/config/hf-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: hfTokenInput })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Impossible d’enregistrer le jeton Hugging Face.");
      setHfTokenInput("");
      await refreshHealth();
    } catch (err) {
      setError(err.message || "Impossible d’enregistrer le jeton Hugging Face.");
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
      form.append("context", contextHint);
      if (meetingId) form.append("meetingId", meetingId);
      form.append("participantsJson", JSON.stringify(participants));

      const response = await fetch(`${API}/api/transcription`, { method: "POST", body: form });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Impossible d’envoyer l’enregistrement.");

      window.localStorage.setItem(LAST_JOB_KEY, payload.jobId);
      if (payload.cached) {
        const stateResponse = await fetch(`${API}/api/transcription/${payload.jobId}`);
        const state = await stateResponse.json();
        setJob(state);
        await loadResult(payload.jobId);
        setBusy(false);
      } else {
        setJob({ jobId: payload.jobId, state: "queued", message: "Enregistrement reçu.", progress: 2, mode });
      }
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
          <small>TRACES AUDIO · ESCALES</small>
          <h1>Transcription des réunions</h1>
          <p>Matéo réutilise l’équipage déjà saisi dans l’escale pour reconnaître les voix.</p>
        </div>
      </header>

      <section className="transcription-panel">
        <div className="transcription-mode-grid" aria-label="Mode de transcription">
          <button
            type="button"
            className={`transcription-mode${mode === "local" ? " active" : ""}`}
            onClick={() => { setMode("local"); resetRun(); }}
          >
            <small>GRATUIT · SUR CE PC</small>
            <strong>Local renforcé</strong>
            <span>large-v3-turbo + repérage local des interlocuteurs. Coût API : 0 $.</span>
          </button>
          <button
            type="button"
            className={`transcription-mode high${mode === "high" ? " active" : ""}`}
            onClick={() => { setMode("high"); resetRun(); }}
          >
            <small>DOSSIER SENSIBLE</small>
            <strong>Vérifié</strong>
            <span>Même traitement local, puis une seconde lecture GPT du texte seulement.</span>
          </button>
        </div>

        <div className="transcription-statusline">
          <strong>{mode === "high" ? "Dossier sensible" : "Moteur local renforcé"}</strong>
          <span className={engineReady ? "ready" : "not-ready"}>
            {engineReady ? `Prêt · ${health?.localModel || "large-v3-turbo"}` : "Configuration nécessaire"}
          </span>
        </div>

        {!health?.localEngineReady && health ? (
          <div className="transcription-callout">
            Lance une seule fois <code>npm run transcription:setup</code>, puis redémarre le moteur de transcription.
          </div>
        ) : null}

        <div className="transcription-context">
          <span>Escale / réunion de Matéo</span>
          <select value={meetingId} onChange={(event) => { setMeetingId(event.target.value); resetRun(); }}>
            <option value="">Audio hors escale / participants à saisir manuellement</option>
            {escales.map((escale) => (
              <option key={escale.id} value={escale.id}>
                {escale.meetingDate ? `${escale.meetingDate} · ` : ""}{escale.title} · {escale.projectName}
              </option>
            ))}
          </select>
          {selectedMeeting ? (
            <small>{selectedMeeting.participantCount} participant{selectedMeeting.participantCount > 1 ? "s" : ""} prévu{selectedMeeting.participantCount > 1 ? "s" : ""} · {participants.join(" · ") || "aucun nom enregistré"}</small>
          ) : (
            <>
              <textarea
                value={manualParticipants}
                onChange={(event) => setManualParticipants(event.target.value)}
                rows={3}
                placeholder="Un nom par ligne, uniquement si l’audio n’est pas déjà rattaché à une escale."
              />
              <small>Dans une escale normale, cette saisie est inutile : Vogue Marry récupère les noms déjà enregistrés.</small>
            </>
          )}
        </div>

        {health?.pyannoteInstalled && !health?.huggingFaceConfigured ? (
          <div className="transcription-api-config">
            <strong>Activer gratuitement la reconnaissance des interlocuteurs</strong>
            <p>Pyannote Community-1 fonctionne ensuite en local. Après avoir accepté les conditions du modèle sur Hugging Face, colle ici ton jeton une seule fois.</p>
            <div>
              <input
                type="password"
                value={hfTokenInput}
                onChange={(event) => setHfTokenInput(event.target.value)}
                placeholder="hf_…"
                autoComplete="off"
              />
              <button type="button" onClick={saveHfToken} disabled={!hfTokenInput.trim()}>Activer les voix</button>
            </div>
          </div>
        ) : null}

        {health?.localDiarizationReady ? (
          <div className="transcription-callout">
            <strong>Interlocuteurs · gratuit</strong>
            <div>Pyannote est prêt. Vogue Marry utilise le nombre et les noms de l’escale, puis cherche les présentations faites en début de réunion pour associer les voix aux personnes.</div>
          </div>
        ) : null}

        {mode === "high" && !health?.openAIConfigured && health ? (
          <div className="transcription-api-config">
            <strong>Activer la vérification dossier sensible</strong>
            <p>La clé OpenAI reste enregistrée uniquement sur ce PC dans <code>~/.config/vogue-merry/</code>.</p>
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

        {mode === "high" ? (
          <label className="transcription-context">
            <span>Contexte utile à la vérification</span>
            <textarea
              value={contextHint}
              onChange={(event) => setContextHint(event.target.value)}
              rows={3}
              placeholder="Sigles, vocabulaire métier, contexte de la réunion…"
            />
            <small>Les noms des participants sont ajoutés automatiquement depuis l’escale.</small>
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
          {file ? (
            <>
              <strong>{file.name}</strong>
              <span>{formatSize(file.size)}{audioDuration ? ` · ${formatClock(audioDuration)}` : ""}</span>
            </>
          ) : <span>Aucun fichier sélectionné.</span>}
        </div>

        {file ? (
          <div className="transcription-callout">
            <strong>{mode === "high" ? "Coût estimé avant lancement" : "Coût"}</strong>
            <div>
              {mode === "high"
                ? (audioDuration
                  ? <><strong>{formatUsd(estimatedCost)}</strong> · seule la seconde lecture GPT est payante. Le repérage des voix reste local et gratuit.</>
                  : <>Calcul de la durée en cours…</>)
                : <><strong>0 $</strong> · transcription et repérage des interlocuteurs en local.</>}
            </div>
          </div>
        ) : null}

        <button type="button" className="transcription-start" disabled={!canStart} onClick={startTranscription}>
          {busy
            ? "Transcription en cours…"
            : mode === "high"
              ? "Transcrire et vérifier"
              : "Transcrire gratuitement"}
        </button>

        {job ? (
          <div className="transcription-progress">
            <div><strong>{job.message || job.state}</strong><span>{job.progress || 0}%</span></div>
            <progress max="100" value={job.progress || 0} />
            {job.duration ? <small>{formatClock(job.duration)} d’audio · {job.segmentCount || 0} passages structurés</small> : null}
          </div>
        ) : null}

        {error ? <div className="transcription-error">{error}</div> : null}
      </section>

      {result ? (
        <section className="transcription-result">
          <div className="transcription-result-head">
            <div>
              <small>{result.mode === "high" ? "DOSSIER SENSIBLE · VÉRIFIÉ" : "LOCAL RENFORCÉ · TERMINÉ"}</small>
              <h2>{result.originalName}</h2>
              <p>
                <strong>{result.participantCount || 0} participant{result.participantCount > 1 ? "s" : ""} attendu{result.participantCount > 1 ? "s" : ""}</strong>
                {result.detectedSpeakerCount ? ` · ${result.detectedSpeakerCount} voix détectée${result.detectedSpeakerCount > 1 ? "s" : ""}` : ""}
              </p>
              {result.mode === "high" ? <p><strong>Coût API estimé : {formatUsd(completedCost)}</strong> · reconnaissance des voix : 0 $.</p> : <p><strong>Coût API : 0 $</strong>.</p>}
              {result.unresolvedSpeakers?.length ? <p className="transcription-result-warning">À confirmer : {result.unresolvedSpeakers.join(" · ")}</p> : null}
              {result.warnings?.length ? <p className="transcription-result-warning">{result.warnings.join(" · ")}</p> : null}
            </div>
            <div>
              <a href={`${API}/api/transcription/${result.jobId}/download`}>Télécharger le texte</a>
              {result.mode === "high" ? <><br /><a href={`${API}/api/transcription/${result.jobId}/download-verification`}>Télécharger la vérification GPT</a></> : null}
            </div>
          </div>
          <pre>{transcript}</pre>
        </section>
      ) : null}
    </main>
  );
}
