import React, { useMemo, useState } from "react";
import {
  Anchor,
  AlertTriangle,
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Compass,
  FileText,
  FolderOpen,
  Mail,
  Map,
  Sailboat,
  Search,
  Settings,
  ShipWheel,
  Telescope,
  Upload,
  Waves
} from "lucide-react";
import "./style.css";
import "./vogue-extra.css";

const menu = [
  { id: "pont", label: "Pont du navire", icon: ShipWheel },
  { id: "iles", label: "Mes îles", icon: Map },
  { id: "escales", label: "Escales", icon: Anchor },
  { id: "coffre", label: "Coffre", icon: FolderOpen },
  { id: "journal", label: "Journal de bord", icon: BookOpen },
  { id: "longuevue", label: "Longue-vue", icon: Telescope },
  { id: "manoeuvres", label: "Manœuvres", icon: Sailboat },
  { id: "caps", label: "Caps validés", icon: Compass }
];

const projects = [
  { name: "Branding Nébuleuse", status: "urgent", label: "Urgent", x: 16, y: 31, size: "medium" },
  { name: "Application Hélios", status: "urgent", label: "Urgent", x: 47, y: 25, size: "large" },
  { name: "Site Lumina", status: "watch", label: "À surveiller", x: 78, y: 39, size: "small" },
  { name: "Campagne Océane", status: "ok", label: "OK", x: 25, y: 69, size: "medium" },
  { name: "Refonte Atlas", status: "progress", label: "En cours", x: 55, y: 72, size: "large volcano" },
  { name: "Com’ Vogue Claire", status: "ok", label: "OK", x: 83, y: 68, size: "medium" }
];

const sectionCopy = {
  pont: "Le poste de commandement : voir les îles, les urgences, la prochaine action et les documents à reprendre.",
  iles: "Chaque projet devient une île avec son état, son cap et ses signaux de priorité.",
  escales: "Les réunions deviennent des escales : date, ordre du jour, décisions et compte-rendu.",
  coffre: "Le coffre range les documents, images, preuves, liens, versions et pièces utiles.",
  journal: "Le journal de bord conserve les comptes-rendus, les synthèses et la mémoire longue.",
  longuevue: "La longue-vue retrouve une information dans les projets, les documents et les décisions.",
  manoeuvres: "Les manœuvres regroupent les tâches, responsables, échéances et relances.",
  caps: "Les caps validés conservent les arbitrages et décisions déjà actées."
};

const recentDocuments = ["Brief Projet Hélios.pdf", "Maquette_Accueil.fig", "Charte_Marque_01.docx", "Moodboard_Océane.jpg"];
const decisions = ["Axe créatif Atlas — validé", "Palette couleurs — validée", "Arborescence — validée"];
const activities = ["Mateo a ajouté une note", "Mateo cartographe a tracé un cap", "Mateo a validé une décision", "Mateo a rangé 3 documents"];

function DashboardPanel({ title, badge, children, className = "" }) {
  return (
    <section className={`dashboardPanel ${className}`}>
      <header className="panelTitle"><span>{title}</span>{badge ? <strong>{badge}</strong> : null}</header>
      <div className="panelBody">{children}</div>
    </section>
  );
}

function ShipAtmosphere() {
  return (
    <div className="shipAtmosphere" aria-hidden="true">
      <div className="sunDisk" />
      <div className="cloud cloudOne" />
      <div className="cloud cloudTwo" />
      <div className="mast mastLeft" />
      <div className="mast mastRight" />
      <div className="sail sailLeft" />
      <div className="sail sailRight" />
      <div className="rope ropeOne" />
      <div className="rope ropeTwo" />
      <div className="deckRail" />
      <div className="bowCurve" />
    </div>
  );
}

function DeckInstruments({ started }) {
  return (
    <div className={`deckInstruments ${started ? "instrumentsReady" : ""}`} aria-hidden="true">
      <div className="instrumentCard compassCard"><Compass size={30} /><strong>Cap</strong><span>Nord-Est</span></div>
      <div className="instrumentCard windCard"><Waves size={30} /><strong>Vent</strong><span>18 nœuds</span></div>
      <div className="instrumentCard logCard"><BookOpen size={30} /><strong>Journal</strong><span>4 traces</span></div>
      <div className="brassDial"><span /><span /><span /></div>
    </div>
  );
}

