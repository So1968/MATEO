import React, { useMemo, useState } from "react";
import {
  Anchor,
  Bell,
  BookOpen,
  ChevronRight,
  Compass,
  FolderOpen,
  Map,
  Sailboat,
  Settings,
  ShipWheel,
  Telescope
} from "lucide-react";

const MENU = [
  { id: "pont", label: "Pont", sublabel: "Vue d’ensemble", icon: ShipWheel },
  { id: "iles", label: "Îles", sublabel: "Vos projets", icon: Map },
  { id: "escales", label: "Escales", sublabel: "Réunions & comités", icon: Anchor, count: 5 },
  { id: "journal", label: "Journal", sublabel: "Comptes rendus", icon: BookOpen, count: 8 },
  { id: "coffre", label: "Coffre", sublabel: "Documents", icon: FolderOpen, count: 23 },
  { id: "longuevue", label: "Longue-vue", sublabel: "Recherche & veille", icon: Telescope },
  { id: "manoeuvres", label: "Manœuvres", sublabel: "Actions à mener", icon: Sailboat },
  { id: "caps", label: "Caps validés", sublabel: "Décisions actées", icon: Compass }
];

const PROJECTS = [
  { name: "Phare d’Émeraude", detail: "Réunions & escales", status: "En cours", tone: "green", x: 18, y: 26 },
  { name: "Baie des Alizés", detail: "Cœur du navire", status: "En construction", tone: "green", x: 52, y: 23 },
  { name: "Atoll des Brumes", detail: "Traces audio", status: "À reprendre", tone: "blue", x: 82, y: 50 },
  { name: "Île des Courants", detail: "Longue-vue recherche", status: "Priorité", tone: "red", x: 53, y: 71 },
  { name: "Lagune des Archives", detail: "Coffre documentaire", status: "En cours", tone: "gold", x: 23, y: 72 }
];

const VIEW_CONTENT = {
  iles: [
    ["Réunions & escales", "À structurer", "Les réunions, décisions et comptes rendus rassemblés au même endroit."],
    ["Cœur du navire", "En construction", "La mémoire centrale et les liens entre les projets."],
    ["Traces audio", "Priorité", "Les enregistrements à transcrire et rattacher aux bonnes escales."],
    ["Coffre documentaire", "En cours", "Les documents, versions, preuves et pièces utiles."],
    ["Longue-vue recherche", "À brancher", "La recherche globale dans la mémoire de Vogue Merry."],
    ["Transmission Mateo", "Cap clair", "Les éléments prêts à être transmis et repris." ]
  ],
  escales: [
    ["Démo Mateo", "À dater", "Préparer la réunion, rattacher l’audio et consigner les décisions."],
    ["Point associé", "À préparer", "Clarifier le périmètre autonome de Vogue Merry."],
    ["Reprise technique", "En cours", "Stabiliser le dépôt et éviter les versions concurrentes."]
  ],
  journal: [
    ["Vogue Merry est le produit officiel", "Validé", "Azoth Studio reste l’atelier qui le porte."],
    ["Ne plus travailler dans les brouillons", "Protection", "Les anciennes copies servent uniquement d’archives."],
    ["Créer le Log Pose de reprise", "À faire", "État, prochaine action, risques et décisions."]
  ],
  coffre: [
    ["Présentation Mateo", "Support", "Conserver les supports de démonstration de référence."],
    ["Charte Kiwika", "Document", "Rattacher la note de cadrage au bon projet."],
    ["Trames réunion", "Méthode", "Déroulé, marqueurs audio et structure de compte rendu."]
  ],
  longuevue: [
    ["Recherche globale", "À brancher", "Retrouver une décision, un document ou une trace depuis un seul champ."],
    ["Filtres utiles", "Mémoire", "Projet, date, personne, type de trace et statut."],
    ["Résultat attendu", "Usage", "Ne plus fouiller dans plusieurs dossiers pour retrouver une information."]
  ],
  manoeuvres: [
    ["Ranger les doublons", "Priorité", "Identifier l’officiel, les archives et la documentation."],
    ["Brancher la vraie mémoire", "V2", "Relier les escales, le coffre, le journal et les caps."],
    ["Préparer la démo", "À suivre", "Montrer un parcours simple et compréhensible."]
  ],
  caps: [
    ["Vogue Merry = produit", "Acté", "Le produit n’est pas Azoth : il est porté par Azoth."],
    ["Un fil = un projet", "Règle", "Éviter de mélanger plusieurs chantiers dans la même zone."],
    ["Lisibilité avant décoration", "Cap", "La structure doit rester utilisable avant toute finition esthétique."]
  ]
};

