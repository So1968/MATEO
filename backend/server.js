import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import os from "os";
import multer from "multer";

const app = express();
const PORT = 8010;

const HOME = os.homedir();
const LEGACY_DATA_ROOT = path.join(HOME, "MATEO-DONNEES");
const VOGUE_MERRY_DATA_ROOT = path.join(HOME, "VOGUE-MERRY-DONNEES");

function prepareDataRoot() {
  if (!fs.existsSync(VOGUE_MERRY_DATA_ROOT) && fs.existsSync(LEGACY_DATA_ROOT)) {
    fs.cpSync(LEGACY_DATA_ROOT, VOGUE_MERRY_DATA_ROOT, { recursive: true });
  }

  return VOGUE_MERRY_DATA_ROOT;
}

const DATA_ROOT = prepareDataRoot();
const PROJECTS_ROOT = path.join(DATA_ROOT, "01_PROJETS");

app.use(cors());
app.use(express.json());
const upload = multer({ storage: multer.memoryStorage() });

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeFileIfMissing(filePath, content) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content, "utf8");
  }
}

function createProjectStructure(projectName) {
  const slug = slugify(projectName);

  if (!slug) {
    throw new Error("Nom de projet invalide.");
  }

  const baseDir = path.join(PROJECTS_ROOT, slug);

  ensureDir(baseDir);

  const folders = [
    "00_carte_ile",
    "01_escales_reunions",
    "02_caps_valides_decisions",
    "03_manoeuvres_actions",
    "04_regles_methodes",
    "05_ecrans_parcours",
    "06_donnees_imports_interfaces",
    "07_questions_blocages",
    "08_coffre_documents_sources",
    "09_exports_livrables",
    "10_log_pose"
  ];

  for (const folder of folders) {
    ensureDir(path.join(baseDir, folder));
  }

  writeFileIfMissing(
    path.join(baseDir, "README_PROJET.md"),
`# Île / projet — ${projectName}

Ce dossier contient la mémoire navigable du projet dans Vogue Merry.

Structure :
- 00_carte_ile : reprise rapide du fil et vue générale
- 01_escales_reunions : audios, transcriptions, comptes-rendus
- 02_caps_valides_decisions : décisions consolidées
- 03_manoeuvres_actions : plan d'actions
- 04_regles_methodes : règles, méthodes et arbitrages
- 05_ecrans_parcours : écrans et parcours utilisateur
- 06_donnees_imports_interfaces : sources, imports, interfaces, mappings
- 07_questions_blocages : questions ouvertes et blocages
- 08_coffre_documents_sources : documents d'origine, pièces et preuves
- 09_exports_livrables : livrables générés
- 10_log_pose : synthèse du cap et prochaine direction
`
  );

  writeFileIfMissing(
    path.join(baseDir, "00_carte_ile", "carte_ile.md"),
`# Carte de l’île — ${projectName}

## Objectif du projet

## Contexte

## Périmètre

## Équipage / acteurs clés

## État actuel

## Dernier cap validé

## Manœuvres en cours

## Questions ouvertes

## Points de vigilance

## Prochaine direction
`
  );

  writeFileIfMissing(
    path.join(baseDir, "02_caps_valides_decisions", "caps_valides.md"),
`# Caps validés / décisions — ${projectName}

| Date | Cap validé / décision | Statut | Source | Impact |
|---|---|---|---|---|
`
  );

  writeFileIfMissing(
    path.join(baseDir, "03_manoeuvres_actions", "manoeuvres_actions.md"),
`# Manœuvres / actions — ${projectName}

| Action | Responsable | Échéance | Statut | Source |
|---|---|---|---|---|
`
  );

  writeFileIfMissing(
    path.join(baseDir, "04_regles_methodes", "regles_methodes.md"),
`# Règles / méthodes — ${projectName}

| Règle / méthode | Statut | Source | Points ouverts |
|---|---|---|---|
`
  );

  writeFileIfMissing(
    path.join(baseDir, "05_ecrans_parcours", "ecrans_parcours.md"),
`# Écrans / parcours — ${projectName}

| Écran / parcours | Objectif | Règles associées | Points ouverts |
|---|---|---|---|
`
  );

  writeFileIfMissing(
    path.join(baseDir, "06_donnees_imports_interfaces", "donnees_imports_interfaces.md"),
`# Données / imports / interfaces — ${projectName}

| Élément | Source | Usage | Points ouverts |
|---|---|---|---|
`
  );

  writeFileIfMissing(
    path.join(baseDir, "07_questions_blocages", "questions_blocages.md"),
`# Questions ouvertes / blocages — ${projectName}

| Date | Sujet | Statut | Responsable | Source |
|---|---|---|---|---|
`
  );

  writeFileIfMissing(
    path.join(baseDir, "10_log_pose", "log_pose.md"),
`# Log Pose — ${projectName}

## Ce qu’il faut retenir

## Dernier cap validé

## Manœuvres prioritaires

## Questions ouvertes

## Documents à retrouver

## Prochaine direction utile
`
  );

  return {
    name: projectName,
    slug,
    path: baseDir
  };
}

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "vogue-merry-local-backend",
    dataRoot: DATA_ROOT,
    legacyDataRoot: fs.existsSync(LEGACY_DATA_ROOT) ? LEGACY_DATA_ROOT : null
  });
});

