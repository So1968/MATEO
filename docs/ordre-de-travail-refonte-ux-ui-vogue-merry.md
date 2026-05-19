# Ordre de travail développeur — Refonte UX/UI Vogue Merry

## 1. Décision produit

**Vogue Merry** est le produit unique.

Objectif : transformer l’application actuelle en véritable outil métier Vogue Merry, avec une interface claire, rapide, professionnelle et cohérente avec l’univers de navigation.

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

Contient : menu principal, en-tête, zone de contenu, accès rapide au Log Pose.

Priorité : haute.

### 5.2 `PontDuNavire`

Rôle : dashboard d’accueil.

Contient : résumé global, alertes, dernières escales, actions prioritaires, Log Pose global.

Priorité : haute.

### 5.3 `IslandCard`

Rôle : carte d’une île / projet.

Contient : nom, statut, dernière escale, prochaine manœuvre, alertes, accès rapide.

Priorité : haute.

### 5.4 `CarteDeLIle`

Rôle : page de détail projet.

Contient : fiche contexte, équipage, escales récentes, caps validés, manœuvres, coffre, Log Pose projet.

Priorité : moyenne à haute.

### 5.5 `EscaleEditor`

Rôle : fiche réunion / escale.

À extraire depuis la partie formulaire actuelle de `App.jsx`.

Sections : informations de l’escale, équipage, traces audio, journal de bord, caps validés, manœuvres, questions/blocages, export/validation.

Priorité : haute.

### 5.6 `LogPoseCard`

Rôle : synthèse de cap.

Doit répondre à : où en est-on, ce qui est décidé, ce qui bloque, les prochaines manœuvres, les documents à retrouver, la prochaine direction utile.

Priorité : très haute.

### 5.7 `LongueVueSearch`

Rôle : recherche dans la mémoire projet.

Améliorations attendues : champ recherche plus visible, filtres par île/projet, filtres par type, résultats avec contexte, bouton ouvrir dans le projet.

Priorité : moyenne.

### 5.8 `StatusBadge`

Rôle : badges homogènes.

Statuts : À traiter, En cours, À vérifier, Bloqué, Urgent, Validé, Terminé, Archivé.

Priorité : haute.

### 5.9 `CoffreDocumentCard`

Rôle : carte document.

Contient : nom, type, projet lié, statut, date, source, tags, lien vers escale ou décision.

Priorité : moyenne.

### 5.10 `ManoeuvreItem`

Rôle : action / tâche.

Contient : action, responsable, échéance, statut, source, décision liée.

Priorité : moyenne à haute.

### 5.11 `CapValideItem`

Rôle : décision validée.

Contient : décision, date, source, impact, statut.

Priorité : moyenne à haute.

---

## 6. Priorités de développement

### Priorité 1 — Stabilisation immédiate

- Supprimer les anciens libellés visibles.
- Vérifier que `VOGUE-MERRY-DONNEES` fonctionne.
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

## 7. Définition de terminé

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
