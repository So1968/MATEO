# Vogue Merry

## Statut du dépôt

Ce dépôt est le dépôt applicatif actuel de **Vogue Merry**.

Ancien nom du prototype technique : **Matéo**.

Le prototype Matéo devient le socle technique de Vogue Merry. Il n’est plus traité comme un projet séparé.

Règle de fusion :

> On ne maintient pas deux produits. On transforme le prototype Matéo en produit Vogue Merry.

## Produit

**Vogue Merry** est un outil de mémoire projet inspiré d’un univers de navigation maritime et de manga d’aventure.

Il sert à transformer les réunions, audios, notes, transcriptions, documents et décisions dispersés en mémoire projet navigable.

Objectif : retrouver rapidement le projet, la réunion, la décision, le document, l’action à faire et le prochain cap.

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

## Vocabulaire technique hérité de Matéo

À conserver comme vocabulaire fonctionnel interne :

- **Source de réunion** : informations de base, audio, marqueurs, matière brute, transcription.
- **Document de travail** : version modifiable issue de la réunion.
- **Version validée** : version figée qui sert de référence.
- **Versions précédentes** : sauvegardes automatiques permettant de revenir en arrière en cas d’erreur.

Cycle : source → travail → validé → historique.

## Règle de développement

Toute évolution graphique Vogue Merry doit conserver le moteur fonctionnel existant : projets, réunions, sources, documents de travail, validation, historique, recherche, export local et continuité de la mémoire projet.

Autrement dit :

> On garde le moteur. On transforme l’expérience.

## Lien avec Azoth Studio

Dans **Azoth Studio**, Vogue Merry est le produit.

Dossier produit associé :

`02_PRODUITS/VOGUE_MERRY`

Le dépôt actuel reste **So1968/MATEO** pendant la transition.

Renommage possible plus tard : **So1968/MATEO** → **So1968/VOGUE-MERRY**, uniquement après vérification que rien ne casse.

## Lancement local

```powershell
cd C:\DEV\MATEO
Get-Location
dir
npm run dev
```

Pour lancer aussi le backend local :

```powershell
cd C:\DEV\MATEO
Get-Location
dir
npm run dev:all
```
