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
  { name: "Phare d’Émeraude", detail: "Déploiement EPM", status: "En cours", tone: "green", kind: "lighthouse", x: 19, y: 31 },
  { name: "Baie des Alizés", detail: "Reporting P&L", status: "En cours", tone: "green", kind: "palms", x: 51, y: 27 },
  { name: "Atoll des Brumes", detail: "Migration modèle", status: "À reprendre", tone: "blue", kind: "mountain", x: 82, y: 49 },
  { name: "Île des Courants", detail: "Budget & Forecast", status: "Priorité", tone: "red", kind: "fortress", x: 54, y: 68 },
  { name: "Lagune des Archives", detail: "Référentiels & données", status: "En cours", tone: "gold", kind: "lagoon", x: 22, y: 67 }
];

const ISLAND_PROJECTS = [
  {
    island: "Phare d’Émeraude",
    name: "Déploiement EPM — Client Horizon",
    status: "En cours",
    tone: "green",
    cap: "Cadrer et sécuriser le modèle Budget / Forecast avant la recette métier.",
    next: "Préparer l’atelier DAF sur les règles de gestion et le workflow de validation."
  },
  {
    island: "Baie des Alizés",
    name: "Refonte reporting P&L",
    status: "En cours",
    tone: "green",
    cap: "Aligner le reporting réel, budget et forecast sur un référentiel commun.",
    next: "Valider la structure du P&L avec le contrôle de gestion."
  },
  {
    island: "Atoll des Brumes",
    name: "Migration modèle Planning",
    status: "À reprendre",
    tone: "blue",
    cap: "Reprendre les règles de calcul et fiabiliser les flux de données entrants.",
    next: "Identifier les écarts entre l’ancien modèle et la cible."
  },
  {
    island: "Île des Courants",
    name: "Campagne Budget 2027",
    status: "Priorité",
    tone: "red",
    cap: "Sécuriser le calendrier budgétaire, les hypothèses et les contributeurs.",
    next: "Arbitrer les règles de saisie avant ouverture de la campagne."
  }
];

const GLOBAL_PRIORITIES = [
  {
    rank: 1,
    project: "Campagne Budget 2027",
    island: "Île des Courants",
    reason: "Ouverture de campagne à sécuriser",
    action: "Arbitrer les règles de saisie et de validation.",
    tone: "red"
  },
  {
    rank: 2,
    project: "Migration modèle Planning",
    island: "Atoll des Brumes",
    reason: "Écarts de calcul à qualifier",
    action: "Comparer les règles source et cible.",
    tone: "blue"
  },
  {
    rank: 3,
    project: "Déploiement EPM — Client Horizon",
    island: "Phare d’Émeraude",
    reason: "Atelier DAF à préparer",
    action: "Consolider les règles de gestion Budget / Forecast.",
    tone: "green"
  }
];

const PILOT_WORLD = {
  carte: {
    label: "Carte de l’île",
    subtitle: "La photographie actuelle du projet : où nous sommes aujourd’hui",
    items: [
      ["Étape actuelle", "Cadrage fonctionnel avancé. Le modèle Budget / Forecast est défini ; les derniers arbitrages précèdent la recette métier."],
      ["Acteurs clés", "Matéo pilote la mission avec la DAF, le contrôle de gestion et le référent SI du Client Horizon."],
      ["Sujets ouverts", "Granularité du Forecast, qualité de l’axe produit, règles d’allocation et validation du mapping analytique."],
      ["Risque principal", "Des historiques ERP hétérogènes peuvent fragiliser les comparaisons Réel / Budget / Forecast pendant la recette."]
    ]
  },
  cap: {
    label: "Cap",
    subtitle: "La direction choisie : ce que le projet cherche à atteindre maintenant",
    items: [
      ["Cap actuel", "Cadrer et sécuriser le modèle Budget / Forecast avant la recette métier."],
      ["Critère de réussite", "Une DAF capable de piloter Réel, Budget et Forecast dans un même modèle, avec des règles comprises et validées."],
      ["Prochain jalon", "Atelier DAF sur les règles de gestion et le workflow, puis lancement des scénarios de recette UAT."],
      ["Direction actée", "Forecast glissant 12 mois, ERP comme source du Réel et workflow de validation à deux niveaux."]
    ]
  },
  manoeuvres: {
    label: "Manœuvres",
    subtitle: "Les actions concrètes nécessaires pour tenir le cap",
    items: [
      ["Finaliser le mapping analytique", "Matéo · 12 correspondances comptes / centres de coûts restent à valider avec le contrôle de gestion."],
      ["Arbitrer la granularité du Forecast", "Choisir entre BU × Produit et BU seule pour la première mise en production."],
      ["Préparer la recette UAT", "Construire les scénarios import Réel, saisie Budget, reforecast, allocation, validation, restitution et export."],
      ["Sécuriser le planning", "Vérifier que recette, corrections et formation tiennent avant l’ouverture de la campagne budgétaire."]
    ]
  },
  arsenal: {
    label: "Arsenal",
    subtitle: "Les outils, documents, données et références embarqués pour avancer sur l’île",
    items: [
      ["Cadrage fonctionnel v1.4", "Périmètre Budget, Forecast, reporting P&L, utilisateurs, règles de gestion et jalons du projet."],
      ["Mapping ERP → EPM", "Correspondance comptes, centres de coûts, BU, produits et axes analytiques."],
      ["Dictionnaire des données", "Définition des indicateurs, sources, fréquence de mise à jour et responsable de chaque donnée."],
      ["Plan de recette UAT", "Scénarios de test métier, jeux de données, résultats attendus, anomalies et critères de validation."]
    ]
  },
  journal: {
    label: "Journal de bord",
    subtitle: "Les passages de Vogue Marry sur cette île, consignés dans l’ordre du voyage",
    items: [
      ["09 sept. — Escale · Comité projet DAF / Kiwika", "Avancement du cadrage. Décision : forecast glissant 12 mois. Risque : qualité hétérogène des axes ERP. Action : contrôler le mapping analytique."],
      ["12 sept. — Escale · Atelier Budget & Forecast", "Arbitrage attendu sur la granularité de saisie et le circuit de validation. Document : cadrage fonctionnel v1.4. Audio et transcription rattachés à l’escale."],
      ["16 sept. — Escale · Atelier Data / SI", "Mapping ERP → EPM, contrôles de cohérence et reprise des historiques. Point sensible : fiabilité de l’axe produit à confirmer avec le SI."],
      ["23 sept. — Escale prévue · Comité de recette", "Préparer les scénarios UAT, les utilisateurs pilotes et les critères de validation. La sortie de cette escale mettra à jour la carte de l’île."]
    ]
  }
};

