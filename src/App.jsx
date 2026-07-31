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
import "./vogue-bridge-redesign.css";

const navItems = [
  { id: "pont", label: "Pont", icon: ShipWheel },
  { id: "iles", label: "Îles", icon: Map },
  { id: "escales", label: "Escales", icon: Anchor },
  { id: "journal", label: "Journal", icon: BookOpen },
  { id: "coffre", label: "Coffre", icon: FolderOpen },
  { id: "longuevue", label: "Longue-vue", icon: Telescope }
];

const destinations = [
  { name: "Île des Courants", subtitle: "Reporting performance", status: "priorité" },
  { name: "Baie des Alizés", subtitle: "Campagne budget", status: "en cours" },
  { name: "Phare d’Émeraude", subtitle: "Forecast grand compte", status: "en cours" },
  { name: "Atoll des Brumes", subtitle: "Marge et chiffre", status: "à venir" }
];

const workspaceData = {
  iles: {
    title: "Îles projets",
    icon: Map,
    intro: "Les projets ne sont plus des galets sur une carte. Ce sont des destinations de travail, avec un cap, un état et un prochain geste.",
    board: [
      ["Destination active", "Île des Courants", "Reporting performance à reprendre en priorité."],
      ["État du cap", "À clarifier", "Identifier ce qui relève du projet, du document et de la décision."],
      ["Ouverture", "Fiche projet", "Une fiche sobre, lisible, reliée aux escales et au coffre."]
    ]
  },
  escales: {
    title: "Escales",
    icon: Anchor,
    intro: "Les réunions deviennent des escales : quelques marqueurs, une synthèse, des décisions et des actions. Pas de théâtre inutile.",
    board: [
      ["Prochaine escale", "Cadrage associé", "Montrer le pont, ouvrir une escale, retrouver une décision."],
      ["Marqueurs", "Décision · action · blocage", "Trois gestes simples pendant la réunion."],
      ["Sortie", "Compte rendu utile", "Une reprise claire sans fouiller dans l’audio." ]
    ]
  },
  journal: {
    title: "Journal de bord",
    icon: BookOpen,
    intro: "La mémoire longue du navire. Chaque reprise doit pouvoir raconter où l’on en est sans refaire toute l’histoire.",
    board: [
      ["Dernière trace", "Refonte du pont", "Arrêt des rustines visuelles."],
      ["Décision", "Vogue Merry n’est pas Azoth", "Azoth porte le produit, Vogue Merry reste le navire de Mateo."],
      ["À écrire", "Synthèse de continuité", "Ce qui a changé, ce qui reste fragile, le prochain cap." ]
    ]
  },
  coffre: {
    title: "Coffre",
    icon: FolderOpen,
    intro: "Le coffre ne doit pas être une boîte fourre-tout. Il protège les documents utiles, leurs versions et leur contexte.",
    board: [
      ["À classer", "Supports de démo", "Pitch, captures, documents et anciennes maquettes."],
      ["Protection", "Ne rien supprimer", "On archive avant de nettoyer."],
      ["Lien", "Projet ou escale", "Chaque pièce doit savoir à quoi elle sert." ]
    ]
  },
  longuevue: {
    title: "Longue-vue",
    icon: Telescope,
    intro: "Retrouver vite une trace, une décision ou un document. La recherche doit réduire le bruit, pas l’augmenter.",
    board: [
      ["Recherche", "À brancher", "Une requête simple, avec contexte."],
      ["Filtres", "Projet · date · type", "De quoi retrouver sans se noyer."],
      ["Résultat", "Réponse exploitable", "La trace trouvée, son origine, son usage." ]
    ]
  }
};

function Topbar({ active, onChange }) {
  return (
    <header className="vrTopbar">
      <div className="vrBrand">
        <div className="vrBrandMark"><Compass size={25} /></div>
        <div>
          <h1>Vogue Merry</h1>
          <p>Mémoire projet · cap · équipage</p>
        </div>
      </div>
      <nav className="vrNav" aria-label="Navigation Vogue Merry">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button key={id} type="button" className={active === id ? "active" : ""} onClick={() => onChange(id)}>
            <Icon size={17} />
            {label}
          </button>
        ))}
      </nav>
      <div className="vrStatus">
        <Sailboat size={22} />
        <div>
          <strong>V1 démo</strong>
          <span>Construire moins. Montrer mieux.</span>
        </div>
      </div>
    </header>
  );
}

