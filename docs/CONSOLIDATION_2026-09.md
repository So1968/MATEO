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

### Backend pendant la consolidation

- `backend/server.js` : API locale principale et mémoire projet
- `backend/transcription-server-v6.js` : unique moteur de transcription actif
- `backend/speaker-sync-server.js` : service temporaire de confirmation des interlocuteurs, à absorber ensuite dans l'API principale
- `backend/local_transcribe.py` : Faster-Whisper
- `backend/local_diarize.py` : Pyannote

## État au 19 septembre 2026

### Fait

- [x] création de la branche de consolidation à partir de l'état fonctionnel le plus récent ;
- [x] `main` et `agent/stabilise-structure-ecran` conservées intactes comme références ;
- [x] suppression du code actif des anciens moteurs de transcription V1 à V5 ;
- [x] suppression des deux pages de démonstration obsolètes du dossier `public/` ;
- [x] ports 8010, 8011 et 8012 limités à `127.0.0.1` ;
- [x] CORS limité aux origines locales de Vogue Marry ;
- [x] validation renforcée des chemins côté API principale et endpoints de transcription ;
- [x] limite d'upload ajoutée à l'API principale ;
- [x] détection de l'audio d'une escale corrigée pour accepter les extensions autres que `.webm` ;
- [x] protection contre deux lancements simultanés d'une même transcription grâce au cache des jobs actifs ;
- [x] Pyannote ne reçoit plus un nombre de voix forcé à partir du seul nombre de participants ;
- [x] attribution automatique des noms durcie : seule une présentation explicite de soi peut produire une association automatique ;
- [x] suppression de l'attribution automatique d'un dernier nom « par élimination ».

### À faire avant intégration

- [ ] mettre Multer à jour vers une version corrigée et régénérer proprement `package-lock.json` ;
- [ ] remplacer le patch global de `Storage.prototype.setItem` par une sauvegarde explicite ;
- [ ] absorber `speaker-sync-server.js` dans une API locale unique ;
- [ ] verrouiller les dépendances JavaScript et Python ;
- [ ] ajouter lint, tests et CI ;
- [ ] connecter progressivement l'interface aux vraies données du backend ;
- [ ] faire tourner le build et les tests sur le poste de développement ;
- [ ] tester une courte transcription locale sans appel API payant.

## Priorités suivantes

### P0 — terminer la sécurité et la stabilité

1. Mise à jour de Multer + lockfile.
2. Test local des trois services sur le poste réel.
3. Vérification que les ports ne répondent qu'en boucle locale.
4. Test de duplication d'un même job sans double lancement.

### P1 — simplification technique

1. Remplacer le patch global de `Storage.prototype.setItem` par une sauvegarde explicite.
2. Réduire les services Node vers une API locale cohérente.
3. Verrouiller les dépendances JS et Python.
4. Ajouter lint, tests et CI.

### P2 — réunification produit

1. Brancher le Pont et les Îles sur `/api/projects`.
2. Brancher Escales sur les vraies réunions.
3. Brancher Longue-vue sur `/api/search`.
4. Intégrer `MeetingMode` au parcours Escale.
5. Relier transcription → journal de bord → validation.
6. Faire du Log Pose une vraie reprise de contexte.

## Condition avant intégration dans `main`

- build réussi ;
- tests locaux des routes critiques ;
- test court de transcription locale sans API payante ;
- test explicite du mode sensible sur un échantillon choisi ;
- aucune donnée ou clé sensible dans Git ;
- revue finale des changements entre `main` et la branche de consolidation.

## Branches

- `main` : futur tronc stable, encore ancien pour le moment ;
- `consolidation/vogue-marry-2026-09` : seule branche sur laquelle poursuivre la consolidation ;
- `agent/stabilise-structure-ecran` : point de sauvegarde historique, ne plus développer dessus ;
- `archive/rustines-esthetiques-20260731` : archive, ne pas fusionner dans le produit.