const APP_CSS = `
:root {
  font-family: Georgia, "Times New Roman", serif;
  color: #13202a;
  background: #120b07;
}

* { box-sizing: border-box; }
html, body, #root { margin: 0; min-height: 100%; }
body { min-width: 320px; background: #120b07; }
button { font: inherit; }

.vogue-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 285px minmax(0, 1fr) 305px;
  background:
    linear-gradient(90deg, rgba(29, 14, 6, .98), rgba(91, 48, 18, .82) 18px, transparent 19px),
    #4a260f;
  border: 10px solid #2a1509;
  box-shadow: inset 0 0 0 3px #7b4b22, inset 0 0 45px #000;
}

.sidebar {
  min-height: calc(100vh - 20px);
  display: flex;
  flex-direction: column;
  color: #f4dba5;
  background:
    radial-gradient(circle at 50% 0, rgba(54, 107, 128, .18), transparent 34%),
    linear-gradient(180deg, #062236 0%, #061d2d 100%);
  border-right: 7px ridge #5c3519;
  box-shadow: inset -18px 0 30px rgba(0, 0, 0, .35);
}

.brand {
  padding: 34px 30px 24px;
  text-align: center;
  border-bottom: 1px solid rgba(214, 174, 105, .22);
}

.brand-rose {
  width: 58px;
  height: 58px;
  margin: 0 auto 14px;
  display: grid;
  place-items: center;
  color: #dcb86f;
  border: 1px solid rgba(220, 184, 111, .35);
  border-radius: 50%;
}

.brand h1 { margin: 0; font-size: 2.1rem; font-weight: 500; letter-spacing: .02em; }
.brand p { margin: 12px 0 0; color: #c8b589; line-height: 1.45; font-size: .95rem; }

.side-nav { padding: 18px 18px 10px; display: grid; gap: 8px; }
.side-nav button {
  width: 100%;
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  padding: 12px 13px;
  color: #ecd39c;
  text-align: left;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
}
.side-nav button:hover { background: rgba(255, 255, 255, .045); }
.side-nav button.active {
  color: #162532;
  background: linear-gradient(180deg, #fff1c9, #e8cb8e);
  border-color: #b7873d;
  box-shadow: inset 0 0 0 2px rgba(255,255,255,.45), 0 6px 16px rgba(0,0,0,.26);
}
.nav-icon { display: grid; place-items: center; }
.nav-label strong { display: block; font-size: 1.12rem; font-weight: 600; }
.nav-label span { display: block; margin-top: 2px; color: #bda879; font-size: .78rem; font-family: Arial, sans-serif; }
.side-nav button.active .nav-label span { color: #6b5838; }
.nav-count {
  min-width: 25px;
  height: 25px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  color: #f1d9a4;
  background: #60401f;
  font-family: Arial, sans-serif;
  font-size: .72rem;
}

.captain-card {
  margin: auto 20px 14px;
  padding: 15px;
  display: grid;
  grid-template-columns: 42px 1fr auto;
  align-items: center;
  gap: 10px;
  border-top: 1px solid rgba(214, 174, 105, .2);
}
.captain-avatar {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: #f2d59c;
  border: 1px solid #b28a4d;
  background: linear-gradient(145deg, #3b5661, #8a6334);
}
.captain-card strong { display: block; font-size: .9rem; }
.captain-card span { display: block; color: #bfa777; font-family: Arial, sans-serif; font-size: .72rem; }
.sidebar-tools { margin: 0 20px 20px; padding: 12px; display: flex; justify-content: space-around; border: 1px solid rgba(214,174,105,.2); border-radius: 10px; }
.sidebar-tools button, .header-tools button { color: inherit; border: 0; background: transparent; cursor: pointer; }

.main-stage {
  min-width: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  background:
    radial-gradient(circle at 50% 0, rgba(255,255,255,.72), transparent 33%),
    linear-gradient(180deg, #f8edcf 0 210px, #d6c092 211px, #c6a86f 100%);
  border-right: 7px ridge #5c3519;
}

.stage-header {
  min-height: 205px;
  padding: 26px 42px 20px;
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr) 100px;
  align-items: start;
  gap: 18px;
  background:
    radial-gradient(ellipse at 8% 5%, rgba(255,255,255,.72), transparent 24%),
    radial-gradient(ellipse at 92% 4%, rgba(255,255,255,.72), transparent 24%),
    linear-gradient(180deg, rgba(255,255,255,.42), transparent),
    #efe0ba;
  border-bottom: 2px solid #8d6633;
  box-shadow: inset 0 -18px 30px rgba(106, 72, 25, .08);
}
.lantern-mark {
  width: 56px;
  height: 72px;
  display: grid;
  place-items: center;
  border: 2px solid #6e4822;
  border-radius: 18px 18px 12px 12px;
  color: #6c451e;
  background: radial-gradient(circle, #fff2a8, #d4983d 52%, #734319 54%);
  box-shadow: 0 0 22px rgba(255,184,67,.48);
}
.header-title { text-align: center; }
.header-title p { margin: 0 0 4px; color: #74572e; font-family: Arial, sans-serif; font-size: .76rem; letter-spacing: .18em; text-transform: uppercase; }
.header-title h2 { margin: 0; color: #142433; font-size: clamp(2.8rem, 5vw, 5rem); font-weight: 500; line-height: .98; }
.header-rule { width: min(360px, 70%); height: 1px; margin: 17px auto 13px; background: linear-gradient(90deg, transparent, #987746 20%, #987746 80%, transparent); }
.header-title span { color: #4e402c; font-size: 1rem; }
.header-tools { display: flex; justify-content: flex-end; gap: 10px; }
.header-tools button {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(83,61,28,.26);
  border-radius: 50%;
  color: #2b3740;
  background: rgba(255,255,255,.28);
}

.stage-content { min-height: 0; padding: 0; background: #173f4e; }
.sea-map {
  position: relative;
  min-height: calc(100vh - 225px);
  overflow: hidden;
  background:
    radial-gradient(circle at 20% 20%, rgba(255,255,255,.15) 0 2px, transparent 3px),
    radial-gradient(circle at 70% 35%, rgba(255,255,255,.12) 0 1px, transparent 2px),
    repeating-linear-gradient(164deg, rgba(255,255,255,.04) 0 2px, transparent 3px 54px),
    linear-gradient(155deg, #3b9cb1 0%, #1b7f96 38%, #0e526d 70%, #07384e 100%);
  background-size: 120px 120px, 90px 90px, auto, auto;
  box-shadow: inset 0 0 0 10px rgba(62,32,12,.55), inset 0 0 80px rgba(0,0,0,.32);
}
.sea-map::after {
  content: "";
  position: absolute;
  inset: auto 0 0;
  height: 92px;
  background: linear-gradient(180deg, transparent, rgba(26,13,6,.74)), repeating-linear-gradient(100deg, #3b1d0c 0 50px, #5a2d12 51px 96px);
  border-top: 8px ridge #7c4b22;
  pointer-events: none;
}
.route-layer { position: absolute; inset: 0; width: 100%; height: 100%; }
.route-layer path { fill: none; stroke: #f5df9b; stroke-width: 4; stroke-dasharray: 13 11; opacity: .86; }
.route-layer circle { fill: #e9d28e; stroke: #80582b; stroke-width: 2; }

.island-node {
  position: absolute;
  z-index: 3;
  width: 190px;
  transform: translate(-50%, -50%);
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  color: #1e2c31;
}
.island-art {
  position: relative;
  width: 156px;
  height: 90px;
  margin: 0 auto -4px;
  border-radius: 52% 48% 58% 42% / 55% 46% 54% 45%;
  background:
    radial-gradient(circle at 45% 24%, #f5e6a2 0 9%, transparent 10%),
    radial-gradient(circle at 62% 36%, #6aa850 0 14%, transparent 15%),
    radial-gradient(circle at 36% 38%, #86be60 0 23%, transparent 24%),
    linear-gradient(160deg, #799d4f 0 46%, #5c633e 47% 67%, #333226 68%);
  box-shadow: 0 19px 22px rgba(0,0,0,.36), inset -16px -16px 18px rgba(0,0,0,.28), inset 12px 10px 16px rgba(255,255,255,.2);
}
.island-art::before {
  content: "";
  position: absolute;
  left: 48%;
  bottom: 26px;
  width: 42px;
  height: 30px;
  border-radius: 6px 6px 3px 3px;
  background: linear-gradient(180deg, #f1d28e, #80502a);
  box-shadow: -32px 9px 0 -7px #e7c376, 30px 4px 0 -8px #f0d28e;
}
.island-art::after {
  content: "";
  position: absolute;
  left: 50%;
  top: 8px;
  width: 11px;
  height: 48px;
  transform: translateX(-50%);
  border-radius: 6px 6px 2px 2px;
  background: linear-gradient(180deg, #fff4c6 0 40%, #b86d3f 41% 55%, #f1e6cb 56%);
  box-shadow: 0 4px 9px rgba(0,0,0,.26);
}
.island-node:nth-of-type(even) .island-art { transform: rotate(3deg); }
.island-node:nth-of-type(3) .island-art { background: linear-gradient(155deg, #7f8d77, #475347 49%, #252c2a 50%); }
.island-node:nth-of-type(4) .island-art { background: linear-gradient(155deg, #96a360, #615b3b 49%, #30291d 50%); }
.island-node:nth-of-type(5) .island-art { background: linear-gradient(155deg, #78ad6b, #3a7256 49%, #2a3f31 50%); }

.island-card {
  position: relative;
  padding: 10px 12px 9px;
  color: #332715;
  background: linear-gradient(180deg, #fff1ca, #e7ca8c);
  border: 1px solid #8d6431;
  border-radius: 8px;
  box-shadow: 0 8px 18px rgba(0,0,0,.28), inset 0 0 0 2px rgba(255,255,255,.42);
}
.island-card strong { display: block; font-size: 1rem; }
.island-card span { display: block; margin-top: 3px; color: #62523a; font-family: Arial, sans-serif; font-size: .72rem; }
.island-card em { display: inline-flex; align-items: center; gap: 5px; margin-top: 5px; color: #53432d; font-family: Arial, sans-serif; font-size: .68rem; font-style: normal; }
.island-card em::before { content: ""; width: 8px; height: 8px; border-radius: 50%; background: #3aa56c; }
.island-card em.red::before { background: #c74b45; }
.island-card em.blue::before { background: #3690b5; }
.island-card em.gold::before { background: #c39836; }

.compass-watermark {
  position: absolute;
  right: 7%;
  top: 8%;
  width: 120px;
  height: 120px;
  display: grid;
  place-items: center;
  border: 2px solid rgba(244,221,157,.35);
  border-radius: 50%;
  color: rgba(244,221,157,.45);
}

.generic-view {
  min-height: calc(100vh - 225px);
  padding: 32px;
  background: linear-gradient(160deg, #0c6175, #07384e);
  box-shadow: inset 0 0 0 10px rgba(62,32,12,.55);
}
.generic-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }
.generic-card {
  min-height: 150px;
  padding: 22px;
  color: #322616;
  background: linear-gradient(180deg, #fff1ca, #e4c483);
  border: 1px solid #8c6330;
  border-radius: 10px;
  box-shadow: 0 14px 28px rgba(0,0,0,.24), inset 0 0 0 2px rgba(255,255,255,.42);
}
.generic-card small { display: inline-block; margin-bottom: 12px; color: #795a2c; font-family: Arial, sans-serif; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; }
.generic-card h3 { margin: 0 0 10px; font-size: 1.35rem; }
.generic-card p { margin: 0; color: #624f35; font-family: Arial, sans-serif; line-height: 1.5; }

.log-pose {
  min-height: calc(100vh - 20px);
  padding: 34px 25px 26px;
  display: flex;
  flex-direction: column;
  color: #372916;
  background:
    linear-gradient(rgba(255,255,255,.24), rgba(255,255,255,.04)),
    repeating-linear-gradient(0deg, rgba(112,75,28,.035) 0 1px, transparent 2px 6px),
    #ead7aa;
  box-shadow: inset 18px 0 34px rgba(80,48,14,.13);
}
.log-pose h2 { margin: 0; text-align: center; font-size: 2rem; font-weight: 500; }
.log-ornament { width: 90px; height: 1px; margin: 13px auto 26px; background: #9d7845; }
.log-compass {
  width: 165px;
  height: 165px;
  margin: 0 auto 26px;
  display: grid;
  place-items: center;
  color: #77501f;
  border: 9px double #7d5224;
  border-radius: 50%;
  background: radial-gradient(circle, #4cb1ca 0 20%, #0f6b85 21% 49%, #d5aa52 50% 53%, #6f461e 54%);
  box-shadow: 0 12px 24px rgba(70,42,12,.25), inset 0 0 20px rgba(255,255,255,.34);
}
.log-section { padding: 24px 8px; border-top: 1px solid rgba(112,75,28,.25); }
.log-section label { display: block; margin-bottom: 8px; color: #735a34; font-family: Arial, sans-serif; font-size: .78rem; }
.log-section strong { display: block; font-size: 1.35rem; font-weight: 500; line-height: 1.25; }
.log-section p { margin: 7px 0 0; color: #6b5637; font-family: Arial, sans-serif; font-size: .82rem; line-height: 1.4; }
.log-button {
  margin-top: auto;
  padding: 13px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #3f301a;
  border: 1px solid rgba(111,76,31,.28);
  background: rgba(255,255,255,.16);
  cursor: pointer;
}

@media (max-width: 1180px) {
  .vogue-shell { grid-template-columns: 245px minmax(0, 1fr); }
  .log-pose { grid-column: 1 / -1; min-height: auto; display: grid; grid-template-columns: 180px repeat(2, 1fr) auto; align-items: center; gap: 18px; }
  .log-pose h2, .log-ornament { display: none; }
  .log-compass { width: 120px; height: 120px; margin: 0; }
  .log-section { border-top: 0; border-left: 1px solid rgba(112,75,28,.25); }
  .log-button { margin-top: 0; }
}

@media (max-width: 820px) {
  .vogue-shell { display: block; border-width: 6px; }
  .sidebar { min-height: auto; border-right: 0; border-bottom: 5px ridge #5c3519; }
  .brand { padding: 20px; }
  .brand p, .captain-card, .sidebar-tools { display: none; }
  .side-nav { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .side-nav button { grid-template-columns: 34px 1fr auto; }
  .main-stage { border-right: 0; }
  .stage-header { min-height: 160px; padding: 22px 18px; grid-template-columns: 48px 1fr 78px; }
  .lantern-mark { width: 44px; height: 58px; }
  .header-title h2 { font-size: 2.35rem; }
  .header-title span { font-size: .85rem; }
  .sea-map, .generic-view { min-height: 660px; }
  .generic-grid { grid-template-columns: 1fr; }
  .log-pose { display: block; padding: 25px; }
  .log-pose h2 { display: block; }
  .log-compass { margin: 20px auto; }
  .log-section { border-left: 0; border-top: 1px solid rgba(112,75,28,.25); }
}
`;

