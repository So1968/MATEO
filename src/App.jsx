import React, { useMemo, useState } from "react";
import {
  Anchor,
  BookOpen,
  Compass,
  Feather,
  FolderOpen,
  Instagram,
  Mail,
  Map,
  Search,
  ShipWheel,
  Telescope,
  UsersRound
} from "lucide-react";
import MeetingMode from "./components/MeetingMode.jsx";
import "./vogue-mainee-pirate.css";

const navItems = [
  { id: "pont", label: "Accueil", icon: ShipWheel },
  { id: "iles", label: "Archipel", icon: Map },
  { id: "escales", label: "Escales", icon: Anchor },
  { id: "journal", label: "Journal", icon: BookOpen },
  { id: "coffre", label: "Coffre", icon: FolderOpen },
  { id: "longuevue", label: "Longue-vue", icon: Telescope }
];

const gallery = [
  { id: "iles", title: "Archipel vivant", text: "projets et îles" },
  { id: "escales", title: "Escales de réunion", text: "marqueurs et décisions" },
  { id: "journal", title: "Carnet d’équipage", text: "mémoire longue" },
  { id: "coffre", title: "Coffre de bord", text: "documents utiles" },
  { id: "longuevue", title: "Longue-vue", text: "retrouver une trace" }
];

const logEntries = [
  ["Prime du jour", "Rendre le pont vraiment présentable"],
  ["Capitaine Mateo", "Manga, pirates, équipage et reprise claire"],
  ["Règle", "Pas de dashboard déguisé en carte"]
];

const workspaceData = {
  iles: {
    title: "Archipel des projets",
    icon: Map,
    intro: "Chaque projet devient une destination lisible : pas un galet sur une carte, mais un territoire avec une promesse, un état et une prochaine reprise.",
    cards: [
      ["Île active", "Île des Courants", "Reporting performance à reprendre en priorité."],
      ["Équipage", "Mateo + associés", "Chacun retrouve le cap sans rouvrir dix discussions."],
      ["Prochaine ouverture", "Fiche projet", "Une page claire : contexte, traces, documents, décisions."]
    ]
  },
  escales: {
    title: "Escales de réunion",
    icon: Anchor,
    intro: "Une escale, c’est une réunion qui devient exploitable : audio, marqueurs, décisions, actions. L’ambiance pirate reste au service du travail.",
    cards: [
      ["Rituel", "Départ · tempête · cap", "On sait ce qui se joue avant d’enregistrer."],
      ["Marqueurs", "Décision · action · blocage", "Trois boutons simples pendant la réunion."],
      ["Sortie", "Compte rendu utile", "Le journal reprend le fil, pas la charge mentale."]
    ]
  },
  journal: {
    title: "Carnet d’équipage",
    icon: BookOpen,
    intro: "La mémoire longue : ce qui a été décidé, ce qui reste flou, ce qu’il faudra reprendre au prochain départ.",
    cards: [
      ["Dernière trace", "Refonte du pont", "Arrêt des rustines et retour à une vraie composition."],
      ["Cap validé", "Vogue Merry n’est pas Azoth", "Azoth porte le produit, Vogue Merry reste le navire de Mateo."],
      ["À écrire", "Synthèse de continuité", "Ce qui a changé, ce qui reste fragile, le prochain cap."]
    ]
  },
  coffre: {
    title: "Coffre de bord",
    icon: FolderOpen,
    intro: "Le coffre protège les documents, captures, supports, versions et preuves. Il ne doit pas devenir une cale fourre-tout.",
    cards: [
      ["À classer", "Supports de démo", "Pitch, captures, anciennes maquettes, références."],
      ["Protection", "Archive avant nettoyage", "Ne rien supprimer tant que le cap officiel n’est pas clair."],
      ["Lien utile", "Projet ou escale", "Chaque pièce doit savoir à quoi elle sert."]
    ]
  },
  longuevue: {
    title: "Longue-vue de recherche",
    icon: Telescope,
    intro: "Retrouver vite une trace, une décision, une réunion ou un document, avec son contexte et son usage.",
    cards: [
      ["Recherche", "Une seule question", "Le résultat doit réduire le bruit."],
      ["Filtres", "Projet · date · type", "De quoi retrouver sans se noyer."],
      ["Résultat", "Trace + contexte", "La bonne information, pas une liste interminable."]
    ]
  }
};

function TopNav({ active, onChange }) {
  return (
    <header className="mpTop">
      <button className="mpBrand" type="button" onClick={() => onChange("pont")}>
        <h1>Vogue Merry</h1>
        <span className="mpSeal">VM</span>
      </button>
      <nav className="mpNav" aria-label="Navigation Vogue Merry">
        {navItems.map(({ id, label }) => (
          <button key={id} type="button" className={active === id ? "active" : ""} onClick={() => onChange(id)}>
            {label}
          </button>
        ))}
      </nav>
      <div className="mpIcons" aria-hidden="true">
        <Instagram size={20} />
        <Mail size={20} />
      </div>
    </header>
  );
}

