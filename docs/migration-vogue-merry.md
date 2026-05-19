# Migration du prototype Matéo vers Vogue Merry

## Décision

**Vogue Merry** est le produit unique.

**Matéo** est l’ancien nom du prototype technique et le socle applicatif actuel.

Ce dépôt reste nommé **So1968/MATEO** pendant la transition, pour éviter de casser les liens, habitudes ou chemins locaux.

## Règle

On ne maintient pas deux produits.
On transforme le prototype Matéo en produit Vogue Merry.

## Ce qui peut être renommé sans risque

- Les titres visibles à l’écran.
- Le titre navigateur.
- Les descriptions du projet.
- Les textes d’aide utilisateur.
- Les exemples de projet.
- Les libellés de navigation.

## Ce qui ne doit pas être renommé brutalement

- Les clés de stockage local déjà utilisées.
- Les noms de scripts npm.
- Les chemins backend/local déjà attendus par le code.
- Les dossiers de données existants si l’utilisateur a déjà commencé à travailler dessus.
- Le nom technique du paquet npm, tant que le renommage complet n’est pas décidé.

## Blocs Vogue Merry à intégrer progressivement dans l’interface

1. **Pont du navire** : vue globale.
2. **Mes îles** : projets.
3. **Carte de l’île** : vue générale d’un projet.
4. **Escales** : réunions.
5. **Traces audio** : audios, transcriptions, marqueurs.
6. **Journal de bord** : comptes rendus, documents de travail, synthèses.
7. **Coffre** : documents liés.
8. **Équipage** : personnes et rôles.
9. **Manœuvres** : actions à faire.
10. **Caps validés** : décisions.
11. **Longue-vue** : recherche.
12. **Log Pose** : synthèse du cap et prochaine direction.

## Priorité de migration interface

1. Remplacer les mentions visibles de Matéo par Vogue Merry.
2. Garder Matéo comme mention historique : “ancien prototype technique”.
3. Réorganiser l’accueil en Pont du navire.
4. Renommer Projets en Mes îles.
5. Renommer Documents/Réunions selon les blocs Vogue Merry.
6. Ajouter un vrai Log Pose visible comme synthèse finale.

## Vérification locale

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
