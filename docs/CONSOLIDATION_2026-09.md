# Consolidation Vogue Marry — septembre 2026

## Statut

**Consolidation intégrée dans `main` le 19 septembre 2026.**

Commit de rassemblement : `75c0c729fb18ad6b7b47a5da85ddd30973e495bc`.

Les anciennes branches de travail `agent/stabilise-structure-ecran` et `consolidation/vogue-marry-2026-09` ont été alignées sur le même commit que `main`. Elles ne doivent plus servir de branches de développement.

`archive/rustines-esthetiques-20260731` reste une archive volontairement séparée.

## Résultat technique

- un seul moteur de transcription actif : `backend/transcription-server-v6.js` ;
- anciens moteurs V1 à V5 retirés du code actif ;
- service de confirmation des interlocuteurs absorbé dans le moteur de transcription ;
- port 8012 supprimé ;
- services locaux 8010 et 8011 limités à `127.0.0.1` ;
- CORS limité aux origines locales ;
- chemins et uploads durcis ;
- protection contre les doubles lancements d’une même transcription ;
- attribution automatique des noms limitée aux présentations explicites ;
- confirmation manuelle des interlocuteurs persistante ;
- consentement explicite obligatoire avant un appel OpenAI ;
- données utilisateur conservées hors dépôt dans `~/VOGUE-MERRY-DONNEES` ;
- dépendances JavaScript verrouillées dans `package-lock.json` ;
- dépendances Python directes regroupées dans `requirements-transcription.txt` ;
- pages de démonstration et workflows temporaires retirés ;
- artefacts Python ignorés par Git.

## Validation automatisée

État validé avant fusion :

- 13 tests sur 13 réussis ;
- build Vite réussi ;
- `npm audit` : 0 vulnérabilité ;
- contrôles syntaxiques Node et Python réussis.

La CI stable est maintenant `.github/workflows/ci.yml` et s’exécute sur `main` et les pull requests vers `main`.

## Ce qui reste à valider sur le poste réel

La CI ne peut pas remplacer un test avec l’environnement local de Sofia. Il reste donc un contrôle matériel : effectuer une courte transcription locale avec Faster-Whisper/Pyannote réellement installés et un fichier audio choisi, sans appel API payant.

## Règle de branche après consolidation

- `main` : seule branche de développement normale ;
- branches de travail temporaires : à créer seulement pour une modification isolée, puis fusionner rapidement dans `main` ;
- `archive/*` : historique conservé, jamais fusionné automatiquement.

## Suite produit

La prochaine étape n’est plus de consolider Git mais de poursuivre la réunification fonctionnelle : Pont et Îles reliés aux vraies données, Escales reliées aux réunions, Longue-vue reliée à la recherche, puis transcription → journal de bord → validation → mémoire.
