import React, { useMemo, useState } from "react";
import "./style.css";

const spaces = [
  ["pont", "⛵", "Pont du navire"],
  ["iles", "🏝️", "Mes îles"],
  ["carte", "🗺️", "Carte de l’île"],
  ["escales", "⚓", "Escales"],
  ["audio", "🎙️", "Traces audio"],
  ["journal", "📖", "Journal de bord"],
  ["coffre", "🧰", "Coffre"],
  ["equipage", "👥", "Équipage"],
  ["manoeuvres", "🪢", "Manœuvres"],
  ["caps", "✅", "Caps validés"],
  ["longuevue", "🔭", "Longue-vue"]
];

const views = {
  pont: {
    title: "Pont du navire",
    intro: "Vue globale du projet actif. On voit vite quoi reprendre, ce qui bloque et où aller.",
    cards: [
      ["Île active", "Exemple — Première île"],
      ["Dernière escale", "Escale de cadrage"],
      ["Dernier cap", "Créer une mémoire projet navigable"],
      ["À faire ensuite", "Structurer les modules sans entasser"]
    ]
  },
  iles: {
    title: "Mes îles",
    intro: "Chaque île est un projet séparé. On choisit un projet avant d’ouvrir sa carte ou ses escales.",
    cards: [["Projet", "Exemple — Première île"], ["Statut", "Actif"], ["Escales", "1 réunion consignée"], ["Prochaine action", "Ouvrir la carte de l’île"]]
  },
  carte: {
    title: "Carte de l’île",
    intro: "La carte résume le projet actif : contexte, décisions, actions, risques et documents à retrouver.",
    cards: [["Contexte", "Première escale de cadrage"], ["Cap", "Mémoire projet navigable"], ["Risque", "Ne pas réduire l’outil à une décoration"], ["Suite", "Créer les vues métier une par une"]]
  },
  escales: {
    title: "Escales",
    intro: "Les escales regroupent réunions, points projet, notes, décisions et matière brute.",
    cards: [["Escale", "Escale de cadrage"], ["Date", "19/05/2026"], ["Équipage", "Sofia, équipe projet"], ["Export", "VOGUE-MERRY-DONNEES"]]
  },
  audio: {
    title: "Traces audio",
    intro: "Les traces audio servent à conserver la source brute avant transcription et journal de bord.",
    cards: [["Audio", "À importer"], ["Transcription", "À générer"], ["Marqueurs", "À poser pendant l’escale"], ["Lien", "Relié au journal"]]
  },
  journal: {
    title: "Journal de bord",
    intro: "Le journal transforme l’audio, les notes et les décisions en compte rendu utile.",
    cards: [["Document de travail", "Modifiable"], ["Version validée", "Référence"], ["Historique", "Versions précédentes"], ["Source", "Escale liée"]]
  },
  coffre: {
    title: "Coffre",
    intro: "Le coffre garde documents, preuves, pièces jointes et exports liés au projet.",
    cards: [["Documents", "À classer"], ["Exports", "Markdown / JSON"], ["Sources", "Audios, notes, pièces"], ["Sécurité", "Local d’abord"]]
  },
  equipage: {
    title: "Équipage",
    intro: "L’équipage permet de savoir qui participe, qui décide et qui doit agir.",
    cards: [["Sofia", "Capitaine de projet"], ["Équipe projet", "Contributeurs"], ["Client", "Décision / validation"], ["Référent métier", "Appui contenu"]]
  },
  manoeuvres: {
    title: "Manœuvres",
    intro: "Les manœuvres transforment les échanges en actions suivies.",
    cards: [["Action", "Structurer les modules"], ["Responsable", "À définir"], ["Échéance", "À fixer"], ["Statut", "En cours"]]
  },
  caps: {
    title: "Caps validés",
    intro: "Les caps validés sont les décisions et arbitrages. Ce n’est pas la boussole : la boussole, c’est le Log Pose.",
    cards: [["Décision", "Créer une mémoire projet navigable"], ["Source", "Escale de cadrage"], ["Statut", "Validé"], ["Impact", "Structure de l’outil"]]
  },
  longuevue: {
    title: "Longue-vue",
    intro: "La longue-vue sert à rechercher dans la mémoire du projet sans savoir où l’information est rangée.",
    cards: [["Recherche", "Décision, action, document"], ["Filtre", "Projet / type"], ["Résultat", "Avec contexte"], ["Ouverture", "Retour vers l’escale"]]
  }
};

export default function App() {
  const [active, setActive] = useState("pont");
  const view = useMemo(() => views[active] || views.pont, [active]);

  return (
    <main className="vogueLayout">
      <header className="topLine">
        <strong>Grande Ligne</strong>
        {[
          "Pont",
          "Île",
          "Carte",
          "Escale",
          "Journal",
          "Caps",
          "Manœuvres",
          "🧭 Log Pose"
        ].map((step) => <span key={step}>{step}</span>)}
      </header>

      <aside className="leftNav">
        <h1>Vogue Merry</h1>
        {spaces.map(([id, icon, label]) => (
          <button key={id} className={active === id ? "navActive" : ""} onClick={() => setActive(id)}>
            {icon} {label}
          </button>
        ))}
      </aside>

      <section className="workspace">
        <p className="eyebrow">Poste de navigation métier</p>
        <h2>{view.title}</h2>
        <p>{view.intro}</p>
        <div className="commandGrid">
          {view.cards.map(([label, value]) => (
            <article key={label}><small>{label}</small><strong>{value}</strong></article>
          ))}
        </div>
      </section>

      <aside className="rightLogPose">
        <h2>🧭 Log Pose</h2>
        <small>Boussole du projet</small>
        <article><strong>Cap validé</strong><p>Créer une mémoire projet navigable.</p></article>
        <article><strong>Manœuvre</strong><p>Structurer les modules sans entasser.</p></article>
        <article><strong>Vigilance</strong><p>Ne pas confondre décor et ergonomie.</p></article>
        <article><strong>Prochaine direction</strong><p>Transformer chaque bouton en vraie page métier.</p></article>
      </aside>
    </main>
  );
}
