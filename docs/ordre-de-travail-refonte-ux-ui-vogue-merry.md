# Ordre de travail développeur — Refonte UX/UI Vogue Merry

## 1. Décision produit

**Vogue Merry** est le produit unique.

**Matéo** est l’ancien nom du prototype technique et le socle applicatif de départ.

Objectif : transformer l’application actuelle en véritable outil métier Vogue Merry, sans perdre le moteur existant : projets, réunions, audio, documents, validation, recherche et export local.

Règle centrale :

> On ne fait pas une décoration pirate. On construit une interface métier claire, rapide et professionnelle, portée par une métaphore de navigation.

---

## 2. Objectif ergonomique général

L’utilisateur doit comprendre en moins de 10 secondes :

- où il est ;
- quel projet / île est actif ;
- quelle réunion / escale est sélectionnée ;
- ce qui est décidé ;
- ce qui reste à faire ;
- ce qui bloque ;
- où chercher une information ;
- quelle est la prochaine action utile.

L’interface doit rester utilisable par une personne fatiguée, pressée, non experte ou qui revient après plusieurs jours.

---

## 3. Diagnostic de l’interface actuelle

### A. Problèmes repérés

- La page actuelle mélange plusieurs zones importantes sur un même écran sans hiérarchie suffisante.
- Le Log Pose est présent comme titre, mais pas encore comme vrai composant de synthèse décisionnelle.
- La logique Vogue Merry est partiellement présente dans les libellés, mais pas encore dans l’architecture d’écran.
- Les projets / îles, les réunions / escales, les documents et les actions ne sont pas encore clairement séparés en modules réutilisables.
- La recherche existe, mais elle doit devenir une vraie **Longue-vue** avec filtres, contexte et résultats plus lisibles.
- Le bloc d’export local doit être raccordé à la logique **VOGUE-MERRY-DONNEES**.
- Les statuts visuels sont encore trop simples pour guider l’utilisateur.
- Les formulaires sont fonctionnels, mais longs : il faut mieux les regrouper.

### B. Risques pour l’utilisateur

- Se perdre entre projets, réunions et documents.
- Ne pas comprendre quoi faire ensuite.
- Oublier une décision ou une action.
- Saisir au mauvais endroit.
- Ne pas retrouver une information.
- Confondre document de travail, version validée et traces brutes.
- Se fatiguer face à un écran trop dense.

### C. Objectif ergonomique

Créer une interface en trois niveaux :

1. **Pont du navire** : vue globale.
2. **Île / projet** : vue structurée d’un projet.
3. **Escale / réunion** : saisie, traces, journal et extraction des décisions/actions.

---

## 4. Nouvelle architecture cible

### Niveau 1 — Pont du navire

Page d’accueil / tableau de bord global.

Doit afficher :

- nombre d’îles / projets actifs ;
- dernières escales ;
- journaux de bord à reprendre ;
- manœuvres ouvertes ;
- caps validés récents ;
- alertes ;
- accès rapide à la Longue-vue ;
- Log Pose global.

### Niveau 2 — Mes îles

Liste des projets.

Chaque île doit afficher :

- nom du projet ;
- statut ;
- dernière escale ;
- nombre d’escales ;
- nombre de manœuvres ouvertes ;
- dernière décision ;
- prochaine direction.

### Niveau 3 — Carte de l’île

Vue projet.

Doit afficher :

- contexte ;
- équipe / équipage ;
- dernières escales ;
- caps validés ;
- manœuvres ;
- coffre documentaire ;
- Log Pose du projet.

### Niveau 4 — Escale / réunion

Vue de saisie et structuration.

Doit afficher :

- informations de base ;
- participants ;
- traces audio ;
- transcription / notes brutes ;
- journal de bord ;
- caps validés ;
- manœuvres ;
- questions ouvertes ;
- export / validation.

---

## 5. Composants à créer ou extraire

### 5.1 `AppShell`

Rôle : structure globale.

Contient :

- menu principal ;
- en-tête ;
- zone de contenu ;
- accès rapide au Log Pose.

À faire :