function PirateWindow() {
  return (
    <div className="mpWindow" aria-label="Fenêtre sur le navire">
      <div className="mpMoonGate" />
      <div className="mpSun" />
      <div className="mpShip" aria-hidden="true">
        <div className="mpMast one" />
        <div className="mpMast two" />
        <div className="mpMast three" />
        <div className="mpSail a" />
        <div className="mpSail b" />
        <div className="mpSail c" />
        <div className="mpFlag" />
        <div className="mpHull" />
      </div>
      <div className="mpWave" />
      <aside className="mpWanted">
        <small>Avis de cap</small>
        <strong>Équipage</strong>
        <span>retrouver le fil</span>
      </aside>
    </div>
  );
}

function Hero({ onChange }) {
  return (
    <section className="mpHero">
      <aside className="mpLeftPanel" aria-hidden="true">
        <div className="mpRope" />
        <div className="mpVertical"><span>Équipage</span><span>cap</span></div>
      </aside>
      <div className="mpHeroText">
        <p className="mpEyebrow">Vogue Merry — mémoire de projet</p>
        <h2>L’équipage garde le cap.</h2>
        <span className="mpSub">Une aventure de travail, pas un tableau de bord déguisé.</span>
        <div className="mpLine" />
        <p>
          Mateo ouvre son navire pour retrouver une île, une escale, une décision ou un document.
          L’ambiance est pirate, manga, un peu cosplay — mais la lecture reste calme, belle et professionnelle.
        </p>
        <div className="mpActions">
          <button className="mpPrimary" type="button" onClick={() => onChange("iles")}>Choisir une île</button>
          <button className="mpGhost" type="button" onClick={() => onChange("escales")}>Ouvrir une escale</button>
        </div>
      </div>
      <PirateWindow />
    </section>
  );
}

function Gallery({ onChange }) {
  return (
    <section className="mpGallery">
      <div className="mpSectionTitle">
        <h2>Archipel</h2>
        <span>— explorer les zones du navire</span>
      </div>
      <div className="mpGalleryGrid">
        {gallery.map((item) => (
          <button className="mpTile" key={item.id} type="button" onClick={() => onChange(item.id)}>
            <div className="mpTileImage" />
            <strong>{item.title}</strong>
            <small>{item.text}</small>
          </button>
        ))}
      </div>
    </section>
  );
}

function LowerPanels({ onChange }) {
  return (
    <section className="mpLower">
      <article className="mpPanel">
        <h2>Carnet d’équipage</h2>
        <p>Écrits de reprise, caps validés et mémoire longue.</p>
        <div className="mpList">
          {logEntries.map(([title, text]) => (
            <button key={title} type="button" onClick={() => onChange("journal")}>
              <span className="mpThumb" />
              <span><strong>{title}</strong><small>{text}</small></span>
              <span className="mpArrow">→</span>
            </button>
          ))}
        </div>
      </article>
      <article className="mpPanel mpResearch">
        <h2>Log Pose</h2>
        <p>Indiquer le prochain cap sans envahir l’écran.</p>
        <p>Cap actuel : rendre Vogue Merry clair, beau, désirable et utilisable par Mateo.</p>
        <button className="mpLink" type="button" onClick={() => onChange("longuevue")}>Regarder à la longue-vue →</button>
      </article>
      <article className="mpPanel mpWorkshop">
        <h2>Sur le pont</h2>
        <p>Un lieu d’action, de transmission et d’équipage.</p>
        <ul>
          <li><span className="mpRound"><UsersRound size={18} /></span> Équipage, rôles et relais</li>
          <li><span className="mpRound"><Feather size={18} /></span> Journal, décisions et synthèses</li>
          <li><span className="mpRound"><Search size={18} /></span> Recherche et documents utiles</li>
        </ul>
      </article>
    </section>
  );
}

function Home({ onChange }) {
  return (
    <>
      <Hero onChange={onChange} />
      <Gallery onChange={onChange} />
      <LowerPanels onChange={onChange} />
    </>
  );
}

function Workspace({ active, isRecording, setIsRecording, markers, setMarkers }) {
  const data = workspaceData[active] || workspaceData.iles;
  const Icon = data.icon;

  return (
    <section className="mpWorkspace">
      <div className="mpWorkspaceHero">
        <div className="mpWorkspaceIcon"><Icon size={28} /></div>
        <div>
          <p className="mpEyebrow">Zone active</p>
          <h2>{data.title}</h2>
          <span>{data.intro}</span>
        </div>
      </div>
      <div className="mpBoard">
        {data.cards.map(([label, value, text]) => (
          <article key={label}>
            <small>{label}</small>
            <strong>{value}</strong>
            <p>{text}</p>
          </article>
        ))}
      </div>
      {active === "escales" && (
        <div className="mpMeetingBox">
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

function Footer() {
  return (
    <footer className="mpFooter">
      <strong>Vogue Merry</strong>
      <span>·</span>
      <span>pirate · manga · équipage · mémoire projet</span>
      <span>·</span>
      <span>Azoth Studio</span>
    </footer>
  );
}

export default function App() {
  const [active, setActive] = useState("pont");
  const [isRecording, setIsRecording] = useState(false);
  const [markers, setMarkers] = useState([]);
  const isHome = useMemo(() => active === "pont", [active]);

  return (
    <main className="mpApp">
      <TopNav active={active} onChange={setActive} />
      {isHome ? (
        <Home onChange={setActive} />
      ) : (
        <Workspace
          active={active}
          isRecording={isRecording}
          setIsRecording={setIsRecording}
          markers={markers}
          setMarkers={setMarkers}
        />
      )}
      <Footer />
    </main>
  );
}
