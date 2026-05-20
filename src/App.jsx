import React, { useMemo, useState } from "react";
import MeetingMode from "./components/MeetingMode.jsx";
import "./style.css";

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

function analyseDocument(name) {
  const text = name.toLowerCase();
  const ext = text.includes(".") ? text.split(".").pop() : "inconnu";
  const score = projects.map((project) => ({
    name: project.name,
    score: project.keys.reduce((total, key) => total + (text.includes(key) ? 1 : 0), 0)
  })).sort((a, b) => b.score - a.score)[0];

  const project = score.score > 0 ? score.name : "À confirmer";
  const isAudio = ["mp3", "wav", "m4a", "ogg"].includes(ext);
  const isImage = ["png", "jpg", "jpeg", "webp"].includes(ext);
  const isMeeting = /cr|reunion|réunion|compte.?rendu|escale/.test(text);
  const isDecision = /decision|décision|valide|validé|arbitrage|accord/.test(text);
  const isAction = /action|todo|relance|a-faire|faire|envoyer|prevoir|prévoir/.test(text);
  const isDoc = /pdf|doc|contrat|facture|scan|api|documentation|lien/.test(text);

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
  pont: {
    title: "Carte de l’archipel",
    intro: "Vue globale des projets de Mateo : urgences, récifs, prochaines manœuvres et pièces à ranger.",
    cards: [["Cap prioritaire", "BPM interne"], ["Récif", "Portail client : décision UX attendue"], ["Water Seven", "5 éléments à trier"], ["Prochaine manœuvre", "Valider le classement intelligent"]]
  },
  iles: {
    title: "Mes îles",
    intro: "Chaque île est un projet. On voit son statut, sa dernière activité et sa prochaine manœuvre.",
    cards: [["En mer", "BPM interne"], ["À remettre au cap", "Transcription IA"], ["Pris dans les récifs", "Portail client"], ["À l’ancre", "Veille outils"]]
  },
  carte: {
    title: "Carte de l’île",
    intro: "Résumé de reprise du projet actif : cap actuel, dernière décision, prochaine action et documents utiles.",
    cards: [["Cap actuel", "Créer un outil de navigation projet"], ["Dernière décision", "Water Seven doit comprendre avant de ranger"], ["Prochaine manœuvre", "Tester le dépôt intelligent"], ["Point de vigilance", "Ne pas faire un simple décor"]]
  },
  audio: {
    title: "Traces audio",
    intro: "Audios, transcriptions, marqueurs et résumés issus des échanges.",
    cards: [["Audio", "À importer"], ["Transcription", "À générer"], ["Marqueurs", "À poser pendant l’escale"], ["Lien", "Relié au journal"]]
  },
  journal: {
    title: "Journal de bord",
    intro: "Mémoire écrite : comptes-rendus, synthèses, notes longues et historique du projet.",
    cards: [["Parchemins", "Comptes-rendus"], ["Synthèses", "Reprises rapides"], ["Source", "Escale liée"], ["Version", "À valider"]]
  },
  coffre: {
    title: "Coffre",
    intro: "Le Coffre garde les pièces : documents, liens, images, versions, archives et pièces précieuses.",
    cards: [["Butin récent", "Derniers fichiers"], ["Épaves à trier", "Non classés"], ["Cartes officielles", "Versions validées"], ["Paquetage", "Dossier complet"]]
  },
  equipage: {
    title: "Équipage",
    intro: "Personnes, rôles, responsabilités et contacts liés à chaque île.",
    cards: [["Mateo", "Capitaine"], ["Équipe", "Contributeurs"], ["Métier", "Validation"], ["Référent", "Appui contenu"]]
  },
  manoeuvres: {
    title: "Manœuvres",
    intro: "Actions à faire, responsables, échéances, priorité et statut.",
    cards: [["À manœuvrer", "Classer les dépôts"], ["En navigation", "Prototype Water Seven"], ["En attente de vent", "Lecture contenu PDF"], ["Terminée", "Vision produit"]]
  },
  caps: {
    title: "Caps validés",
    intro: "Décisions prises, arbitrages, validations et points actés.",
    cards: [["Décision", "Vogue Merry = pilotage + cerveau documentaire"], ["Règle", "Si cap clair, il range"], ["Brouillard", "Il demande à Mateo"], ["Origine", "Conversation de cadrage"]]
  },
  longuevue: {
    title: "Longue-vue",
    intro: "Recherche dans la mémoire : documents, réunions, décisions, actions, personnes et dates.",
    cards: [["Recherche", "Décision, action, document"], ["Filtre", "Projet / type"], ["Résultat", "Avec contexte"], ["Ouverture", "Retour à la source"]]
  },
  phare: {
    title: "Phare",
    intro: "Rappels doux : actions sans échéance, documents non classés, réunions à préparer, projets sans mouvement.",
    cards: [["Signal", "Document sans date"], ["Signal", "Action sans responsable"], ["Signal", "Projet sans activité"], ["Signal", "Réunion sans CR"]]
  },
  logpose: {
    title: "Log Pose",
    intro: "Synthèse du cap : où en est le projet, ce qui compte, la prochaine action et les points à ne pas oublier.",
    cards: [["Cap", "Water Seven intelligent"], ["Prochaine action", "Brancher le dépôt réel"], ["Vigilance", "Qualité avant classement"], ["Mémoire", "Fil d’origine"]]
  }
};

