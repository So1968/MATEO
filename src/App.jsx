import React, { useMemo, useState } from "react";
import {
  Anchor,
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  CloudSun,
  Compass,
  FileText,
  FolderOpen,
  Mail,
  Map,
  Mic,
  Sailboat,
  Search,
  Settings,
  ShipWheel,
  Telescope,
  Users,
  Waves
} from "lucide-react";
import MeetingMode from "./components/MeetingMode.jsx";
import "./vogue-maquette.css";

const leftMenu = [
  { id: "pont", label: "Accueil", subtitle: "Pont du navire", icon: ShipWheel },
  { id: "activite", label: "Activité", subtitle: "Flux & nouveautés", icon: Bell },
  { id: "notes", label: "Notes", subtitle: "Mes notes rapides", icon: FileText },
  { id: "calendrier", label: "Calendrier", subtitle: "Échéances & escales", icon: CalendarDays },
  { id: "messages", label: "Messages", subtitle: "Équipage & échanges", icon: Mail },
  { id: "reglages", label: "Réglages", subtitle: "Préférences & outils", icon: Settings }
];

const islands = [
  { id: "forecast", name: "Phare d’Émeraude", subtitle: "Forecast grand compte", status: "En cours", x: 18, y: 54 },
  { id: "budget", name: "Baie des Alizés", subtitle: "Campagne budget", status: "En cours", x: 36, y: 43 },
  { id: "mobile", name: "Île des Courants", subtitle: "Reporting performance", status: "Priorité", x: 55, y: 50, current: true },
  { id: "mapping", name: "Rocher du Nord", subtitle: "Mapping données EPM", status: "En pause", x: 73, y: 42 },
  { id: "marge", name: "Atoll des Brumes", subtitle: "Marge & chiffre d’affaires", status: "À venir", x: 86, y: 64 }
];

const modules = [
  { id: "carte", title: "Carte de l’île", subtitle: "Vue générale du projet", count: null, icon: Map },
  { id: "escales", title: "Escales", subtitle: "Réunions & comités", count: 5, icon: Anchor },
  { id: "audio", title: "Traces audio", subtitle: "Transcriptions", count: 12, icon: Mic },
  { id: "journal", title: "Journal de bord", subtitle: "Comptes rendus", count: 8, icon: BookOpen },
  { id: "coffre", title: "Coffre", subtitle: "Documents", count: 23, icon: FolderOpen },
  { id: "equipage", title: "Équipage", subtitle: "Personnes & rôles", count: 6, icon: Users },
  { id: "manoeuvres", title: "Manœuvres", subtitle: "Actions à faire", count: 14, icon: Sailboat },
  { id: "caps", title: "Caps validés", subtitle: "Décisions", count: 9, icon: CheckCircle2 },
  { id: "longuevue", title: "Longue-vue", subtitle: "Recherche mémoire", count: null, icon: Telescope },
  { id: "logpose", title: "Log Pose", subtitle: "Direction suivante", count: null, icon: Compass }
];

