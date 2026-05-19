import React from "react";
import "./style.css";

export default function App() {
  return (
    <main className="vogueLayout">
      <header className="topLine">
        <strong>Grande Ligne</strong>
        <span>Pont</span>
        <span>Île</span>
        <span>Carte</span>
        <span>Escale</span>
        <span>Journal</span>
        <span>Caps</span>
        <span>Manœuvres</span>
        <span>🧭 Log Pose</span>
      </header>

      <aside className="leftNav">
        <h1>Vogue Merry</h1>
        <button>⛵ Pont du navire</button>
        <button>🏝️ Mes îles</button>
        <button>🗺️ Carte de l’île</button>
        <button>⚓ Escales</button>
        <button>🎙️ Traces audio</button>
        <button>📖 Journal de bord</button>
        <button>🧰 Coffre</button>
        <button>👥 Équipage</button>
        <button>🪢 Manœuvres</button>
        <button>✅ Caps validés</button>
        <button>🔭 Longue-vue</button>
      </aside>

      <section className="workspace">
        <p className="eyebrow">Poste de navigation métier</p>
        <h2>Pont du navire</h2>
        <p>Vue globale du projet actif. Une seule zone de travail doit être affichée ici à la fois.</p>
        <div className="commandGrid">
          <article><small>Île active</small><strong>Exemple — Première île</strong></article>
          <article><small>Dernière escale</small><strong>Escale de cadrage</strong></article>
          <article><small>Dernier cap</small><strong>Créer une mémoire projet navigable</strong></article>
          <article><small>À faire ensuite</small><strong>Structurer les modules sans entasser</strong></article>
        </div>
      </section>

      <aside className="rightLogPose">
        <h2>🧭 Log Pose</h2>
        <small>Boussole du projet</small>
        <article><strong>Cap validé</strong><p>Ce qui est décidé.</p></article>
        <article><strong>Manœuvre</strong><p>Ce qu’il faut faire.</p></article>
        <article><strong>Vigilance</strong><p>Ce qui bloque.</p></article>
        <article><strong>Prochaine direction</strong><p>Où reprendre le fil.</p></article>
      </aside>
    </main>
  );
}
