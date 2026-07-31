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
  Settings,
  ShipWheel,
  Telescope,
  Upload
} from "lucide-react";
import "./style.css";
import "./vogue-extra.css";
import "./vogue-da2.css";
import "./vogue-islands-v2.css";

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
  { name: "Réunions & escales", status: "watch", label: "À structurer", x: 16, y: 31, size: "medium", mood: "port" },
  { name: "Cœur du navire", status: "progress", label: "En construction", x: 47, y: 25, size: "large", mood: "observatory" },
  { name: "Traces audio", status: "urgent", label: "Priorité", x: 78, y: 39, size: "small", mood: "cliff" },
  { name: "Coffre documentaire", status: "progress", label: "En cours", x: 25, y: 69, size: "medium", mood: "lagoon" },
  { name: "Longue-vue recherche", status: "watch", label: "À brancher", x: 55, y: 72, size: "large volcano", mood: "forge" },
  { name: "Transmission Mateo", status: "ok", label: "Cap clair", x: 83, y: 68, size: "medium", mood: "village" }
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

const escales = [
  { title: "Démo Mateo", badge: "À dater", text: "Réunion de présentation : audio, notes, décisions et actions à raccrocher au bon projet." },
  { title: "Point associé", badge: "À préparer", text: "Clarifier ce que Vogue Merry doit faire seul, et ce qui reste dans Azoth Studio." },
  { title: "Reprise technique", badge: "En cours", text: "Nettoyer les doublons, stabiliser le dépôt et garder une seule version officielle." }
];

const coffreItems = [
  { title: "Présentation Mateo", badge: "Support", text: "PDF, PPTX et pitch de présentation à garder comme références." },
  { title: "Charte Kiwika", badge: "Document", text: "Note de cadrage à relier au coffre documentaire." },
  { title: "Trames réunion", badge: "Méthode", text: "Déroulé, marqueurs audio et structure de compte-rendu." }
];

const journalItems = [
  { title: "Décision : Vogue Merry est le produit officiel", badge: "Validé", text: "Le dépôt So1968/MATEO devient la base applicative. Azoth Studio reste l'atelier qui le porte." },
  { title: "Règle : ne plus travailler dans les brouillons", badge: "Protection", text: "VOGUE_MARRY_SEUL et les anciennes copies servent d'archives, pas de chantier actif." },
  { title: "Prochaine synthèse", badge: "À faire", text: "Créer un Log Pose de reprise : état, prochaine action, risques, décisions." }
];

const manoeuvres = [
  { title: "Ranger les doublons", badge: "Priorité", text: "Identifier officiel / archives / documentation. Ne rien supprimer sans sauvegarde." },
  { title: "Brancher la vraie mémoire", badge: "V2", text: "Faire en sorte que les escales, documents, caps et journal ne soient plus seulement visuels." },
  { title: "Préparer la démo", badge: "Mercredi", text: "Montrer le pont, ouvrir une escale, retrouver une décision, déposer un document." }
];

const caps = [
  { title: "Vogue Merry = produit", badge: "Acté", text: "Le produit n'est pas Azoth. Il est porté par Azoth." },
  { title: "Un fil = un projet", badge: "Règle", text: "On évite de mélanger Azoth, Cortijo, ARTAG et Vogue Merry dans la même zone de travail." },
  { title: "Démo avant perfection", badge: "Cap", text: "Mercredi, il faut comprendre la promesse, pas finir tout le logiciel." }
];

const workspacePanelStyle = {
  minHeight: "clamp(430px, 54vh, 590px)",
  border: "4px solid rgba(184, 106, 36, 0.86)",
  borderRadius: "28px",
  padding: "28px",
  background: "linear-gradient(135deg, rgba(5, 27, 43, 0.96), rgba(8, 52, 67, 0.93))",
  boxShadow: "0 18px 48px rgba(0, 0, 0, 0.22)",
  position: "relative",
  overflow: "hidden"
};

const workspaceHeaderStyle = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
  marginBottom: "24px"
};

