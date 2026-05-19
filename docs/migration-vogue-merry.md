# Migration interne Vogue Merry

## Décision

**Vogue Merry** est le produit unique.

Les anciens noms et libellés doivent disparaître des écrans, des documents de travail et du vocabulaire produit.

## Règle

On ne maintient pas deux produits.
On travaille uniquement sur **Vogue Merry**.

## Ce qui doit porter le nom Vogue Merry

- Les titres visibles à l’écran.
- Le titre navigateur.
- Les descriptions du projet.
- Les textes d’aide utilisateur.
- Les exemples de projet.
- Les libellés de navigation.
- Le nom du package npm.
- Les chemins de lancement local.
- Les dossiers de données nouvellement créés.

## Point de vigilance technique

Certaines clés de stockage local peuvent rester temporairement inchangées uniquement si elles protègent des données déjà présentes dans le navigateur.

Ces clés ne doivent pas être affichées à l’utilisateur.
Elles devront être migrées plus tard avec une vraie procédure de reprise des données.

## Blocs Vogue Merry à intégrer dans l’interface

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

1. Supprimer les anciens libellés visibles.
2. Réorganiser l’accueil en Pont du navire.
3. Renommer Projets en Mes îles.
4. Renommer Documents/Réunions selon les blocs Vogue Merry.
5. Ajouter un vrai Log Pose visible comme synthèse finale.
6. Tester le dossier local `VOGUE-MERRY-DONNEES`.

## Vérification locale

Voir le README du dépôt pour les commandes de lancement complètes.
