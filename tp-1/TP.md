# TP 1 — Les restaurants de New York

**Base de données NoSQL · MongoDB · durée indicative 4 h · en binôme**

Vous êtes data analyst au service d'hygiène de la ville de New York. On vous confie l'export des inspections sanitaires des restaurants (25 359 établissements, inspections 2010-2015) et cinq questions auxquelles la direction veut une réponse chiffrée **et fiable**. Les données sont réelles, donc sales. Le travail consiste autant à découper chaque question en étapes qu'à écrire les requêtes.

## Mise en route

```bash
cd tp-1
docker compose up -d           # importe les données tout seul au premier démarrage (~10 s)
docker exec -it tp-mongo mongosh restaurants
```

Interface web : http://localhost:8082 (admin / tp). Avec MongoDB Compass : `mongodb://localhost:27018` (voir `README.md`).
Pour repartir de zéro : `docker compose down -v && docker compose up -d`.

Un document ressemble à ceci :

```js
{
  address: { building: '1007', coord: [ -73.856077, 40.848447 ], street: 'Morris Park Ave', zipcode: '10462' },
  borough: 'Bronx',
  cuisine: 'Bakery',
  grades: [ { date: ISODate('2014-03-03'), grade: 'A', score: 2 },
            { date: ISODate('2013-09-11'), grade: 'A', score: 6 }, … ],
  name: 'Morris Park Bake Shop',
  restaurant_id: '30075445'
}
```

Le `score` est le nombre de points de violation relevés lors d'une inspection : **plus il est bas, mieux c'est** (0-13 → A, 14-27 → B, 28+ → C). Les grades `Z`, `P` et `Not Yet Graded` sont des codes administratifs (note en attente), pas des erreurs.

## Ce qu'on attend de vous

Pour chaque question, un fichier `qN.js` exécutable dans mongosh (`load("q1.js")`) et un compte rendu court `RAPPORT.md` avec, par question :

1. **La décomposition** : les sous-questions que vous avez identifiées, dans l'ordre.
2. **Les requêtes**, commentées. Une requête par sous-question, pas une requête de 80 lignes.
3. **Les résultats** (chiffres, tableaux) et **une phrase d'interprétation**.
4. **Les hypothèses** que vous avez dû prendre (exclusions, définitions, seuils).

Barème : 4 points par question, dont 1 pour la décomposition et 1 pour les hypothèses explicites. Un bon chiffre sans hypothèses écrites vaut moins qu'un chiffre discutable bien justifié.

---

## Q1 · Audit et nettoyage (à faire en premier, les autres questions en dépendent)

Avant d'analyser, on inventorie ce qui cloche. Produisez un **tableau des anomalies** avec, pour chacune, le nombre de documents concernés et la décision prise (corriger, exclure, ignorer).

Pistes à vérifier, au minimum :

- les arrondissements (`borough`) : les cinq de New York, et… ?
- les noms d'établissement vides ou dupliqués sous plusieurs orthographes (cherchez une célèbre enseigne de donuts) ;
- les codes postaux qui ne font pas 5 chiffres ;
- les coordonnées GPS absentes, ou qui ne sont pas à New York (New York est grosso modo entre les longitudes −74,3 et −73,6 et les latitudes 40,45 et 40,95) ;
- les restaurants jamais inspectés ;
- les scores `null` ou négatifs ;
- un problème d'encodage dans une valeur de `cuisine` ;
- la liste complète des valeurs de `grade` et leur fréquence.

Puis **appliquez vos corrections** avec `updateMany` (normalisation des noms, encodage, suppression des coordonnées fausses, retrait des inspections à score invalide…) et **prouvez** par une requête que chaque anomalie corrigée a disparu.

> Les réponses attendues de Q2 à Q5 supposent ces corrections appliquées : noms de l'enseigne de donuts unifiés, coordonnées hors New York retirées, `borough` « Missing » retiré, inspections à score invalide retirées du tableau.

## Q2 · Le palmarès par arrondissement

La direction veut savoir « ce qu'on mange où ».

