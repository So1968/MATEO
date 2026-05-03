import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import os from "os";

const app = express();
const PORT = 8010;

const HOME = os.homedir();
const DATA_ROOT = path.join(HOME, "MATEO-DONNEES");
const PROJECTS_ROOT = path.join(DATA_ROOT, "01_PROJETS");

app.use(cors());
app.use(express.json());

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

app.listen(PORT, "127.0.0.1", () => {
  console.log(`Matéo backend lancé : http://127.0.0.1:${PORT}`);
  console.log(`Dossier données : ${DATA_ROOT}`);
});