app.get("/api/projects", (req, res) => {
  ensureDir(PROJECTS_ROOT);

  const projects = fs
    .readdirSync(PROJECTS_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({
      slug: entry.name,
      name: entry.name.replaceAll("_", " "),
      path: path.join(PROJECTS_ROOT, entry.name)
    }))
    .sort((a, b) => a.slug.localeCompare(b.slug));

  res.json({ projects });
});

app.post("/api/projects", (req, res) => {
  try {
    const { name } = req.body;
    const project = createProjectStructure(name);
    res.status(201).json({ project });
  } catch (error) {
    res.status(400).json({
      error: error.message || "Erreur pendant la création du projet."
    });
  }
});


function safeFileName(value) {
  return slugify(value).slice(0, 80) || "reunion";
}

function projectSlugFromName(projectName) {
  return slugify(projectName);
}

app.post("/api/meetings/export", (req, res) => {
  try {
    const {
      projectName,
      meetingDate,
      meetingType,
      title,
      participants,
      context,
      decisions,
      rules,
      screens,
      openQuestions,
      actions,
      risks,
      keywords,
      rawNotes
    } = req.body;

    const projectSlug = projectSlugFromName(projectName);

    if (!projectSlug) {
      throw new Error("Projet manquant.");
    }

    const projectDir = path.join(PROJECTS_ROOT, projectSlug);
    ensureDir(projectDir);

    const meetingsDir = path.join(projectDir, "01_escales_reunions");
    ensureDir(meetingsDir);

    const date = meetingDate || new Date().toISOString().slice(0, 10);
    const typeSlug = safeFileName(meetingType || "reunion");
    const titleSlug = safeFileName(title || "sans_titre");
    const meetingDirName = `${date}_${typeSlug}_${titleSlug}`;
    const meetingDir = path.join(meetingsDir, meetingDirName);

    ensureDir(meetingDir);
    ensureDir(path.join(meetingDir, "pieces_jointes"));

    const markdown = `# Journal de bord — ${title || "Réunion sans titre"}

## Île / projet

${projectName || ""}

## Date

${date}

## Type d’escale

${meetingType || ""}

## Équipage / participants

${participants || ""}

## Contexte

${context || ""}

## Caps validés / décisions prises

${decisions || ""}

## Règles / méthodes validées

${rules || ""}

## Écrans / fonctionnalités concernés

${screens || ""}

## Questions ouvertes

${openQuestions || ""}

## Manœuvres / actions à faire

${actions || ""}

## Risques / alertes

${risks || ""}

## Mots-clés

${keywords || ""}

## Traces audio / notes brutes / transcription / marqueurs

${rawNotes || ""}
`;

    fs.writeFileSync(
      path.join(meetingDir, "journal_de_bord_exporte.md"),
      markdown,
      "utf8"
    );

    fs.writeFileSync(
      path.join(meetingDir, "donnees_escale.json"),
      JSON.stringify(req.body, null, 2),
      "utf8"
    );

    res.status(201).json({
      status: "ok",
      meetingDir,
      meetingDirName
    });
  } catch (error) {
    res.status(400).json({
      error: error.message || "Erreur pendant l’export de la réunion."
    });
  }
});