- extraire la structure globale depuis `App.jsx` ;
- éviter que `App.jsx` contienne toute l’interface ;
- préparer un routage simple plus tard.

Priorité : haute.

---

### 5.2 `PontDuNavire`

Rôle : dashboard d’accueil.

Contient :

- résumé global ;
- alertes ;
- dernières escales ;
- actions prioritaires ;
- Log Pose global.

Priorité : haute.

---

### 5.3 `IslandCard`

Rôle : carte d’une île / projet.

Contient :

- nom ;
- statut ;
- dernière escale ;
- prochaine manœuvre ;
- alertes ;
- accès rapide.

Priorité : haute.

---

### 5.4 `CarteDeLIle`

Rôle : page de détail projet.

Contient :

- fiche contexte ;
- équipage ;
- escales récentes ;
- caps validés ;
- manœuvres ;
- coffre ;
- Log Pose projet.

Priorité : moyenne à haute.

---

### 5.5 `EscaleEditor`

Rôle : fiche réunion / escale.

À extraire depuis la partie formulaire actuelle de `App.jsx`.

Doit être découpé en sous-sections :

- Informations de l’escale ;
- Équipage ;
- Traces audio ;
- Journal de bord ;
- Caps validés ;
- Manœuvres ;
- Questions / blocages ;
- Export / validation.

Priorité : haute.

---

### 5.6 `LogPoseCard`

Rôle : synthèse de cap.

Doit répondre à :

- où en est-on ?
- ce qui est décidé ;
- ce qui bloque ;
- les prochaines manœuvres ;
- les documents à retrouver ;
- la prochaine direction utile.

Priorité : très haute.

Le Log Pose ne doit pas être décoratif : c’est le cœur ergonomique de Vogue Merry.

---

### 5.7 `LongueVueSearch`

Rôle : recherche dans la mémoire projet.

Améliorations attendues :

- champ recherche plus visible ;
- filtres par île / projet ;
- filtres par type : escale, journal, cap, manœuvre, document ;
- résultats avec contexte ;
- bouton “ouvrir dans le projet”.

Priorité : moyenne.

---

### 5.8 `StatusBadge`

Rôle : badges homogènes.

Statuts à prévoir :

- À traiter ;
- En cours ;
- À vérifier ;
- Bloqué ;
- Urgent ;
- Validé ;
- Terminé ;
- Archivé.

Priorité : haute.

---

### 5.9 `CoffreDocumentCard`

Rôle : carte document.

Contient :

- nom du document ;
- type ;
- projet lié ;
- statut ;
- date ;
- source ;
- tags ;
- lien vers escale ou décision.

Priorité : moyenne.

---

### 5.10 `ManoeuvreItem`

Rôle : action / tâche.

Contient :

- action ;
- responsable ;
- échéance ;
- statut ;
- source ;
- décision liée.

Priorité : moyenne à haute.

---

### 5.11 `CapValideItem`

Rôle : décision validée.

Contient :

- décision ;
- date ;
- source ;
- impact ;
- statut.

Priorité : moyenne à haute.

---

## 6. Checklist écran par écran

## Écran 1 — Pont du navire

### A. Problèmes repérés

L’accueil actuel est surtout une page de travail directe. Il manque une vraie vue globale.

### B. Risques pour l’utilisateur

L’utilisateur arrive dans l’outil sans savoir ce qui est prioritaire.

### C. Objectif ergonomique

Donner une vision immédiate : projets actifs, réunions à reprendre, actions, décisions, alertes.

### D. Nouvelle organisation proposée

1. Bandeau “Pont du navire”.
2. Log Pose global à droite.
3. Grille des îles / projets.
4. Bloc “À reprendre”.
5. Bloc “Manœuvres urgentes”.
6. Bloc “Caps récents”.
7. Longue-vue rapide.

### E. Recommandations UI

- Fond clair parchemin très léger.
- Cartes blanches ou sable clair.
- Accent bleu océan.
- Or uniquement pour Log Pose et décisions importantes.

### F. Recommandations techniques

Créer `PontDuNavire.jsx`.
Calculer les compteurs à partir de `data.projects`.
Prévoir des props simples : `projects`, `reports`, `actions`, `decisions`.