function Sidebar({ active, onChange }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-rose"><Compass size={38} /></div>
        <h1>Vogue Merry</h1>
        <p>Le journal de bord<br />qui vous aide à garder<br />le cap sur vos projets.</p>
      </div>

      <nav className="side-nav">
        {MENU.map(({ id, label, sublabel, icon: Icon, count }) => (
          <button key={id} className={active === id ? "active" : ""} onClick={() => onChange(id)}>
            <span className="nav-icon"><Icon size={25} /></span>
            <span className="nav-label"><strong>{label}</strong><span>{sublabel}</span></span>
            {count ? <span className="nav-count">{count}</span> : null}
          </button>
        ))}
      </nav>

      <div className="captain-card">
        <div className="captain-avatar">M</div>
        <div><strong>Capitaine Mateo</strong><span>Gardien du cap</span></div>
        <ChevronRight size={18} />
      </div>
      <div className="sidebar-tools">
        <button aria-label="Réglages"><Settings size={21} /></button>
        <button aria-label="Alertes"><Bell size={21} /></button>
        <button aria-label="Aide"><Compass size={21} /></button>
      </div>
    </aside>
  );
}

function StageHeader({ active }) {
  const current = MENU.find((item) => item.id === active) || MENU[0];
  const titles = {
    pont: ["Pont du navire", "Reprendre le cap sur vos projets actifs"],
    iles: ["Mes îles", "Voir l’état et la direction de chaque projet"],
    escales: ["Escales", "Préparer, vivre et transmettre les réunions"],
    journal: ["Journal de bord", "Conserver la mémoire longue du projet"],
    coffre: ["Coffre", "Ranger les documents et les preuves utiles"],
    longuevue: ["Longue-vue", "Retrouver une information sans fouiller partout"],
    manoeuvres: ["Manœuvres", "Voir les actions à mener et les prochaines relances"],
    caps: ["Caps validés", "Retrouver les décisions déjà actées"]
  };
  const [title, subtitle] = titles[current.id];

  return (
    <header className="stage-header">
      <div className="lantern-mark"><Compass size={26} /></div>
      <div className="header-title">
        <p>Vogue Merry · {current.label}</p>
        <h2>{title}</h2>
        <div className="header-rule" />
        <span>{subtitle}</span>
      </div>
      <div className="header-tools">
        <button aria-label="Notifications"><Bell size={20} /></button>
        <button aria-label="Réglages"><Settings size={20} /></button>
      </div>
    </header>
  );
}