app.post("/api/meetings/export-audio", upload.single("audio"), (req, res) => {
  try {
    const { projectName, meetingDirName } = req.body;

    if (!req.file) {
      throw new Error("Aucun fichier audio reçu.");
    }

    const projectSlug = slugify(projectName);
    if (!projectSlug) {
      throw new Error("Projet manquant.");
    }

    const safeMeetingDirName = String(meetingDirName || "").replace(/[\/\\]/g, "");
    if (!safeMeetingDirName) {
      throw new Error("Dossier de réunion manquant.");
    }

    const meetingDir = path.join(
      PROJECTS_ROOT,
      projectSlug,
      "01_escales_reunions",
      safeMeetingDirName
    );

    ensureDir(meetingDir);

    const extension = path.extname(req.file.originalname || "") || ".webm";
    const audioPath = path.join(meetingDir, `audio_original${extension}`);

    fs.writeFileSync(audioPath, req.file.buffer);

    res.status(201).json({
      status: "ok",
      audioPath
    });
  } catch (error) {
    res.status(400).json({
      error: error.message || "Erreur pendant l’export audio."
    });
  }
});



function readJsonIfExists(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function readMeetingData(meetingDir) {
  return (
    readJsonIfExists(path.join(meetingDir, "donnees_escale.json")) ||
    readJsonIfExists(path.join(meetingDir, "donnees_reunion.json"))
  );
}

function findMeetingDir(projectSlug, meetingDirName) {
  const newPath = path.join(PROJECTS_ROOT, projectSlug, "01_escales_reunions", meetingDirName);
  if (fs.existsSync(newPath)) return newPath;

  const legacyPath = path.join(PROJECTS_ROOT, projectSlug, "01_reunions", meetingDirName);
  if (fs.existsSync(legacyPath)) return legacyPath;

  return newPath;
}

function findReportPaths(meetingDir) {
  return {
    validatedPath: path.join(meetingDir, "journal_de_bord_valide.md"),
    exportedPath: path.join(meetingDir, "journal_de_bord_exporte.md"),
    legacyValidatedPath: path.join(meetingDir, "compte_rendu_valide.md"),
    legacyExportedPath: path.join(meetingDir, "compte_rendu_exporte.md")
  };
}

app.get("/api/inbox", (req, res) => {
  try {
    ensureDir(PROJECTS_ROOT);

    const items = [];

    const projects = fs
      .readdirSync(PROJECTS_ROOT, { withFileTypes: true })
      .filter((entry) => entry.isDirectory());

    for (const project of projects) {
      const projectDir = path.join(PROJECTS_ROOT, project.name);
      const candidateMeetingDirs = [
        path.join(projectDir, "01_escales_reunions"),
        path.join(projectDir, "01_reunions")
      ];

      for (const meetingsDir of candidateMeetingDirs) {
        if (!fs.existsSync(meetingsDir)) continue;

        const meetings = fs
          .readdirSync(meetingsDir, { withFileTypes: true })
          .filter((entry) => entry.isDirectory());

        for (const meeting of meetings) {
          const meetingDir = path.join(meetingsDir, meeting.name);
          const data = readMeetingData(meetingDir);
          const reportPaths = findReportPaths(meetingDir);

          const hasAudio = fs.existsSync(path.join(meetingDir, "audio_original.webm"));
          const hasReport =
            fs.existsSync(reportPaths.exportedPath) ||
            fs.existsSync(reportPaths.legacyExportedPath);
          const hasValidatedReport =
            fs.existsSync(reportPaths.validatedPath) ||
            fs.existsSync(reportPaths.legacyValidatedPath);
          const hasRawNotes = Boolean(data?.rawNotes && String(data.rawNotes).trim());

          let status = "À traiter";
          if (hasValidatedReport) {
            status = "Validé";
          } else if (hasReport && hasRawNotes) {
            status = "Journal de bord à valider";
          } else if (hasAudio && !hasRawNotes) {
            status = "Audio à transcrire";
          } else if (hasReport) {
            status = "Exporté à compléter";
          }

          items.push({
            projectSlug: project.name,
            projectName: data?.projectName || project.name.replaceAll("_", " "),
            meetingDirName: meeting.name,
            title: data?.title || meeting.name,
            date: data?.meetingDate || meeting.name.slice(0, 10),
            meetingType: data?.meetingType || "",
            status,
            hasAudio,
            hasReport,
            hasValidatedReport,
            hasRawNotes,
            path: meetingDir
          });
        }
      }
    }

    items.sort((a, b) => String(b.date).localeCompare(String(a.date)));

    res.json({ items });
  } catch (error) {
    res.status(500).json({
      error: error.message || "Erreur pendant la lecture de la boîte à traiter."
    });
  }
});



app.post("/api/meetings/validate", (req, res) => {
  try {
    const { projectSlug, meetingDirName } = req.body;

    if (!projectSlug || !meetingDirName) {
      throw new Error("Projet ou réunion manquant.");
    }

    const safeProjectSlug = String(projectSlug).replace(/[\/\\]/g, "");
    const safeMeetingDirName = String(meetingDirName).replace(/[\/\\]/g, "");

    const meetingDir = findMeetingDir(safeProjectSlug, safeMeetingDirName);
    const reportPaths = findReportPaths(meetingDir);

    const sourcePath = fs.existsSync(reportPaths.exportedPath)
      ? reportPaths.exportedPath
      : reportPaths.legacyExportedPath;

    const validatedPath = reportPaths.validatedPath;

    if (!fs.existsSync(sourcePath)) {
      throw new Error("Journal de bord exporté introuvable.");
    }

    const content = fs.readFileSync(sourcePath, "utf8");

    createFileVersion(validatedPath, "avant_validation");

    fs.writeFileSync(
      validatedPath,
      content + "\n\n---\n\nValidé dans Vogue Merry le " + new Date().toISOString() + "\n",
      "utf8"
    );

    res.status(201).json({
      status: "ok",
      validatedPath
    });
  } catch (error) {
    res.status(400).json({
      error: error.message || "Erreur pendant la validation de la réunion."
    });
  }
});



app.post("/api/meetings/read-report", (req, res) => {
  try {
    const { projectSlug, meetingDirName } = req.body;

    if (!projectSlug || !meetingDirName) {
      throw new Error("Projet ou réunion manquant.");
    }

    const safeProjectSlug = String(projectSlug).replace(/[\/\\]/g, "");
    const safeMeetingDirName = String(meetingDirName).replace(/[\/\\]/g, "");

    const meetingDir = findMeetingDir(safeProjectSlug, safeMeetingDirName);
    const reportPaths = findReportPaths(meetingDir);

    let reportPath = reportPaths.exportedPath;
    let reportType = "exporte";

    if (fs.existsSync(reportPaths.validatedPath)) {
      reportPath = reportPaths.validatedPath;
      reportType = "valide";
    } else if (fs.existsSync(reportPaths.legacyValidatedPath)) {
      reportPath = reportPaths.legacyValidatedPath;
      reportType = "valide";
    } else if (fs.existsSync(reportPaths.legacyExportedPath)) {
      reportPath = reportPaths.legacyExportedPath;
      reportType = "exporte";
    }

    if (!fs.existsSync(reportPath)) {
      throw new Error("Aucun journal de bord trouvé pour cette réunion.");
    }

    const content = fs.readFileSync(reportPath, "utf8");

    res.json({
      status: "ok",
      reportType,
      reportPath,
      content
    });
  } catch (error) {
    res.status(400).json({
      error: error.message || "Erreur pendant la lecture du journal de bord."
    });
  }
});



app.post("/api/meetings/save-report", (req, res) => {
  try {
    const { projectSlug, meetingDirName, content } = req.body;

    if (!projectSlug || !meetingDirName) {
      throw new Error("Projet ou réunion manquant.");
    }

    const safeProjectSlug = String(projectSlug).replace(/[\/\\]/g, "");
    const safeMeetingDirName = String(meetingDirName).replace(/[\/\\]/g, "");

    const meetingDir = findMeetingDir(safeProjectSlug, safeMeetingDirName);

    ensureDir(meetingDir);

    const exportedPath = path.join(meetingDir, "journal_de_bord_exporte.md");

    createFileVersion(exportedPath, "avant_sauvegarde");

    fs.writeFileSync(
      exportedPath,
      String(content || ""),
      "utf8"
    );

    res.json({
      status: "ok",
      savedPath: exportedPath
    });
  } catch (error) {
    res.status(400).json({
      error: error.message || "Erreur pendant l’enregistrement du journal de bord."
    });
  }
});



function timestampForFile() {
  return new Date()
    .toISOString()
    .replace("T", "_")
    .replace(/:/g, "-")
    .replace(/\..+/, "");
}

function createFileVersion(filePath, reason = "version") {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const dir = path.dirname(filePath);
    const versionsDir = path.join(dir, "99_versions");
    ensureDir(versionsDir);

    const parsed = path.parse(filePath);
    const versionFileName = `${timestampForFile()}_${parsed.name}_${reason}${parsed.ext}`;
    const versionPath = path.join(versionsDir, versionFileName);

    fs.copyFileSync(filePath, versionPath);

    if (typeof logAudit === "function") {
      logAudit("file_version_created", {
        originalPath: filePath,
        versionPath,
        reason
      });
    }

    return versionPath;
  } catch (error) {
    console.error("Erreur création version :", error.message);
    return null;
  }
}