### G. Version développeur

Créer un dashboard d’accueil qui remplace le haut de page actuel et affiche les priorités globales avant les formulaires.

---

## Écran 2 — Mes îles

### A. Problèmes repérés

La liste des projets existe, mais elle est encore trop simple.

### B. Risques pour l’utilisateur

Ne pas savoir quel projet reprendre ni pourquoi.

### C. Objectif ergonomique

Faire de chaque projet une carte lisible avec état, dernière activité et prochaine action.

### D. Nouvelle organisation proposée

Chaque carte île contient :

- nom ;
- statut ;
- dernière escale ;
- nombre de journaux ;
- manœuvres ouvertes ;
- prochain cap.

### E. Recommandations UI

Carte avec petit repère visuel d’île, mais très sobre.
Badge statut visible.
Action principale : “Ouvrir l’île”.

### F. Recommandations techniques

Créer `IslandCard.jsx`.
Remplacer progressivement les boutons actuels de `projectList` par ce composant.

### G. Version développeur

Transformer la liste de projets en cartes d’îles métier avec statut et prochaine action.

---

## Écran 3 — Carte de l’île

### A. Problèmes repérés

Il n’existe pas encore de vraie page projet synthétique.

### B. Risques pour l’utilisateur

Être obligé de lire les réunions une par une pour comprendre l’état du projet.

### C. Objectif ergonomique

Faire une page projet qui donne le contexte, l’état, les décisions, les tâches et le prochain cap.

### D. Nouvelle organisation proposée

1. En-tête projet.
2. Log Pose projet.
3. Dernières escales.
4. Caps validés.
5. Manœuvres.
6. Coffre.
7. Équipage.

### E. Recommandations UI

Page en deux colonnes sur ordinateur :

- gauche : contenus et listes ;
- droite : Log Pose / alertes / actions rapides.

Sur mobile : empilement vertical.

### F. Recommandations techniques

Créer `CarteDeLIle.jsx`.
Préparer des sous-composants réutilisables.

### G. Version développeur

Créer une vraie vue projet avant la fiche réunion.

---

## Écran 4 — Escale / réunion

### A. Problèmes repérés

Le formulaire est long et tout est affiché en continu.

### B. Risques pour l’utilisateur

Fatigue, erreurs de saisie, difficulté à repérer les décisions et actions.

### C. Objectif ergonomique

Découper la fiche en sections claires.

### D. Nouvelle organisation proposée

Sections :

1. Informations de l’escale.
2. Équipage.
3. Traces audio.
4. Journal de bord.
5. Caps validés.
6. Manœuvres.
7. Questions ouvertes.
8. Export / validation.

### E. Recommandations UI

Utiliser des accordéons ou blocs pliables.
Toujours garder visibles : projet actif, titre, statut, bouton enregistrer/exporter.

### F. Recommandations techniques

Extraire le formulaire actuel dans `EscaleEditor.jsx`.
Créer des composants de sections.
Garder les champs actuels pour ne pas casser la structure de données.

### G. Version développeur

Ne pas supprimer les champs actuels : les regrouper et les renommer visuellement.

---

## Écran 5 — Longue-vue

### A. Problèmes repérés

La recherche est présente mais simple.

### B. Risques pour l’utilisateur

Trop de résultats, pas assez de contexte.

### C. Objectif ergonomique

Retrouver vite une information sans connaître son emplacement.

### D. Nouvelle organisation proposée

- Recherche globale.
- Filtre projet.
- Filtre type.
- Résultat avec titre, projet, date, extrait, action d’ouverture.

### E. Recommandations UI

Résultats sous forme de cartes compactes.
Mettre en évidence le mot recherché si possible.

### F. Recommandations techniques

Créer `LongueVueSearch.jsx`.
Préparer compatibilité avec `/api/search`.

### G. Version développeur

Transformer la recherche actuelle en vraie page/module Longue-vue.

---

## Écran 6 — Log Pose

### A. Problèmes repérés

Le Log Pose est surtout un titre. Il doit devenir un vrai outil.

### B. Risques pour l’utilisateur

Ne pas savoir quoi faire après une réunion ou après une reprise de projet.