const workspaceData = {
  activite: {
    title: "Activité du navire",
    icon: Bell,
    intro: "Les derniers mouvements du projet : notes, décisions, documents, réunions et alertes.",
    cards: [
      ["Nouveau", "2 traces audio à rattacher à une escale"],
      ["Décision", "Palette maritime illustrée à conserver"],
      ["Alerte", "Le mode réunion doit rester visible dans Escales"]
    ]
  },
  notes: {
    title: "Notes rapides",
    icon: FileText,
    intro: "Un sas pour déposer vite une idée avant de la ranger dans une île, une escale ou le journal.",
    cards: [["À classer", "Idées de DA illustrée"], ["Mémo", "Îles = missions EPM"], ["À relire", "Pantoufle et Perroquet à préciser"]]
  },
  calendrier: {
    title: "Calendrier des escales",
    icon: CalendarDays,
    intro: "Les échéances, comités, ateliers et reprises à ne pas manquer.",
    cards: [["Cette semaine", "2 escales à préparer"], ["À dater", "Démo Mateo"], ["Vigilance", "Ne pas perdre les décisions"]]
  },
  messages: {
    title: "Messages de l’équipage",
    icon: Mail,
    intro: "Les échanges utiles, demandes et retours à rattacher au bon projet.",
    cards: [["Client", "Questions forecast"], ["Équipe", "Retour sur les règles de calcul"], ["À envoyer", "Synthèse du cap actuel"]]
  },
  reglages: {
    title: "Réglages du navire",
    icon: Settings,
    intro: "Les préférences de l’outil : vocabulaire, exports, affichage et modules visibles.",
    cards: [["Nom", "Vogue Mary"], ["Métaphore", "Navire, îles, Log Pose"], ["Style", "Illustré, lisible, métier"]]
  },
  carte: {
    title: "Carte de l’île",
    icon: Map,
    intro: "Vue synthétique de l’île active : contexte, objectifs, risques, documents et décisions.",
    cards: [["Île active", "Île des Courants"], ["Mission", "Reporting performance"], ["Objectif", "Rendre les indicateurs lisibles et pilotables"]]
  },
  audio: {
    title: "Traces audio",
    icon: Mic,
    intro: "Les audios et transcriptions alimentent les escales, le journal de bord et les décisions.",
    cards: [["Audio brut", "À importer"], ["Transcription", "À générer"], ["Marqueurs", "Décision, action, blocage"]]
  },
  journal: {
    title: "Journal de bord",
    icon: BookOpen,
    intro: "La mémoire longue : comptes rendus, synthèses, arbitrages et fil de reprise.",
    cards: [["Compte rendu", "Escale de cadrage"], ["Synthèse", "Cap actuel"], ["Historique", "Versions précédentes"]]
  },
  coffre: {
    title: "Coffre documentaire",
    icon: FolderOpen,
    intro: "Les documents, exports, fichiers clients, mappings, supports de comité et pièces de référence.",
    cards: [["Documents", "23 éléments"], ["À classer", "Spécifications v1"], ["Référence", "Anciennes images DA récupérées"]]
  },
  equipage: {
    title: "Équipage",
    icon: Users,
    intro: "Les personnes impliquées : qui décide, qui agit, qui doit être relancé.",
    cards: [["Capitaine", "Mateo"], ["Client", "Comité finance"], ["Équipe", "Contributeurs projet"]]
  },
  manoeuvres: {
    title: "Manœuvres",
    icon: Sailboat,
    intro: "Les actions à faire, avec responsable, échéance et statut.",
    cards: [["Action", "Refondre le Pont"], ["Responsable", "Équipe projet"], ["Statut", "En cours"]]
  },
  caps: {
    title: "Caps validés",
    icon: CheckCircle2,
    intro: "Les décisions et arbitrages actés. Le cap validé n’est pas la boussole : la boussole reste le Log Pose.",
    cards: [["Décision", "Vogue Mary = mémoire projet navigable"], ["Règle", "Îles = missions clients"], ["DA", "Carte maritime illustrée"]]
  },
  longuevue: {
    title: "Longue-vue",
    icon: Telescope,
    intro: "La recherche qui retrouve une décision, une règle, une personne, un document ou une trace.",
    cards: [["Recherche", "À brancher"], ["Filtres", "Projet, date, type"], ["Résultat", "Avec contexte"]]
  },
  logpose: {
    title: "Log Pose",
    icon: Compass,
    intro: "La boussole du projet : elle dit où reprendre, quoi sécuriser et quelle direction suivre.",
    cards: [["Cap actuel", "Livrer une V1 lisible"], ["Prochaine direction", "Brancher les vraies données"], ["Vigilance", "Ne pas empiler les modules"]]
  }
};

function SideMenu({ active, onChange }) {
  return (
    <aside className="vmLeft">
      <div className="vmBrand">
        <h1>Vogue Mary</h1>
        <p>Le journal de bord qui aide chaque projet à garder le cap.</p>
      </div>
      <nav className="vmMenu">
        {leftMenu.map(({ id, label, subtitle, icon: Icon }) => (
          <button key={id} className={active === id ? "active" : ""} onClick={() => onChange(id)}>
            <Icon size={22} />
            <span>{label}<small>{subtitle}</small></span>
          </button>
        ))}
      </nav>
      <div className="vmWeather">
        <strong><CloudSun size={17} /> Météo du jour</strong>
        <p>Vent doux, visibilité claire. Le cap est lisible.</p>
      </div>
      <div className="vmLevel">
        <strong>Niveau du navire · 12</strong>
        <div className="vmLevelBar"><span /></div>
        <p>Prochain gain : +50 XP</p>
      </div>
    </aside>
  );
}

function TopDeck() {
  return (
    <header className="vmTop">
      <div className="vmCaptain">
        <div className="vmCaptainAvatar">M</div>
        <div><strong>Capitaine Mateo</strong><span>Gardien du cap</span></div>
      </div>
      <div className="vmTopTitle">
        <h2>Pont du navire</h2>
        <p>Vue d’ensemble de toutes nos aventures.</p>
      </div>
      <div className="vmCaptain">
        <Bell size={20} />
        <Settings size={20} />
      </div>
    </header>
  );
}