function LogPose({ active }) {
  const activeLabel = useMemo(() => navItems.find((item) => item.id === active)?.label || "Pont", [active]);

  return (
    <aside className="vrLog">
      <header>
        <div className="vrLogIcon"><Compass size={28} /></div>
        <div>
          <h2>Log Pose</h2>
          <p>{activeLabel}</p>
        </div>
      </header>
      <article>
        <small>Cap actuel</small>
        <strong>Faire de Vogue Merry un outil que Mateo a envie d’ouvrir.</strong>
      </article>
      <article>
        <small>À protéger</small>
        <strong>La clarté, la mémoire, les décisions et l’ambiance navire.</strong>
      </article>
      <article>
        <small>Prochaine manœuvre</small>
        <strong>Brancher les vraies données seulement après une scène solide.</strong>
      </article>
    </aside>
  );
}

function ShipScene() {
  return (
    <div className="vrSeaTable" aria-label="Scène de navigation">
      <svg className="vrRouteSvg" viewBox="0 0 1000 520" preserveAspectRatio="none" aria-hidden="true">
        <path d="M126 372 C260 255 414 316 500 238 S710 164 870 274" />
        <path d="M214 176 C344 104 488 134 600 226 S714 344 814 376" />
      </svg>
      <div className="vrShip" aria-hidden="true">
        <div className="vrMast m1" />
        <div className="vrMast m2" />
        <div className="vrMast m3" />
        <div className="vrSail s1" />
        <div className="vrSail s2" />
        <div className="vrSail s3" />
        <div className="vrFlag" />
        <div className="vrHull" />
      </div>
      <div className="vrCompassPlate"><Compass size={48} /></div>
      <div className="vrDeckNote"><Compass size={18} /><span>Prochaine reprise : Île des Courants</span></div>
    </div>
  );
}

function PontView({ onChange }) {
  return (
    <section className="vrPont">
      <div className="vrStage">
        <div className="vrHeroText">
          <p className="vrEyebrow">Pont du navire</p>
          <h2>Tenir le cap sans perdre la mémoire.</h2>
          <span>Vogue Merry doit ouvrir une scène claire : un navire, des destinations, une reprise. Pas un tableau de bord déguisé.</span>
        </div>
        <ShipScene />
        <div className="vrMissionStrip">
          {destinations.map((destination) => (
            <button
              key={destination.name}
              className={`vrDestination ${destination.status === "priorité" ? "priority" : ""}`}
              type="button"
              onClick={() => onChange("iles")}
            >
              <strong>{destination.name}</strong>
              <span>{destination.subtitle}</span>
              <em>{destination.status}</em>
            </button>
          ))}
        </div>
      </div>
      <LogPose active="pont" />
    </section>
  );
}

function Workspace({ active, isRecording, setIsRecording, markers, setMarkers }) {
  const data = workspaceData[active] || workspaceData.iles;
  const Icon = data.icon;

  return (
    <section className="vrWorkspace">
      <div className="vrWorkspaceHeader">
        <div className="vrWorkspaceIcon"><Icon size={28} /></div>
        <div>
          <p className="vrEyebrow">Zone active</p>
          <h2>{data.title}</h2>
          <span>{data.intro}</span>
        </div>
      </div>

      <div className="vrBoard">
        {data.board.map(([label, value, text]) => (
          <article className="vrBoardCard" key={label}>
            <small>{label}</small>
            <strong>{value}</strong>
            <p>{text}</p>
          </article>
        ))}
      </div>

      <div className="vrAgenda">
        <article>
          <small>Vision produit</small>
          <h3>Une interface pour reprendre le fil.</h3>
          <p>Chaque zone doit aider Mateo à savoir où il est, ce qu’il protège, et ce qu’il fait ensuite.</p>
        </article>
        <article>
          <small>Règle de design</small>
          <h3>Moins de décor. Plus de direction.</h3>
          <p>L’ambiance pirate sert la lecture. Elle ne doit jamais remplacer l’usage.</p>
        </article>
      </div>

      {active === "escales" && (
        <div className="vrMeetingBox">
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
    <main className="vrApp">
      <div className="vrShell">
        <Topbar active={active} onChange={setActive} />
        <section className="vrMain">
          {active === "pont" ? (
            <PontView onChange={setActive} />
          ) : (
            <Workspace
              active={active}
              isRecording={isRecording}
              setIsRecording={setIsRecording}
              markers={markers}
              setMarkers={setMarkers}
            />
          )}
        </section>
      </div>
    </main>
  );
}