function LighthouseAlert({ urgentCount }) {
  return (
    <div className={`lighthouseScene ${urgentCount ? "lighthouseOn" : ""}`} aria-label="Phare des urgences">
      <div className="lightBeam one" />
      <div className="lightBeam two" />
      <div className="lighthouseGlow" />
      <div className="lighthouseTop" />
      <div className="lighthouseBody"><span /><span /><span /></div>
      <div className="lighthouseRock" />
    </div>
  );
}

function MateoIntro({ onStart }) {
  return (
    <section className="mateoIntro">
      <div className="introCompass"><Compass size={42} /></div>
      <div className="introPortrait">
        <div className="portraitHat" />
        <div className="portraitHead"><span className="portraitHair" /><span className="portraitEye l" /><span className="portraitEye r" /><span className="portraitSmile" /><span className="portraitBeard" /></div>
        <div className="portraitShoulders" />
      </div>
      <p>Vogue Merry</p>
      <h2>Mateo, reprends la barre.</h2>
      <span>Le pont t’attend. Un clic, et le capitaine pose les deux mains sur la barre : phare, îles, coffre et prochaines manœuvres s’alignent.</span>
      <button onClick={onStart}>Prendre la barre</button>
    </section>
  );
}

function CaptainMateo({ started }) {
  return (
    <div className={`captainMateo ${started ? "started" : "waiting"}`} aria-label="Mateo capitaine">
      <div className="captainAura" />
      <div className="captainHat" />
      <div className="captainHead"><span className="hair" /><span className="eye left" /><span className="eye right" /><span className="smile" /><span className="beard" /></div>
      <div className="captainBody"><span className="shirt" /><span className="sash" /><span className="ep left" /><span className="ep right" /></div>
      <div className="arm leftArm" />
      <div className="arm rightArm" />
      <div className="helm"><span className="ring" /><span className="center"><Compass size={28} /></span><span className="spoke s1" /><span className="spoke s2" /><span className="spoke s3" /><span className="spoke s4" /></div>
    </div>
  );
}

function IslandMap() {
  return (
    <section className="mapFrame">
      <div className="mapHeader">Carte des îles-projets</div>
      <svg className="routeLayer" viewBox="0 0 1000 560" preserveAspectRatio="none" aria-hidden="true">
        <path d="M160 190 C280 120 380 150 470 142 S690 125 770 205" />
        <path d="M240 382 C370 315 450 390 548 392 S730 326 835 380" />
        <path d="M470 142 C512 230 540 312 548 392" />
        <path d="M160 190 C155 280 198 337 240 382" />
      </svg>
      <div className="seaTexture" />
      {projects.map((project) => (
        <button key={project.name} className={`islandPin island-${project.status} ${project.size}`} style={{ left: `${project.x}%`, top: `${project.y}%` }}>
          <span className="islandLand"><i /></span><strong>{project.name}</strong><em>{project.label}</em>
        </button>
      ))}
      <div className="compassRose"><Compass size={62} /></div>
      <aside className="mapLegend"><b>État des projets</b><span className="dot-urgent">Urgent</span><span className="dot-progress">En cours</span><span className="dot-watch">À surveiller</span><span className="dot-ok">En bonne voie</span></aside>
    </section>
  );
}

function SideNavigation({ active, onChange, onStart }) {
  return (
    <aside className="sideNavigation">
      <div className="brandMark"><Compass /><h1>Vogue Merry</h1></div>
      <nav>{menu.map(({ id, label, icon: Icon }) => <button key={id} className={active === id ? "active" : ""} onClick={() => { onStart(); onChange(id); }}><Icon size={21} /><span>{label}</span></button>)}</nav>
      <div className="crewNote"><strong>Cap clair.</strong><p>Le phare s’allume quand il y a urgence.</p></div>
    </aside>
  );
}

