# Transcription V6 — réunions de Matéo

## Décision produit

Vogue Marry conserve seulement deux modes :

1. **Local renforcé · gratuit**
   - Faster-Whisper `large-v3-turbo` ;
   - timestamps mot à mot ;
   - Pyannote `speaker-diarization-community-1` en local ;
   - coût API : 0 $.

2. **Dossier sensible · vérifié**
   - même traitement local ;
   - une seconde lecture indépendante avec `gpt-transcribe` ;
   - la diarisation reste locale et gratuite ;
   - seuls les appels GPT de vérification sont payants.

## Lien avec les escales

La transcription réutilise les données déjà saisies dans l'escale :
- projet ;
- titre / date de la réunion ;
- participants présents ;
- nombre de participants déduit de la liste des présents ;
- contexte disponible.

Il ne faut pas demander à Matéo de ressaisir ces informations lors d'une réunion normale.

## Reconnaissance des interlocuteurs

Pyannote sépare les voix pendant toute la réunion.

Vogue Marry rapproche ensuite les voix des noms déjà connus dans l'escale. L'identification privilégie les présentations faites naturellement au début de la réunion, par exemple :

> Bonjour, Josiane Just…

Une fois l'association voix ↔ participant trouvée, elle est conservée pour toute l'escale.

Si une voix ne peut pas être attribuée avec une confiance suffisante, Vogue Marry conserve un libellé `Intervenant N` au lieu d'inventer un nom.

Aucune banque biométrique permanente de voix n'est créée : l'association est limitée à la réunion en cours.

## Sécurités V6

- empreinte SHA-256 de l'audio ;
- réutilisation d'un résultat déjà produit pour le même fichier et le même contexte afin d'éviter une nouvelle facturation ;
- conservation de l'audio original ;
- reprise automatique du job après rechargement de la page ;
- séparation entre transcription structurée et seconde lecture GPT ;
- signalement des tranches où les deux moteurs divergent sensiblement ;
- nombre de voix détectées comparé au nombre de participants attendus.

## Principe

**Gratuit = transcription + horaires + interlocuteurs.**  
**Payant = uniquement une vérification indépendante du texte lorsque l'enjeu le justifie.**
