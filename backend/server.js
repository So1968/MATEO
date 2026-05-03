import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import os from "os";
import multer from "multer";

const app = express();
const PORT = 8010;

const HOME = os.homedir();
const DATA_ROOT = path.join(HOME, "MATEO-DONNEES");
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
    "00_vue_ensemble",
    "01_reunions",
    "02_decisions",
    "03_actions",
    "04_regles_calcul_methodes",
    "05_ecrans_parcours",
    "06_donnees_imports_interfaces",
    "07_points_ouverts_blocages",
    "08_documents_sources",
    "09_exports_livrables"
  ];

  for (const folder of folders) {
    ensureDir(path.join(baseDir, folder));
  }

  writeFileIfMissing(
    path.join(baseDir, "README_PROJET.md"),
`# Projet — ${projectName}

Ce dossier contient la mémoire du projet.

Structure :
- 00_vue_ensemble : reprise rapide du fil
- 01_reunions : audios, transcriptions, comptes-rendus
- 02_decisions : décisions consolidées
- 03_actions : plan d'actions
- 04_regles_calcul_methodes : règles EPM, méthodes, arbitrages
- 05_ecrans_parcours : écrans et parcours utilisateur
- 06_donnees_imports_interfaces : sources, imports, interfaces, mappings
- 07_points_ouverts_blocages : questions ouvertes et blocages
- 08_documents_sources : documents d'origine
- 09_exports_livrables : livrables générés
`
  );

  writeFileIfMissing(
    path.join(baseDir, "00_vue_ensemble", "vue_ensemble.md"),
`# Vue d'ensemble — ${projectName}

## Objectif du projet

## Contexte

## Périmètre

## Acteurs clés

## État actuel

## Dernière décision importante

## Actions en cours

## Questions ouvertes

## Points de vigilance

## Prochaine étape
`
  );

  writeFileIfMissing(
    path.join(baseDir, "02_decisions", "decisions_consolidees.md"),
`# Décisions consolidées — ${projectName}

| Date | Décision | Statut | Source | Impact |
|---|---|---|---|---|
`
  );

  writeFileIfMissing(
    path.join(baseDir, "03_actions", "plan_actions.md"),
`# Plan d'actions — ${projectName}

| Action | Responsable | Échéance | Statut | Source |
|---|---|---|---|---|
`
  );

  writeFileIfMissing(
    path.join(baseDir, "04_regles_calcul_methodes", "regles_consolidees.md"),
`# Règles / méthodes consolidées — ${projectName}

| Règle / méthode | Statut | Source | Points ouverts |
|---|---|---|---|
`
  );

  writeFileIfMissing(
    path.join(baseDir, "05_ecrans_parcours", "ecrans_consolides.md"),
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
    path.join(baseDir, "07_points_ouverts_blocages", "points_ouverts.md"),
`# Points ouverts / blocages — ${projectName}

| Date | Sujet | Statut | Responsable | Source |
|---|---|---|---|---|
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
    service: "mateo-local-backend",
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

    const meetingsDir = path.join(projectDir, "01_reunions");
    ensureDir(meetingsDir);

    const date = meetingDate || new Date().toISOString().slice(0, 10);
    const typeSlug = safeFileName(meetingType || "reunion");
    const titleSlug = safeFileName(title || "sans_titre");
    const meetingDirName = `${date}_${typeSlug}_${titleSlug}`;
    const meetingDir = path.join(meetingsDir, meetingDirName);

    ensureDir(meetingDir);
    ensureDir(path.join(meetingDir, "pieces_jointes"));

    const markdown = `# Compte-rendu — ${title || "Réunion sans titre"}

## Projet

${projectName || ""}

## Date

${date}

## Type de réunion

${meetingType || ""}

## Participants

${participants || ""}

## Contexte

${context || ""}

## Décisions prises

${decisions || ""}

## Règles / méthodes validées

${rules || ""}

## Écrans / fonctionnalités concernés

${screens || ""}

## Questions ouvertes

${openQuestions || ""}

## Actions à faire

${actions || ""}

## Risques / alertes

${risks || ""}

## Mots-clés

${keywords || ""}

## Notes brutes / transcription / marqueurs

${rawNotes || ""}
`;

    fs.writeFileSync(
      path.join(meetingDir, "compte_rendu_exporte.md"),
      markdown,
      "utf8"
    );

    fs.writeFileSync(
      path.join(meetingDir, "donnees_reunion.json"),
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
      "01_reunions",
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

app.get("/api/inbox", (req, res) => {
  try {
    ensureDir(PROJECTS_ROOT);

    const items = [];

    const projects = fs
      .readdirSync(PROJECTS_ROOT, { withFileTypes: true })
      .filter((entry) => entry.isDirectory());

    for (const project of projects) {
      const projectDir = path.join(PROJECTS_ROOT, project.name);
      const meetingsDir = path.join(projectDir, "01_reunions");

      if (!fs.existsSync(meetingsDir)) continue;

      const meetings = fs
        .readdirSync(meetingsDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory());

      for (const meeting of meetings) {
        const meetingDir = path.join(meetingsDir, meeting.name);
        const data = readJsonIfExists(path.join(meetingDir, "donnees_reunion.json"));

        const hasAudio = fs.existsSync(path.join(meetingDir, "audio_original.webm"));
        const hasReport = fs.existsSync(path.join(meetingDir, "compte_rendu_exporte.md"));
        const hasValidatedReport = fs.existsSync(path.join(meetingDir, "compte_rendu_valide.md"));
        const hasRawNotes = Boolean(data?.rawNotes && String(data.rawNotes).trim());

        let status = "À traiter";
        if (hasValidatedReport) {
          status = "Validé";
        } else if (hasReport && hasRawNotes) {
          status = "Compte-rendu à valider";
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

    const meetingDir = path.join(
      PROJECTS_ROOT,
      safeProjectSlug,
      "01_reunions",
      safeMeetingDirName
    );

    const exportedPath = path.join(meetingDir, "compte_rendu_exporte.md");
    const validatedPath = path.join(meetingDir, "compte_rendu_valide.md");

    if (!fs.existsSync(exportedPath)) {
      throw new Error("Compte-rendu exporté introuvable.");
    }

    const content = fs.readFileSync(exportedPath, "utf8");

    createFileVersion(validatedPath, "avant_validation");

    fs.writeFileSync(
      validatedPath,
      content + "\n\n---\n\nValidé dans Matéo le " + new Date().toISOString() + "\n",
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

    const meetingDir = path.join(
      PROJECTS_ROOT,
      safeProjectSlug,
      "01_reunions",
      safeMeetingDirName
    );

    const validatedPath = path.join(meetingDir, "compte_rendu_valide.md");
    const exportedPath = path.join(meetingDir, "compte_rendu_exporte.md");

    let reportPath = exportedPath;
    let reportType = "exporte";

    if (fs.existsSync(validatedPath)) {
      reportPath = validatedPath;
      reportType = "valide";
    }

    if (!fs.existsSync(reportPath)) {
      throw new Error("Aucun compte-rendu trouvé pour cette réunion.");
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
      error: error.message || "Erreur pendant la lecture du compte-rendu."
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

    const meetingDir = path.join(
      PROJECTS_ROOT,
      safeProjectSlug,
      "01_reunions",
      safeMeetingDirName
    );

    ensureDir(meetingDir);

    const exportedPath = path.join(meetingDir, "compte_rendu_exporte.md");

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
      error: error.message || "Erreur pendant l’enregistrement du compte-rendu."
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


app.listen(PORT, "127.0.0.1", () => {
  console.log(`Matéo backend lancé : http://127.0.0.1:${PORT}`);
  console.log(`Dossier données : ${DATA_ROOT}`);
});