- **a.** Pour chaque arrondissement : le nombre total de restaurants et ses 3 cuisines les plus fréquentes avec leur part en % du total de l'arrondissement.
- **b.** Le top 3 ne dit pas grand-chose (c'est « American » partout). Calculez un **indice de sur-représentation** : la part d'une cuisine dans un arrondissement divisée par sa part dans toute la ville. Un indice de 3 signifie « trois fois plus présent ici qu'en moyenne ». Ne gardez que les cuisines qui ont au moins 50 restaurants dans la ville. Donnez le top 10 des couples (arrondissement, cuisine).

Indices : il vous faut deux agrégations (ville, arrondissement) et il faudra les **combiner**. Plusieurs chemins : deux requêtes et un calcul en JavaScript dans mongosh, `$facet`, ou une collection intermédiaire avec `$out`. Choisissez, et dites pourquoi.

## Q3 · Les notes dans le temps

Chaque restaurant a plusieurs inspections. Toute cette question repose sur la **dernière inspection** de chaque restaurant.

- **a.** Les tableaux `grades` semblent triés par date décroissante. Prouvez-le (ou prouvez le contraire) avec une requête : combien de restaurants ont une première inspection du tableau qui n'est pas la plus récente ? Décidez ensuite si vous pouvez utiliser `grades[0]` ou s'il faut trier.
- **b.** Pour chaque année de dernière inspection, la répartition en % des grades A, B et C.
- **c.** Les restaurants **en déclin** : dernière note C alors qu'ils ont eu au moins un A auparavant. Combien ? Donnez les 10 pires (score le plus haut) avec nom, arrondissement, cuisine, score et date.
- **d.** Les **irréprochables** : au moins 4 inspections, toutes A. Pour chaque arrondissement, leur part en % parmi les restaurants ayant au moins 4 inspections. Quel arrondissement est le plus propre ?

Indices : `$sortArray`, `$first`, `$year`, `$filter`, `$size`, `$elemMatch`. Attention aux restaurants sans inspection et aux grades qui ne sont ni A, ni B, ni C.

## Q4 · Chaînes contre indépendants

Hypothèse de travail : une **chaîne** est un nom d'établissement (normalisé : minuscules, espaces coupés) qui apparaît au moins 10 fois.

- **a.** Construisez une collection `chaines` (une ligne par chaîne) avec : nombre d'établissements, nombre d'arrondissements couverts, score moyen de la dernière inspection, part de A en %. Utilisez `$merge` ou `$out`.
- **b.** Le top 10 des chaînes par nombre d'établissements.
- **c.** Ajoutez à chaque restaurant un champ `chaine: true/false`. (Deux `updateMany`, ou un seul malin.)
- **d.** Par arrondissement : score moyen et part de A à la dernière inspection, pour les chaînes d'un côté et les indépendants de l'autre. Qui est le plus propre ?
- **e.** La chaîne la moins propre et la plus propre (score moyen), parmi celles qui ont au moins 10 dernières inspections notées A/B/C.

Indices : `$toLower`, `$trim`, `$addToSet`, `$merge`, `distinct`, `$expr` avec `$in`. Les noms vides ne sont pas une chaîne.

## Q5 · Géographie

La collection a un index `2dsphere` sur `address.coord` (vérifiez avec `getIndexes()`). Times Square est en `[-73.9855, 40.7580]`, l'université Columbia en `[-73.9626, 40.8075]`.

- **a.** Combien de restaurants dans un rayon de 500 m autour de Times Square, et quelles sont les 5 cuisines les plus présentes dans ce cercle ?
- **b.** Les 5 pizzerias (`cuisine: "Pizza"`) notées A à leur dernière inspection les plus proches de Columbia, avec la distance en mètres arrondie.
- **c.** Pour chaque arrondissement, le code postal qui compte le plus de restaurants, et la cuisine dominante dans ce code postal.
- **d.** Pour chaque arrondissement, le restaurant le plus éloigné de Times Square, et sa distance en km. Un des résultats est bizarre : lequel, et pourquoi ?

Indices : `$geoNear` (doit être la **première** étape du pipeline, et une seule par pipeline), `distanceField`, `maxDistance`, `query`, `$facet`. Si vous n'avez pas fait le nettoyage des coordonnées en Q1, `$geoNear` vous le rappellera.

---

## Pour rendre

Un dossier `nom1-nom2/` avec `q1.js` … `q5.js`, `RAPPORT.md`, et rien d'autre (pas le jeu de données). Les requêtes doivent s'exécuter dans l'ordre sur une base fraîchement importée.
