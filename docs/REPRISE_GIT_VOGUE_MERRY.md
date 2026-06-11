# Reprise Git — Vogue Mary

## Statut officiel

Ce dépôt est le dépôt applicatif de **Vogue Mary**.

Nom actuel du dépôt GitHub : `So1968/MATEO`.

Nom produit à utiliser dans les textes, l'interface et la documentation : **Vogue Mary**.

> Le nom `MATEO` ne doit plus être compris comme le nom du produit. Il correspond seulement à l'ancien nom du dépôt GitHub, en attente de renommage manuel.

## Dépôt à conserver

Dépôt officiel actuel :

```text
So1968/MATEO
```

Dépôt cible conseillé après renommage manuel dans GitHub Settings :

```text
So1968/VOGUE-MARY
```

## Règle de nommage

À partir de maintenant :

- utiliser **Vogue Mary** pour le produit ;
- utiliser `vogue-mary` pour le nom technique npm ;
- utiliser `VOGUE-MARY` pour le futur nom de dépôt GitHub ;
- ne pas utiliser **Vogue Merry** comme nom produit, car cela renvoie trop directement à One Piece ;
- éviter de recréer des variantes comme `VOGUE_MARRY_SEUL`, `VOGUE_MARRY_OUTIL`, `MATEO_OUTIL`, etc. ;
- conserver les anciennes copies uniquement comme archives, pas comme chantier actif.

## Structure produit à préserver

Le dépôt contient :

- une application Vite / React ;
- un backend local Node / Express ;
- une logique de mémoire projet ;
- un système d'îles / projets ;
- des escales / réunions ;
- un coffre documentaire ;
- des journaux de bord ;
- des caps validés ;
- des manœuvres / actions ;
- une longue-vue de recherche ;
- un Log Pose de synthèse.

## Règle de développement

Ne pas supprimer le moteur fonctionnel existant.

Toute amélioration graphique ou UX doit préserver :

- les projets ;
- les escales ;
- les sources ;
- les documents de travail ;
- les versions validées ;
- l'historique ;
- la recherche ;
- l'export local ;
- la continuité de la mémoire projet.

Formule de reprise :

> On garde le moteur. On transforme l'expérience.

## À faire sur l'ordinateur de Sofia après renommage GitHub

Si le dépôt est renommé dans GitHub Settings en `VOGUE-MARY`, mettre à jour le remote local :

```bash
cd ~/DEV/VOGUE-MERRY
pwd
git status
git remote -v
git remote set-url origin https://github.com/So1968/VOGUE-MARY.git
git remote -v
```

Optionnel, après vérification : renommer aussi le dossier local pour être cohérente :

```bash
cd ~/DEV
mv VOGUE-MERRY VOGUE-MARY
cd ~/DEV/VOGUE-MARY
pwd
git status
```

Puis vérifier :

```bash
git pull
npm install
npm run dev:all
```

## Point de vigilance

Le dépôt GitHub peut être propre même si le dossier local de l'ordinateur contient encore des brouillons, anciens dossiers ou fichiers non suivis.

Avant suppression locale :

1. vérifier le dossier ;
2. confirmer ce qui est officiel ;
3. archiver les anciennes copies ;
4. ne supprimer qu'après sauvegarde.