function SeaMap() {
  return (
    <section className="sea-map">
      <svg className="route-layer" viewBox="0 0 1000 620" preserveAspectRatio="none" aria-hidden="true">
        <path d="M160 190 C280 110 390 155 520 150 S730 210 805 310" />
        <path d="M160 190 C190 320 245 445 500 455 S725 435 805 310" />
        <path d="M520 150 C480 255 490 350 500 455" />
        <circle cx="160" cy="190" r="6" />
        <circle cx="520" cy="150" r="6" />
        <circle cx="805" cy="310" r="6" />
        <circle cx="500" cy="455" r="6" />
      </svg>

      <div className="compass-watermark"><Compass size={74} /></div>

      {PROJECTS.map((project) => (
        <button
          className="island-node"
          key={project.name}
          style={{ left: `${project.x}%`, top: `${project.y}%` }}
        >
          <span className="island-art" />
          <span className="island-card">
            <strong>{project.name}</strong>
            <span>{project.detail}</span>
            <em className={project.tone}>{project.status}</em>
          </span>
        </button>
      ))}
    </section>
  );
}

function GenericView({ active }) {
  const cards = VIEW_CONTENT[active] || VIEW_CONTENT.iles;
  return (
    <section className="generic-view">
      <div className="generic-grid">
        {cards.map(([title, badge, text]) => (
          <article className="generic-card" key={title}>
            <small>{badge}</small>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function LogPose({ active }) {
  const current = MENU.find((item) => item.id === active) || MENU[0];
  const nextDirections = {
    pont: "Stabiliser le Pont et rendre les îles réellement ouvrables",
    iles: "Transformer chaque île en vraie page projet",
    escales: "Créer une escale depuis un audio ou des notes",
    journal: "Produire le premier Log Pose de reprise",
    coffre: "Brancher le dépôt documentaire réel",
    longuevue: "Connecter la recherche à la mémoire",
    manoeuvres: "Attribuer les actions et les échéances",
    caps: "Relier chaque décision à son contexte"
  };

  return (
    <aside className="log-pose">
      <h2>Log Pose</h2>
      <div className="log-ornament" />
      <div className="log-compass"><Compass size={82} /></div>

      <section className="log-section">
        <label>Cap actuel</label>
        <strong>Nord-Est</strong>
        <p>Lisibilité, cohérence et efficacité.</p>
      </section>

      <section className="log-section">
        <label>Zone active</label>
        <strong>{current.label}</strong>
        <p>{current.sublabel}</p>
      </section>

      <section className="log-section">
        <label>Prochaine direction</label>
        <strong>{nextDirections[active]}</strong>
        <p>Une seule étape validée à la fois.</p>
      </section>

      <button className="log-button">Voir le détail <ChevronRight size={18} /></button>
    </aside>
  );
}

export default function App() {
  const [active, setActive] = useState("pont");
  const centralView = useMemo(() => active === "pont" ? <SeaMap /> : <GenericView active={active} />, [active]);

  return (
    <>
      <style>{APP_CSS}</style>
      <main className="vogue-shell">
        <Sidebar active={active} onChange={setActive} />
        <section className="main-stage">
          <StageHeader active={active} />
          <div className="stage-content">{centralView}</div>
        </section>
        <LogPose active={active} />
      </main>
    </>
  );
}