### C. Objectif ergonomique

Afficher la prochaine direction utile.

### D. Nouvelle organisation proposée

Bloc avec 5 zones :

- Ce qu’il faut retenir ;
- Caps validés ;
- Manœuvres prioritaires ;
- Points bloqués ;
- Prochaine direction.

### E. Recommandations UI

Carte premium sobre : bleu profond + or boussole.
Très lisible.
Toujours courte.

### F. Recommandations techniques

Créer `LogPoseCard.jsx`.
Dans un premier temps, alimenter manuellement depuis les champs existants : décisions, actions, questions, risques.

### G. Version développeur

Créer un composant Log Pose qui synthétise les champs déjà présents.

---

## 7. Palette UI recommandée

```txt
--ocean-deep: #0B2545;
--ocean: #123C69;
--horizon: #2E6F95;
--parchment: #FFF7E6;
--sand: #F4E3C1;
--wood: #8B5E34;
--compass-gold: #D6A84F;
--danger: #C94B4B;
--success: #3E8F6B;
--warning: #D88932;
--ink: #2D2D2D;
--mist: #EEF1F4;
```

---

## 8. Règles UI

- Le bleu océan structure l’interface.
- Le parchemin sert aux zones de lecture.
- L’or sert aux décisions, caps et Log Pose.
- Le rouge est réservé aux vraies urgences.
- Les textures doivent rester très légères.
- Les formulaires doivent rester sur fond clair.
- Les tableaux doivent rester simples, lisibles et non décoratifs.
- Les icônes doivent aider à reconnaître, pas décorer.

---

## 9. Règles responsive

### Ordinateur

Disposition recommandée :

- menu latéral gauche ;
- contenu central ;
- panneau droit Log Pose / alertes.

### Mobile

Disposition recommandée :

- titre compact ;
- bouton action principale ;
- cartes empilées ;
- menu en tiroir ou barre basse ;
- Log Pose accessible par bouton flottant ou bloc en haut.

---

## 10. Priorités de développement

### Priorité 1 — Stabilisation immédiate

- Terminer les derniers libellés visibles MATEO → VOGUE-MERRY.
- Vérifier que `VOGUE-MERRY-DONNEES` fonctionne.
- Conserver compatibilité avec `MATEO-DONNEES`.
- Tester `npm run dev:all`.

### Priorité 2 — Extraction composants

- `AppShell`
- `PontDuNavire`
- `IslandCard`
- `EscaleEditor`
- `LogPoseCard`
- `StatusBadge`

### Priorité 3 — Refonte projet

- `CarteDeLIle`
- `LongueVueSearch`
- `ManoeuvreItem`
- `CapValideItem`
- `CoffreDocumentCard`

### Priorité 4 — Finition UI

- palette ;
- responsive ;
- micro-animations ;
- états vides ;
- messages erreur / confirmation.

---

## 11. Commandes complètes de vérification

Depuis PowerShell :

```powershell
cd C:\DEV\MATEO
Get-Location
dir
dir package.json
npm run dev:all
```

Si le dossier a été renommé localement plus tard :

```powershell
cd C:\DEV\VOGUE-MERRY
Get-Location
dir
dir package.json
npm run dev:all
```

Si le bon dossier est inconnu :

```powershell
cd C:\DEV
Get-Location
dir
Get-ChildItem -Path "C:\DEV" -Recurse -Filter package.json -ErrorAction SilentlyContinue |
  Where-Object { $_.FullName -notmatch "\\node_modules\\" } |
  Select-Object FullName
```

---

## 12. Définition de terminé

La refonte est considérée comme réussie quand :

- l’accueil affiche un vrai Pont du navire ;
- les projets sont visibles comme Mes îles ;
- chaque projet a une Carte de l’île ;
- les réunions sont gérées comme Escales ;
- le Journal de bord est clair ;
- les décisions sont visibles comme Caps validés ;
- les tâches sont visibles comme Manœuvres ;
- la recherche devient Longue-vue ;
- le Log Pose indique réellement la prochaine direction ;
- l’utilisateur peut travailler sans se demander où cliquer.