function IslandMap() {
  return (
    <section className="vmSea">
      <div className="vmSeaTitle">
        <h3>Mes îles</h3>
        <p>Chaque île est un projet. Choisissez votre prochaine destination.</p>
      </div>
      <svg className="vmRoute" viewBox="0 0 1000 520" preserveAspectRatio="none" aria-hidden="true">
        <path d="M130 280 C250 210 360 245 470 250 S650 210 820 330" />
        <path d="M210 360 C330 420 510 380 620 430 S760 440 890 350" />
      </svg>
      <Compass className="vmCompassRose" size={82} />
      {islands.map((island) => (
        <button
          key={island.id}
          className={`vmIsland ${island.current ? "current" : ""}`}
          style={{ left: `${island.x}%`, top: `${island.y}%` }}
          type="button"
        >
          <span className="vmIslandArt" />
          <span className="vmIslandLabel"><strong>{island.name}</strong><span>{island.subtitle} · {island.status}</span></span>
        </button>
      ))}
    </section>
  );
}

function ModuleGrid({ active, onChange }) {
  return (
    <section className="vmModules">
      {modules.map(({ id, title, subtitle, count, icon: Icon }) => (
        <button key={id} className={`vmModule ${active === id ? "active" : ""}`} onClick={() => onChange(id)} type="button">
          {count ? <em>{count}</em> : null}
          <Icon size={27} />
          <strong>{title}</strong>
          <span>{subtitle}</span>
        </button>
      ))}
    </section>
  );
}

function Workspace({ active, isRecording, setIsRecording, markers, setMarkers }) {
  const data = workspaceData[active] || workspaceData.carte;
  const Icon = data.icon;

  return (
    <section className="vmWorkspace">
      <div className="vmWorkspaceHeader">
        <div className="vmWorkspaceIcon"><Icon size={30} /></div>
        <div>
          <h2>{data.title}</h2>
          <p>{data.intro}</p>
        </div>
      </div>
      <div className="vmCards">
        {data.cards.map(([label, value]) => (
          <article className="vmCard" key={label}>
            <small>{label}</small>
            <strong>{value}</strong>
          </article>
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

function LogPose({ active }) {
  const activeLabel = useMemo(() => {
    return modules.find((item) => item.id === active)?.title || leftMenu.find((item) => item.id === active)?.label || "Pont du navire";
  }, [active]);

  return (
    <aside className="vmRight">
      <div className="vmLogHeader">
        <Compass size={68} />
        <h2>Log Pose — cap actuel</h2>
      </div>
      <div className="vmLogBlock"><strong>Zone active</strong><p>{activeLabel}</p></div>
      <div className="vmLogBlock"><strong>Cap suivi</strong><p>Livrer une V1 robuste, belle et adoptée par les premiers utilisateurs.</p></div>
      <div className="vmLogBlock"><strong>Prochaine direction</strong><p>Transformer les cartes en vraies pages métier branchées aux données.</p></div>
      <div className="vmLogBlock"><strong>Éléments à retrouver</strong><ul className="vmChecklist"><li><CheckCircle2 size={15} /> Parcours onboarding</li><li><CheckCircle2 size={15} /> Feedbacks clés</li><li><CheckCircle2 size={15} /> Spécifications V1</li></ul></div>
      <div className="vmLogBlock"><strong>À ne pas manquer</strong><p>Ne pas confondre Log Pose et caps validés : le Log Pose oriente, les caps actent.</p></div>
    </aside>
  );
}

export default function App() {
  const [active, setActive] = useState("pont");
  const [isRecording, setIsRecording] = useState(false);
  const [markers, setMarkers] = useState([]);
  const isPont = active === "pont";

  return (
    <main className="vmApp">
      <SideMenu active={active} onChange={setActive} />
      <section className="vmDeck">
        <TopDeck />
        {isPont ? (
          <div className="vmPont">
            <IslandMap />
            <ModuleGrid active={active} onChange={setActive} />
          </div>
        ) : (
          <Workspace active={active} isRecording={isRecording} setIsRecording={setIsRecording} markers={markers} setMarkers={setMarkers} />
        )}
      </section>
      <LogPose active={active} />
      <Waves style={{ display: "none" }} />
      <Search style={{ display: "none" }} />
      <ClipboardList style={{ display: "none" }} />
    </main>
  );
}
