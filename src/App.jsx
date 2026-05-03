import React, { useMemo, useRef, useState } from "react";
import {
  Search,
  Plus,
  FolderKanban,
  FileText,
  Download,
  Trash2,
  Save,
  Mic,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import MeetingMode from "./components/MeetingMode.jsx";
import "./style.css";

const STORAGE_KEY = "mateo_v1_data";

const initialData = {
  projects: [
    {
      id: crypto.randomUUID(),
      name: "Exemple — Projet EPM",
      description: "Projet exemple pour tester Matéo.",
      reports: [
        {
          id: crypto.randomUUID(),
          date: new Date().toISOString().slice(0, 10),
          title: "Réunion de cadrage",
          meetingType: "Cadrage",
          participants: "Sofia, équipe projet",
          context: "Première réunion de cadrage du projet.",
          decisions: "Créer une mémoire projet structurée par comptes-rendus.",
          rules: "Chaque réunion doit produire une trace exploitable.",
          screens: "Tableau de bord, recherche, fiche compte-rendu.",
          openQuestions: "Quel outil de transcription audio choisir ?",
          actions: "Tester Matéo sur une vraie réunion.",
          risks: "Perte d'information si les comptes-rendus ne sont pas rangés.",
          keywords: "EPM, cadrage, règle de calcul, écran, méthode",
          rawNotes: "Notes brutes ou transcription à coller ici."
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

function emptyReport() {
  return {
    id: crypto.randomUUID(),
    date: new Date().toISOString().slice(0, 10),
    title: "",
    meetingType: "Cadrage",
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

export default function App() {
  const [data, setData] = useState(loadData);
  const [selectedProjectId, setSelectedProjectId] = useState(data.projects[0]?.id || null);
  const [selectedReportId, setSelectedReportId] = useState(data.projects[0]?.reports[0]?.id || null);
  const [query, setQuery] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [projectCreationStatus, setProjectCreationStatus] = useState("");
  const [meetingExportStatus, setMeetingExportStatus] = useState("");
  const [meetingMarkers, setMeetingMarkers] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const selectedProject = data.projects.find((p) => p.id === selectedProjectId) || data.projects[0];
  const selectedReport =
    selectedProject?.reports.find((r) => r.id === selectedReportId) ||
    selectedProject?.reports[0];

  function updateData(nextData) {
    setData(nextData);
    saveData(nextData);
  }

  async function addProject() {
    const name = newProjectName.trim();
    if (!name) return;

    let folderMessage = "";

    try {
      const response = await fetch("http://127.0.0.1:8010/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name })
      });

      if (!response.ok) {
        throw new Error("Backend local non disponible.");
      }

      const result = await response.json();
      folderMessage = `Dossier créé dans MATEO-DONNEES : ${result.project.slug}`;
    } catch (error) {
      folderMessage =
        "Projet créé dans Matéo, mais le dossier local n’a pas pu être créé. Vérifie que le backend est lancé.";
    }

    const project = {
      id: crypto.randomUUID(),
      name,
      description: "",
      reports: []
    };

    const nextData = {
      ...data,
      projects: [...data.projects, project]
    };

    updateData(nextData);
    setSelectedProjectId(project.id);
    setSelectedReportId(null);
    setNewProjectName("");
    setProjectCreationStatus(folderMessage);
  }

  function deleteProject(projectId) {
    const nextProjects = data.projects.filter((p) => p.id !== projectId);
    const nextData = { ...data, projects: nextProjects };
    updateData(nextData);
    setSelectedProjectId(nextProjects[0]?.id || null);
    setSelectedReportId(nextProjects[0]?.reports[0]?.id || null);
  }

  function addReport() {
    if (!selectedProject) return;
    const report = emptyReport();

    const nextData = {
      ...data,
      projects: data.projects.map((p) =>
        p.id === selectedProject.id
          ? { ...p, reports: [report, ...p.reports] }
          : p
      )
    };

    updateData(nextData);
    setSelectedReportId(report.id);
  }

  function deleteReport(reportId) {
    if (!selectedProject) return;

    const nextReports = selectedProject.reports.filter((r) => r.id !== reportId);

    const nextData = {
      ...data,
      projects: data.projects.map((p) =>
        p.id === selectedProject.id
          ? { ...p, reports: nextReports }
          : p
      )
    };

    updateData(nextData);
    setSelectedReportId(nextReports[0]?.id || null);
  }

  function updateReport(field, value) {
    if (!selectedProject || !selectedReport) return;

    const nextData = {
      ...data,
      projects: data.projects.map((p) =>
        p.id === selectedProject.id
          ? {
              ...p,
              reports: p.reports.map((r) =>
                r.id === selectedReport.id ? { ...r, [field]: value } : r
              )
            }
          : p
      )
    };

    updateData(nextData);
  }

  function addMeetingMarker(marker) {
    setMeetingMarkers((current) => [marker, ...current]);

    if (selectedReport) {
      const existing = selectedReport.rawNotes?.trim() || "";
      const markerLine = `[MARQUEUR ${marker.timeLabel}] ${marker.label}`;
      const nextNotes = existing ? `${existing}\n${markerLine}` : markerLine;
      updateReport("rawNotes", nextNotes);
    }
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setMeetingMarkers([]);
      setIsRecording(true);
    } catch (error) {
      alert("Impossible d’accéder au micro. Vérifie l’autorisation du navigateur.");
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }

    setIsRecording(false);
  }

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const results = [];

    for (const project of data.projects) {
      for (const report of project.reports) {
        const fullText = [
          project.name,
          report.date,
          report.title,
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

        if (fullText.includes(q)) {
          results.push({ project, report });
        }
      }
    }

    return results;
  }, [data, query]);

  async function exportMeetingToDataFolder() {
    if (!selectedProject || !selectedReport) {
      setMeetingExportStatus("Aucune réunion sélectionnée.");
      return;
    }

    setMeetingExportStatus("Export vers MATEO-DONNEES en cours...");

    try {
      const response = await fetch("http://127.0.0.1:8010/api/meetings/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          projectName: selectedProject.name,
          meetingDate: selectedReport.date,
          meetingType: selectedReport.meetingType || "Réunion",
          title: selectedReport.title || "sans titre",
          participants: selectedReport.participants || "",
          context: selectedReport.context || "",
          decisions: selectedReport.decisions || "",
          rules: selectedReport.rules || "",
          screens: selectedReport.screens || "",
          openQuestions: selectedReport.openQuestions || "",
          actions: selectedReport.actions || "",
          risks: selectedReport.risks || "",
          keywords: selectedReport.keywords || "",
          rawNotes: selectedReport.rawNotes || ""
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erreur export réunion.");
      }

      if (!audioBlob) {
        setMeetingExportStatus(`Réunion exportée : ${result.meetingDirName}`);
        return;
      }

      try {
        const formData = new FormData();
        formData.append("projectName", selectedProject.name);
        formData.append("meetingDirName", result.meetingDirName);
        formData.append(
          "audio",
          audioBlob,
          selectedReport.audioFileName || `audio-${selectedReport.date}.webm`
        );

        const audioResponse = await fetch("http://127.0.0.1:8010/api/meetings/export-audio", {
          method: "POST",
          body: formData
        });

        if (!audioResponse.ok) {
          setMeetingExportStatus(
            `Réunion exportée : ${result.meetingDirName}. Audio non exporté.`
          );
          return;
        }

        setMeetingExportStatus(`Réunion + audio exportés : ${result.meetingDirName}`);
      } catch (audioError) {
        setMeetingExportStatus(
          `Réunion exportée : ${result.meetingDirName}. Audio non exporté.`
        );
      }
    } catch (error) {
      setMeetingExportStatus(
        `Export impossible : ${error.message || "vérifie que le backend local est lancé."}`
      );
    }
  }


  function exportData() {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json"
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mateo-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const totalReports = data.projects.reduce((sum, p) => sum + p.reports.length, 0);

  return (
    <main className="app">
      <header className="hero">
        <div>
          <p className="eyebrow">Matéo V1</p>
          <h1>Mémoire projet & comptes-rendus</h1>
          <p>
            Classe tes réunions par projet, garde une trace propre, puis retrouve les décisions,
            règles de calcul, écrans, méthodes et points ouverts.
          </p>
        </div>

        <div className="heroCard">
          <div>
            <strong>{data.projects.length}</strong>
            <span>projets</span>
          </div>
          <div>
            <strong>{totalReports}</strong>
            <span>comptes-rendus</span>
          </div>
        </div>
      </header>

      <section className="warning">
        <AlertTriangle size={20} />
        <div>
          <strong>V1 locale</strong>
          <p>
            Les données sont stockées dans ton navigateur. Utilise le bouton export JSON pour
            sauvegarder régulièrement. La transcription audio viendra en V2.
          </p>
        </div>
      </section>

      <section className="warning">
        <AlertTriangle size={20} />
        <div>
          <strong>Matéo garde la mémoire pour reposer le cerveau.</strong>
          <p>
            Tu restes présente dans l’échange. Matéo capte, classe, structure et prépare la mémoire projet.
          </p>
        </div>
      </section>

      <section className="cockpit">
        <article className="cockpitCard">
          <strong>Déposer</strong>
          <p>Enregistrer une réunion, importer un audio, poser une note brute ou un sujet à ne pas perdre.</p>
        </article>

        <article className="cockpitCard">
          <strong>Traiter</strong>
          <p>Transformer le brut en compte-rendu, décisions, actions, règles, écrans et points ouverts.</p>
        </article>

        <article className="cockpitCard">
          <strong>Retrouver</strong>
          <p>Interroger la mémoire projet sans refaire tout l’historique mental.</p>
        </article>

        <article className="cockpitCard">
          <strong>Suivre</strong>
          <p>Voir les actions, décisions fragiles, questions ouvertes, blocages et réunions à traiter.</p>
        </article>
      </section>

      <section className="grid">
        <aside className="panel sidebar">
          <div className="panelTitle">
            <FolderKanban size={20} />
            <h2>Projets</h2>
          </div>

          <div className="newProject">
            <input
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Nouveau projet..."
            />
            <button onClick={addProject}>
              <Plus size={16} />
            </button>
          </div>

          {projectCreationStatus && (
            <p className="backendStatus">{projectCreationStatus}</p>
          )}

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
                <small>{project.reports.length} CR</small>
              </button>
            ))}
          </div>

          {selectedProject && (
            <button className="danger ghost" onClick={() => deleteProject(selectedProject.id)}>
              <Trash2 size={16} />
              Supprimer le projet sélectionné
            </button>
          )}
        </aside>

        <section className="panel">
          <div className="panelTitle between">
            <div>
              <div className="inlineTitle">
                <FileText size={20} />
                <h2>Comptes-rendus</h2>
              </div>
              <p>{selectedProject?.name || "Aucun projet sélectionné"}</p>
            </div>
            <button onClick={addReport} disabled={!selectedProject}>
              <Plus size={16} />
              Nouveau CR
            </button>
          </div>

          <div className="reports">
            {selectedProject?.reports.length ? (
              selectedProject.reports.map((report) => (
                <button
                  key={report.id}
                  className={report.id === selectedReport?.id ? "active reportButton" : "reportButton"}
                  onClick={() => setSelectedReportId(report.id)}
                >
                  <strong>{report.title || "Compte-rendu sans titre"}</strong>
                  <span>{report.date}</span>
                  <small>{report.keywords}</small>
                </button>
              ))
            ) : (
              <p className="empty">Aucun compte-rendu pour ce projet.</p>
            )}
          </div>
        </section>

        <section className="panel editor">
          <div className="panelTitle between">
            <div className="inlineTitle">
              <Save size={20} />
              <h2>Fiche réunion</h2>
            </div>
            {selectedReport && (
              <button className="danger ghost" onClick={() => deleteReport(selectedReport.id)}>
                <Trash2 size={16} />
                Supprimer
              </button>
            )}
          </div>

          {selectedReport ? (
            <div className="form">
              <MeetingMode
                projectName={selectedProject?.name}
                reportTitle={selectedReport?.title}
                isRecording={isRecording}
                onStartRecording={startRecording}
                onStopRecording={stopRecording}
                onAddMarker={addMeetingMarker}
                markers={meetingMarkers}
              />

              <section className="exportMeetingBox">
                <div>
                  <strong>Classement local</strong>
                  <p>
                    Exporte cette réunion dans le dossier du projet, avec compte-rendu Markdown
                    et données structurées.
                  </p>
                </div>

                <button onClick={exportMeetingToDataFolder}>
                  <Download size={16} />
                  Exporter vers MATEO-DONNEES
                </button>

                {meetingExportStatus && (
                  <p className="backendStatus">{meetingExportStatus}</p>
                )}
              </section>
              <label>
                Date
                <input
                  type="date"
                  value={selectedReport.date}
                  onChange={(e) => updateReport("date", e.target.value)}
                />
              </label>

              <label>
                Titre de la réunion
                <input
                  value={selectedReport.title}
                  onChange={(e) => updateReport("title", e.target.value)}
                  placeholder="Ex : Atelier règles de calcul"
                />
              </label>

              <label>
                Type de réunion
                <select
                  value={selectedReport.meetingType || "Cadrage"}
                  onChange={(e) => updateReport("meetingType", e.target.value)}
                >
                  <option>Cadrage</option>
                  <option>Règle de calcul</option>
                  <option>Écran / parcours utilisateur</option>
                  <option>Données / imports / interfaces</option>
                  <option>Méthode / arbitrage</option>
                  <option>Point projet</option>
                  <option>Décision</option>
                  <option>Suivi / avancement</option>
                  <option>Blocage</option>
                  <option>Validation métier</option>
                </select>
              </label>

              <label>
                Participants
                <input
                  value={selectedReport.participants}
                  onChange={(e) => updateReport("participants", e.target.value)}
                  placeholder="Noms ou rôles"
                />
              </label>

              <label>
                Contexte
                <textarea
                  value={selectedReport.context}
                  onChange={(e) => updateReport("context", e.target.value)}
                />
              </label>

              <label>
                Décisions prises
                <textarea
                  value={selectedReport.decisions}
                  onChange={(e) => updateReport("decisions", e.target.value)}
                />
              </label>

              <label>
                Règles / méthodes validées
                <textarea
                  value={selectedReport.rules}
                  onChange={(e) => updateReport("rules", e.target.value)}
                  placeholder="Règles de calcul, méthode EPM, arbitrages..."
                />
              </label>

              <label>
                Écrans / fonctionnalités concernés
                <textarea
                  value={selectedReport.screens}
                  onChange={(e) => updateReport("screens", e.target.value)}
                />
              </label>

              <label>
                Questions ouvertes
                <textarea
                  value={selectedReport.openQuestions}
                  onChange={(e) => updateReport("openQuestions", e.target.value)}
                />
              </label>

              <label>
                Actions à faire
                <textarea
                  value={selectedReport.actions}
                  onChange={(e) => updateReport("actions", e.target.value)}
                />
              </label>

              <label>
                Risques / alertes
                <textarea
                  value={selectedReport.risks}
                  onChange={(e) => updateReport("risks", e.target.value)}
                />
              </label>

              <label>
                Mots-clés
                <input
                  value={selectedReport.keywords}
                  onChange={(e) => updateReport("keywords", e.target.value)}
                  placeholder="règle calcul, écran, budget, EPM..."
                />
              </label>

              <label>
                Notes brutes / transcription à coller
                <textarea
                  className="bigTextarea"
                  value={selectedReport.rawNotes}
                  onChange={(e) => updateReport("rawNotes", e.target.value)}
                />
              </label>
            </div>
          ) : (
            <p className="empty">Crée un compte-rendu pour commencer.</p>
          )}
        </section>
      </section>

      <section className="panel searchPanel">
        <div className="panelTitle between">
          <div className="inlineTitle">
            <Search size={20} />
            <h2>Recherche dans la mémoire projet</h2>
          </div>

          <button onClick={exportData}>
            <Download size={16} />
            Export JSON
          </button>
        </div>

        <div className="searchBox">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ex : règle de calcul, écran validation, arbitrage, budget..."
          />
        </div>

        {query.trim() && (
          <div className="results">
            {searchResults.length ? (
              searchResults.map(({ project, report }) => (
                <button
                  key={report.id}
                  className="resultCard"
                  onClick={() => {
                    setSelectedProjectId(project.id);
                    setSelectedReportId(report.id);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  <CheckCircle2 size={18} />
                  <div>
                    <strong>{report.title || "Compte-rendu sans titre"}</strong>
                    <p>{project.name} — {report.date}</p>
                    <small>{report.decisions || report.rules || report.rawNotes}</small>
                  </div>
                </button>
              ))
            ) : (
              <p className="empty">Aucun résultat trouvé.</p>
            )}
          </div>
        )}
      </section>

      <section className="panel roadmap">
        <div className="inlineTitle">
          <Mic size={20} />
          <h2>Prochaine étape Matéo V2</h2>
        </div>
        <p>
          Ajouter une brique transcription audio : import d’un fichier, transcription, puis génération
          automatique d’un compte-rendu structuré. Pour l’instant, on colle la transcription ou les notes
          brutes dans la fiche.
        </p>
      </section>
    </main>
  );
}
