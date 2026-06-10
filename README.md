# Vogue Mary

## Statut du dépôt

Ce dépôt est le dépôt applicatif de **Vogue Mary**.

Vogue Mary est le produit unique. Les anciens noms ou libellés techniques doivent être progressivement remplacés par le vocabulaire Vogue Mary.

## Produit

**Vogue Mary** est un outil de mémoire projet inspiré d’un univers de navigation maritime, sans dépendre directement de l’univers One Piece.

Il sert à transformer les réunions, audios, notes, transcriptions, documents et décisions dispersés en mémoire projet navigable.

Objectif : retrouver rapidement le projet, l’escale, la décision, le document, l’action à faire et le prochain cap.

## Logique fonctionnelle à préserver

L’outil ne doit pas devenir seulement une page décorative. L’univers maritime doit servir le fonctionnement de l’outil.

Organisation cible :

1. **Pont du navire** : vue globale.
2. **Mes îles** : projets.
3. **Carte de l’île** : vue générale d’un projet.
4. **Escales** : réunions et points projet.
5. **Traces audio** : transcriptions et sources audio.
6. **Journal de bord** : comptes rendus, documents de travail et synthèses.
7. **Coffre** : documents liés au projet.
8. **Équipage** : personnes et rôles.
9. **Manœuvres** : actions à faire.
10. **Caps validés** : décisions.
11. **Longue-vue** : recherche dans la mémoire du projet.
12. **Log Pose** : synthèse du cap, prochaine direction, éléments importants à retrouver.

## Vocabulaire fonctionnel

- **Source d’escale** : informations de base, audio, marqueurs, matière brute, transcription.
- **Document de travail** : version modifiable issue d’une escale.
- **Version validée** : version figée qui sert de référence.
- **Versions précédentes** : sauvegardes automatiques permettant de revenir en arrière en cas d’erreur.

Cycle : source → travail → validé → historique.

## Règle de développement

Toute évolution graphique Vogue Mary doit conserver le moteur fonctionnel existant : projets, escales, sources, documents de travail, validation, historique, recherche, export local et continuité de la mémoire projet.

> On garde le moteur. On transforme l’expérience.

## Lien avec Azoth Studio

Dans **Azoth Studio**, Vogue Mary est le produit.

Dossier produit associé : `02_PRODUITS/VOGUE_MARY`.