function WaterSeven() {
  const [fileName, setFileName] = useState(sampleFiles[0]);
  const analysis = useMemo(() => analyseDocument(fileName), [fileName]);

  return (
    <>
      <p className="eyebrow">Port d’entrée intelligent</p>
      <h2>Water Seven</h2>
      <p>Mateo dépose. Vogue Merry reconnaît, propose le rangement, signale le brouillard et garde le fil d’origine.</p>

      <div className="commandGrid">
        <article>
          <small>Document déposé</small>
          <strong>Tester l’analyse</strong>
          <input
            value={fileName}
            onChange={(event) => setFileName(event.target.value)}
            style={{ width: "100%", marginTop: 14, padding: 12, borderRadius: 14, border: "1px solid rgba(216,168,73,.42)" }}
          />
          <p>Exemples : {sampleFiles.join(" · ")}</p>
        </article>
        <article><small>Île probable</small><strong>{analysis.project}</strong></article>
        <article><small>Type détecté</small><strong>{analysis.category}</strong></article>
        <article><small>Date détectée</small><strong>{analysis.date}</strong></article>
        <article><small>Rangement conseillé</small><strong>{analysis.target}</strong></article>
        <article><small>Niveau de confiance</small><strong>{analysis.confidence}</strong></article>
      </div>

      <div className="commandGrid">
        <article>
          <small>Vigie qualité</small>
          <strong>{analysis.warnings.length ? "À vérifier avant rangement" : "Document exploitable"}</strong>
          <p>{analysis.warnings.length ? analysis.warnings.join(" · ") : "Aucun signal bloquant détecté."}</p>
        </article>
        <article>
          <small>Fil d’origine</small>
          <strong>Pourquoi ce classement ?</strong>
          <p>{analysis.reason}. Extension détectée : {analysis.extension}. Dépôt simulé par Mateo dans Water Seven.</p>
        </article>
        <article>
          <small>Action proposée</small>
          <strong>Valider ou corriger</strong>
          <p>Si le cap est clair, Vogue Merry range. Si le brouillard est là, il demande à Mateo.</p>
        </article>
        <article>
          <small>Boutons V1</small>
          <strong>Valider · Corriger · Mettre à quai</strong>
          <p>La prochaine étape sera de brancher un vrai glisser-déposer de fichiers.</p>
        </article>
      </div>
    </>
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
        <article><strong>Water Seven</strong><p>Mateo dépose. Vogue Merry comprend, propose et classe.</p></article>
        <article><strong>Règle</strong><p>Si le cap est clair, il range. Si le brouillard est là, il demande.</p></article>
        <article><strong>Prochaine direction</strong><p>Brancher le dépôt réel de fichiers.</p></article>
      </aside>
    </main>
  );
}
