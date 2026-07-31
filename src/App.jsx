import React, { useMemo, useState } from "react";
import {
  Anchor,
  BookOpen,
  Compass,
  FolderOpen,
  Map,
  ShipWheel,
  Telescope
} from "lucide-react";
import MeetingMode from "./components/MeetingMode.jsx";
import "./vogue-mainee-pirate.css";

const navItems = [
  { id: "pont", label: "Pont", subtitle: "Vue d’ensemble", icon: ShipWheel },
  { id: "iles", label: "Îles", subtitle: "Vos projets", icon: Map },
  { id: "escales", label: "Escales", subtitle: "Réunions & comités", icon: Anchor, count: 5 },
  { id: "journal", label: "Journal", subtitle: "Comptes rendus", icon: BookOpen, count: 8 },
  { id: "coffre", label: "Coffre", subtitle: "Documents", icon: FolderOpen, count: 23 },
  { id: "longuevue", label: "Longue-vue", subtitle: "Recherche & veille", icon: Telescope }
];

const islands = [
  { id: "longuevue", name: "Phare d’Émeraude", subtitle: "Forecast grand compte", status: "En cours", tone: "green", x: 22, y: 38, icon: "⚓" },
  { id: "iles", name: "Baie des Alizés", subtitle: "Campagne budget", status: "En cours", tone: "green", x: 49, y: 31, icon: "🌴" },
  { id: "coffre", name: "Atoll des Brumes", subtitle: "Marge & chiffre d’affaires", status: "À venir", tone: "blue", x: 74, y: 58, icon: "☁" },
  { id: "journal", name: "Île des Courants", subtitle: "Reporting performance", status: "Priorité", tone: "red", x: 47, y: 71, icon: "≋" }
];

const workspaceData = {
  iles: {
    title: "Archipel des projets",
    intro: "Chaque projet devient une île lisible : contexte, état, documents, décisions et prochaine reprise.",
    cards: [
      ["Destination active", "Île des Courants", "Reporting performance à reprendre en priorité."],
      ["Cap à tenir", "Ne pas mélanger", "Projet, réunion, document et décision restent reliés."],
      ["Prochain geste", "Ouvrir une fiche", "Une page claire, exploitable, transmissible."]
    ]
  },
  escales: {
    title: "Escales de réunion",
    intro: "Une réunion devient une escale : audio, marqueurs, décisions, actions et compte rendu utile.",
    cards: [
      ["Départ", "Cadre de réunion", "Pourquoi on se réunit, avec qui, pour décider quoi."],
      ["Pendant", "Marqueurs", "Décision · action · blocage · idée à reprendre."],
      ["Arrivée", "Compte rendu", "Une reprise reliée au projet et au journal."]
    ]
  },
  journal: {
    title: "Journal de bord",
    intro: "La mémoire longue du navire : ce qui a été décidé, ce qui reste fragile, ce qu’il faut reprendre.",
    cards: [
      ["Dernière page", "Direction artistique", "Arrêt des dashboards déguisés et retour au navire."],
      ["Cap validé", "Vogue Merry ≠ Azoth", "Azoth porte le produit, Vogue Merry est le navire de Mateo."],
      ["À écrire", "Synthèse de continuité", "Ce qui change, ce qui reste à faire, le prochain cap."]
    ]
  },
  coffre: {
    title: "Coffre de bord",
    intro: "Le coffre protège les pièces utiles : documents, captures, versions, preuves et références.",
    cards: [
      ["À classer", "Supports de démo", "Pitch, captures, documents de présentation, anciennes pistes."],
      ["Protection", "Archive avant nettoyage", "Ne rien supprimer tant que le cap officiel n’est pas clair."],
      ["Règle", "Chaque pièce a un usage", "Projet, escale, décision ou journal de reprise."]
    ]
  },
  longuevue: {
    title: "Longue-vue",
    intro: "Retrouver une trace avec son contexte, pas afficher une liste de résultats sans âme.",
    cards: [
      ["Question", "Une requête simple", "Retrouver une décision, un document, une réunion ou une action."],
      ["Filtres", "Projet · date · type", "Réduire le bruit sans casser la fluidité."],
      ["Résultat", "Trace + contexte", "D’où ça vient, à quoi ça sert, quoi faire ensuite."]
    ]
  }
};

function Sidebar({ active, onChange }) {
  return (
    <aside className="bridgeSidebar">
      <div className="sidebarOrnament" />
      <div className="brandCompass"><Compass size={34} /></div>
      <div className="brandBlock">
        <h1>Vogue Mary</h1>
        <p>Le journal de bord qui vous aide à garder le cap sur vos projets.</p>
      </div>
      <nav className="sideNav" aria-label="Navigation Vogue Merry">
        {navItems.map(({ id, label, subtitle, icon: Icon, count }) => (
          <button key={id} type="button" className={active === id ? "active" : ""} onClick={() => onChange(id)}>
            <Icon size={30} />
            <span><strong>{label}</strong><small>{subtitle}</small></span>
            {count ? <em>{count}</em> : null}
          </button>
        ))}
      </nav>
      <div className="captainDock">
        <div className="captainAvatar">M</div>
        <div><strong>Capitaine Mateo</strong><span>Gardien du cap</span></div>
      </div>
      <div className="sideTools"><span>⚙</span><span>🔔</span><span>?</span></div>
    </aside>
  );
}