const VIEW_CONTENT = {
  iles: [
    ["Réunions & escales", "À structurer", "Les réunions, décisions et comptes rendus rassemblés au même endroit."],
    ["Cœur du navire", "En construction", "La mémoire centrale et les liens entre les projets."],
    ["Traces audio", "Priorité", "Les enregistrements à transcrire et rattacher aux bonnes escales."],
    ["Coffre documentaire", "En cours", "Les documents, versions, preuves et pièces utiles."],
    ["Longue-vue recherche", "À brancher", "La recherche globale dans la mémoire de Vogue Marry."],
    ["Transmission Mateo", "Cap clair", "Les éléments prêts à être transmis et repris."]
  ],
  escales: [
    ["Démo Mateo", "À dater", "Préparer la réunion, rattacher l’audio et consigner les décisions."],
    ["Point associé", "À préparer", "Clarifier le périmètre autonome de Vogue Marry."],
    ["Reprise technique", "En cours", "Stabiliser le dépôt et éviter les versions concurrentes."]
  ],
  journal: [
    ["Vogue Marry est le produit officiel", "Validé", "Azoth Studio reste l’atelier qui le porte."],
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
    ["Vogue Marry = produit", "Acté", "Le produit n’est pas Azoth : il est porté par Azoth."],
    ["Un fil = un projet", "Règle", "Éviter de mélanger plusieurs chantiers dans la même zone."],
    ["Lisibilité avant décoration", "Cap", "La structure doit rester utilisable avant toute finition esthétique."]
  ]
};

