# Consolidation Vogue Marry — septembre 2026

## But

Remettre Vogue Marry sur un tronc lisible, sûr et testable avant toute nouvelle extension fonctionnelle.

## Branche de travail

`consolidation/vogue-marry-2026-09`

Cette branche part de l'état fonctionnel le plus récent de `agent/stabilise-structure-ecran`.

`main` reste intacte jusqu'à validation complète de la consolidation.

## Règles de consolidation

1. Une seule version active de chaque moteur.
2. Les anciennes expérimentations restent accessibles dans l'historique Git, pas dans le code actif.
3. Les données utilisateur restent hors du dépôt, dans `~/VOGUE-MERRY-DONNEES`.
4. Les services locaux écoutent uniquement sur la boucle locale.
5. Les opérations payantes sont explicites et protégées contre les doubles lancements.
6. L'interface doit progressivement afficher les vraies données du moteur plutôt qu'une maquette statique.
7. Le parcours cible reste : projet → escale → source/audio → transcription → journal → validation → mémoire.

## Architecture cible

Le détail est dans `docs/ARCHITECTURE_CIBLE.md`.

Pendant la consolidation :

- `backend/server.js` : API locale principale et mémoire projet ;
- `backend/transcription-server-v6.js` : unique moteur de transcription actif ;
- `backend/speaker-sync-server.js` : service temporaire de confirmation des interlocuteurs, à absorber ensuite dans le moteur de transcription ;
- `backend/local_transcribe.py` : Faster-Whisper ;
- `backend/local_diarize.py` : Pyannote.

## État au 19 septembre 2026

### Fait

- [x] création de la branche de consolidation ;
- [x] `main` conservée intacte et `agent/stabilise-structure-ecran` figée comme référence historique ;
- [x] pull request de consolidation ouverte en brouillon vers `main` ;
- [x] suppression du code actif des anciens moteurs de transcription V1 à V5 ;
- [x] suppression des pages de démonstration obsolètes du dossier `public/` ;
- [x] ports 8010, 8011 et 8012 limités à `127.0.0.1` ;
- [x] CORS limité aux origines locales de Vogue Marry ;
- [x] validation renforcée des chemins côté API principale et transcription ;
- [x] limites d'upload ajoutées ;
- [x] détection de l'audio d'une escale corrigée pour toutes les extensions `audio_original.*` ;
- [x] protection contre deux lancements simultanés d'une transcription identique ;
- [x] Pyannote ne force plus le nombre de voix à partir du seul nombre de participants ;
- [x] attribution automatique des noms limitée aux présentations explicites de soi ;
- [x] suppression de l'attribution automatique « par élimination » ;
- [x] suppression du patch global de `Storage.prototype.setItem` ;
- [x] confirmation des interlocuteurs enregistrée explicitement via le service local ;
- [x] consentement explicite obligatoire avant l'envoi d'un audio, du contexte et des noms vers OpenAI ;
- [x] Multer mis à jour et verrouillé en `2.4.0` et `package-lock.json` régénéré ;
- [x] nom du paquet harmonisé en `vogue-merry` dans le lockfile ;
- [x] versions frontend auparavant déclarées en `latest` verrouillées sur les versions déjà validées par le lockfile ;
- [x] garde-fous automatisés ajoutés pour empêcher une régression de Multer ou un retour à `latest` ;
- [x] tests de garde-fou ajoutés avec `node:test` ;
- [x] CI GitHub : `npm ci`, syntaxe Node/Python, tests et build frontend ;
- [x] workflows temporaires de migration retirés après usage ;
- [x] CI complète réussie après les migrations techniques.

### À faire avant intégration

- [x] service de confirmation des interlocuteurs absorbé dans `transcription-server-v6.js` ; le port 8012 a été supprimé ;
- [x] dépendances Python directes centralisées dans `requirements-transcription.txt` ;
- [ ] ajouter un vrai lint du frontend ;
- [ ] ajouter des tests fonctionnels des routes locales, au-delà des garde-fous statiques ;
- [ ] connecter progressivement l'interface aux vraies données du backend ;
- [ ] faire tourner les tests locaux sur le poste de développement ;
- [ ] tester une courte transcription locale sans appel API payant.

## Priorités suivantes

### P0 — terminer la consolidation technique

1. Retester CI après suppression du service 8012.
2. Ajouter lint et approfondir les tests fonctionnels des routes.
3. Valider une transcription locale courte sur le poste réel.

### P1 — validation sur le poste réel

1. `npm ci`, `npm test`, `npm run build` sur le poste de développement.
2. Vérifier que les services répondent uniquement en boucle locale.
3. Tester la récupération d'un job identique sans double lancement.
4. Tester une courte transcription locale gratuite.
5. Tester ensuite le contrôle renforcé uniquement sur un échantillon choisi.

### P2 — réunification produit

1. Brancher le Pont et les Îles sur `/api/projects`.
2. Brancher Escales sur les vraies réunions.
3. Brancher Longue-vue sur `/api/search`.
4. Intégrer `MeetingMode` au parcours Escale.
5. Relier transcription → journal de bord → validation.
6. Faire du Log Pose une vraie reprise de contexte.

## Condition avant intégration dans `main`

- CI verte ;
- tests locaux des routes critiques ;
- build local réussi ;
- test court de transcription locale sans API payante ;
- test explicite du mode contrôle renforcé sur un échantillon choisi ;
- aucune donnée ou clé sensible dans Git ;
- revue finale des changements entre `main` et la branche de consolidation.

## Branches

- `main` : futur tronc stable, encore ancien pour le moment ;
- `consolidation/vogue-marry-2026-09` : seule branche active de consolidation ;
- `agent/stabilise-structure-ecran` : point de sauvegarde historique, ne plus développer dessus ;
- `archive/rustines-esthetiques-20260731` : archive, ne pas fusionner dans le produit.