function IslandCard({ island, onChange }) {
  return (
    <button
      className={`islandCard ${island.tone}`}
      style={{ left: `${island.x}%`, top: `${island.y}%` }}
      type="button"
      onClick={() => onChange(island.id)}
    >
      <span className="islandBadge">{island.icon}</span>
      <strong>{island.name}</strong>
      <small>{island.subtitle}</small>
      <em>{island.status}</em>
    </button>
  );
}

function PontMap({ onChange }) {
  return (
    <section className="mapWindow" aria-label="Carte des îles de Vogue Merry">
      <div className="mapSky left" />
      <div className="mapSky right" />
      <div className="seaIllustration">
        <svg className="routeLines" viewBox="0 0 1000 620" preserveAspectRatio="none" aria-hidden="true">
          <path d="M150 300 C310 200 430 350 520 255 S700 230 850 360" />
          <path d="M360 455 C270 325 430 270 580 355 S710 500 820 415" />
          <path d="M245 415 C365 550 520 470 600 380" />
        </svg>
        <div className="mapCompassRose">N<br /><span>W&nbsp;&nbsp;&nbsp;&nbsp;E</span><br />S</div>
        <div className="paintedIsland lighthouse" />
        <div className="paintedIsland palms" />
        <div className="paintedIsland rocks" />
        <div className="paintedIsland harbor" />
        {islands.map((island) => <IslandCard key={island.name} island={island} onChange={onChange} />)}
        <div className="deskObjects">
          <div className="spyglass" />
          <div className="openJournal" />
          <div className="deckCompass" />
        </div>
      </div>
    </section>
  );
}

function LogPose({ active }) {
  const activeLabel = useMemo(() => navItems.find((item) => item.id === active)?.label || "Pont", [active]);
  return (
    <aside className="logPosePanel">
      <div className="paperPins"><span /><span /></div>
      <header>
        <h2>Log Pose</h2>
        <small>{activeLabel}</small>
      </header>
      <div className="compassObject"><Compass size={98} /></div>
      <article>
        <small>Cap actuel</small>
        <strong>Nord-Est</strong>
        <p>Croissance & efficacité</p>
      </article>
      <article>
        <small>Prochaine direction</small>
        <strong>Transformer les cartes en vraies pages métier</strong>
        <p>Données & automatisation</p>
      </article>
      <button type="button">Voir le détail <span>→</span></button>
    </aside>
  );
}

function Pont({ onChange }) {
  return (
    <section className="pontScene">
      <div className="ceilingBeam" />
      <div className="lantern" />
      <div className="topRoundButtons"><span>🔔</span><span>⚙</span></div>
      <header className="pontHeader">
        <h1>Pont du navire</h1>
        <p>Reprendre le cap sur vos projets actifs</p>
      </header>
      <PontMap onChange={onChange} />
    </section>
  );
}

function Workspace({ active, isRecording, setIsRecording, markers, setMarkers }) {
  const data = workspaceData[active] || workspaceData.iles;
  return (
    <section className="workspaceScene">
      <div className="ceilingBeam" />
      <header className="workspaceHeader">
        <p>Zone active</p>
        <h1>{data.title}</h1>
        <span>{data.intro}</span>
      </header>
      <div className="workspaceBoard">
        {data.cards.map(([label, value, text]) => (
          <article key={label}>
            <small>{label}</small>
            <strong>{value}</strong>
            <p>{text}</p>
          </article>
        ))}
      </div>
      {active === "escales" && (
        <div className="meetingWrap">
          <MeetingMode
            projectName="Île des Courants — Reporting performance"
            reportTitle="Escale de cadrage"
            isRecording={isRecording}
            onStartRecording={() => setIsRecording(true)}
            onStopRecording={() => setIsRecording(false)}
            onAddMarker={(marker) => setMarkers((current) => [marker, ...current])}
            markers={markers}
          />
        </div>
      )}
    </section>
  );
}

export default function App() {
  const [active, setActive] = useState("pont");
  const [isRecording, setIsRecording] = useState(false);
  const [markers, setMarkers] = useState([]);

  return (
    <main className="bridgeApp">
      <Sidebar active={active} onChange={setActive} />
      {active === "pont" ? (
        <Pont onChange={setActive} />
      ) : (
        <Workspace active={active} isRecording={isRecording} setIsRecording={setIsRecording} markers={markers} setMarkers={setMarkers} />
      )}
      <LogPose active={active} />
    </main>
  );
}