const workspaceIconStyle = {
  width: "58px",
  height: "58px",
  padding: "12px",
  borderRadius: "20px",
  color: "#291302",
  background: "linear-gradient(135deg, #ffe6a0, #bd782b)",
  boxShadow: "0 12px 24px rgba(0, 0, 0, 0.26)"
};

const workspaceEyebrowStyle = {
  margin: "0 0 4px",
  color: "#ffdc85",
  textTransform: "uppercase",
  letterSpacing: "0.22em",
  fontSize: "0.72rem",
  fontWeight: 900
};

const workspaceTitleStyle = {
  margin: 0,
  color: "#fff7dc",
  fontSize: "clamp(2rem, 4vw, 4.2rem)",
  lineHeight: 0.95
};

const cardListStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "18px"
};

const cardStyle = {
  minHeight: "190px",
  border: "1px solid rgba(255, 218, 129, 0.48)",
  borderRadius: "24px",
  padding: "22px",
  background: "linear-gradient(160deg, rgba(255, 238, 177, 0.96), rgba(210, 152, 73, 0.92))",
  color: "#2b1605",
  boxShadow: "0 18px 32px rgba(0, 0, 0, 0.24)"
};

const badgeStyle = {
  display: "inline-flex",
  marginBottom: "16px",
  padding: "7px 12px",
  borderRadius: "999px",
  background: "rgba(6, 29, 48, 0.92)",
  color: "#ffe7a5",
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  fontSize: "0.68rem",
  fontWeight: 900
};

function DashboardPanel({ title, badge, children, className = "" }) {
  return (
    <section className={`dashboardPanel ${className}`}>
      <header className="panelTitle"><span>{title}</span>{badge ? <strong>{badge}</strong> : null}</header>
      <div className="panelBody">{children}</div>
    </section>
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
        <button key={project.name} className={`islandPin island-${project.status} island-${project.mood} ${project.size}`} style={{ left: `${project.x}%`, top: `${project.y}%` }}>
          <span className={`islandBeacon beacon-${project.status}`} aria-hidden="true"><span /></span>
          <span className="islandLand"><i /></span><strong>{project.name}</strong><em>{project.label}</em>
        </button>
      ))}
      <div className="compassRose"><Compass size={62} /></div>
      <aside className="mapLegend"><b>État des projets</b><span className="dot-urgent">Priorité</span><span className="dot-progress">En cours</span><span className="dot-watch">À structurer</span><span className="dot-ok">Cap clair</span></aside>
    </section>
  );
}

function SideNavigation({ active, onChange }) {
  return (
    <aside className="sideNavigation">
      <div className="brandMark"><Compass /><h1>Vogue Merry</h1></div>
      <nav>{menu.map(({ id, label, icon: Icon }) => <button key={id} className={active === id ? "active" : ""} onClick={() => onChange(id)}><Icon size={21} /><span>{label}</span></button>)}</nav>
      <div className="crewNote"><strong>Cap clair.</strong><p>Le phare s’allume quand une trace risque de se perdre.</p></div>
    </aside>
  );
}

function TopBar() {
  return <header className="topBar"><div className="quoteScroll">“Chaque projet est une île. Chaque décision, un nouveau cap.”</div><div className="profileDock"><div className="avatarMateo">M</div><div><strong>Capitaine de projet</strong><span>Équipage Vogue Merry</span></div><Bell size={19} /><Mail size={19} /><Settings size={19} /></div></header>;
}

