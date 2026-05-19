import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import os from "os";
import multer from "multer";

const app = express();
const PORT = 8010;

const HOME = os.homedir();
const DATA_ROOT = path.join(HOME, "VOGUE-MERRY-DONNEES");
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

function safeSegment(value) {
  return String(value || "").replace(/[\/\\]/g, "");
}

function timestampForFile() {
  return new Date().toISOString().replace("T", "_").replace(/:/g, "-").replace(/\..+/, "");
}

function createFileVersion(filePath, reason = "version") {
  if (!fs.existsSync(filePath)) return null;

  const dir = path.dirname(filePath);
  const versionsDir = path.join(dir, "99_versions");
  ensureDir(versionsDir);

  const parsed = path.parse(filePath);
  const versionPath = path.join(versionsDir, `${timestampForFile()}_${parsed.name}_${reason}${parsed.ext}`);
  fs.copyFileSync(filePath, versionPath);
  return versionPath;
}

function createProjectStructure(projectName) {
  const slug = slugify(projectName);
  if (!slug) throw new Error("Nom de projet invalide.");

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

  folders.forEach((folder) => ensureDir(path.join(baseDir, folder)));

  writeFileIfMissing(
    path.join(baseDir, "README_PROJET.md"),
`# Île / projet — ${projectName}

Ce dossier contient la mémoire navigable du projet dans Vogue Merry.

Structure :
- 00_carte_ile : reprise rapide du fil et vue générale
- 01_escales_reunions : audios, transcriptions, journaux de bord
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

  writeFileIfMissing(path.join(baseDir, "02_caps_valides_decisions", "caps_valides.md"), `# Caps validés / décisions — ${projectName}\n\n| Date | Cap validé / décision | Statut | Source | Impact |\n|---|---|---|---|---|\n`);
  writeFileIfMissing(path.join(baseDir, "03_manoeuvres_actions", "manoeuvres_actions.md"), `# Manœuvres / actions — ${projectName}\n\n| Action | Responsable | Échéance | Statut | Source |\n|---|---|---|---|---|\n`);
  writeFileIfMissing(path.join(baseDir, "04_regles_methodes", "regles_methodes.md"), `# Règles / méthodes — ${projectName}\n\n| Règle / méthode | Statut | Source | Points ouverts |\n|---|---|---|---|\n`);
  writeFileIfMissing(path.join(baseDir, "05_ecrans_parcours", "ecrans_parcours.md"), `# Écrans / parcours — ${projectName}\n\n| Écran / parcours | Objectif | Règles associées | Points ouverts |\n|---|---|---|---|\n`);
  writeFileIfMissing(path.join(baseDir, "06_donnees_imports_interfaces", "donnees_imports_interfaces.md"), `# Données / imports / interfaces — ${projectName}\n\n| Élément | Source | Usage | Points ouverts |\n|---|---|---|---|\n`);
  writeFileIfMissing(path.join(baseDir, "07_questions_blocages", "questions_blocages.md"), `# Questions ouvertes / blocages — ${projectName}\n\n| Date | Sujet | Statut | Responsable | Source |\n|---|---|---|---|---|\n`);
  writeFileIfMissing(path.join(baseDir, "10_log_pose", "log_pose.md"), `# Log Pose — ${projectName}\n\n## Ce qu’il faut retenir\n\n## Dernier cap validé\n\n## Manœuvres prioritaires\n\n## Questions ouvertes\n\n## Documents à retrouver\n\n## Prochaine direction utile\n`);

  return { name: projectName, slug, path: baseDir };
}

function readJsonIfExists(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function readMeetingData(meetingDir) {
  return readJsonIfExists(path.join(meetingDir, "donnees_escale.json"));
}

function findMeetingDir(projectSlug, meetingDirName) {
  return path.join(PROJECTS_ROOT, projectSlug, "01_escales_reunions", meetingDirName);
}

function findReportPaths(meetingDir) {
  return {
    validatedPath: path.join(meetingDir, "journal_de_bord_valide.md"),
    exportedPath: path.join(meetingDir, "journal_de_bord_exporte.md")
  };
}

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "vogue-merry-local-backend",
    dataRoot: DATA_ROOT
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
    const project = createProjectStructure(req.body.name);
    res.status(201).json({ project });
  } catch (error) {
    res.status(400).json({ error: error.message || "Erreur pendant la création du projet." });
  }
});

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

    const projectSlug = slugify(projectName);
    if (!projectSlug) throw new Error("Projet manquant.");

    const projectDir = path.join(PROJECTS_ROOT, projectSlug);
    ensureDir(projectDir);

    const meetingsDir = path.join(projectDir, "01_escales_reunions");
    ensureDir(meetingsDir);

    const date = meetingDate || new Date().toISOString().slice(0, 10);
    const typeSlug = slugify(meetingType || "escale").slice(0, 80) || "escale";
    const titleSlug = slugify(title || "sans_titre").slice(0, 80) || "sans_titre";
    const meetingDirName = `${date}_${typeSlug}_${titleSlug}`;
    const meetingDir = path.join(meetingsDir, meetingDirName);

    ensureDir(meetingDir);
    ensureDir(path.join(meetingDir, "pieces_jointes"));

    const markdown = `# Journal de bord — ${title || "Escale sans titre"}

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

    fs.writeFileSync(path.join(meetingDir, "journal_de_bord_exporte.md"), markdown, "utf8");
    fs.writeFileSync(path.join(meetingDir, "donnees_escale.json"), JSON.stringify(req.body, null, 2), "utf8");

    res.status(201).json({ status: "ok", meetingDir, meetingDirName });
  } catch (error) {
    res.status(400).json({ error: error.message || "Erreur pendant l’export de l’escale." });
  }
});

app.post("/api/meetings/export-audio", upload.single("audio"), (req, res) => {
  try {
    const { projectName, meetingDirName } = req.body;
    if (!req.file) throw new Error("Aucun fichier audio reçu.");

    const projectSlug = slugify(projectName);
    const safeMeetingDirName = safeSegment(meetingDirName);
    if (!projectSlug || !safeMeetingDirName) throw new Error("Projet ou escale manquant.");

    const meetingDir = path.join(PROJECTS_ROOT, projectSlug, "01_escales_reunions", safeMeetingDirName);
    ensureDir(meetingDir);

    const extension = path.extname(req.file.originalname || "") || ".webm";
    const audioPath = path.join(meetingDir, `audio_original${extension}`);
    fs.writeFileSync(audioPath, req.file.buffer);

    res.status(201).json({ status: "ok", audioPath });
  } catch (error) {
    res.status(400).json({ error: error.message || "Erreur pendant l’export audio." });
  }
});

app.get("/api/inbox", (req, res) => {
  try {
    ensureDir(PROJECTS_ROOT);
    const items = [];

    const projects = fs.readdirSync(PROJECTS_ROOT, { withFileTypes: true }).filter((entry) => entry.isDirectory());

    for (const project of projects) {
      const meetingsDir = path.join(PROJECTS_ROOT, project.name, "01_escales_reunions");
      if (!fs.existsSync(meetingsDir)) continue;

      const meetings = fs.readdirSync(meetingsDir, { withFileTypes: true }).filter((entry) => entry.isDirectory());

      for (const meeting of meetings) {
        const meetingDir = path.join(meetingsDir, meeting.name);
        const data = readMeetingData(meetingDir);
        const reportPaths = findReportPaths(meetingDir);
        const hasAudio = fs.existsSync(path.join(meetingDir, "audio_original.webm"));
        const hasReport = fs.existsSync(reportPaths.exportedPath);
        const hasValidatedReport = fs.existsSync(reportPaths.validatedPath);
        const hasRawNotes = Boolean(data?.rawNotes && String(data.rawNotes).trim());

        let status = "À traiter";
        if (hasValidatedReport) status = "Validé";
        else if (hasReport && hasRawNotes) status = "Journal de bord à valider";
        else if (hasAudio && !hasRawNotes) status = "Audio à transcrire";
        else if (hasReport) status = "Exporté à compléter";

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

    items.sort((a, b) => String(b.date).localeCompare(String(a.date)));
    res.json({ items });
  } catch (error) {
    res.status(500).json({ error: error.message || "Erreur pendant la lecture de la boîte à traiter." });
  }
});

app.post("/api/meetings/validate", (req, res) => {
  try {
    const safeProjectSlug = safeSegment(req.body.projectSlug);
    const safeMeetingDirName = safeSegment(req.body.meetingDirName);
    if (!safeProjectSlug || !safeMeetingDirName) throw new Error("Projet ou escale manquant.");

    const meetingDir = findMeetingDir(safeProjectSlug, safeMeetingDirName);
    const { exportedPath, validatedPath } = findReportPaths(meetingDir);

    if (!fs.existsSync(exportedPath)) throw new Error("Journal de bord exporté introuvable.");

    const content = fs.readFileSync(exportedPath, "utf8");
    createFileVersion(validatedPath, "avant_validation");
    fs.writeFileSync(validatedPath, content + "\n\n---\n\nValidé dans Vogue Merry le " + new Date().toISOString() + "\n", "utf8");

    res.status(201).json({ status: "ok", validatedPath });
  } catch (error) {
    res.status(400).json({ error: error.message || "Erreur pendant la validation de l’escale." });
  }
});

app.post("/api/meetings/read-report", (req, res) => {
  try {
    const safeProjectSlug = safeSegment(req.body.projectSlug);
    const safeMeetingDirName = safeSegment(req.body.meetingDirName);
    if (!safeProjectSlug || !safeMeetingDirName) throw new Error("Projet ou escale manquant.");

    const meetingDir = findMeetingDir(safeProjectSlug, safeMeetingDirName);
    const { exportedPath, validatedPath } = findReportPaths(meetingDir);

    const reportPath = fs.existsSync(validatedPath) ? validatedPath : exportedPath;
    const reportType = fs.existsSync(validatedPath) ? "valide" : "exporte";

    if (!fs.existsSync(reportPath)) throw new Error("Aucun journal de bord trouvé pour cette escale.");

    res.json({ status: "ok", reportType, reportPath, content: fs.readFileSync(reportPath, "utf8") });
  } catch (error) {
    res.status(400).json({ error: error.message || "Erreur pendant la lecture du journal de bord." });
  }
});

app.post("/api/meetings/save-report", (req, res) => {
  try {
    const safeProjectSlug = safeSegment(req.body.projectSlug);
    const safeMeetingDirName = safeSegment(req.body.meetingDirName);
    if (!safeProjectSlug || !safeMeetingDirName) throw new Error("Projet ou escale manquant.");

    const meetingDir = findMeetingDir(safeProjectSlug, safeMeetingDirName);
    ensureDir(meetingDir);

    const exportedPath = path.join(meetingDir, "journal_de_bord_exporte.md");
    createFileVersion(exportedPath, "avant_sauvegarde");
    fs.writeFileSync(exportedPath, String(req.body.content || ""), "utf8");

    res.json({ status: "ok", savedPath: exportedPath });
  } catch (error) {
    res.status(400).json({ error: error.message || "Erreur pendant l’enregistrement du journal de bord." });
  }
});

function walkFiles(dirPath, files = []) {
  if (!fs.existsSync(dirPath)) return files;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) walkFiles(fullPath, files);
    else if (entry.name.endsWith(".md") || entry.name.endsWith(".json") || entry.name.endsWith(".txt")) files.push(fullPath);
  }

  return files;
}

function extractSnippet(content, query) {
  const lower = content.toLowerCase();
  const q = query.toLowerCase();
  const index = lower.indexOf(q);
  if (index === -1) return content.slice(0, 260);
  return content.slice(Math.max(0, index - 120), Math.min(content.length, index + q.length + 160)).replace(/\n+/g, " ");
}

app.get("/api/search", (req, res) => {
  try {
    const query = String(req.query.q || "").trim();
    const projectSlug = safeSegment(req.query.projectSlug);
    if (!query) return res.json({ results: [] });

    const roots = projectSlug ? [path.join(PROJECTS_ROOT, projectSlug)] : [PROJECTS_ROOT];
    const results = [];

    for (const root of roots) {
      for (const filePath of walkFiles(root)) {
        const content = fs.readFileSync(filePath, "utf8");
        if (content.toLowerCase().includes(query.toLowerCase())) {
          const relativePath = path.relative(PROJECTS_ROOT, filePath);
          const parts = relativePath.split(path.sep);
          results.push({
            projectSlug: parts[0] || "",
            filePath,
            relativePath,
            fileName: path.basename(filePath),
            snippet: extractSnippet(content, query)
          });
        }
      }
    }

    res.json({ query, projectSlug, count: results.length, results: results.slice(0, 50) });
  } catch (error) {
    res.status(500).json({ error: error.message || "Erreur pendant la recherche." });
  }
});

app.listen(PORT, "127.0.0.1", () => {
  console.log(`Vogue Merry backend lancé : http://127.0.0.1:${PORT}`);
  console.log(`Dossier données : ${DATA_ROOT}`);
});
