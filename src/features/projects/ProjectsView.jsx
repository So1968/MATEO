import { useMemo, useState } from "react";
import { makeProjectViewModel } from "./project-utils.js";

export default function ProjectsView({ projects, meetings, loading, error, onOpenProject }) {
  const [mode, setMode] = useState("cards");
  const viewModels = useMemo(
    () => projects.map((project, index) => makeProjectViewModel(project, meetings, index)),
    [projects, meetings]
  );

  return (
    <section className="islands-view">
      <div className="islands-toolbar">
        <p>Les Îles sont chargées depuis la mémoire locale de Vogue Marry.</p>
        <div className="view-switch" aria-label="Mode d’affichage des îles">
          <button type="button" className={mode === "cards" ? "active" : ""} onClick={() => setMode("cards")}>Cartes</button>
          <button type="button" className={mode === "list" ? "active" : ""} onClick={() => setMode("list")}>Liste</button>
        </div>
      </div>

      {loading ? <p className="data-state">Lecture des projets locaux…</p> : null}
      {error ? <p className="data-state error">{error}</p> : null}
      {!loading && !error && !viewModels.length ? (
        <div className="data-empty">
          <h3>Aucune île enregistrée</h3>
          <p>Créez un projet depuis l’API locale pour le faire apparaître ici.</p>
        </div>
      ) : null}

      {!loading && !error && viewModels.length > 0 && mode === "cards" ? (
        <div className="island-project-grid">
          {viewModels.map((project) => (
            <article className="project-card" key={project.slug}>
              <div className="project-card-top">
                <div>
                  <small>Île / projet</small>
                  <h3>{project.name}</h3>
                </div>
                <span className={`project-status ${project.tone}`}>{project.status}</span>
              </div>
              <div className="project-meta">
                <div><label>État de la mémoire</label><p>{project.cap}</p></div>
                <div><label>Prochaine reprise</label><p>{project.next}</p></div>
              </div>
              <button type="button" className="project-open-button" onClick={() => onOpenProject(project)}>Ouvrir →</button>
            </article>
          ))}
        </div>
      ) : null}

      {!loading && !error && viewModels.length > 0 && mode === "list" ? (
        <div className="island-project-list">
          <div className="project-row header" aria-hidden="true">
            <span>Projet</span><span>État</span><span>Mémoire</span><span>Prochaine reprise</span><span />
          </div>
          {viewModels.map((project) => (
            <article className="project-row" key={project.slug}>
              <div><strong>{project.name}</strong><span className="project-island">{project.detail}</span></div>
              <span className={`project-status ${project.tone}`}>{project.status}</span>
              <p>{project.cap}</p>
              <p>{project.next}</p>
              <button type="button" className="project-open-button" onClick={() => onOpenProject(project)}>Ouvrir →</button>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
