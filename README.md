# Matéo / Vogue Merry

Matéo et Vogue Merry sont associés dans ce dépôt.

- **Matéo** désigne le moteur fonctionnel : mémoire projet, réunions, sources audio, documents de travail, versions validées, recherche et traces.
- **Vogue Merry** désigne l’univers d’interface et la métaphore de navigation : pont du navire, îles/projets, escales/réunions, traces audio, journal de bord, coffre, équipage, manœuvres, caps validés, longue-vue et Log Pose.

La règle de continuité est simple : **Matéo porte la mécanique de travail, Vogue Merry porte l’univers et l’expérience utilisateur.**

## Statut Git

Le dépôt GitHub accessible et actif est : **So1968/MATEO**.

Aucun dépôt séparé nommé **VOGUE-MERRY** n’apparaît dans les dépôts GitHub accessibles à ce stade. La continuité Vogue Merry doit donc être rattachée ici, dans le dépôt **MATEO**, sauf création ultérieure d’un dépôt séparé.

## Logique fonctionnelle à préserver

L’outil ne doit pas devenir seulement une page décorative. L’univers maritime / manga d’aventure doit servir le fonctionnement de l’outil.

Organisation cible :

1. Une vue globale appelée **Pont du navire**.
2. Une entrée **Mes îles**, où chaque île correspond à un projet.
3. Dans chaque île/projet, les modes fonctionnels suivants :
   - **Carte de l’île** : vue générale du projet.
   - **Escales** : réunions.
   - **Traces audio** : transcriptions et sources audio.
   - **Journal de bord** : comptes-rendus, documents de travail et synthèses.
   - **Coffre** : documents liés au projet.
   - **Équipage** : personnes et rôles.
   - **Manœuvres** : actions à faire.
   - **Caps validés** : décisions.
   - **Longue-vue** : recherche dans la mémoire du projet.
   - **Log Pose** : synthèse du cap, prochaine direction, éléments importants à retrouver.

## Vocabulaire Matéo

Pour éviter la confusion entre les différents niveaux de travail, Matéo distingue :

- **Source de réunion** : informations de base, audio, marqueurs, matière brute, transcription.
- **Document de travail** : version modifiable issue de la réunion.
- **Version validée** : version figée qui sert de référence.
- **Versions précédentes** : sauvegardes automatiques permettant de revenir en arrière en cas d’erreur.

L’objectif est de ne pas multiplier les mots autour du compte-rendu, mais de clarifier le cycle :
source → travail → validé → historique.

## Règle de développement

Toute évolution graphique Vogue Merry doit conserver le fonctionnement Matéo : projets, réunions, sources, documents de travail, validation, historique, recherche, export local et continuité de la mémoire projet.

Autrement dit : **on ne remplace pas Matéo par Vogue Merry ; on habille Matéo avec Vogue Merry.**
