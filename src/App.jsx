import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileText,
  FolderKanban,
  Plus,
  Search,
  Trash2
} from "lucide-react";
import "./style.css";

const STORAGE_KEY = "vogue_merry_v1_data";

const participantOptions = [
  "Sofia",
  "Équipe projet",
  "Client",
  "Consultant",
  "Invité",
  "Référent métier"
];

const navigationBlocks = [
  {
    symbol: "⛵",
    title: "Pont du navire",
    subtitle: "Vue globale",
    text: "Voir les îles actives, les alertes, les escales récentes et le cap à reprendre."
  },
  {
    symbol: "🏝️",
    title: "Mes îles",
    subtitle: "Projets",
    text: "Entrer dans un projet sans mélanger les sujets, les personnes, les documents et les décisions."
  },
  {
    symbol: "🗺️",
    title: "Carte de l’île",
    subtitle: "Vue projet",
    text: "Comprendre l’état du projet, ses repères, son contexte et ses prochaines étapes."
  },
  {
    symbol: "⚓",
    title: "Escales",
    subtitle: "Réunions",
    text: "Créer, retrouver et suivre les réunions ou points projet."
  },
  {
    symbol: "🎙️",
    title: "Traces audio",
    subtitle: "Sources brutes",
    text: "Garder les audios, transcriptions et marqueurs reliés au bon projet."
  },
  {
    symbol: "📖",
    title: "Journal de bord",
    subtitle: "Comptes rendus",
    text: "Transformer la matière brute en mémoire écrite propre, modifiable puis validée."
  },
  {
    symbol: "🧰",
    title: "Coffre",
    subtitle: "Documents",
    text: "Ranger les fichiers utiles, preuves, pièces, annexes et références."
  },
  {
    symbol: "👥",
    title: "Équipage",
    subtitle: "Personnes et rôles",
    text: "Savoir qui intervient, qui décide, qui doit faire quoi et qui est concerné."
  },
  {
    symbol: "🪢",
    title: "Manœuvres",
    subtitle: "Actions",
    text: "Transformer les échanges en tâches suivies, responsables, échéances et statuts."
  },
  {
    symbol: "🧭",
    title: "Caps validés",
    subtitle: "Décisions",
    text: "Retrouver ce qui a été arbitré, quand, par qui, dans quel contexte."
  },
  {
    symbol: "🔭",
    title: "Longue-vue",
    subtitle: "Recherche",
    text: "Retrouver une information, une décision, un mot, une personne ou un document."
  },
  {
    symbol: "🌀",
    title: "Log Pose",
    subtitle: "Prochaine direction",
    text: "Synthétiser ce qui compte, ce qui bloque, ce qui est décidé et la suite utile."
  }
];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function buildDefaultEscaleTitle(projectName) {
  return `Escale ${projectName || "projet"} — ${new Date().toLocaleDateString("fr-FR")}`;
}

function createEmptyEscale(projectName = "projet") {
  return {
    id: crypto.randomUUID(),
    date: today(),
    title: buildDefaultEscaleTitle(projectName),
    meetingType: "Cadrage",
    meetingTypeOther: "",
    participants: "",
    context: "",
    decisions: "",
    rules: "",
    screens: "",
    openQuestions: "",
    actions: "",
    risks: "",
    keywords: "",
    rawNotes: ""
  };
}