function walkFiles(dirPath, files = []) {
  if (!fs.existsSync(dirPath)) return files;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      walkFiles(fullPath, files);
    } else if (
      entry.name.endsWith(".md") ||
      entry.name.endsWith(".json") ||
      entry.name.endsWith(".txt")
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

function extractSnippet(content, query) {
  const lower = content.toLowerCase();
  const q = query.toLowerCase();
  const index = lower.indexOf(q);

  if (index === -1) return content.slice(0, 260);

  const start = Math.max(0, index - 120);
  const end = Math.min(content.length, index + q.length + 160);

  return content.slice(start, end).replace(/\n+/g, " ");
}

app.get("/api/search", (req, res) => {
  try {
    const query = String(req.query.q || "").trim();
    const projectSlug = String(req.query.projectSlug || "").trim();

    if (!query) {
      res.json({ results: [] });
      return;
    }

    const roots = [];

    if (projectSlug) {
      roots.push(path.join(PROJECTS_ROOT, projectSlug));
    } else {
      roots.push(PROJECTS_ROOT);
    }

    const results = [];

    for (const root of roots) {
      const files = walkFiles(root);

      for (const filePath of files) {
        const content = fs.readFileSync(filePath, "utf8");

        if (content.toLowerCase().includes(query.toLowerCase())) {
          const relativePath = path.relative(PROJECTS_ROOT, filePath);
          const parts = relativePath.split(path.sep);
          const foundProjectSlug = parts[0] || "";

          results.push({
            projectSlug: foundProjectSlug,
            filePath,
            relativePath,
            fileName: path.basename(filePath),
            snippet: extractSnippet(content, query)
          });
        }
      }
    }

    res.json({
      query,
      projectSlug,
      count: results.length,
      results: results.slice(0, 50)
    });
  } catch (error) {
    res.status(500).json({
      error: error.message || "Erreur pendant la recherche."
    });
  }
});


app.listen(PORT, "127.0.0.1", () => {
  console.log(`Vogue Merry backend lancé : http://127.0.0.1:${PORT}`);
  console.log(`Dossier données : ${DATA_ROOT}`);
  if (fs.existsSync(LEGACY_DATA_ROOT)) {
    console.log(`Ancien dossier Matéo conservé comme source/backup : ${LEGACY_DATA_ROOT}`);
  }
});
