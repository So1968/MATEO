import React, { useMemo, useRef, useState } from "react";
import MeetingMode from "./components/MeetingMode.jsx";
import "./style.css";

const API_BASE = "http://127.0.0.1:8010";

const spaces = [
  ["pont", "🗺️", "Carte de l’archipel"],
  ["water", "🏗️", "Water Seven"],
  ["iles", "🏝️", "Mes îles"],
  ["carte", "🌋", "Carte de l’île"],
  ["escales", "⚓", "Escales"],
  ["audio", "🎙️", "Traces audio"],
  ["journal", "📖", "Journal de bord"],
  ["coffre", "🧰", "Coffre"],
  ["equipage", "👥", "Équipage"],
  ["manoeuvres", "🪢", "Manœuvres"],
  ["caps", "✅", "Caps validés"],
  ["longuevue", "🔭", "Longue-vue"],
  ["phare", "🗼", "Phare"],
  ["logpose", "🧭", "Log Pose"]
];

const projects = [
  { name: "BPM interne", keys: ["bpm", "process", "workflow", "architecture", "api"] },
  { name: "Transcription IA", keys: ["audio", "transcription", "whisper", "compte rendu", "reunion"] },
  { name: "Portail client", keys: ["client", "ux", "portail", "interface", "maquette"] },
  { name: "Veille outils", keys: ["veille", "outil", "comparatif", "benchmark"] }
];

const sampleFiles = [
  "CR_reunion_BPM_architecture_22mai.pdf",
  "audio_point_transcription_ia.m4a",
  "decision_budget_bpm.md",
  "capture_portail_client_ux.png",
  "lien_doc_api_documentaire.txt"
];

function detectDate(text) {
  const datePattern = /(\d{1,2})[-_\s]?(janvier|fevrier|février|mars|avril|mai|juin|juillet|aout|août|septembre|octobre|novembre|decembre|décembre|\d{1,2})/i;
  const result = text.match(datePattern);
  return result ? result[0].replaceAll("_", " ") : "À confirmer";
}

function analyseDocument(file) {
  const name = typeof file === "string" ? file : file?.name || "document_sans_nom";
  const text = name.toLowerCase();
  const ext = text.includes(".") ? text.split(".").pop() : "inconnu";
  const score = projects.map((project) => ({
    name: project.name,
    score: project.keys.reduce((total, key) => total + (text.includes(key) ? 1 : 0), 0)
  })).sort((a, b) => b.score - a.score)[0];

  const project = score.score > 0 ? score.name : "À confirmer";
  const isAudio = ["mp3", "wav", "m4a", "ogg", "webm"].includes(ext);
  const isImage = ["png", "jpg", "jpeg", "webp"].includes(ext);
  const isMeeting = /cr|reunion|réunion|compte.?rendu|escale/.test(text);
  const isDecision = /decision|décision|valide|validé|arbitrage|accord/.test(text);
  const isAction = /action|todo|relance|a-faire|faire|envoyer|prevoir|prévoir/.test(text);
  const isDoc = /pdf|doc|docx|txt|md|contrat|facture|scan|api|documentation|lien/.test(text);

  let category = "Épaves à trier";
  let target = "Water Seven";
  let reason = "Type ou projet encore flou";

  if (isAudio) {
    category = "Trace audio";
    target = "Traces audio";
    reason = "extension audio détectée";
  } else if (isDecision) {
    category = "Cap validé";
    target = "Caps validés";
    reason = "mot-clé de décision détecté";
  } else if (isMeeting) {
    category = "Compte-rendu / réunion";
    target = "Journal de bord + Escales";
    reason = "mot-clé réunion ou CR détecté";
  } else if (isAction) {
    category = "Manœuvre";
    target = "Manœuvres";
    reason = "mot-clé action détecté";
  } else if (isImage) {
    category = "Image / capture";
    target = "Coffre";
    reason = "extension image détectée";
  } else if (isDoc) {
    category = "Document";
    target = "Coffre";
    reason = "document ou lien détecté";
  }

  const warnings = [];
  if (project === "À confirmer") warnings.push("Île/projet incertain");
  if (detectDate(text) === "À confirmer") warnings.push("Date absente ou illisible");
  if (category === "Épaves à trier") warnings.push("Type de pièce à confirmer");
  if (isAction && !/mateo|sofia|client|equipe|équipe/.test(text)) warnings.push("Action possible sans responsable détecté");

  const confidence = warnings.length === 0 ? "🧭 Cap clair" : warnings.length <= 2 ? "🌫️ Brouillard" : "⚠️ Récif";

  return {
    fileName: name,
    size: typeof file === "string" ? "Simulation" : `${Math.max(1, Math.round((file?.size || 0) / 1024))} Ko`,
    extension: ext,
    project,
    category,
    target,
    date: detectDate(text),
    reason,
    confidence,
    warnings
  };
}

