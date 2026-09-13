# AZOTH STUDIO — RÈGLE FIXE DE DIRECTION ARTISTIQUE LOGICIELLE

Cette règle est prioritaire pour tout travail visuel sur l’interface.
Elle existe pour éviter les illustrations médiocres, le bruit visuel et les approximations dessinées à la main dans le code.

## Principe fondamental

**Le code construit l’interface. Les illustrations sont des assets.**

Ne jamais essayer de reproduire une illustration complexe, un décor, un paysage, un objet narratif ou une ambiance graphique en les « dessinant » à la main avec du CSS, des pseudo-éléments, des `div`, des gradients empilés, des `clip-path`, ou un SVG improvisé dans le code.

Le CSS/HTML/React peut gérer :
- structure et mise en page ;
- hiérarchie visuelle ;
- typographie ;
- couleurs et dégradés simples ;
- cadres, séparateurs, ombres et espacements ;
- interactions et états ;
- icônes fonctionnelles provenant d’une bibliothèque cohérente ;
- schémas fonctionnels simples lorsqu’ils servent directement la compréhension.

Le CSS/HTML/React ne doit pas servir à fabriquer :
- paysages ;
- bateaux, phares, montagnes, côtes, plantes, personnages ;
- objets décoratifs complexes ;
- faux dessins « à la main » ;
- cliparts ;
- ornements illustratifs complexes ;
- pseudo-gravures ou pseudo-manga bricolés.

## Si une illustration est nécessaire

Utiliser un **vrai asset graphique séparé**, de qualité suffisante pour le produit : image ou SVG finalisé, créé spécifiquement, généré à un niveau professionnel, fourni par l’utilisateur, ou issu d’une source autorisée.

L’asset doit ensuite être intégré dans le logiciel comme un élément visuel indépendant. Ne pas tenter de le réinterpréter avec des formes CSS approximatives.

**S’il n’existe pas d’asset assez bon, laisser l’espace vide.**
Un espace calme, un dégradé ou un fond propre est toujours préférable à une illustration médiocre.

## Quand une maquette ou une image de référence existe

La maquette validée est une **direction artistique**, pas une invitation à fabriquer une imitation grossière.

Procéder dans cet ordre :
1. reproduire la composition générale ;
2. reproduire les proportions et la hiérarchie ;
3. reproduire la palette et les dégradés ;
4. reproduire les espacements et la respiration ;
5. intégrer ensuite les vrais assets illustratifs nécessaires.

Ne jamais remplacer un décor détaillé de la maquette par un croquis CSS/SVG de moindre qualité.

## Zone de lecture protégée

La zone contenant les informations, boutons, titres, textes et actions doit rester calme.

Par défaut :
- aucun décor derrière un texte ;
- aucun dessin traversant une zone de lecture ;
- aucun trait décoratif inutile sous les libellés ;
- aucun motif qui concurrence une information ;
- les illustrations décoratives restent dans les marges, les coins ou des zones clairement réservées.

La lisibilité est prioritaire sur le décor.

## Règle anti-bruit visuel

Chaque élément visuel doit répondre à l’une de ces fonctions :
- informer ;
- orienter ;
- hiérarchiser ;
- permettre une action ;
- installer l’identité visuelle sans gêner les quatre fonctions précédentes.

Si un élément n’a aucune de ces fonctions, le supprimer.

## Règle de comportement de l’agent

Quand l’utilisateur dit : **« je veux que le logiciel ressemble à cette image »**, ne pas générer automatiquement une nouvelle image et ne pas produire une nouvelle maquette sauf demande explicite.

Il faut modifier le logiciel lui-même.

Avant toute intervention graphique, classer mentalement chaque élément en deux catégories :
- **UI → code** ;
- **illustration → asset**.

Si l’agent se surprend à essayer de dessiner un décor complexe en CSS ou en SVG improvisé, **STOP** : revenir à un fond propre et prévoir un asset séparé.

## Critère de qualité

Ne jamais ajouter un visuel simplement parce qu’un emplacement semble vide.

Un visuel n’est ajouté que s’il est :
- cohérent avec la direction artistique ;
- suffisamment qualitatif ;
- placé hors des zones de lecture ;
- lisible à la taille réelle de l’application ;
- meilleur que l’espace vide qu’il remplace.

## Règle de sécurité finale

En cas de doute entre :
- ajouter un décor moyen ;
- ou laisser respirer l’interface ;

**toujours choisir de laisser respirer l’interface.**

Cette règle doit être appliquée avant toute nouvelle passe visuelle.