function RightCommand({ urgentCount }) {
  return (
    <aside className="rightCommand">
      <DashboardPanel title="Prochaine escale"><div className="harborThumb" /><h3>Réunion à transformer</h3><p>Audio, notes, décisions et actions à raccrocher au bon projet</p><small><CalendarDays size={15} /> Démo Mateo · À dater</small></DashboardPanel>
      <DashboardPanel title="Prochaine action"><div className="actionLine"><ClipboardList /><div><h3>Stabiliser le moteur</h3><p>Escales · Coffre · Journal · Log Pose</p></div></div><small>Objectif : une première version utilisable</small><button className="primaryButton">Ouvrir la tâche →</button></DashboardPanel>
      <DashboardPanel title="Alertes & urgences" badge={urgentCount} className="urgentPanel"><div className="beaconNotice"><AlertTriangle size={18} /> Phare allumé</div><p>Traces audio à intégrer</p><p>Recherche Longue-vue à brancher</p><button className="dangerButton">Voir les urgences →</button></DashboardPanel>
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

function WaterSevenDock() {
  return <div className="waterSevenDock"><Upload size={24} /><div><strong>Water Seven</strong><p>Déposer un document, une image ou une trace audio pour proposer un rangement.</p></div><button className="primaryButton">Ouvrir le quai</button></div>;
}

function CardList({ items }) {
  return (
    <div className="vogueCardList" style={cardListStyle}>
      {items.map((item) => (
        <article className="vogueWorkCard" style={cardStyle} key={item.title}>
          <span style={badgeStyle}>{item.badge}</span>
          <h3 style={{ margin: "0 0 12px", fontSize: "1.35rem", lineHeight: 1.08 }}>{item.title}</h3>
          <p style={{ margin: 0, color: "rgba(43, 22, 5, 0.78)", fontWeight: 800, lineHeight: 1.48 }}>{item.text}</p>
        </article>
      ))}
    </div>
  );
}

function SectionWorkspace({ active, urgentCount }) {
  if (active === "pont") {
    return <div className="mainGrid"><IslandMap /><RightCommand urgentCount={urgentCount} /></div>;
  }

  if (active === "iles") {
    return <div className="mainGrid"><IslandMap /><DashboardPanel title="Lecture des îles"><p>Chaque île représente une zone de mémoire projet. Le statut indique ce qui réclame l'attention.</p><ul><li>Priorité : à reprendre vite.</li><li>En cours : chantier actif.</li><li>À structurer : matière non rangée.</li><li>Cap clair : zone stabilisée.</li></ul></DashboardPanel></div>;
  }

  const views = {
    escales: { title: "Escales à transformer", icon: Anchor, items: escales },
    coffre: { title: "Coffre documentaire", icon: FolderOpen, items: coffreItems },
    journal: { title: "Journal de bord", icon: BookOpen, items: journalItems },
    longuevue: { title: "Longue-vue", icon: Telescope, items: [
      { title: "Recherche globale", badge: "À brancher", text: "Retrouver une décision, un document, une escale ou une trace audio depuis un seul champ." },
      { title: "Filtres utiles", badge: "Mémoire", text: "Projet, date, personne, type de trace, statut et cap validé." },
      { title: "Résultat attendu", badge: "Usage", text: "Ne plus fouiller dans tous les dossiers pour retrouver une information." }
    ] },
    manoeuvres: { title: "Manœuvres à faire", icon: Sailboat, items: manoeuvres },
    caps: { title: "Caps validés", icon: Compass, items: caps }
  };

  const current = views[active] || views.journal;
  const Icon = current.icon;

  return (
    <section className="sectionWorkspacePanel" style={workspacePanelStyle}>
      <div className="sectionWorkspaceHeader" style={workspaceHeaderStyle}>
        <Icon size={34} style={workspaceIconStyle} />
        <div>
          <p style={workspaceEyebrowStyle}>Zone active</p>
          <h2 style={workspaceTitleStyle}>{current.title}</h2>
        </div>
      </div>
      <CardList items={current.items} />
    </section>
  );
}

export default function App() {
  const [active, setActive] = useState("pont");
  const urgentCount = useMemo(() => projects.filter((p) => p.status === "urgent").length + 1, []);
  const activeLabel = menu.find((item) => item.id === active)?.label || "Pont du navire";

  return (
    <main className="vogueMerryApp appStarted">
      <SideNavigation active={active} onChange={setActive} />
      <section className="commandDeck">
        <TopBar />
        <div className="sectionIntro"><p>Poste actif · {activeLabel}</p><h2>{activeLabel}</h2><span>{sectionCopy[active]}</span></div>
        <SectionWorkspace active={active} urgentCount={urgentCount} />
        {active === "pont" && <WaterSevenDock />}
        {active === "pont" && <BottomDeck />}
      </section>
    </main>
  );
}