const views = {
  pont: { title: "Carte de l’archipel", intro: "Vue globale des projets de Mateo : urgences, récifs, prochaines manœuvres et pièces à ranger.", cards: [["Cap prioritaire", "BPM interne"], ["Récif", "Portail client : décision UX attendue"], ["Water Seven", "Glisser-déposer actif"], ["Prochaine manœuvre", "Valider le classement intelligent"]] },
  iles: { title: "Mes îles", intro: "Chaque île est un projet. On voit son statut, sa dernière activité et sa prochaine manœuvre.", cards: [["En mer", "BPM interne"], ["À remettre au cap", "Transcription IA"], ["Pris dans les récifs", "Portail client"], ["À l’ancre", "Veille outils"]] },
  carte: { title: "Carte de l’île", intro: "Résumé de reprise du projet actif : cap actuel, dernière décision, prochaine action et documents utiles.", cards: [["Cap actuel", "Créer un outil de navigation projet"], ["Dernière décision", "Water Seven doit comprendre avant de ranger"], ["Prochaine manœuvre", "Tester le dépôt intelligent"], ["Point de vigilance", "Ne pas faire un simple décor"]] },
  audio: { title: "Traces audio", intro: "Audios, transcriptions, marqueurs et résumés issus des échanges.", cards: [["Audio", "À importer"], ["Transcription", "À générer"], ["Marqueurs", "À poser pendant l’escale"], ["Lien", "Relié au journal"]] },
  journal: { title: "Journal de bord", intro: "Mémoire écrite : comptes-rendus, synthèses, notes longues et historique du projet.", cards: [["Parchemins", "Comptes-rendus"], ["Synthèses", "Reprises rapides"], ["Source", "Escale liée"], ["Version", "À valider"]] },
  coffre: { title: "Coffre", intro: "Le Coffre garde les pièces : documents, liens, images, versions, archives et pièces précieuses.", cards: [["Butin récent", "Derniers fichiers"], ["Épaves à trier", "Non classés"], ["Cartes officielles", "Versions validées"], ["Paquetage", "Dossier complet"]] },
  equipage: { title: "Équipage", intro: "Personnes, rôles, responsabilités et contacts liés à chaque île.", cards: [["Mateo", "Capitaine"], ["Équipe", "Contributeurs"], ["Métier", "Validation"], ["Référent", "Appui contenu"]] },
  manoeuvres: { title: "Manœuvres", intro: "Actions à faire, responsables, échéances, priorité et statut.", cards: [["À manœuvrer", "Classer les dépôts"], ["En navigation", "Prototype Water Seven"], ["En attente de vent", "Lecture contenu PDF"], ["Terminée", "Vision produit"]] },
  caps: { title: "Caps validés", intro: "Décisions prises, arbitrages, validations et points actés.", cards: [["Décision", "Vogue Merry = pilotage + cerveau documentaire"], ["Règle", "Si cap clair, il range"], ["Brouillard", "Il demande à Mateo"], ["Origine", "Conversation de cadrage"]] },
  longuevue: { title: "Longue-vue", intro: "Recherche dans la mémoire : documents, réunions, décisions, actions, personnes et dates.", cards: [["Recherche", "Décision, action, document"], ["Filtre", "Projet / type"], ["Résultat", "Avec contexte"], ["Ouverture", "Retour à la source"]] },
  phare: { title: "Phare", intro: "Rappels doux : actions sans échéance, documents non classés, réunions à préparer, projets sans mouvement.", cards: [["Signal", "Document sans date"], ["Signal", "Action sans responsable"], ["Signal", "Projet sans activité"], ["Signal", "Réunion sans CR"]] },
  logpose: { title: "Log Pose", intro: "Synthèse du cap : où en est le projet, ce qui compte, la prochaine action et les points à ne pas oublier.", cards: [["Cap", "Water Seven intelligent"], ["Prochaine action", "Lire le contenu réel"], ["Vigilance", "Qualité avant classement"], ["Mémoire", "Fil d’origine"]] }
};