const initialData = {
  projects: [
    {
      id: crypto.randomUUID(),
      name: "Exemple — Première île",
      description: "Projet exemple pour tester Vogue Merry.",
      reports: [
        {
          ...createEmptyEscale("Première île"),
          title: "Escale de cadrage",
          participants: "Sofia, équipe projet",
          context: "Première escale pour cadrer le projet.",
          decisions: "Créer une mémoire projet navigable.",
          actions: "Tester le Pont du navire, le Journal de bord et le Log Pose.",
          openQuestions: "Quelles traces audio intégrer en priorité ?",
          keywords: "cadrage, mémoire projet, log pose"
        }
      ]
    }
  ]
};

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialData;
  } catch {
    return initialData;
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function hasText(value) {
  return Boolean(String(value || "").trim());
}

function shortText(value, fallback, max = 150) {
  const text = String(value || "").trim();
  if (!text) return fallback;
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export default function App() {
  const [data, setData] = useState(loadData);
  const [selectedProjectId, setSelectedProjectId] = useState(data.projects[0]?.id || null);
  const [selectedReportId, setSelectedReportId] = useState(data.projects[0]?.reports[0]?.id || null);
  const [query, setQuery] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [newParticipantName, setNewParticipantName] = useState("");
  const [inboxItems, setInboxItems] = useState([]);
  const [inboxStatus, setInboxStatus] = useState("");
  const [projectStatus, setProjectStatus] = useState("");
  const [exportStatus, setExportStatus] = useState("");

  const selectedProject = data.projects.find((project) => project.id === selectedProjectId) || data.projects[0];
  const selectedReport =
    selectedProject?.reports.find((report) => report.id === selectedReportId) || selectedProject?.reports[0];

  const totalReports = data.projects.reduce((sum, project) => sum + project.reports.length, 0);
  const reportsWithActions = data.projects.reduce(
    (sum, project) => sum + project.reports.filter((report) => hasText(report.actions)).length,
    0
  );
  const pointsToWatch = data.projects.reduce(
    (sum, project) =>
      sum + project.reports.filter((report) => hasText(report.risks) || hasText(report.openQuestions)).length,
    0
  );

  const latestReport = selectedProject?.reports?.[0];
  const logPose = {
    cap: shortText(selectedReport?.decisions, "Aucun cap validé pour l’instant."),
    manoeuvre: shortText(selectedReport?.actions, "Aucune manœuvre prioritaire saisie."),
    vigilance: shortText(selectedReport?.risks || selectedReport?.openQuestions, "Aucun point bloquant signalé."),
    direction: shortText(
      selectedReport?.openQuestions || selectedReport?.actions,
      "Créer ou reprendre une escale pour préciser le prochain cap."
    )
  };

  const searchResults = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return [];

    const results = [];

    for (const project of data.projects) {
      for (const report of project.reports) {
        const text = [
          project.name,
          report.title,
          report.date,
          report.meetingType,
          report.participants,
          report.context,
          report.decisions,
          report.rules,
          report.screens,
          report.openQuestions,
          report.actions,
          report.risks,
          report.keywords,
          report.rawNotes
        ]
          .join(" ")
          .toLowerCase();

        if (text.includes(value)) results.push({ project, report });
      }
    }

    return results;
  }, [data, query]);

  function updateData(nextData) {
    setData(nextData);
    saveData(nextData);
  }

  async function loadInbox() {
    setInboxStatus("Chargement de la boîte à reprendre...");
    try {
      const response = await fetch("http://127.0.0.1:8010/api/inbox");
      if (!response.ok) throw new Error("Backend local non disponible.");
      const result = await response.json();
      setInboxItems(result.items || []);
      setInboxStatus("");
    } catch {
      setInboxStatus("Impossible de charger la boîte à reprendre. Vérifie que le backend est lancé.");
    }
  }

  useEffect(() => {
    loadInbox();
  }, []);

  async function addProject() {
    const name = newProjectName.trim();
    if (!name) return;

    try {
      const response = await fetch("http://127.0.0.1:8010/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      });
      if (!response.ok) throw new Error("Backend local non disponible.");
      const result = await response.json();
      setProjectStatus(`Dossier créé dans VOGUE-MERRY-DONNEES : ${result.project.slug}`);
    } catch {
      setProjectStatus("Île créée dans l’interface. Le dossier local sera créé quand le backend sera lancé.");
    }

    const project = { id: crypto.randomUUID(), name, description: "", reports: [] };
    updateData({ ...data, projects: [...data.projects, project] });
    setSelectedProjectId(project.id);
    setSelectedReportId(null);
    setNewProjectName("");
  }

  function deleteProject(projectId) {
    const projects = data.projects.filter((project) => project.id !== projectId);
    updateData({ ...data, projects });
    setSelectedProjectId(projects[0]?.id || null);
    setSelectedReportId(projects[0]?.reports[0]?.id || null);
  }

  function addReport() {
    if (!selectedProject) return;
    const report = createEmptyEscale(selectedProject.name);
    updateData({
      ...data,
      projects: data.projects.map((project) =>
        project.id === selectedProject.id ? { ...project, reports: [report, ...project.reports] } : project
      )
    });
    setSelectedReportId(report.id);
  }

  function deleteReport(reportId) {
    if (!selectedProject) return;
    const reports = selectedProject.reports.filter((report) => report.id !== reportId);
    updateData({
      ...data,
      projects: data.projects.map((project) =>
        project.id === selectedProject.id ? { ...project, reports } : project
      )
    });
    setSelectedReportId(reports[0]?.id || null);
  }

  function updateReport(field, value) {
    if (!selectedProject || !selectedReport) return;
    updateData({
      ...data,
      projects: data.projects.map((project) =>
        project.id === selectedProject.id
          ? {
              ...project,
              reports: project.reports.map((report) =>
                report.id === selectedReport.id ? { ...report, [field]: value } : report
              )
            }
          : project
      )
    });
  }

  function toggleParticipant(name) {
    if (!selectedReport) return;
    const current = selectedReport.participants
      ? selectedReport.participants.split(",").map((item) => item.trim()).filter(Boolean)
      : [];
    const next = current.includes(name) ? current.filter((item) => item !== name) : [...current, name];
    updateReport("participants", next.join(", "));
  }

  function addParticipant() {
    const name = newParticipantName.trim();
    if (!name) return;
    toggleParticipant(name);
    setNewParticipantName("");
  }

  async function exportEscale() {
    if (!selectedProject || !selectedReport) {
      setExportStatus("Aucune escale sélectionnée.");
      return;
    }

    setExportStatus("Export vers VOGUE-MERRY-DONNEES en cours...");

    try {
      const response = await fetch("http://127.0.0.1:8010/api/meetings/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: selectedProject.name,
          meetingDate: selectedReport.date,
          meetingType: selectedReport.meetingType === "Autre" ? selectedReport.meetingTypeOther : selectedReport.meetingType,
          title: selectedReport.title,
          participants: selectedReport.participants,
          context: selectedReport.context,
          decisions: selectedReport.decisions,
          rules: selectedReport.rules,
          screens: selectedReport.screens,
          openQuestions: selectedReport.openQuestions,
          actions: selectedReport.actions,
          risks: selectedReport.risks,
          keywords: selectedReport.keywords,
          rawNotes: selectedReport.rawNotes
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Export impossible.");
      setExportStatus(`Escale exportée : ${result.meetingDirName}`);
      loadInbox();
    } catch (error) {
      setExportStatus(`Export impossible : ${error.message || "vérifie que le backend local est lancé."}`);
    }
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `vogue-merry-export-${today()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="app">
      <header className="hero">
        <div>
          <p className="eyebrow">Vogue Merry</p>
          <h1>Pont du navire</h1>
          <div className="heroSignatureRow">
            <div className="onePieceMotto">
              <span>Une mémoire de projet qui navigue : îles, escales, coffre, équipage, caps et Log Pose.</span>
            </div>
            <div className="strawHatSeal" aria-hidden="true">
              <div className="hatTop"></div>
              <div className="hatBrim"></div>
              <div className="hatBand"></div>
            </div>
          </div>
          <p>
            Monte sur le pont, repère les îles actives, ouvre la carte du projet,
            transforme les escales en journal de bord et retrouve la prochaine direction.
          </p>
        </div>

        <div className="heroCard">
          <div><strong>{data.projects.length}</strong><span>îles / projets</span></div>
          <div><strong>{totalReports}</strong><span>escales consignées</span></div>
          <div><strong>{reportsWithActions}</strong><span>manœuvres</span></div>
          <div><strong>{pointsToWatch}</strong><span>points à surveiller</span></div>
        </div>
      </header>

      <section className="panel navigationDeck">
        <div className="panelTitle between">
          <div>
            <div className="inlineTitle"><FolderKanban size={20} /><h2>Carte de navigation Vogue Merry</h2></div>
            <p>Les 12 espaces métier du produit, visibles pour ne jamais réduire l’outil à une simple décoration.</p>
          </div>
          <span className="statusPill">Architecture complète</span>
        </div>
        <div className="navigationGrid">
          {navigationBlocks.map((block) => (
            <article className="navigationBlock" key={block.title}>
              <span className="navSymbol">{block.symbol}</span>
              <div>
                <strong>{block.title}</strong>
                <small>{block.subtitle}</small>
                <p>{block.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel islandMapPanel">
        <div className="panelTitle between">
          <div>
            <div className="inlineTitle"><FileText size={20} /><h2>Carte de l’île — {selectedProject?.name || "Aucune île"}</h2></div>
            <p>Vue synthétique du projet actif avant d’entrer dans les escales.</p>
          </div>
          <span className="statusPill">Projet actif</span>
        </div>
        <div className="islandMapGrid">
          <article><small>Dernière escale</small><strong>{latestReport?.title || "Aucune escale"}</strong><p>{latestReport?.date || "Créer une première escale."}</p></article>
          <article><small>Dernier cap</small><p>{shortText(latestReport?.decisions, "Aucune décision consolidée.")}</p></article>
          <article><small>Manœuvres</small><p>{shortText(latestReport?.actions, "Aucune action ouverte.")}</p></article>
          <article><small>Questions / risques</small><p>{shortText(latestReport?.openQuestions || latestReport?.risks, "Aucun point bloquant signalé.")}</p></article>
        </div>
      </section>

      <section className="panel logPosePanel">
        <div className="panelTitle between">
          <div className="inlineTitle">
            <AlertTriangle size={20} />
            <h2>Log Pose — cap actuel</h2>
          </div>
          <span className="statusPill">Synthèse utile</span>
        </div>
        <div className="logPoseGrid">
          <article><small>Cap validé</small><p>{logPose.cap}</p></article>
          <article><small>Manœuvre prioritaire</small><p>{logPose.manoeuvre}</p></article>
          <article><small>Point à surveiller</small><p>{logPose.vigilance}</p></article>
          <article><small>Prochaine direction</small><p>{logPose.direction}</p></article>
        </div>
      </section>

      <section className="panel inboxPanel">
        <div className="panelTitle between">
          <div className="inlineTitle"><FileText size={20} /><h2>À reprendre</h2></div>
          <button className="refreshButton" onClick={loadInbox}>Actualiser</button>
        </div>
        {inboxStatus && <p className="backendStatus">{inboxStatus}</p>}
        {inboxItems.length ? (
          <div className="inboxList">
            {inboxItems.slice(0, 6).map((item) => (
              <article className="inboxItem" key={`${item.projectSlug}-${item.meetingDirName}`}>
                <div>
                  <strong>{item.title || "Escale sans titre"}</strong>
                  <p>{item.projectName} — {item.date} — {item.meetingType}</p>
                  <small>{item.meetingDirName}</small>
                </div>
                <span className="statusPill">{item.status}</span>
              </article>
            ))}
          </div>
        ) : (
          <p className="empty">Aucune escale à reprendre pour l’instant.</p>
        )}
      </section>

      <section className="grid">
        <aside className="panel sidebar">
          <div className="panelTitle"><FolderKanban size={20} /><h2>Mes îles</h2></div>
          <div className="newProject">
            <input value={newProjectName} onChange={(event) => setNewProjectName(event.target.value)} placeholder="Nouvelle île / projet..." />
            <button onClick={addProject}><Plus size={16} /></button>
          </div>
          {projectStatus && <p className="backendStatus">{projectStatus}</p>}
          <div className="projectList">
            {data.projects.map((project) => (
              <button
                key={project.id}
                className={project.id === selectedProject?.id ? "active projectButton" : "projectButton"}
                onClick={() => {
                  setSelectedProjectId(project.id);
                  setSelectedReportId(project.reports[0]?.id || null);
                }}
              >
                <span>{project.name}</span>
                <small>{project.reports.length} escales</small>
              </button>
            ))}
          </div>
          {selectedProject && (
            <button className="danger ghost" onClick={() => deleteProject(selectedProject.id)}>
              <Trash2 size={16} /> Supprimer l’île sélectionnée
            </button>
          )}
        </aside>

        <section className="panel">
          <div className="panelTitle between">
            <div><div className="inlineTitle"><FileText size={20} /><h2>Journal de bord</h2></div><p>{selectedProject?.name || "Aucune île sélectionnée"}</p></div>
            <button onClick={addReport} disabled={!selectedProject}><Plus size={16} />Nouvelle escale</button>
          </div>
          <div className="reports">
            {selectedProject?.reports.length ? selectedProject.reports.map((report) => (
              <button
                key={report.id}
                className={report.id === selectedReport?.id ? "active reportButton" : "reportButton"}
                onClick={() => setSelectedReportId(report.id)}
              >
                <strong>{report.title || "Escale sans titre"}</strong>
                <span>{report.date}</span>
                <small>{report.keywords}</small>
              </button>
            )) : <p className="empty">Aucun journal de bord pour cette île.</p>}
          </div>
        </section>

        <section className="panel editor">
          <div className="panelTitle between">
            <div className="inlineTitle"><FileText size={20} /><h2>Escale / réunion</h2></div>
            {selectedReport && <button className="danger ghost" onClick={() => deleteReport(selectedReport.id)}><Trash2 size={16} />Supprimer</button>}
          </div>

          {selectedReport ? (
            <div className="form">
              <div className="activeProjectBanner">Île active : <strong>{selectedProject?.name}</strong></div>

              <section className="exportMeetingBox">
                <div>
                  <strong>Coffre local</strong>
                  <p>Exporte cette escale dans le dossier Vogue Merry du projet, avec journal de bord et données structurées.</p>
                </div>
                <button onClick={exportEscale}><Download size={16} />Exporter vers VOGUE-MERRY-DONNEES</button>
                {exportStatus && <p className="backendStatus">{exportStatus}</p>}
              </section>

              <label>Date<input type="date" value={selectedReport.date} onChange={(event) => updateReport("date", event.target.value)} /></label>
              <label>Titre de l’escale<input value={selectedReport.title} onChange={(event) => updateReport("title", event.target.value)} /></label>
              <label>Type d’escale
                <select value={selectedReport.meetingType} onChange={(event) => updateReport("meetingType", event.target.value)}>
                  <option>Cadrage</option><option>Point projet</option><option>Décision</option><option>Suivi / avancement</option><option>Blocage</option><option>Validation métier</option><option>Autre</option>
                </select>
              </label>

              <label>Équipage / participants
                <div className="participantsGrid">
                  {participantOptions.map((name) => (
                    <button key={name} type="button" className={selectedReport.participants.includes(name) ? "participantChip participantChipActive" : "participantChip"} onClick={() => toggleParticipant(name)}>{name}</button>
                  ))}
                </div>
                <div className="addParticipantRow">
                  <input value={newParticipantName} onChange={(event) => setNewParticipantName(event.target.value)} placeholder="Ajouter un participant..." />
                  <button type="button" onClick={addParticipant}>Ajouter</button>
                </div>
              </label>

              <label>Contexte<textarea value={selectedReport.context} onChange={(event) => updateReport("context", event.target.value)} /></label>
              <label>Caps validés / décisions prises<textarea value={selectedReport.decisions} onChange={(event) => updateReport("decisions", event.target.value)} /></label>
              <label>Règles / méthodes validées<textarea value={selectedReport.rules} onChange={(event) => updateReport("rules", event.target.value)} /></label>
              <label>Écrans / fonctionnalités concernés<textarea value={selectedReport.screens} onChange={(event) => updateReport("screens", event.target.value)} /></label>
              <label>Questions ouvertes<textarea value={selectedReport.openQuestions} onChange={(event) => updateReport("openQuestions", event.target.value)} /></label>
              <label>Manœuvres / actions à faire<textarea value={selectedReport.actions} onChange={(event) => updateReport("actions", event.target.value)} /></label>
              <label>Risques / alertes<textarea value={selectedReport.risks} onChange={(event) => updateReport("risks", event.target.value)} /></label>
              <label>Mots-clés<input value={selectedReport.keywords} onChange={(event) => updateReport("keywords", event.target.value)} /></label>
              <label>Matière brute / transcription / marqueurs<textarea className="bigTextarea" value={selectedReport.rawNotes} onChange={(event) => updateReport("rawNotes", event.target.value)} /></label>
            </div>
          ) : <p className="empty">Crée une escale pour commencer.</p>}
        </section>
      </section>

      <section className="panel searchPanel">
        <div className="panelTitle between">
          <div className="inlineTitle"><Search size={20} /><h2>Longue-vue — recherche dans la mémoire projet</h2></div>
          <button onClick={exportJson}><Download size={16} />Export JSON</button>
        </div>
        <div className="searchBox"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher une décision, une action, une réunion, un mot-clé..." /></div>
        {query.trim() && (
          <div className="results">
            {searchResults.length ? searchResults.map(({ project, report }) => (
              <button key={report.id} className="resultCard" onClick={() => { setSelectedProjectId(project.id); setSelectedReportId(report.id); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                <CheckCircle2 size={18} />
                <div><strong>{report.title || "Escale sans titre"}</strong><p>{project.name} — {report.date}</p><small>{report.decisions || report.actions || report.rawNotes}</small></div>
              </button>
            )) : <p className="empty">Aucun résultat trouvé.</p>}
          </div>
        )}
      </section>
    </main>
  );
}
