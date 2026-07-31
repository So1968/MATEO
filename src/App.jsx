import React, { useMemo, useState } from "react";
import {
  Anchor,
  BookOpen,
  Compass,
  FileText,
  FolderOpen,
  Map,
  Search,
  ShipWheel,
  Telescope
} from "lucide-react";
import MeetingMode from "./components/MeetingMode.jsx";
import "./vogue-mainee-pirate.css";

const navItems = [
  { id: "pont", label: "Pont", icon: ShipWheel },
  { id: "iles", label: "Îles", icon: Map },
  { id: "escales", label: "Escales", icon: Anchor },
  { id: "journal", label: "Journal", icon: BookOpen },
  { id: "coffre", label: "Coffre", icon: FolderOpen },
  { id: "longuevue", label: "Longue-vue", icon: Telescope }
];

const voyageObjects = [
  { id: "iles", kicker: "Carte au trésor", title: "Îles-projets", text: "Choisir une destination de travail, voir son état, ouvrir la bonne reprise." },
  { id: "escales", kicker: "Épisode", title: "Escales", text: "Transformer une réunion en marqueurs, décisions, actions et compte rendu." },
  { id: "journal", kicker: "Carnet", title: "Journal de bord", text: "Garder la mémoire longue du navire sans refaire toute l’histoire." },
  { id: "coffre", kicker: "Inventaire", title: "Coffre", text: "Ranger documents, captures, preuves et versions utiles." },
  { id: "longuevue", kicker: "Longue-vue", title: "Recherche", text: "Retrouver une trace sans fouiller partout." }
];

const crew = [
  ["Capitaine", "Mateo", "reprend la barre"],
  ["Navigatrice", "Mémoire", "retrouve le fil"],
  ["Charpentier", "Azoth", "porte le chantier"]
];

const workspaceData = {
  iles: {
    title: "Archipel des projets",
    icon: Map,
    intro: "Les projets deviennent des îles : chacune a son cap, son état, ses traces et sa prochaine reprise.",
    cards: [
      ["Destination active", "Île des Courants", "Reporting performance à reprendre en priorité."],
      ["Cap à tenir", "Ne pas mélanger", "Projet, document, réunion et décision doivent rester reliés."],
      ["Prochain geste", "Ouvrir une fiche", "Contexte, traces, documents, décisions, actions."]
    ]
  },
  escales: {
    title: "Escales de réunion",
    icon: Anchor,
    intro: "Une escale est une réunion transformée en épisode utile : audio, marqueurs, décisions, actions et reprise claire.",
    cards: [
      ["Départ", "Cadre de réunion", "Pourquoi on se réunit, avec qui, pour décider quoi."],
      ["Pendant", "Marqueurs simples", "Décision · action · blocage · idée à reprendre."],
      ["Arrivée", "Compte rendu", "Un texte exploitable, relié au projet et au journal."]
    ]
  },
  journal: {
    title: "Journal de bord",
    icon: BookOpen,
    intro: "La mémoire longue de l’équipage : ce qui a été décidé, ce qui reste fragile, ce qu’il faut reprendre.",
    cards: [
      ["Dernière page", "Direction artistique", "Arrêt des dashboards déguisés et retour au navire."],
      ["Cap validé", "Vogue Merry n’est pas Azoth", "Azoth porte le produit, Vogue Merry est le navire de Mateo."],
      ["À écrire", "Synthèse de continuité", "Ce qui change, ce qui reste à faire, le prochain cap."]
    ]
  },
  coffre: {
    title: "Coffre de bord",
    icon: FolderOpen,
    intro: "Le coffre protège les pièces utiles : documents, maquettes, captures, versions, preuves et références.",
    cards: [
      ["À classer", "Supports de démo", "Pitch, captures, documents de présentation, anciennes pistes."],
      ["Protection", "Archiver avant nettoyage", "Ne rien supprimer tant que le cap officiel n’est pas clair."],
      ["Règle", "Chaque pièce a un usage", "Projet, escale, décision ou journal de reprise."]
    ]
  },
  longuevue: {
    title: "Longue-vue",
    icon: Telescope,
    intro: "La recherche doit retrouver une trace avec son contexte, pas afficher une liste de résultats sans âme.",
    cards: [
      ["Question", "Une requête simple", "Retrouver une décision, un document, une réunion ou une action."],
      ["Filtres", "Projet · date · type", "Réduire le bruit sans casser la fluidité."],
      ["Résultat", "Trace + contexte", "D’où ça vient, à quoi ça sert, quoi faire ensuite."]
    ]
  }
};

