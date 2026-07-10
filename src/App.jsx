import React, { useMemo, useState } from "react";
import {
  Anchor,
  BookOpen,
  CheckCircle2,
  Compass,
  FileText,
  FolderOpen,
  Map,
  Mic,
  Sailboat,
  Search,
  Settings,
  ShipWheel,
  Telescope,
  Users
} from "lucide-react";
import MeetingMode from "./components/MeetingMode.jsx";
import "./vogue-maquette.css";

const navItems = [
  { id: "pont", label: "Pont", subtitle: "vue d’ensemble", icon: ShipWheel },
  { id: "iles", label: "Îles", subtitle: "projets clients", icon: Map },
  { id: "escales", label: "Escales", subtitle: "réunions", icon: Anchor },
  { id: "journal", label: "Journal", subtitle: "mémoire longue", icon: BookOpen },
  { id: "coffre", label: "Coffre", subtitle: "documents", icon: FolderOpen },
  { id: "longuevue", label: "Longue-vue", subtitle: "recherche", icon: Telescope }
];

const islands = [
  { name: "Île des Courants", subtitle: "Reporting performance", status: "priorité" },
  { name: "Baie des Alizés", subtitle: "Campagne budget", status: "en cours" },
  { name: "Phare d’Émeraude", subtitle: "Forecast grand compte", status: "en cours" },
  { name: "Atoll des Brumes", subtitle: "Marge & chiffre d’affaires", status: "à venir" }
];

const quickModules = [
  { id: "escales", title: "Mode réunion", subtitle: "enregistrer, marquer, reprendre", icon: Mic },
  { id: "journal", title: "Journal de bord", subtitle: "compte rendu et synthèse", icon: BookOpen },
  { id: "coffre", title: "Coffre", subtitle: "documents et références", icon: FolderOpen },
  { id: "longuevue", title: "Longue-vue", subtitle: "retrouver une info", icon: Search }
];

const workspaceData = {
  iles: {
    title: "Îles projets",
    icon: Map,
    intro: "Chaque île correspond à une mission client ou un chantier EPM. On choisit une destination, puis on ouvre ses escales, ses documents et ses décisions.",
    cards: [["Île active", "Île des Courants"], ["Métier", "Reporting performance"], ["Statut", "Priorité"]]
  },
  escales: {
    title: "Escales",
    icon: Anchor,
    intro: "Les réunions, ateliers et comités deviennent des escales : on enregistre, on pose quelques marqueurs, puis le journal de bord reprend le fil.",
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
            <Icon size={20} />
            <span>{label}<small>{subtitle}</small></span>
          </button>
        ))}
      </nav>
      <div className="vmSideNote">
        <strong>Règle de bord</strong>
        <p>Une zone active à la fois. Le navire respire, le capitaine aussi.</p>
      </div>
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
      <div className="vmLogHeader">
        <Compass size={42} />
        <h2>Log Pose</h2>
        <p>cap actuel</p>
      </div>
      <article><small>Zone active</small><strong>{activeLabel}</strong></article>
      <article><small>Cap suivi</small><strong>Livrer une V1 claire, belle et utilisable.</strong></article>
      <article><small>Prochaine direction</small><strong>Brancher les vraies données sans surcharger l’écran.</strong></article>
      <article><small>À préserver</small><strong>Le Log Pose oriente. Les caps validés décident.</strong></article>
    </aside>
  );
}

function PontView({ onChange }) {
  return (
    <section className="vmPont">
      <header className="vmHero">
        <div>
          <p className="vmEyebrow">Pont du navire</p>
          <h2>Vue calme de toutes les îles.</h2>
          <span>On choisit le projet, puis seulement ensuite on ouvre les outils nécessaires.</span>
        </div>
        <Compass size={54} />
      </header>

      <div className="vmSeaCalm">
        <div className="vmSeaLine" />
        {islands.map((island) => (
          <button key={island.name} className="vmIslandCard" onClick={() => onChange("iles")} type="button">
            <span className="vmIslandShape" />
            <strong>{island.name}</strong>
            <small>{island.subtitle}</small>
            <em>{island.status}</em>
          </button>
        ))}
      </div>

      <div className="vmQuickGrid">
        {quickModules.map(({ id, title, subtitle, icon: Icon }) => (
          <button key={id} onClick={() => onChange(id)} type="button">
            <Icon size={24} />
            <strong>{title}</strong>
            <span>{subtitle}</span>
          </button>
        ))}
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
        <div className="vmWorkspaceIcon"><Icon size={28} /></div>
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
      <Sailboat className="vmBoatGhost" size={120} />
      <Settings style={{ display: "none" }} />
      <FileText style={{ display: "none" }} />
      <Users style={{ display: "none" }} />
      <CheckCircle2 style={{ display: "none" }} />
    </main>
  );
}
