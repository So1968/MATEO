import React, { useEffect, useMemo, useRef, useState } from "react";
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

const participantOptions = [
  "Matéo",
  "Matito",
  "Matita",
  "Nora",
  "Léo",
  "Samia",
  "Alex"
];

function buildDefaultMeetingTitle(projectName) {
  const date = new Date().toLocaleDateString("fr-FR");
  return `Réunion ${projectName || "projet"} — ${date}`;
}

const initialData = {
  projects: [
    {
      id: crypto.randomUUID(),
      name: "Exemple — Projet EPM",
      description: "Projet exemple pour tester Vogue Merry.",
      reports: [
        {
          id: crypto.randomUUID(),
          date: new Date().toISOString().slice(0, 10),
          title: "Réunion de cadrage",
          meetingType: "Cadrage",
          meetingTypeOther: "",
          participants: "Sofia, équipe projet",
          context: "Première réunion de cadrage du projet.",
          decisions: "Créer une mémoire projet structurée par documents de travail.",
          rules: "Chaque réunion doit produire une trace exploitable.",
          screens: "Tableau de bord, recherche, fiche document.",
          openQuestions: "Quel outil de transcription audio choisir ?",
          actions: "Tester Vogue Merry sur une vraie réunion.",
          risks: "Perte d'information si les documents de travail ne sont pas rangés.",
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

function emptyReport(projectName = "projet") {
  return {
    id: crypto.randomUUID(),
    date: new Date().toISOString().slice(0, 10),
    title: buildDefaultMeetingTitle(projectName),
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

export default function App() {
  const [data, setData] = useState(loadData);
  const [selectedProjectId, setSelectedProjectId] = useState(data.projects[0]?.id || null);
  const [selectedReportId, setSelectedReportId] = useState(data.projects[0]?.reports[0]?.id || null);
  const [query, setQuery] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [newParticipantName, setNewParticipantName] = useState("");
  const [projectCreationStatus, setProjectCreationStatus] = useState("");
  const [meetingExportStatus, setMeetingExportStatus] = useState("");
  const [inboxItems, setInboxItems] = useState([]);
  const [inboxStatus, setInboxStatus] = useState("");
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [selectedInboxReport, setSelectedInboxReport] = useState(null);
  const [selectedInboxContent, setSelectedInboxContent] = useState("");
  const [reportSaveStatus, setReportSaveStatus] = useState("");
  const [meetingMarkers, setMeetingMarkers] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [audioStatus, setAudioStatus] = useState("");
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
        "Projet créé dans Vogue Merry, mais le dossier local n’a pas pu être créé. Vérifie que le backend est lancé.";
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
    const report = emptyReport(selectedProject.name);

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

  function addParticipantToMeeting() {
    const name = newParticipantName.trim();

    if (!name || !selectedReport) return;

    const current = selectedReport.participants
      ? selectedReport.participants.split(",").map((item) => item.trim()).filter(Boolean)
      : [];

    if (!current.includes(name)) {
      updateReport("participants", [...current, name].join(", "));
    }

    setNewParticipantName("");
  }

  function toggleParticipant(name) {
    if (!selectedReport) return;

    const current = selectedReport.participants
      ? selectedReport.participants.split(",").map((item) => item.trim()).filter(Boolean)
      : [];

    const next = current.includes(name)
      ? current.filter((item) => item !== name)
      : [...current, name];

    updateReport("participants", next.join(", "));
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
    if (!selectedReport) {
      setAudioStatus("Crée d’abord une source de réunion.");
      return;
    }

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
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });

        stream.getTracks().forEach((track) => track.stop());

        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
        }

        const nextAudioUrl = URL.createObjectURL(blob);
        const fileName = `audio-${selectedReport.date || new Date().toISOString().slice(0, 10)}.webm`;

        setAudioBlob(blob);
        setAudioUrl(nextAudioUrl);
        setAudioStatus("Audio enregistré et attaché à cette source de réunion.");
        updateReport("audioFileName", fileName);
      };

      recorder.start();
      setMeetingMarkers([]);
      setIsRecording(true);
      setAudioStatus("Enregistrement en cours...");
    } catch (error) {
      setAudioStatus("Impossible d’accéder au micro. Vérifie l’autorisation du navigateur.");
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
          report.meetingTypeOther,
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

  async function loadInbox() {
    setInboxStatus("Chargement de la boîte à traiter...");

    try {
      const response = await fetch("http://127.0.0.1:8010/api/inbox");

      if (!response.ok) {
        throw new Error("Backend local non disponible.");
      }

      const result = await response.json();
      setInboxItems(result.items || []);
      setInboxStatus("");
    } catch (error) {
      setInboxStatus("Impossible de charger la boîte à traiter. Vérifie que le backend est lancé.");
    }
  }

  async function copyReportPath() {
    if (!selectedInboxReport?.reportPath) {
      setInboxStatus("Aucun chemin à copier.");
      return;
    }

    try {
      await navigator.clipboard.writeText(selectedInboxReport.reportPath);
      setInboxStatus("Chemin du document copié.");
    } catch {
      setInboxStatus("Impossible de copier le chemin automatiquement.");
    }
  }

  async function openInboxReport(item) {
    const sameReportIsOpen =
      selectedInboxReport &&
      selectedInboxReport.projectSlug === item.projectSlug &&
      selectedInboxReport.meetingDirName === item.meetingDirName;

    if (sameReportIsOpen) {
      setSelectedInboxReport(null);
      setSelectedInboxContent("");
      setInboxStatus("");
      return;
    }

    setInboxStatus("Ouverture du document...");
    setSelectedInboxReport(null);
    setSelectedInboxContent("");

    try {
      const response = await fetch("http://127.0.0.1:8010/api/meetings/read-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          projectSlug: item.projectSlug,
          meetingDirName: item.meetingDirName
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erreur pendant l’ouverture du document.");
      }

      setSelectedInboxReport({
        ...item,
        reportType: result.reportType,
        reportPath: result.reportPath
      });
      setSelectedInboxContent(result.content || "");
      setInboxStatus("");
    } catch (error) {
      setInboxStatus(`Ouverture impossible : ${error.message}`);
    }
  }


  async function saveInboxReport() {
    if (!selectedInboxReport) {
      setReportSaveStatus("Aucun document ouvert.");
      setInboxStatus("Aucun document ouvert.");
      return;
    }

    setReportSaveStatus("Enregistrement en cours...");
    setInboxStatus("Enregistrement du document...");

    try {
      const response = await fetch("http://127.0.0.1:8010/api/meetings/save-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          projectSlug: selectedInboxReport.projectSlug,
          meetingDirName: selectedInboxReport.meetingDirName,
          content: selectedInboxContent
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erreur pendant l’enregistrement.");
      }

      const time = new Date().toLocaleTimeString();
      setReportSaveStatus(`Document enregistré à ${time}`);
      setInboxStatus(`Document enregistré à ${time}`);
      loadInbox();
    } catch (error) {
      setReportSaveStatus(`Enregistrement impossible : ${error.message}`);
      setInboxStatus(`Enregistrement impossible : ${error.message}`);
    }
  }


  async function validateInboxMeeting(item) {
    setInboxStatus("Validation de la réunion en cours...");

    try {
      const response = await fetch("http://127.0.0.1:8010/api/meetings/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          projectSlug: item.projectSlug,
          meetingDirName: item.meetingDirName
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erreur pendant la validation.");
      }

      setInboxStatus("Réunion marquée comme validée.");
      loadInbox();
    } catch (error) {
      setInboxStatus(`Validation impossible : ${error.message}`);
    }
  }

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
          meetingType:
            selectedReport.meetingType === "Autre"
              ? selectedReport.meetingTypeOther || "Autre"
              : selectedReport.meetingType || "Réunion",
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

      const currentAudioBlob = typeof audioBlob !== "undefined" ? audioBlob : null;

      if (!currentAudioBlob) {
        setMeetingExportStatus(`Réunion exportée : ${result.meetingDirName}. Aucun audio attaché.`);
        loadInbox();
        return;
      }

      try {
        const formData = new FormData();
        formData.append("projectName", selectedProject.name);
        formData.append("meetingDirName", result.meetingDirName);
        formData.append(
          "audio",
          currentAudioBlob,
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
        loadInbox();
      } catch (audioError) {
        setMeetingExportStatus(
          `Réunion exportée : ${result.meetingDirName}. Audio non exporté.`
        );
          loadInbox();
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
    a.download = `vogue-merry-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  useEffect(() => {
    loadInbox();
  }, []);

  const totalReports = data.projects.reduce((sum, p) => sum + p.reports.length, 0);

  return (
    <main className="app">
      <header className="hero">
        <div>
          <p className="eyebrow">Vogue Merry</p>
          <h1>Log Pose</h1>

        <div className="heroSignatureRow">
          <div className="onePieceMotto">
            <span>Garder le cap, protéger la mémoire, avancer avec son équipage.</span>
          </div>

          <div className="strawHatSeal">
            <div className="hatTop"></div>
            <div className="hatBrim"></div>
            <div className="hatBand"></div>
          </div>
        </div>
        
          <p>
            Navigue entre tes îles-projets, garde une trace propre des escales,
            puis retrouve les décisions, documents, actions, méthodes et points ouverts.
          </p>
        </div>

        <div className="heroCard">
          <div>
            <strong>{data.projects.length}</strong>
            <span>îles / projets</span>
          </div>
          <div>
            <strong>{totalReports}</strong>
            <span>journaux de bord</span>
          </div>
        </div>
      </header>

      <section className="panel inboxPanel">
        <div className="panelTitle between">
          <button
            type="button"
            className="sectionTitleButton"
            onClick={() => setIsInboxOpen((open) => !open)}
          >
            <FileText size={20} />
            <span>À reprendre</span>
          </button>

          <button className="refreshButton" onClick={loadInbox}>
            Actualiser
          </button>
        </div>

        {isInboxOpen && (
          <div className="collapsibleContent">
            {inboxStatus && <p className="backendStatus">{inboxStatus}</p>}

        {inboxItems.length ? (
          <div className="inboxList">
            {inboxItems.slice(0, 8).map((item) => (
              <article key={`${item.projectSlug}-${item.meetingDirName}`} className="inboxItem">
                <div>
                  <button className="inboxTitleButton" onClick={() => openInboxReport(item)}>
                    {item.title || "Réunion sans titre"}
                  </button>
                  <p>{item.projectName} — {item.date} — {item.meetingType}</p>
                  <small>{item.meetingDirName}</small>
                </div>

                <div className="inboxActions">
                  <span className="statusPill">{item.status}</span>

                  {item.status !== "Validé" && (
                    <button className="smallButton" onClick={() => validateInboxMeeting(item)}>
                      Valider
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="empty">Aucune réunion à traiter pour l’instant.</p>
        )}

        {selectedInboxReport && (
          <section className="reportPreview">
            <div className="panelTitle between">
              <div>
                <div className="inlineTitle">
                  <FileText size={20} />
                  <h2>Document de travail à reprendre</h2>
                </div>
                <p>
                  {selectedInboxReport.projectName} — {selectedInboxReport.date} — {selectedInboxReport.title}
                </p>
              </div>

              <span className="statusPill">
                {selectedInboxReport.reportType === "valide" ? "Version validée" : "Document de travail"}
              </span>
            </div>

            <div className="filePathRow">
              <p className="filePath">{selectedInboxReport.reportPath}</p>
              <button className="smallButton secondarySmallButton" onClick={copyReportPath}>
                Copier le chemin
              </button>
            </div>

            <textarea
              className="reportPreviewText"
              value={selectedInboxContent}
              onChange={(event) => setSelectedInboxContent(event.target.value)}
            />

            <div className="reportPreviewActions">
              <button onClick={saveInboxReport}>
                Enregistrer les modifications
              </button>

              {selectedInboxReport.status !== "Validé" && (
                <button onClick={() => validateInboxMeeting(selectedInboxReport)}>
                  Valider cette version
                </button>
              )}
            </div>

            {reportSaveStatus && (
              <p className="reportSaveStatus">{reportSaveStatus}</p>
            )}
          </section>
        )}
          </div>
        )}

      </section>

      <section className="grid">
        <aside className="panel sidebar">
          <div className="panelTitle">
            <FolderKanban size={20} />
            <h2>Mes îles</h2>
          </div>

          <div className="newProject">
            <input
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Nouvelle île / projet..."
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
                <small>{project.reports.length} escales</small>
              </button>
            ))}
          </div>

          {selectedProject && (
            <button className="danger ghost" onClick={() => deleteProject(selectedProject.id)}>
              <Trash2 size={16} />
              Supprimer l’île / projet sélectionné
            </button>
          )}
        </aside>

        <section className="panel">
          <div className="panelTitle between">
            <div>
              <div className="inlineTitle">
                <FileText size={20} />
                <h2>Journal de bord</h2>
              </div>
              <p>{selectedProject?.name || "Aucune île sélectionnée"}</p>
            </div>
            <button onClick={addReport} disabled={!selectedProject}>
              <Plus size={16} />
              Nouvelle escale
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
                  <strong>{report.title || "Document sans titre"}</strong>
                  <span>{report.date}</span>
                  <small>{report.keywords}</small>
                </button>
              ))
            ) : (
              <p className="empty">Aucun document de bord pour cette île.</p>
            )}
          </div>
        </section>

        <section className="panel editor">
          <div className="panelTitle between">
            <div className="inlineTitle">
              <Save size={20} />
              <h2>Escale / réunion</h2>
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
              <div className="activeProjectBanner">
                Île active : <strong>{selectedProject?.name}</strong>
              </div>

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
                    Exporte cette escale dans le dossier du projet, avec document Markdown
                    et données structurées.
                  </p>
                </div>

                <button onClick={exportMeetingToDataFolder}>
                  <Download size={16} />
                  Exporter vers MATEO-DONNEES
                </button>

                <p className="audioStateLine">
                  {audioBlob ? "Audio attaché à cette source de réunion." : "Aucun audio attaché pour l’instant."}
                </p>

                {audioStatus && (
                  <p className="backendStatus">{audioStatus}</p>
                )}

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
                Titre de l’escale / réunion
                <input
                  value={selectedReport.title}
                  onChange={(e) => updateReport("title", e.target.value)}
                  placeholder="Ex : Atelier règles de calcul"
                />
              </label>

              <label>
                Type d’escale
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
                  <option>Autre</option>
                </select>

                {selectedReport.meetingType === "Autre" && (
                  <input
                    value={selectedReport.meetingTypeOther || ""}
                    onChange={(e) => updateReport("meetingTypeOther", e.target.value)}
                    placeholder="Préciser le type d’escale..."
                  />
                )}
              </label>

              <label>
                Équipage / participants
                <div className="participantsGrid">
                  {[
                    ...participantOptions,
                    ...(
                      selectedReport.participants
                        ? selectedReport.participants
                            .split(",")
                            .map((item) => item.trim())
                            .filter(Boolean)
                            .filter((name) => !participantOptions.includes(name))
                        : []
                    )
                  ].map((name) => {
                    const selectedParticipants = selectedReport.participants
                      ? selectedReport.participants.split(",").map((item) => item.trim()).filter(Boolean)
                      : [];

                    return (
                      <button
                        type="button"
                        key={name}
                        className={
                          selectedParticipants.includes(name)
                            ? "participantChip participantChipActive"
                            : "participantChip"
                        }
                        onClick={() => toggleParticipant(name)}
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>

                <div className="addParticipantRow">
                  <input
                    value={newParticipantName}
                    onChange={(event) => setNewParticipantName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addParticipantToMeeting();
                      }
                    }}
                    placeholder="Ajouter un participant : client, invité, consultant..."
                  />

                  <button type="button" onClick={addParticipantToMeeting}>
                    Ajouter
                  </button>
                </div>
              </label>

              <label>
                Contexte
                <textarea
                  value={selectedReport.context}
                  onChange={(e) => updateReport("context", e.target.value)}
                />
              </label>

              <label>
                Caps validés / décisions prises
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
                Manœuvres / actions à faire
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
                Matière brute / transcription / marqueurs
                <textarea
                  className="bigTextarea"
                  value={selectedReport.rawNotes}
                  onChange={(e) => updateReport("rawNotes", e.target.value)}
                />
              </label>
            </div>
          ) : (
            <p className="empty">Crée une escale pour commencer.</p>
          )}
        </section>
      </section>

      <section className="panel searchPanel">
        <div className="panelTitle between">
          <div className="inlineTitle">
            <Search size={20} />
            <h2>Longue-vue — recherche dans la mémoire projet</h2>
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
                    <strong>{report.title || "Document sans titre"}</strong>
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
          <h2>Prochaine étape Vogue Merry</h2>
        </div>
        <p>
          Ajouter une brique transcription audio : import d’un fichier, transcription, puis génération
          automatique d’un document structuré. Pour l’instant, on colle la transcription ou les notes
          brutes dans la fiche.
        </p>
      </section>
    </main>
  );
}