const APP_CSS = `
:root { font-family: Georgia, "Times New Roman", serif; color: #13202a; background: #120b07; }
* { box-sizing: border-box; }
html, body, #root { margin: 0; min-height: 100%; }
body { min-width: 320px; background: #120b07; }
button { font: inherit; }

.vogue-shell {
  height: 100vh;
  min-height: 680px;
  display: grid;
  grid-template-columns: 285px minmax(0, 1fr) 305px;
  overflow: hidden;
  background: #4a260f;
  border: 10px solid #2a1509;
  box-shadow: inset 0 0 0 3px #7b4b22, inset 0 0 45px #000;
}
.vogue-shell.no-log { grid-template-columns: 285px minmax(0, 1fr); }
.vogue-shell.no-log .main-stage { border-right: 0; }

.sidebar {
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: #f4dba5;
  background: radial-gradient(circle at 50% 0, rgba(54,107,128,.18), transparent 34%), linear-gradient(180deg,#062236,#061d2d);
  border-right: 7px ridge #5c3519;
  box-shadow: inset -18px 0 30px rgba(0,0,0,.35);
}
.brand { padding: 16px 30px 12px; text-align: center; border-bottom: 1px solid rgba(214,174,105,.22); }
.brand-rose { width: 46px; height: 46px; margin: 0 auto 8px; display: grid; place-items: center; color: #dcb86f; border: 1px solid rgba(220,184,111,.35); border-radius: 50%; }
.brand h1 { margin: 0; font-size: 1.9rem; font-weight: 500; }
.brand p { margin: 7px 0 0; color: #c8b589; line-height: 1.32; font-size: .85rem; }
.side-nav { padding: 9px 18px 6px; display: grid; gap: 2px; }
.side-nav button { width: 100%; display: grid; grid-template-columns: 40px minmax(0,1fr) auto; align-items: center; gap: 8px; padding: 8px 13px; color: #ecd39c; text-align: left; border: 1px solid transparent; border-radius: 8px; background: transparent; cursor: pointer; }
.side-nav button:hover { background: rgba(255,255,255,.045); }
.side-nav button.active { color: #162532; background: linear-gradient(180deg,#fff1c9,#e8cb8e); border-color: #b7873d; box-shadow: inset 0 0 0 2px rgba(255,255,255,.45),0 6px 16px rgba(0,0,0,.26); }
.nav-icon { display: grid; place-items: center; }
.nav-label strong { display: block; font-size: 1.03rem; font-weight: 600; }
.nav-label span { display: block; margin-top: 1px; color: #bda879; font: .72rem Arial,sans-serif; }
.side-nav button.active .nav-label span { color: #6b5838; }
.nav-count { min-width: 24px; height: 24px; display: grid; place-items: center; border-radius: 999px; color: #f1d9a4; background: #60401f; font: .7rem Arial,sans-serif; }
.captain-card { margin: auto 20px 6px; padding: 10px 13px; display: grid; grid-template-columns: 38px 1fr auto; align-items: center; gap: 9px; border-top: 1px solid rgba(214,174,105,.2); }
.captain-avatar { width: 38px; height: 38px; display: grid; place-items: center; border-radius: 50%; color: #f2d59c; border: 1px solid #b28a4d; background: linear-gradient(145deg,#3b5661,#8a6334); }
.captain-card strong { display: block; font-size: .86rem; }
.captain-card span { display: block; color: #bfa777; font: .7rem Arial,sans-serif; }
.sidebar-tools { margin: 0 20px 10px; padding: 7px; display: flex; justify-content: space-around; border: 1px solid rgba(214,174,105,.2); border-radius: 10px; }
.sidebar-tools button, .header-tools button { color: inherit; border: 0; background: transparent; cursor: pointer; }

.main-stage { min-width: 0; min-height: 0; display: grid; grid-template-rows: auto minmax(0,1fr); background: #efe0ba; border-right: 7px ridge #5c3519; }
.stage-header { min-height: 205px; padding: 26px 42px 20px; display: grid; grid-template-columns: 72px minmax(0,1fr) 100px; align-items: start; gap: 18px; background: radial-gradient(ellipse at 8% 5%,rgba(255,255,255,.72),transparent 24%),radial-gradient(ellipse at 92% 4%,rgba(255,255,255,.72),transparent 24%),linear-gradient(180deg,rgba(255,255,255,.42),transparent),#efe0ba; border-bottom: 2px solid #8d6633; box-shadow: inset 0 -18px 30px rgba(106,72,25,.08); }
.stage-header.project-mode .header-title h2 { font-size: clamp(2.45rem,4vw,4.2rem); }
.lantern-mark { width: 56px; height: 72px; display: grid; place-items: center; border: 2px solid #6e4822; border-radius: 18px 18px 12px 12px; color: #6c451e; background: radial-gradient(circle,#fff2a8,#d4983d 52%,#734319 54%); box-shadow: 0 0 22px rgba(255,184,67,.48); }
.header-title { text-align: center; }
.header-title p { margin: 0 0 4px; color: #74572e; font: .76rem Arial,sans-serif; letter-spacing: .18em; text-transform: uppercase; }
.header-title h2 { margin: 0; color: #142433; font-size: clamp(2.8rem,5vw,5rem); font-weight: 500; line-height: .98; }
.header-rule { width: min(360px,70%); height: 1px; margin: 17px auto 13px; background: linear-gradient(90deg,transparent,#987746 20%,#987746 80%,transparent); }
.header-title span { color: #4e402c; font-size: 1rem; }
.header-tools { display: flex; justify-content: flex-end; gap: 10px; }
.header-tools button { width: 40px; height: 40px; display: grid; place-items: center; border: 1px solid rgba(83,61,28,.26); border-radius: 50%; color: #2b3740; background: rgba(255,255,255,.28); }

.stage-content { min-height: 0; background: #173f4e; }
.pont-view { height: 100%; min-height: 470px; display: grid; grid-template-rows: auto minmax(0,1fr); overflow: hidden; background: #173f4e; }
.priorities-board { padding: 12px 18px 11px; color: #f1dca6; background: linear-gradient(180deg,#0a3446,#082a3a); border-bottom: 2px solid #8d6633; box-shadow: inset 0 -10px 20px rgba(0,0,0,.16); }
.priorities-heading { margin-bottom: 9px; display: flex; align-items: baseline; justify-content: space-between; gap: 16px; }
.priorities-heading strong { font-size: 1.05rem; font-weight: 600; }
.priorities-heading span { color: #c9b78b; font: .72rem Arial,sans-serif; }
.priorities-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 9px; }
.priority-card { min-width: 0; padding: 9px 11px; display: grid; grid-template-columns: 28px minmax(0,1fr); gap: 9px; color: #382b18; background: linear-gradient(180deg,#f7e4b5,#dfc17f); border: 1px solid #8d6431; border-radius: 7px; box-shadow: inset 0 0 0 1px rgba(255,255,255,.34); }
.priority-rank { width: 25px; height: 25px; display: grid; place-items: center; border-radius: 50%; color: #f8e5b4; background: #6c4421; font: 700 .72rem Arial,sans-serif; }
.priority-card.red .priority-rank { background: #8f3933; }
.priority-card.blue .priority-rank { background: #286b83; }
.priority-card small { display: block; color: #7b5d31; font: 700 .62rem Arial,sans-serif; letter-spacing: .06em; text-transform: uppercase; }
.priority-card strong { display: block; margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: .91rem; }
.priority-card p { margin: 4px 0 0; color: #624e32; font: .69rem/1.28 Arial,sans-serif; }
.priority-card p b { color: #4d3920; font-weight: 700; }
.pont-view .sea-map { min-height: 0; }

.sea-map { position: relative; height: 100%; min-height: 470px; overflow: hidden; background: radial-gradient(circle at 20% 20%,rgba(255,255,255,.17) 0 2px,transparent 3px),radial-gradient(circle at 70% 35%,rgba(255,255,255,.12) 0 1px,transparent 2px),repeating-linear-gradient(164deg,rgba(255,255,255,.045) 0 2px,transparent 3px 54px),linear-gradient(155deg,#42a7bb 0%,#1d8299 38%,#0e526d 70%,#07384e 100%); background-size: 120px 120px,90px 90px,auto,auto; box-shadow: inset 0 0 0 10px rgba(62,32,12,.55),inset 0 0 80px rgba(0,0,0,.32); }
.sea-map::before { content: ""; position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse at 42% 22%,rgba(255,255,255,.13),transparent 30%),repeating-radial-gradient(ellipse at 50% 50%,transparent 0 24px,rgba(255,255,255,.025) 25px 27px); }
.sea-map::after { content: ""; position: absolute; inset: auto 0 0; height: 58px; background: linear-gradient(180deg,transparent,rgba(26,13,6,.55)),repeating-linear-gradient(100deg,#3b1d0c 0 50px,#5a2d12 51px 96px); border-top: 7px ridge #7c4b22; pointer-events: none; z-index: 2; }
.route-layer { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 1; }
.route-layer path { fill: none; stroke: #f5df9b; stroke-width: 4; stroke-dasharray: 13 11; opacity: .9; }
.route-layer circle { fill: #e9d28e; stroke: #80582b; stroke-width: 2; }

.island-node { position: absolute; z-index: 4; width: 220px; transform: translate(-50%,-50%); padding: 0; border: 0; background: transparent; cursor: pointer; color: #1e2c31; }
.island-node:hover { z-index: 8; }
.island-art { position: relative; display: block; width: 184px; height: 116px; margin: 0 auto; isolation: isolate; filter: drop-shadow(0 18px 14px rgba(0,0,0,.34)); }
.terrain { position: absolute; inset: 13px 2px 5px; display: block; border-radius: 58% 42% 55% 45% / 50% 56% 44% 50%; background: radial-gradient(ellipse at 44% 32%,#f5e8aa 0 14%,#9bc76b 15% 34%,#508653 35% 60%,#384836 61% 70%,#282821 71%); box-shadow: 0 0 0 7px rgba(239,216,150,.22),inset -19px -18px 20px rgba(0,0,0,.32),inset 16px 11px 18px rgba(255,255,255,.19); transform: perspective(260px) rotateX(10deg) rotate(-2deg); }
.terrain::after { content: ""; position: absolute; left: 8%; right: 7%; bottom: -12px; height: 28px; border-radius: 50%; background: radial-gradient(ellipse,rgba(3,24,30,.42),transparent 70%); filter: blur(5px); }
.feature { position: absolute; display: block; z-index: 3; }
.feature-a::before, .feature-a::after, .feature-b::before, .feature-b::after, .feature-c::before, .feature-c::after { content: ""; position: absolute; display: block; }

.kind-lighthouse .feature-a { left: 75px; top: 5px; width: 29px; height: 76px; border-radius: 8px 8px 4px 4px; background: linear-gradient(90deg,#d8d0b9,#fff6d8 45%,#a98d68); box-shadow: inset 0 -12px 0 #8c623d,0 5px 8px rgba(0,0,0,.3); }
.kind-lighthouse .feature-a::before { left: -5px; top: 19px; width: 39px; height: 9px; background: #a34f35; box-shadow: 0 22px 0 #a34f35; }
.kind-lighthouse .feature-a::after { left: -3px; top: -9px; width: 35px; height: 17px; border-radius: 7px 7px 3px 3px; background: #55331f; box-shadow: inset 0 0 0 3px #d7a85c,0 0 15px rgba(255,219,119,.78); }
.kind-lighthouse .feature-b { left: 37px; top: 63px; width: 42px; height: 25px; border-radius: 5px; background: linear-gradient(#f1d89c,#8d5b2d); box-shadow: 50px 5px 0 -5px #e6c37d; }
.kind-lighthouse .feature-c { left: 23px; top: 33px; width: 32px; height: 27px; border-radius: 50% 50% 45% 45%; background: radial-gradient(circle at 30% 30%,#b7dc73,#4e874e 68%,#315a40 69%); box-shadow: 105px 16px 0 -4px #507f4b; }

.kind-palms .terrain { background: radial-gradient(ellipse at 48% 27%,#f7ecb7 0 19%,#8fca6f 20% 39%,#4a8b52 40% 62%,#2f4632 63% 72%,#282821 73%); }
.kind-palms .feature-a { left: 72px; top: 30px; width: 8px; height: 58px; border-radius: 8px; background: #6e4724; transform: rotate(-7deg); box-shadow: 28px 5px 0 -1px #76502a,52px 13px 0 -2px #65401f; }
.kind-palms .feature-a::before { left: -20px; top: -16px; width: 46px; height: 30px; border-radius: 50%; background: radial-gradient(ellipse at 50% 100%,#5d9d46 0 25%,transparent 26%),linear-gradient(25deg,transparent 44%,#4f9344 45% 55%,transparent 56%); box-shadow: 29px 5px 0 -2px #5b9b45,54px 12px 0 -4px #4d8c42; }
.kind-palms .feature-b { left: 49px; top: 70px; width: 81px; height: 25px; border-radius: 8px; background: linear-gradient(#efd79c,#8b5a2e); box-shadow: 18px -13px 0 -8px #efd79c; }
.kind-palms .feature-c { left: 36px; top: 53px; width: 28px; height: 20px; border-radius: 4px; background: #d8b875; box-shadow: 91px 14px 0 -4px #e2c57e; }

.kind-mountain .terrain { background: radial-gradient(ellipse at 46% 30%,#ddd7a3 0 12%,#738a70 13% 37%,#48584f 38% 63%,#303432 64% 74%,#222523 75%); }
.kind-mountain .feature-a { left: 40px; top: 25px; width: 72px; height: 66px; clip-path: polygon(50% 0,100% 100%,0 100%); background: linear-gradient(135deg,#dbe0d2 0 18%,#596761 19% 64%,#343c3a 65%); filter: drop-shadow(22px 10px 0 #47534e); }
.kind-mountain .feature-b { left: 103px; top: 41px; width: 50px; height: 48px; clip-path: polygon(50% 0,100% 100%,0 100%); background: linear-gradient(135deg,#cfd5c8 0 18%,#4b5954 19% 68%,#303735 69%); }
.kind-mountain .feature-c { left: 27px; top: 81px; width: 130px; height: 16px; border-radius: 50%; background: rgba(235,245,235,.36); filter: blur(4px); }

.kind-fortress .terrain { background: radial-gradient(ellipse at 49% 27%,#d9ca86 0 13%,#76935d 14% 38%,#596449 39% 61%,#38382c 62% 73%,#25251f 74%); }
.kind-fortress .feature-a { left: 61px; top: 40px; width: 70px; height: 49px; background: linear-gradient(#d0b070,#77502e); border-radius: 4px 4px 2px 2px; box-shadow: inset 0 0 0 4px rgba(80,45,23,.24); }
.kind-fortress .feature-a::before { left: -16px; top: -20px; width: 27px; height: 69px; background: linear-gradient(#dbbd79,#75502f); box-shadow: 75px 7px 0 -1px #b68a52; }
.kind-fortress .feature-a::after { left: -19px; top: -24px; width: 33px; height: 10px; background: repeating-linear-gradient(90deg,#6e4729 0 6px,#d4b477 7px 11px); box-shadow: 76px 7px 0 -1px #6e4729; }
.kind-fortress .feature-b { left: 95px; top: 19px; width: 4px; height: 47px; background: #3e2b1d; }
.kind-fortress .feature-b::after { left: 4px; top: 0; width: 30px; height: 19px; clip-path: polygon(0 0,100% 50%,0 100%); background: #b7372f; }
.kind-fortress .feature-c { left: 35px; top: 74px; width: 35px; height: 17px; border-radius: 50%; background: #d9c47f; box-shadow: 93px 6px 0 -3px #d9c47f; }

.kind-lagoon .terrain { background: radial-gradient(ellipse at 46% 40%,#72d0c0 0 18%,#e5d397 19% 28%,#74b56d 29% 49%,#39765b 50% 67%,#28392e 68%); }
.kind-lagoon .feature-a { left: 46px; top: 65px; width: 89px; height: 25px; border-radius: 50%; background: radial-gradient(ellipse,#8fe2d2 0 48%,#e8d59b 49% 67%,transparent 68%); }
.kind-lagoon .feature-b { left: 75px; top: 43px; width: 42px; height: 31px; border-radius: 5px; background: linear-gradient(#edcf8b,#7d512b); box-shadow: -36px 13px 0 -7px #e9cc8a,47px 10px 0 -8px #e9cc8a; }
.kind-lagoon .feature-c { left: 34px; top: 27px; width: 35px; height: 30px; border-radius: 50%; background: radial-gradient(circle at 35% 35%,#a4d16a,#4c854b 68%,#315f42 69%); box-shadow: 91px 6px 0 -3px #51844b; }

.island-card { position: relative; display: block; width: 194px; margin: -2px auto 0; padding: 9px 11px 8px; color: #332715; background: linear-gradient(180deg,#fff1ca,#e7ca8c); border: 1px solid #8d6431; border-radius: 8px; box-shadow: 0 8px 18px rgba(0,0,0,.28),inset 0 0 0 2px rgba(255,255,255,.42); }
.island-card strong { display: block; font-size: .96rem; line-height: 1.1; }
.island-card span { display: block; margin-top: 3px; color: #62523a; font: .69rem Arial,sans-serif; }
.island-card em { display: inline-flex; align-items: center; gap: 5px; margin-top: 4px; color: #53432d; font: .65rem Arial,sans-serif; font-style: normal; }
.island-card em::before { content: ""; width: 8px; height: 8px; border-radius: 50%; background: #3aa56c; }
.island-card em.red::before { background: #c74b45; }
.island-card em.blue::before { background: #3690b5; }
.island-card em.gold::before { background: #c39836; }
.compass-watermark { position: absolute; right: 7%; top: 8%; z-index: 2; width: 116px; height: 116px; display: grid; place-items: center; border: 2px solid rgba(244,221,157,.35); border-radius: 50%; color: rgba(244,221,157,.45); }

.generic-view { height: 100%; min-height: 470px; padding: 32px; background: linear-gradient(160deg,#0c6175,#07384e); box-shadow: inset 0 0 0 10px rgba(62,32,12,.55); overflow: auto; }
.generic-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 20px; }
.generic-card { min-height: 150px; padding: 22px; color: #322616; background: linear-gradient(180deg,#fff1ca,#e4c483); border: 1px solid #8c6330; border-radius: 10px; box-shadow: 0 14px 28px rgba(0,0,0,.24),inset 0 0 0 2px rgba(255,255,255,.42); }
.generic-card small { display: inline-block; margin-bottom: 12px; color: #795a2c; font: 700 .72rem Arial,sans-serif; letter-spacing: .1em; text-transform: uppercase; }
.generic-card h3 { margin: 0 0 10px; font-size: 1.35rem; }
.generic-card p { margin: 0; color: #624f35; font: .95rem/1.5 Arial,sans-serif; }

.islands-view { height: 100%; min-height: 470px; padding: 22px 24px 24px; background: linear-gradient(160deg,#0c6175,#07384e); box-shadow: inset 0 0 0 10px rgba(62,32,12,.55); overflow: auto; }
.islands-toolbar { min-height: 42px; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between; gap: 16px; color: #f1dca6; }
.islands-toolbar p { margin: 0; font: .82rem/1.35 Arial,sans-serif; color: #d8c89d; }
.view-switch { display: inline-flex; flex: 0 0 auto; padding: 3px; border: 1px solid rgba(238,213,154,.42); border-radius: 8px; background: rgba(4,29,40,.34); }
.view-switch button { padding: 7px 13px; border: 0; border-radius: 5px; color: #ead5a4; background: transparent; cursor: pointer; font: 700 .76rem Arial,sans-serif; }
.view-switch button.active { color: #26313a; background: #efd79c; }
.island-project-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 14px; }
.project-card { min-height: 142px; padding: 15px 17px; color: #332715; background: linear-gradient(180deg,#fff1ca,#e5c785); border: 1px solid #8d6431; border-radius: 9px; box-shadow: 0 10px 20px rgba(0,0,0,.23),inset 0 0 0 2px rgba(255,255,255,.38); }
.project-card::after, .project-row:not(.header)::after { content: none !important; }
.project-card-top { display: flex; align-items: start; justify-content: space-between; gap: 12px; }
.project-card small { display: block; color: #7b5c2e; font: 700 .68rem Arial,sans-serif; letter-spacing: .08em; text-transform: uppercase; }
.project-card h3 { margin: 4px 0 0; font-size: 1.2rem; line-height: 1.15; }
.project-status { flex: 0 0 auto; display: inline-flex; align-items: center; gap: 5px; color: #5c4b33; font: .7rem Arial,sans-serif; }
.project-status::before { content: ""; width: 8px; height: 8px; border-radius: 50%; background: #3aa56c; }
.project-status.blue::before { background: #3690b5; }
.project-status.red::before { background: #c74b45; }
.project-meta { margin-top: 12px; padding-top: 10px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; border-top: 1px solid rgba(112,75,28,.2); }
.project-meta label { display: block; margin-bottom: 4px; color: #806334; font: 700 .65rem Arial,sans-serif; text-transform: uppercase; letter-spacing: .06em; }
.project-meta p { margin: 0; color: #5e4b31; font: .78rem/1.35 Arial,sans-serif; }
.project-open-button { margin: 9px 0 0 auto; padding: 4px 0; display: block; color: #6e451c; border: 0; background: transparent; cursor: pointer; font: 700 .73rem Arial,sans-serif; }
.project-open-button:hover { text-decoration: underline; }
.project-pilot-note { margin-top: 10px; display: block; text-align: right; color: #8a7049; font: .68rem Arial,sans-serif; }
.island-project-list { display: grid; gap: 8px; }
.project-row { display: grid; grid-template-columns: minmax(150px,1.15fr) 100px minmax(150px,1.2fr) minmax(160px,1.2fr) 74px; gap: 12px; align-items: center; padding: 13px 15px; color: #332715; background: linear-gradient(180deg,#fff1ca,#e7cb90); border: 1px solid #8d6431; border-radius: 8px; box-shadow: 0 8px 16px rgba(0,0,0,.18); }
.project-row.header { padding-top: 7px; padding-bottom: 7px; color: #dfc991; background: rgba(4,29,40,.36); border-color: rgba(238,213,154,.35); box-shadow: none; font: 700 .67rem Arial,sans-serif; letter-spacing: .07em; text-transform: uppercase; }
.project-row strong { display: block; font-size: .98rem; }
.project-row .project-island { display: block; margin-top: 2px; color: #7a633f; font: .7rem Arial,sans-serif; }
.project-row p { margin: 0; color: #5f4c31; font: .76rem/1.3 Arial,sans-serif; }
.project-row .project-open-button, .project-row .project-pilot-note { margin: 0; text-align: right; }

.project-world-view { height: 100%; min-height: 470px; padding: 16px 18px 20px; overflow: auto; color: #f1dca6; background: linear-gradient(160deg,#0c6175,#07384e); box-shadow: inset 0 0 0 10px rgba(62,32,12,.55); }
.project-world-top { min-height: 34px; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between; gap: 14px; }
.back-to-islands { padding: 6px 10px; color: #f0d89f; border: 1px solid rgba(238,213,154,.42); border-radius: 6px; background: rgba(4,29,40,.34); cursor: pointer; font: 700 .72rem Arial,sans-serif; }
.world-kicker { color: #cdbb8f; font: .72rem Arial,sans-serif; }
.world-tabs { margin-bottom: 12px; display: flex; flex-wrap: wrap; gap: 6px; }
.world-tabs button { padding: 7px 10px; color: #dfcda0; border: 1px solid rgba(238,213,154,.28); border-radius: 6px; background: rgba(4,29,40,.28); cursor: pointer; font: 700 .7rem Arial,sans-serif; }
.world-tabs button.active { color: #26313a; background: #efd79c; border-color: #c29651; }
.world-overview { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 11px; }
.world-summary-card, .world-section { padding: 14px 16px; color: #332715; background: linear-gradient(180deg,#fff1ca,#e5c785); border: 1px solid #8d6431; border-radius: 9px; box-shadow: 0 10px 20px rgba(0,0,0,.22),inset 0 0 0 2px rgba(255,255,255,.36); }
.world-summary-card.wide { grid-column: 1/-1; }
.world-summary-card small, .world-section small { display: block; margin-bottom: 5px; color: #806334; font: 700 .65rem Arial,sans-serif; letter-spacing: .06em; text-transform: uppercase; }
.world-summary-card h3, .world-section h3 { margin: 0 0 6px; font-size: 1.12rem; }
.world-summary-card p, .world-section p { margin: 0; color: #5f4d34; font: .78rem/1.4 Arial,sans-serif; }
.world-map { margin-top: 10px; display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 7px; }
.world-map button { padding: 9px 7px; color: #5b452b; border: 1px solid rgba(112,75,28,.24); border-radius: 6px; background: rgba(255,255,255,.2); cursor: pointer; font: 700 .68rem Arial,sans-serif; }
.world-section-header { margin-bottom: 12px; }
.world-section-header span { color: #79613f; font: .75rem Arial,sans-serif; }
.world-items { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 10px; }
.world-item { padding: 12px 13px; border: 1px solid rgba(112,75,28,.22); border-radius: 7px; background: rgba(255,255,255,.18); }
.world-item strong { display: block; margin-bottom: 4px; font-size: .94rem; }
.world-item span { color: #675438; font: .74rem/1.4 Arial,sans-serif; }

.mind-map-shell { padding: 14px 16px 16px; color: #332715; background: linear-gradient(180deg,#fff1ca,#e5c785); border: 1px solid #8d6431; border-radius: 9px; box-shadow: 0 10px 20px rgba(0,0,0,.22),inset 0 0 0 2px rgba(255,255,255,.36); }
.mind-map-heading { margin-bottom: 10px; }
.mind-map-heading small { display: block; margin-bottom: 4px; color: #806334; font: 700 .65rem Arial,sans-serif; letter-spacing: .06em; text-transform: uppercase; }
.mind-map-heading h3 { margin: 0; font-size: 1.12rem; }
.mind-map-heading span { color: #79613f; font: .75rem Arial,sans-serif; }
.mind-map { display: grid; grid-template-columns: minmax(140px,1fr) 34px minmax(210px,1.25fr) 34px minmax(140px,1fr); grid-template-rows: auto 28px auto 28px auto; align-items: center; gap: 0; padding: 4px 2px 8px; }
.mind-branch { min-height: 72px; padding: 10px 12px; color: #4d3b25; border: 1px solid rgba(112,75,28,.28); border-radius: 10px; background: rgba(255,255,255,.34); cursor: pointer; box-shadow: inset 0 0 0 1px rgba(255,255,255,.28); }
.mind-branch:hover, .mind-branch.active { background: rgba(255,247,220,.78); border-color: #9b6c32; }
.mind-branch strong { display: block; font-size: 1rem; }
.mind-branch span { display: block; margin-top: 3px; color: #725e40; font: .72rem/1.25 Arial,sans-serif; }
.mind-branch-cap { grid-column: 3; grid-row: 1; }
.mind-branch-journal { grid-column: 1; grid-row: 3; }
.mind-branch-manoeuvres { grid-column: 5; grid-row: 3; }
.mind-branch-arsenal { grid-column: 3; grid-row: 5; }
.mind-link { display: block; background: rgba(112,75,28,.48); }
.mind-link.north { grid-column: 3; grid-row: 2; width: 2px; height: 100%; justify-self: center; }
.mind-link.south { grid-column: 3; grid-row: 4; width: 2px; height: 100%; justify-self: center; }
.mind-link.west { grid-column: 2; grid-row: 3; width: 100%; height: 2px; }
.mind-link.east { grid-column: 4; grid-row: 3; width: 100%; height: 2px; }
.mind-center { grid-column: 3; grid-row: 3; padding: 15px 14px; text-align: center; border: 2px solid #8d6431; border-radius: 18px; background: linear-gradient(180deg,#f8e6b8,#dfbd76); box-shadow: 0 8px 18px rgba(86,52,18,.18),inset 0 0 0 2px rgba(255,255,255,.36); }
.mind-center small { display: block; color: #806334; font: 700 .62rem Arial,sans-serif; letter-spacing: .08em; text-transform: uppercase; }
.mind-center strong { display: block; margin-top: 4px; font-size: 1.08rem; line-height: 1.2; }
.mind-center p { margin: 5px 0 0; color: #655236; font: .73rem/1.3 Arial,sans-serif; }
.mind-center-meta { margin-top: 9px; display: flex; flex-wrap: wrap; justify-content: center; gap: 5px; }
.mind-center-meta span { padding: 4px 7px; color: #604b2e; border: 1px solid rgba(112,75,28,.2); border-radius: 999px; background: rgba(255,255,255,.28); font: .62rem Arial,sans-serif; }
.mind-resume { grid-column: 2 / 5; grid-row: 6; margin-top: 14px; display: grid; grid-template-columns: .9fr 1.1fr; overflow: hidden; color: #493820; border: 1px solid rgba(112,75,28,.34); border-radius: 9px; background: rgba(255,250,232,.58); box-shadow: inset 0 0 0 1px rgba(255,255,255,.32); }
.mind-resume > div { padding: 11px 14px; }
.mind-resume > div + div { border-left: 1px solid rgba(112,75,28,.24); }
.mind-resume small { display: block; margin-bottom: 4px; color: #806334; font: 700 .62rem Arial,sans-serif; letter-spacing: .08em; text-transform: uppercase; }
.mind-resume strong { display: block; font-size: .88rem; line-height: 1.25; }
.mind-resume span { display: block; margin-top: 3px; color: #6a573b; font: .7rem/1.3 Arial,sans-serif; }
.mind-map-help { margin: 8px 0 0; text-align: center; color: #735d3e; font: .72rem Arial,sans-serif; }
.mind-detail { margin-top: 10px; padding: 11px 12px; border: 1px solid rgba(112,75,28,.22); border-radius: 8px; background: rgba(255,255,255,.22); }
.mind-detail-header { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.mind-detail-header strong { font-size: .95rem; }
.mind-detail-header button { padding: 5px 8px; color: #6e451c; border: 1px solid rgba(112,75,28,.25); border-radius: 5px; background: rgba(255,255,255,.25); cursor: pointer; font: 700 .68rem Arial,sans-serif; }
.mind-detail-list { margin-top: 8px; display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 7px; }
.mind-detail-item { padding: 8px 9px; border-radius: 6px; background: rgba(255,255,255,.22); }
.mind-detail-item strong { display: block; font-size: .79rem; }
.mind-detail-item span { display: block; margin-top: 3px; color: #6c593c; font: .67rem/1.3 Arial,sans-serif; }

.log-pose { min-height: 0; padding: 22px 25px 16px; display: flex; flex-direction: column; overflow: hidden; color: #372916; background: linear-gradient(rgba(255,255,255,.24),rgba(255,255,255,.04)),repeating-linear-gradient(0deg,rgba(112,75,28,.035) 0 1px,transparent 2px 6px),#ead7aa; box-shadow: inset 18px 0 34px rgba(80,48,14,.13); }
.log-pose h2 { margin: 0; text-align: center; font-size: 2rem; font-weight: 500; }
.log-ornament { width: 90px; height: 1px; margin: 10px auto 16px; background: #9d7845; }
.log-compass { width: 132px; height: 132px; min-width: 132px; min-height: 132px; flex: 0 0 132px; aspect-ratio: 1 / 1; margin: 0 auto 16px; display: grid; place-items: center; color: #77501f; border: 9px double #7d5224; border-radius: 50%; background: radial-gradient(circle,#4cb1ca 0 20%,#0f6b85 21% 49%,#d5aa52 50% 53%,#6f461e 54%); box-shadow: 0 12px 24px rgba(70,42,12,.25),inset 0 0 20px rgba(255,255,255,.34); }
.log-section { padding: 15px 8px; border-top: 1px solid rgba(112,75,28,.25); }
.log-section label { display: block; margin-bottom: 6px; color: #735a34; font: .78rem Arial,sans-serif; }
.log-section strong { display: block; font-size: 1.3rem; font-weight: 500; line-height: 1.25; }
.log-section p { margin: 5px 0 0; color: #6b5637; font: .82rem/1.4 Arial,sans-serif; }
.log-button { margin-top: auto; padding: 11px 16px; display: flex; align-items: center; justify-content: center; gap: 10px; color: #3f301a; border: 1px solid rgba(111,76,31,.28); background: rgba(255,255,255,.16); cursor: pointer; }

@media (max-width: 1180px) {
  .vogue-shell { height: auto; min-height: 100vh; grid-template-columns: 245px minmax(0,1fr); overflow: visible; }
  .vogue-shell.no-log { grid-template-columns: 245px minmax(0,1fr); }
  .log-pose { grid-column: 1/-1; min-height: auto; display: grid; grid-template-columns: 180px repeat(2,1fr) auto; align-items: center; gap: 18px; }
  .log-pose h2, .log-ornament { display: none; }
  .log-compass { width: 120px; height: 120px; min-width: 120px; min-height: 120px; flex-basis: 120px; margin: 0; }
  .log-section { border-top: 0; border-left: 1px solid rgba(112,75,28,.25); }
  .log-button { margin-top: 0; }
  .project-row { grid-template-columns: minmax(160px,1fr) 100px minmax(180px,1.2fr); }
  .project-row > :nth-child(4) { display: none; }
  .project-row > :last-child { display: block; }
}
@media (max-width: 820px) {
  .vogue-shell { display: block; border-width: 6px; }
  .sidebar { min-height: auto; border-right: 0; border-bottom: 5px ridge #5c3519; }
  .brand { padding: 20px; }
  .brand p, .captain-card, .sidebar-tools { display: none; }
  .side-nav { grid-template-columns: repeat(2,minmax(0,1fr)); }
  .side-nav button { grid-template-columns: 34px 1fr auto; }
  .main-stage { border-right: 0; }
  .stage-header { min-height: 160px; padding: 22px 18px; grid-template-columns: 48px 1fr 78px; }
  .lantern-mark { width: 44px; height: 58px; }
  .header-title h2 { font-size: 2.35rem; }
  .header-title span { font-size: .85rem; }
  .pont-view { height: auto; min-height: 680px; overflow: visible; }
  .priorities-grid { grid-template-columns: 1fr; }
  .sea-map, .generic-view, .islands-view, .project-world-view { min-height: 680px; }
  .generic-grid, .island-project-grid, .world-overview, .world-items { grid-template-columns: 1fr; }
  .world-summary-card.wide { grid-column: auto; }
  .world-map { grid-template-columns: repeat(2,minmax(0,1fr)); }
  .islands-toolbar { align-items: flex-start; flex-direction: column; }
  .project-row, .project-row.header { grid-template-columns: 1fr; }
  .project-row.header { display: none; }
  .project-row > :nth-child(4), .project-row > :last-child { display: block; }
  .mind-map { grid-template-columns: 1fr; grid-template-rows: auto; gap: 8px; }
  .mind-branch-cap, .mind-branch-journal, .mind-branch-manoeuvres, .mind-branch-arsenal, .mind-center, .mind-resume { grid-column: 1; grid-row: auto; }
  .mind-center { order: -1; }
  .mind-resume { grid-template-columns: 1fr; }
  .mind-resume > div + div { border-left: 0; border-top: 1px solid rgba(112,75,28,.24); }
  .mind-link { display: none; }
  .mind-detail-list { grid-template-columns: 1fr; }
  .log-pose { display: block; padding: 25px; overflow: auto; }
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
        <h1>Vogue Marry</h1>
        <p>Le journal de bord<br />qui vous aide à garder<br />le cap sur vos projets.</p>
      </div>
      <nav className="side-nav">
        {MENU.filter(({ id }) => id !== "manoeuvres" && id !== "caps").map(({ id, label, sublabel, icon: Icon, count }) => (
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

function StageHeader({ active, project }) {
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
  const projectParts = project ? project.name.split("—").map((part) => part.trim()) : [];
  const projectMission = projectParts[0] || "Projet";
  const projectClient = projectParts[1] || project?.name || "";
  const [title, subtitle] = project
    ? [projectClient.toUpperCase(), `${projectMission} · Budget / Forecast · ${project.status}`]
    : titles[current.id];
  return (
    <header className={`stage-header${project ? " project-mode" : ""}`}>
      <div className="lantern-mark"><Compass size={26} /></div>
      <div className="header-title">
        <p>Vogue Marry · {project ? project.island : current.label}</p>
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

function IslandVisual({ kind }) {
  return (
    <span className={`island-art kind-${kind}`}>
      <span className="terrain" />
      <span className="feature feature-a" />
      <span className="feature feature-b" />
      <span className="feature feature-c" />
    </span>
  );
}

function SeaMap() {
  return (
    <section className="sea-map">
      <svg className="route-layer" viewBox="0 0 1000 620" preserveAspectRatio="none" aria-hidden="true">
        <path d="M175 205 C285 120 410 155 510 170 S735 200 815 305" />
        <path d="M175 205 C205 325 280 430 525 445 S740 425 815 305" />
        <path d="M510 170 C470 270 485 360 525 445" />
        <circle cx="175" cy="205" r="6" />
        <circle cx="510" cy="170" r="6" />
        <circle cx="815" cy="305" r="6" />
        <circle cx="525" cy="445" r="6" />
      </svg>
      <div className="compass-watermark"><Compass size={74} /></div>
      {PROJECTS.map((project) => (
        <button className="island-node" key={project.name} style={{ left: `${project.x}%`, top: `${project.y}%` }}>
          <IslandVisual kind={project.kind} />
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

function PriorityBoard() {
  return (
    <section className="priorities-board" aria-label="Priorités maintenant">
      <div className="priorities-heading">
        <strong>Priorités maintenant</strong>
        <span>3 caps à regarder avant le reste</span>
      </div>
      <div className="priorities-grid">
        {GLOBAL_PRIORITIES.map((priority) => (
          <article className={`priority-card ${priority.tone}`} key={priority.project}>
            <span className="priority-rank">{priority.rank}</span>
            <div>
              <small>{priority.island}</small>
              <strong>{priority.project}</strong>
              <p>{priority.reason} · <b>{priority.action}</b></p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function PontView() {
  return (
    <section className="pont-view">
      <PriorityBoard />
      <SeaMap />
    </section>
  );
}

function IslandsView({ onOpenProject }) {
  const [mode, setMode] = useState("cards");

  const projectAction = (project) => project.name === "Déploiement EPM — Client Horizon" ? (
    <button type="button" className="project-open-button" onClick={() => onOpenProject(project)}>Ouvrir →</button>
  ) : (
    <span className="project-pilot-note">Après validation du pilote</span>
  );

  return (
    <section className="islands-view">
      <div className="islands-toolbar">
        <p>Une île = un projet. Sa carte montre son état actuel ; son journal conserve les escales et ce qu’elles ont produit.</p>
        <div className="view-switch" aria-label="Mode d’affichage des îles">
          <button type="button" className={mode === "cards" ? "active" : ""} onClick={() => setMode("cards")}>Cartes</button>
          <button type="button" className={mode === "list" ? "active" : ""} onClick={() => setMode("list")}>Liste</button>
        </div>
      </div>

      {mode === "cards" ? (
        <div className="island-project-grid">
          {ISLAND_PROJECTS.map((project) => (
            <article className="project-card" key={project.name}>
              <div className="project-card-top">
                <div>
                  <small>{project.island}</small>
                  <h3>{project.name}</h3>
                </div>
                <span className={`project-status ${project.tone}`}>{project.status}</span>
              </div>
              <div className="project-meta">
                <div><label>Cap actuel</label><p>{project.cap}</p></div>
                <div><label>Prochaine reprise</label><p>{project.next}</p></div>
              </div>
              {projectAction(project)}
            </article>
          ))}
        </div>
      ) : (
        <div className="island-project-list">
          <div className="project-row header" aria-hidden="true">
            <span>Projet</span><span>État</span><span>Cap actuel</span><span>Prochaine reprise</span><span />
          </div>
          {ISLAND_PROJECTS.map((project) => (
            <article className="project-row" key={project.name}>
              <div><strong>{project.name}</strong><span className="project-island">{project.island}</span></div>
              <span className={`project-status ${project.tone}`}>{project.status}</span>
              <p>{project.cap}</p>
              <p>{project.next}</p>
              {projectAction(project)}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function IslandProjectView({ project, onBack }) {
  const [section, setSection] = useState("carte");
  const currentSection = PILOT_WORLD[section];
  const returnToMap = () => setSection("carte");

  return (
    <section className="project-world-view">
      <div className="project-world-top">
        {section === "carte" ? (
          <button type="button" className="back-to-islands" onClick={onBack}>← Mes îles</button>
        ) : (
          <button type="button" className="back-to-islands" onClick={returnToMap}>← Carte de l’île</button>
        )}
        <span className="world-kicker">{section === "carte" ? "La carte est le menu du projet" : `${project.island} · ${currentSection.label}`}</span>
      </div>

      {section === "carte" ? (
        <section className="mind-map-shell" aria-label="Carte mentale du projet">
          <div className="mind-map-heading">
            <small>{project.island}</small>
            <h3>Carte mentale</h3>
            <span>Choisir une branche pour entrer dans l’espace correspondant.</span>
          </div>
          <div className="mind-map">
            <button type="button" className="mind-branch mind-branch-cap" onClick={() => setSection("cap")}>
              <strong>Cap</strong><span>Où va le projet ?</span>
            </button>
            <span className="mind-link north" aria-hidden="true" />

            <button type="button" className="mind-branch mind-branch-journal" onClick={() => setSection("journal")}>
              <strong>Journal</strong><span>Ce qui s’est passé</span>
            </button>
            <span className="mind-link west" aria-hidden="true" />

            <article className="mind-center">
              <small>Projet</small>
              <strong>{project.name}</strong>
              <p>Budget / Forecast · mission EPM</p>
              <div className="mind-center-meta">
                <span>4 acteurs clés</span>
                <span>2 risques ouverts</span>
                <span>Prochaine escale · 12 sept.</span>
              </div>
            </article>

            <span className="mind-link east" aria-hidden="true" />
            <button type="button" className="mind-branch mind-branch-manoeuvres" onClick={() => setSection("manoeuvres")}>
              <strong>Manœuvres</strong><span>Ce qu’on fait maintenant</span>
            </button>

            <span className="mind-link south" aria-hidden="true" />
            <button type="button" className="mind-branch mind-branch-arsenal" onClick={() => setSection("arsenal")}>
              <strong>Arsenal</strong><span>Ce qu’on a pour agir</span>
            </button>

            <div className="mind-resume" aria-label="Point de reprise du projet">
              <div>
                <small>Position actuelle</small>
                <strong>Mapping analytique à finaliser</strong>
              </div>
              <div>
                <small>Reprendre ici</small>
                <strong>Ouvrir le mapping ERP → EPM</strong>
                <span>12 correspondances comptes / centres de coûts restent à valider.</span>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <article className="world-section">
          <div className="world-section-header">
            <small>{project.island}</small>
            <h3>{currentSection.label}</h3>
            <span>{currentSection.subtitle}</span>
          </div>
          <div className="world-items">
            {currentSection.items.map(([title, text]) => (
              <div className="world-item" key={title}>
                <strong>{title}</strong>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </article>
      )}
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

function LogPose({ active, project }) {
  const current = MENU.find((item) => item.id === active) || MENU[0];
  const resumeDirections = {
    pont: "Regarder les trois priorités du Pont",
    iles: "Choisir l’île à reprendre",
    escales: "Consigner la prochaine escale dans le Journal",
    journal: "Relire la dernière escale utile",
    coffre: "Retrouver le document de référence",
    longuevue: "Lancer la recherche utile au contexte",
    manoeuvres: "Reprendre la prochaine manœuvre ouverte",
    caps: "Relire la dernière décision actée"
  };
  return (
    <aside className="log-pose">
      <h2>Log Pose</h2>
      <div className="log-ornament" />
      <div className="log-compass"><Compass size={82} /></div>
      <section className="log-section">
        <label>Dernière position</label>
        <strong>{project ? "Cadrage fonctionnel avancé" : current.label}</strong>
        <p>{project ? "Le modèle Budget / Forecast est cadré. La recette métier se prépare." : current.sublabel}</p>
      </section>
      <section className="log-section">
        <label>Point d’arrêt</label>
        <strong>{project ? "Mapping analytique à finaliser" : "Navigation en cours"}</strong>
        <p>{project ? "12 correspondances comptes / centres de coûts restent à valider avec le contrôle de gestion." : "Aucun point d’arrêt précis n’est encore enregistré dans cette zone."}</p>
      </section>
      <section className="log-section">
        <label>Reprendre ici</label>
        <strong>{project ? "Ouvrir le mapping ERP → EPM" : resumeDirections[active]}</strong>
        <p>{project ? "Valider les correspondances restantes, puis préparer l’atelier DAF." : "Repartir de ce point sans devoir reconstruire tout le contexte."}</p>
      </section>
      <button className="log-button">Voir le point de reprise <ChevronRight size={18} /></button>
    </aside>
  );
}

export default function App() {
  const [active, setActive] = useState("pont");
  const [selectedProject, setSelectedProject] = useState(null);

  const handleSectionChange = (id) => {
    setSelectedProject(null);
    setActive(id);
  };

  const centralView = useMemo(() => {
    if (selectedProject) return <IslandProjectView project={selectedProject} onBack={() => setSelectedProject(null)} />;
    if (active === "pont") return <PontView />;
    if (active === "iles") return <IslandsView onOpenProject={setSelectedProject} />;
    return <GenericView active={active} />;
  }, [active, selectedProject]);

  const showShipLog = active === "pont" && !selectedProject;

  return (
    <>
      <style>{APP_CSS}</style>
      <main className={`vogue-shell${showShipLog ? "" : " no-log"}`}>
        <Sidebar active={active} onChange={handleSectionChange} />
        <section className="main-stage">
          <StageHeader active={active} project={selectedProject} />
          <div className="stage-content">{centralView}</div>
        </section>
        {showShipLog ? <LogPose active={active} project={null} /> : null}
      </main>
    </>
  );
}
