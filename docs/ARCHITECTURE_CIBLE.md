# Architecture cible de Vogue Marry

## Principe

Vogue Marry est un outil local de mémoire projet. L'interface maritime est une manière de naviguer dans les données ; elle ne doit jamais remplacer les vraies données.

Le parcours fonctionnel de référence est :

**Projet → Escale → Source / audio → Transcription → Journal de bord → Validation → Mémoire → Reprise du cap**

## Sources de vérité

Les données utilisateur ne vivent pas dans le code React.

Elles vivent dans :

`~/VOGUE-MERRY-DONNEES`

Le dépôt Git contient le moteur, les composants, les règles et la documentation technique. Il ne contient pas les dossiers réels de l'utilisateur, les audios, les transcriptions de travail ni les secrets.

## Frontend

L'application doit évoluer vers des fonctions séparées :

- `projects` : projets / îles ;
- `meetings` : escales et mode réunion ;
- `transcription` : audio, texte et interlocuteurs ;
- `journal` : compte rendu de travail, validation, historique ;
- `documents` : coffre ;
- `search` : Longue-vue ;
- `resume` : Log Pose et reprise du contexte.

Pendant la migration, l'écran actuel reste fonctionnel : on extrait les fonctions progressivement au lieu de refaire l'application d'un seul coup.

## Backend local

### API locale unifiée — port 8010

Responsabilités :

- projets ;
- escales ;
- journaux ;
- versions ;
- coffre / dépôt ;
- recherche ;
- validation ;
- accès aux transcriptions ;
- confirmation des interlocuteurs ;
- identification et suivi des besoins.

Le service doit écouter uniquement sur `127.0.0.1`.

L'interface ne connaît que cette adresse. Elle ne contacte jamais directement le moteur de transcription.

### Moteur de transcription V6 — port interne 8011

Responsabilités :

- Faster-Whisper local ;
- Pyannote local ;
- récupération des participants d'une escale ;
- structuration des interventions ;
- cache anti-double lancement ;
- seconde lecture OpenAI uniquement sur demande explicite.

Le moteur écoute uniquement sur `127.0.0.1` et n'est accessible que par la façade 8010. Il reste séparé parce que Faster-Whisper et Pyannote sont lourds et doivent pouvoir travailler sans bloquer l'API mémoire.

### Confirmation des interlocuteurs — exposée par 8010

La confirmation est exécutée par le moteur V6, mais elle passe par la façade unifiée :
`POST /api/transcription/:jobId/speakers`.

Il n'existe plus de service séparé ni de port 8012. La pile locale visible par l'interface se limite à 8010 ; 8011 reste un port interne de travail.

## Règles de sécurité

- aucun service métier exposé sur le réseau local ;
- CORS limité aux origines de développement locales ;
- aucun secret dans Git ni dans le navigateur ;
- clés enregistrées uniquement dans `~/.config/vogue-merry/` avec permissions restreintes ;
- chemins utilisateurs résolus sous une racine connue avant lecture ou écriture ;
- limites explicites sur les uploads ;
- une opération payante ne doit pas pouvoir partir deux fois pour la même demande ;
- le mode local reste le mode par défaut.

## Règles de confiance pour les interlocuteurs

Un nom ne doit être associé automatiquement à une voix que lorsque la personne s'identifie elle-même de manière explicite, par exemple :

- « je suis … » ;
- « je m'appelle … » ;
- « moi c'est … » ;
- « mon nom est … ».

Une salutation contenant le nom d'un tiers ne constitue pas une preuve d'identité.

Le nombre de participants d'une escale est une information de contexte, pas l'obligation pour le moteur de détecter exactement le même nombre de voix.

Quand l'identité reste incertaine, Vogue Marry conserve `Intervenant N` et demande confirmation.

## Règle Git

- `main` : stable ;
- une branche de consolidation / développement active ;
- une fonctionnalité importante doit être testée avant intégration ;
- les anciennes versions restent dans l'historique Git au lieu de rester dans le code actif ;
- les branches d'archive ne sont jamais fusionnées dans le produit courant.