function TopNav({ active, onChange }) {
  return (
    <header className="vpTop">
      <button className="vpBrand" type="button" onClick={() => onChange("pont")}>
        <span className="vpFlagMark">VM</span>
        <span><strong>Vogue Merry</strong><small>navire de mémoire projet</small></span>
      </button>
      <nav className="vpNav" aria-label="Navigation Vogue Merry">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button key={id} type="button" className={active === id ? "active" : ""} onClick={() => onChange(id)}>
            <Icon size={17} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </header>
  );
}

function MangaShip() {
  return (
    <div className="vpShipScene" aria-label="Trois-mâts Vogue Merry">
      <div className="vpSpeedLines" />
      <div className="vpIslandBack one" />
      <div className="vpIslandBack two" />
      <div className="vpRouteArc" />
      <div className="vpShip" aria-hidden="true">
        <div className="vpMast mastOne" />
        <div className="vpMast mastTwo" />
        <div className="vpMast mastThree" />
        <div className="vpSail sailOne" />
        <div className="vpSail sailTwo" />
        <div className="vpSail sailThree" />
        <div className="vpJollyFlag" />
        <div className="vpCabin" />
        <div className="vpHull" />
      </div>
      <div className="vpWave front" />
      <div className="vpWave back" />
      <div className="vpLogOrb">
        <Compass size={34} />
        <span>Log Pose</span>
      </div>
    </div>
  );
}

function WantedNote() {
  return (
    <aside className="vpWanted">
      <small>AVIS DE CAP</small>
      <strong>Prime du jour</strong>
      <span>Rendre le pont assez clair pour une démo, assez vivant pour Mateo.</span>
    </aside>
  );
}

function Home({ onChange }) {
  return (
    <>
      <section className="vpHero">
        <div className="vpHeroText">
          <p className="vpEyebrow">Manga pirate · équipage · mémoire projet</p>
          <h1>Monte à bord. On reprend le cap.</h1>
          <p className="vpLead">
            Vogue Merry transforme projets, réunions, documents et décisions en voyage lisible :
            une île à choisir, une escale à ouvrir, une trace à retrouver.
          </p>
          <div className="vpActions">
            <button className="vpPrimary" type="button" onClick={() => onChange("iles")}>Choisir une île</button>
            <button className="vpSecondary" type="button" onClick={() => onChange("escales")}>Ouvrir une escale</button>
          </div>
        </div>
        <MangaShip />
        <WantedNote />
      </section>

      <section className="vpObjects">
        <header className="vpSectionHead">
          <p className="vpEyebrow">Objets du navire</p>
          <h2>Chaque fonction devient un objet d’aventure.</h2>
        </header>
        <div className="vpObjectGrid">
          {voyageObjects.map((item) => (
            <button key={item.id} className="vpObjectCard" type="button" onClick={() => onChange(item.id)}>
              <small>{item.kicker}</small>
              <strong>{item.title}</strong>
              <span>{item.text}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="vpCrewDeck">
        <article className="vpCrewPoster">
          <p className="vpEyebrow">Équipage</p>
          <h2>Pas de solitude face au bazar.</h2>
          <p>Le navire organise les rôles : qui garde le cap, qui range, qui retrouve, qui transmet.</p>
        </article>
        <div className="vpCrewList">
          {crew.map(([role, name, text]) => (
            <article key={role}>
              <small>{role}</small>
              <strong>{name}</strong>
              <span>{text}</span>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function Workspace({ active, isRecording, setIsRecording, markers, setMarkers }) {
  const data = workspaceData[active] || workspaceData.iles;
  const Icon = data.icon;

  return (
    <section className="vpWorkspace">
      <div className="vpWorkspaceHero">
        <div className="vpWorkspaceIcon"><Icon size={30} /></div>
        <div>
          <p className="vpEyebrow">Zone active</p>
          <h1>{data.title}</h1>
          <p>{data.intro}</p>
        </div>
      </div>

      <div className="vpBoard">
        {data.cards.map(([label, value, text]) => (
          <article key={label}>
            <small>{label}</small>
            <strong>{value}</strong>
            <p>{text}</p>
          </article>
        ))}
      </div>

      {active === "escales" && (
        <div className="vpMeetingBox">
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
    <footer className="vpFooter">
      <span>Vogue Merry</span>
      <span>·</span>
      <span>pirate manga, mais outil de travail</span>
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
    <main className="vpApp">
      <TopNav active={active} onChange={setActive} />
      {isHome ? (
        <Home onChange={setActive} />
      ) : (
        <Workspace active={active} isRecording={isRecording} setIsRecording={setIsRecording} markers={markers} setMarkers={setMarkers} />
      )}
      <Footer />
    </main>
  );
}
