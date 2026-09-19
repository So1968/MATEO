# Consolidation Vogue Marry — septembre 2026

## But

Remettre Vogue Marry sur un tronc lisible et sûr avant toute nouvelle extension fonctionnelle.

## Branche de travail

`consolidation/vogue-marry-2026-09`

Cette branche part de l'état fonctionnel le plus récent de `agent/stabilise-structure-ecran`.

`main` reste intacte jusqu'à validation de la consolidation.

## Règles de consolidation

1. Une seule version active de chaque moteur.
2. Les anciennes expérimentations restent accessibles dans l'historique Git ; elles ne restent pas dans le code actif.
3. Les données utilisateur restent hors du dépôt, dans `~/VOGUE-MERRY-DONNEES`.
4. Les services locaux doivent écouter uniquement sur la boucle locale.
5. Les opérations payantes doivent être explicites et protégées contre les doubles lancements.
6. L'interface doit afficher les vraies données du moteur au lieu de dupliquer une maquette statique.
7. Le parcours cible reste : projet → escale → source/audio → transcription → journal → validation → mémoire.

## Architecture cible

### Frontend

- `src/app/` : coque et navigation
- `src/features/projects/` : îles / projets
- `src/features/meetings/` : escales et mode réunion
- `src/features/transcription/` : transcription et interlocuteurs
- `src/features/journal/` : journal de bord, validation, versions
- `src/features/search/` : Longue-vue
- `src/features/documents/` : Coffre
- `src/components/` : composants partagés

La migration vers cette structure doit se faire progressivement, sans casser l'écran actuel.

### Backend

- `backend/server.js` : API locale principale et mémoire projet
- `backend/transcription-server-v6.js` : moteur de transcription actif pendant la consolidation
- `backend/speaker-sync-server.js` : service temporaire de confirmation des interlocuteurs, à absorber ensuite dans l'API principale
- `backend/local_transcribe.py` : Faster-Whisper
- `backend/local_diarize.py` : Pyannote

## Priorités

### P0 — sécurité et stabilité

- lier les services 8010 / 8011 / 8012 à `127.0.0.1` ;
- limiter CORS aux origines locales de Vogue Marry ;
- mettre à jour Multer ;
- durcir la validation des chemins et les limites d'upload ;
- protéger les appels payants contre les doubles lancements simultanés.

### P1 — simplification technique

- ne conserver que la V6 de transcription dans le code actif ;
- supprimer les pages de test obsolètes du build public ;
- remplacer le patch global de `Storage.prototype.setItem` par une sauvegarde explicite ;
- réduire les trois services Node vers une API locale cohérente ;
- verrouiller les dépendances JS et Python ;
- ajouter lint, tests et CI.

### P2 — réunification produit

- brancher le Pont et les Îles sur `/api/projects` ;
- brancher Escales sur les vraies réunions ;
- brancher Longue-vue sur `/api/search` ;
- intégrer `MeetingMode` au parcours Escale ;
- relier transcription → journal de bord → validation ;
- faire du Log Pose une vraie reprise de contexte.

## Condition avant intégration dans `main`

- build réussi ;
- tests locaux des routes critiques ;
- test court de transcription locale sans API payante ;
- test explicite du mode sensible sur un échantillon choisi ;
- aucune donnée ou clé sensible dans Git ;
- revue finale des changements entre `main` et la branche de consolidation.

## État initial

La branche historique `agent/stabilise-structure-ecran` reste intacte comme point de sauvegarde. La branche d'archive reste une archive et ne sera pas fusionnée dans le produit.