function TopBar() {
  return <header className="topBar"><div className="quoteScroll">“Chaque projet est une île. Chaque décision, un nouveau cap.”</div><div className="profileDock"><div className="avatarMateo">M</div><div><strong>Capitaine de projet</strong><span>Équipage Vogue Merry</span></div><Bell size={19} /><Mail size={19} /><Settings size={19} /></div></header>;
}

function RightCommand({ urgentCount, onStart }) {
  return (
    <aside className="rightCommand">
      <DashboardPanel title="Prochaine escale"><div className="harborThumb" /><h3>Havre des Idées</h3><p>Réunion de lancement</p><small><CalendarDays size={15} /> 24 mai 2024 · 10:00</small></DashboardPanel>
      <DashboardPanel title="Prochaine action"><div className="actionLine"><ClipboardList /><div><h3>Valider la maquette</h3><p>Page Accueil · Site Lumina</p></div></div><small>Échéance : 27 mai 2024</small><button className="primaryButton" onClick={onStart}>Ouvrir la tâche →</button></DashboardPanel>
      <DashboardPanel title="Alertes & urgences" badge={urgentCount} className="urgentPanel"><div className="beaconNotice"><AlertTriangle size={18} /> Phare allumé</div><p>2 tâches en retard</p><p>1 validation en attente</p><button className="dangerButton" onClick={onStart}>Voir les urgences →</button></DashboardPanel>
    </aside>
  );
}

function BottomDeck() {
  return (
    <section className="bottomDeck">
      <DashboardPanel title="Moral de l’équipage"><div className="morale"><span>♥</span><strong>92%</strong></div><p>Excellent cap !</p></DashboardPanel>
      <DashboardPanel title="Documents récents" badge="5"><ul>{recentDocuments.map((doc) => <li key={doc}><FileText size={15} />{doc}</li>)}</ul></DashboardPanel>
      <DashboardPanel title="Décisions validées"><ul>{decisions.map((decision) => <li key={decision}><CheckCircle2 size={15} />{decision}</li>)}</ul></DashboardPanel>
      <DashboardPanel title="Caps validés" badge="12"><h3>Bravo, Capitaine !</h3><p>Tous les caps sont à jour.</p><div className="anchors">⚓ ⚓ ⚓ ⚓ ⚓</div></DashboardPanel>
      <DashboardPanel title="Activité"><ul>{activities.map((a) => <li key={a}>{a}</li>)}</ul></DashboardPanel>
    </section>
  );
}

function WaterSevenDock({ onStart }) {
  return <div className="waterSevenDock"><Upload size={24} /><div><strong>Water Seven</strong><p>Déposer un document, une image ou une trace audio pour proposer un rangement.</p></div><button className="primaryButton" onClick={onStart}>Ouvrir le quai</button></div>;
}

export default function App() {
  const [active, setActive] = useState("pont");
  const [started, setStarted] = useState(false);
  const urgentCount = useMemo(() => projects.filter((p) => p.status === "urgent").length + 1, []);
  const activeLabel = menu.find((item) => item.id === active)?.label || "Pont du navire";
  const start = () => setStarted(true);

  return (
    <main className={`vogueMerryApp ${started ? "appStarted" : "appIntro"}`}>
      <div className="skyGlow" />
      <div className="oceanHorizon"><Waves size={110} /></div>
      <ShipAtmosphere />
      <LighthouseAlert urgentCount={urgentCount} />
      <SideNavigation active={active} onChange={setActive} onStart={start} />
      <section className="commandDeck" onClick={start}>
        <TopBar />
        <div className="sectionIntro"><p>Poste actif · {activeLabel}</p><h2>{activeLabel}</h2><span>{sectionCopy[active]}</span></div>
        <div className="mainGrid"><IslandMap /><RightCommand urgentCount={urgentCount} onStart={start} /></div>
        <WaterSevenDock onStart={start} />
        <BottomDeck />
      </section>
      <DeckInstruments started={started} />
      <CaptainMateo started={started} />
      {!started && <MateoIntro onStart={start} />}
      <div className="deckFloor" />
      <Search className="hiddenSearchIcon" />
    </main>
  );
}
