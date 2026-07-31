import React, { useMemo, useState } from "react";
import {
  Anchor,
  BookOpen,
  Compass,
  FolderOpen,
  Map,
  Sailboat,
  ShipWheel,
  Telescope
} from "lucide-react";
import MeetingMode from "./components/MeetingMode.jsx";
import "./vogue-maquette.css";
import "./vogue-structure-fix.css";

const navItems = [
  { id: "pont", label: "Pont", subtitle: "vue d’ensemble", icon: ShipWheel },
  { id: "iles", label: "Îles", subtitle: "projets clients", icon: Map },
  { id: "escales", label: "Escales", subtitle: "réunions", icon: Anchor },
  { id: "journal", label: "Journal", subtitle: "mémoire longue", icon: BookOpen },
  { id: "coffre", label: "Coffre", subtitle: "documents", icon: FolderOpen },
  { id: "longuevue", label: "Longue-vue", subtitle: "recherche", icon: Telescope }
];

const islands = [
  { name: "Île des Courants", subtitle: "Reporting performance", status: "priorité", x: 29, y: 57 },
  { name: "Baie des Alizés", subtitle: "Campagne budget", status: "en cours", x: 47, y: 38 },
  { name: "Phare d’Émeraude", subtitle: "Forecast grand compte", status: "en cours", x: 67, y: 55 },
  { name: "Atoll des Brumes", subtitle: "Marge & chiffre d’affaires", status: "à venir", x: 78, y: 31 }
];

const workspaceData = {
  iles: {
    title: "Îles projets",
    icon: Map,
    intro: "Chaque île correspond à une mission client ou un chantier EPM. On choisit une destination, puis on ouvre seulement ce qui est utile.",
    cards: [["Île active", "Île des Courants"], ["Métier", "Reporting performance"], ["Statut", "Priorité"]]
  },
  escales: {
    title: "Escales",
    icon: Anchor,
    intro: "Les réunions, ateliers et comités deviennent des escales : on enregistre, on pose quelques marqueurs, puis le journal reprend le fil.",
    cards: [["Prochaine escale", "Escale de cadrage"], ["Marqueurs", "Décision · action · blocage"], ["Sortie attendue", "Compte rendu exploitable"]]
  },
  journal: {
    title: "Journal de bord",
    icon: BookOpen,
    intro: "La mémoire longue : comptes rendus, synthèses, décisions et fil de reprise, sans mélanger les projets.",
    cards: [["Dernier compte rendu", "Escale de cadrage"], ["Synthèse", "Cap actuel"], ["À relire", "Décisions validées"]]
  },
  coffre: {
    title: "Coffre documentaire",
    icon: FolderOpen,
    intro: "Un espace calme pour ranger les supports, mappings, exports, captures, documents clients et références utiles.",
    cards: [["Documents", "23 éléments"], ["À classer", "Spécifications V1"], ["Référence", "Ancienne DA sauvegardée"]]
  },
  longuevue: {
    title: "Longue-vue",
    icon: Telescope,
    intro: "La recherche doit retrouver une décision, une règle, un document ou une trace audio sans fouiller dans tout le navire.",
    cards: [["Recherche", "À brancher"], ["Filtres", "Projet · date · type"], ["Résultat", "Avec contexte"]]
  }
};

function LeftNav({ active, onChange }) {
  return (
    <aside className="vmLeft">
      <div className="vmBrand">
        <h1>Vogue Mary</h1>
        <p>Une mémoire projet qui garde le cap.</p>
      </div>
      <nav className="vmMenu">
        {navItems.map(({ id, label, subtitle, icon: Icon }) => (
          <button key={id} className={active === id ? "active" : ""} onClick={() => onChange(id)} type="button">
            <Icon size={19} />
            <span>{label}<small>{subtitle}</small></span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

function LogPose({ active }) {
  const activeLabel = useMemo(() => {
    if (active === "pont") return "Pont du navire";
    return navItems.find((item) => item.id === active)?.label || "Pont";
  }, [active]);

  return (
    <aside className="vmRight">
      <header>
        <Compass size={34} />
        <div>
          <h2>Log Pose</h2>
          <p>{activeLabel}</p>
        </div>
      </header>
      <article>
        <small>Cap actuel</small>
        <strong>Rendre Vogue Mary clair, beau et utilisable.</strong>
      </article>
      <article>
        <small>Prochaine direction</small>
        <strong>Brancher les vraies données sans surcharger l’écran.</strong>
      </article>
    </aside>
  );
}

function PontView({ onChange }) {
  return (
    <section className="vmPont">
      <header className="vmHero">
        <p className="vmEyebrow">Pont du navire</p>
        <h2>Choisir une île. Garder le cap.</h2>
        <span>Une seule scène pour retrouver le projet, puis ouvrir l’outil nécessaire.</span>
      </header>

      <div className="vmMapScene" aria-label="Carte des îles projets">
        <svg className="vmRoute" viewBox="0 0 1000 520" preserveAspectRatio="none" aria-hidden="true">
          <path d="M190 310 C310 200 410 245 500 190 S690 180 800 295" />
          <path d="M290 315 C410 390 560 365 675 300" />
        </svg>
        {islands.map((island) => (
          <button
            key={island.name}
            className={`vmIsland ${island.status === "priorité" ? "priority" : ""}`}
            style={{ left: `${island.x}%`, top: `${island.y}%` }}
            onClick={() => onChange("iles")}
            type="button"
          >
            <span className="vmIslandShape" />
            <strong>{island.name}</strong>
            <small>{island.subtitle}</small>
            <em>{island.status}</em>
          </button>
        ))}
        <div className="vmCurrentCap">
          <Compass size={18} />
          <span>Prochaine reprise : Île des Courants</span>
        </div>
      </div>
    </section>
  );
}

function Workspace({ active, isRecording, setIsRecording, markers, setMarkers }) {
  const data = workspaceData[active] || workspaceData.iles;
  const Icon = data.icon;

  return (
    <section className="vmWorkspace">
      <div className="vmWorkspaceHeader">
        <div className="vmWorkspaceIcon"><Icon size={26} /></div>
        <div>
          <p className="vmEyebrow">Zone active</p>
          <h2>{data.title}</h2>
          <span>{data.intro}</span>
        </div>
      </div>
      <div className="vmCards">
        {data.cards.map(([label, value]) => (
          <article key={label} className="vmCard"><small>{label}</small><strong>{value}</strong></article>
        ))}
      </div>
      {active === "escales" && (
        <MeetingMode
          projectName="Île des Courants — Reporting performance"
          reportTitle="Escale de cadrage"
          isRecording={isRecording}
          onStartRecording={() => setIsRecording(true)}
          onStopRecording={() => setIsRecording(false)}
          onAddMarker={(marker) => setMarkers((current) => [marker, ...current])}
          markers={markers}
        />
      )}
    </section>
  );
}

export default function App() {
  const [active, setActive] = useState("pont");
  const [isRecording, setIsRecording] = useState(false);
  const [markers, setMarkers] = useState([]);

  return (
    <main className="vmApp">
      <LeftNav active={active} onChange={setActive} />
      <section className="vmDeck">
        {active === "pont" ? <PontView onChange={setActive} /> : <Workspace active={active} isRecording={isRecording} setIsRecording={setIsRecording} markers={markers} setMarkers={setMarkers} />}
      </section>
      <LogPose active={active} />
      <Sailboat className="vmBoatGhost" size={90} />
    </main>
  );
}