function WaterSeven() {
  const fileInputRef = useRef(null);
  const [droppedFile, setDroppedFile] = useState(null);
  const [serverDeposit, setServerDeposit] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("idle");
  const [uploadError, setUploadError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState(sampleFiles[0]);
  const [showDetails, setShowDetails] = useState(false);
  const activeDocument = serverDeposit?.analysis || droppedFile || fileName;
  const localAnalysis = useMemo(() => analyseDocument(activeDocument), [activeDocument]);
  const analysis = serverDeposit?.analysis || localAnalysis;
  const hasDocument = Boolean(droppedFile || serverDeposit);

  async function sendToWaterSeven(file) {
    const formData = new FormData();
    formData.append("document", file);
    setUploadStatus("uploading");
    setUploadError("");
    setServerDeposit(null);

    try {
      const response = await fetch(`${API_BASE}/api/water-seven/deposit`, { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Dépôt impossible dans Water Seven.");
      setServerDeposit(data.deposit);
      setUploadStatus("success");
    } catch (error) {
      setUploadStatus("error");
      setUploadError(error.message || "Backend indisponible.");
    }
  }

  function handleFiles(files) {
    const [file] = Array.from(files || []);
    if (!file) return;
    setDroppedFile(file);
    sendToWaterSeven(file);
  }

  return (
    <section className="waterScene">
      <div className="waterHero">
        <p className="eyebrow">Water Seven — Port d’entrée</p>
        <h2>Dépose. Vogue Merry trie.</h2>
        <p>Un quai simple pour accueillir les pièces. Mateo glisse un document, le bateau propose le bon cap.</p>
      </div>

      <div
        className={`dropHarbor ${isDragging ? "dropHarborActive" : ""}`}
        onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
        onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => { event.preventDefault(); setIsDragging(false); handleFiles(event.dataTransfer.files); }}
        onClick={() => fileInputRef.current?.click()}
      >
        <input ref={fileInputRef} type="file" onChange={(event) => handleFiles(event.target.files)} style={{ display: "none" }} />
        <div className="dockIcon">📦</div>
        <strong>{hasDocument ? "Document reçu sur le quai" : "Glisse le document ici"}</strong>
        <span>{hasDocument ? analysis.fileName : "PDF, image, audio, note, compte-rendu ou lien exporté"}</span>
        {uploadStatus === "uploading" && <em>Water Seven range la caisse sur le quai...</em>}
        {uploadStatus === "success" && <em>Fichier sauvegardé. Fil d’origine créé.</em>}
        {uploadStatus === "error" && <em>{uploadError}</em>}
      </div>

      {hasDocument ? (
        <div className="simpleProposal">
          <div>
            <small>Île probable</small>
            <strong>{analysis.project}</strong>
          </div>
          <div>
            <small>Rangement</small>
            <strong>{analysis.target}</strong>
          </div>
          <div>
            <small>Confiance</small>
            <strong>{analysis.confidence}</strong>
          </div>
          <button>Valider le rangement</button>
          <button className="secondaryButton">Corriger</button>
          <button className="secondaryButton">Mettre à quai</button>
        </div>
      ) : (
        <div className="quietTestBox">
          <small>Mode essai, en attendant un fichier réel</small>
          <input value={fileName} onChange={(event) => setFileName(event.target.value)} />
          <span>{sampleFiles.slice(0, 3).join(" · ")}</span>
        </div>
      )}

      <button className="detailsToggle" onClick={() => setShowDetails((value) => !value)}>
        {showDetails ? "Masquer les détails" : "Voir les détails de la vigie"}
      </button>

      {showDetails && (
        <div className="detailsDeck">
          <article><small>Type détecté</small><strong>{analysis.category}</strong></article>
          <article><small>Date détectée</small><strong>{analysis.date}</strong></article>
          <article><small>Vigie qualité</small><strong>{analysis.warnings.length ? "À vérifier" : "OK"}</strong><p>{analysis.warnings.length ? analysis.warnings.join(" · ") : "Aucun signal bloquant."}</p></article>
          <article><small>Fil d’origine</small><strong>{serverDeposit?.id || "En attente"}</strong><p>{analysis.reason}. {serverDeposit?.filePath || "Le chemin apparaîtra après dépôt réel."}</p></article>
        </div>
      )}
    </section>
  );
}

export default function App() {
  const [active, setActive] = useState("water");
  const [isRecording, setIsRecording] = useState(false);
  const [markers, setMarkers] = useState([]);
  const view = useMemo(() => views[active] || views.pont, [active]);

  function handleAddMarker(marker) {
    setMarkers((current) => [marker, ...current]);
  }

  return (
    <main className="vogueLayout">
      <header className="topLine">
        <strong>Vogue Merry</strong>
        {["Carte de l’archipel", "Water Seven", "Coffre", "Longue-vue", "Phare", "🧭 Log Pose"].map((step) => <span key={step}>{step}</span>)}
      </header>

      <aside className="leftNav">
        <h1>Vogue Merry</h1>
        {spaces.map(([id, icon, label]) => (
          <button key={id} className={active === id ? "navActive" : ""} onClick={() => setActive(id)}>{icon} {label}</button>
        ))}
      </aside>

      <section className="workspace">
        {active === "water" ? (
          <WaterSeven />
        ) : (
          <>
            <p className="eyebrow">Poste de navigation métier</p>
            <h2>{view.title}</h2>
            <p>{view.intro}</p>
            <div className="commandGrid">
              {view.cards.map(([label, value]) => <article key={label}><small>{label}</small><strong>{value}</strong></article>)}
            </div>
          </>
        )}

        {active === "escales" && (
          <MeetingMode
            projectName="BPM interne"
            reportTitle="Escale de cadrage"
            isRecording={isRecording}
            onStartRecording={() => setIsRecording(true)}
            onStopRecording={() => setIsRecording(false)}
            onAddMarker={handleAddMarker}
            markers={markers}
          />
        )}
      </section>

      <aside className="rightLogPose">
        <h2>🧭 Log Pose</h2>
        <small>Boussole de Mateo</small>
        <article><strong>Cap validé</strong><p>Vogue Merry = pilotage projet + cerveau documentaire.</p></article>
        <article><strong>Water Seven</strong><p>Un quai simple : Mateo glisse, Vogue Merry propose.</p></article>
        <article><strong>Règle</strong><p>Si le cap est clair, il range. Si le brouillard est là, il demande.</p></article>
        <article><strong>Prochaine direction</strong><p>Déplacer automatiquement vers le bon Coffre après validation.</p></article>
      </aside>
    </main>
  );
}
