# Exercices — Séance 1 · MongoDB sur la base « Zwipe »

Prérequis : `docker compose up -d` puis `docker exec zwipe-mongo mongosh --quiet zwipe --file /seed.js`.
Shell : `docker exec -it zwipe-mongo mongosh zwipe`.

Chaque réponse attendue est repliée sous « Résultat attendu ». Essayez avant d'ouvrir. Si vous avez cassé la base, rechargez le seed, il est déterministe.

---

## Bloc A · Lire (filtrer, projeter, trier)

**A1.** Les 3 vidéos les plus longues parmi celles qui dépassent 150 secondes. Afficher seulement `titre` et `duree`, sans `_id`.
<details><summary>Résultat attendu</summary>

```
POV : tu révises le NoSQL la veille   179
Ski à Milan-Cortina, vlog 1           176
Micro-trottoir : c'est quoi NoSQL ?   174
```
</details>

**A2.** Combien d'utilisateurs français ont strictement moins de 20 ans ?
<details><summary>Résultat attendu</summary>

`8`
</details>

**A3.** Les 3 vidéos taguées `#cdm2026` avec au moins 1 000 000 de vues, triées par vues décroissantes. `titre` et `vues` seulement.
<details><summary>Résultat attendu</summary>

```
Je réponds à vos commentaires   2458286
Drop de sneakers, j'ai pas eu   2400396
Tuto : paraître productif       2229714
```
</details>

**A4.** Combien de vidéos ont un produit affilié à moins de 30 € ?
<details><summary>Résultat attendu</summary>

`16`
</details>

**A5.** Les pseudos des utilisateurs qui ont à la fois le badge `verifie` et le badge `createur`.
<details><summary>Résultat attendu</summary>

`aaron.tech` (un seul)
</details>

**A6.** Combien de commentaires ont au moins une réponse avec 40 likes ou plus ? (Attention : une réponse, pas le commentaire.)
<details><summary>Résultat attendu</summary>

`53`
</details>

**A7.** Combien de vidéos ont un ratio likes / vues supérieur à 17 % ? Indice : il faut comparer deux champs du même document.
<details><summary>Résultat attendu</summary>

`15`
</details>

**A8.** Les vidéos sur « son original » (artiste `null`) qui ont exactement 3 langues de sous-titres. `titre` et `sousTitres`.
<details><summary>Résultat attendu</summary>

```
GRWM avant le partiel               [es, ar, en]
Ratio + pas de base de données      [it, es, ar]
POV : tu révises le NoSQL la veille [ar, es, it]
```
</details>

---

## Bloc B · Écrire (insert, update, delete)

Faites ce bloc dans l'ordre, chaque étape dépend de la précédente.

**B1.** Créez votre profil dans `users` : `pseudo` (unique, choisissez), `pays`, `abonnements: []`, `badges: ["early"]`, `inscritLe` à maintenant.

**B2.** Postez une vidéo dans `videos` dont vous êtes l'auteur (`auteur` = votre `_id`, récupéré par `findOne`). Champs minimum : `titre, duree, vues: 0, likes: 0, hashtags, son, publieLe`.

**B3.** En **une seule** commande `updateOne` sur votre vidéo : ajoutez 1 000 vues et 120 likes, ajoutez `#pourtoi` aux hashtags **sans doublon possible**, et ajoutez un sondage `{ question, options: [{texte, votes: 0}, {texte, votes: 0}] }`.
<details><summary>Résultat attendu</summary>

`matchedCount: 1, modifiedCount: 1`
</details>

**B4.** Votez pour la première option du sondage : incrémentez `votes` de **l'option dont le texte est « Mongo »** (ou le texte que vous avez choisi), sans toucher à l'autre. Indice : opérateur positionnel `$`.
<details><summary>Résultat attendu</summary>

L'option visée passe à `votes: 1`, l'autre reste à `0`.
</details>

**B5.** Ajoutez 2 commentaires sur votre vidéo (`insertMany`), signés par deux utilisateurs existants.

**B6.** Supprimez **proprement** votre profil : les commentaires de votre vidéo, puis la vidéo, puis le profil. Vérifiez qu'il ne reste rien.
<details><summary>Résultat attendu</summary>

`deletedCount: 2`, `deletedCount: 1`, `deletedCount: 1`, puis trois comptages à `0`.
Pourquoi trois commandes ? Parce qu'il n'y a pas de `ON DELETE CASCADE`. Vous êtes la cascade.
</details>

---

## Bloc C · Pièges (le résultat est faux, pas d'erreur)

Chaque requête ci-dessous « marche » et renvoie un nombre. Exécutez-la, comparez avec la version corrigée que vous devez écrire, et **expliquez l'écart** en une phrase.

**C1.** « Les utilisateurs qui n'ont pas 18 ans » : `db.users.countDocuments({ age: { $ne: 18 } })`
<details><summary>Résultat attendu</summary>

`44` avec la requête piège, `35` avec la bonne. Les 9 utilisateurs **sans champ `age`** matchent `$ne: 18`. Il faut ajouter `$exists: true`.
</details>

**C2.** « Les vidéos qui ont `#nosql` ET `#humour` » : `db.videos.countDocuments({ hashtags: "#nosql", hashtags: "#humour" })`
<details><summary>Résultat attendu</summary>

`33` avec la requête piège, `3` avec la bonne. En JavaScript, la deuxième clé **écrase** la première : la requête ne filtre que sur `#humour`. Il faut `$all` (ou `$and` explicite).
</details>

**C3.** « Les vidéos dont le sondage a l'option Non avec plus de 4 000 votes » : `db.videos.countDocuments({ "sondage.options.texte": "Non", "sondage.options.votes": { $gt: 4000 } })`
<details><summary>Résultat attendu</summary>

`12` avec la requête piège, `6` avec la bonne. Sans `$elemMatch`, « texte Non » et « votes > 4000 » peuvent être satisfaits par **deux options différentes** du même tableau.
</details>

**C4.** « Les vidéos taguées `#nosql` » : `db.videos.countDocuments({ hashtags: ["#nosql"] })`
<details><summary>Résultat attendu</summary>

`7` avec la requête piège, `31` avec la bonne. `{ hashtags: ["#nosql"] }` cherche un tableau **exactement égal** à `["#nosql"]`. Pour « contient », on écrit `{ hashtags: "#nosql" }`.
</details>

---

## Pour aller plus loin (facultatif)

- Avec `explain("executionStats")`, comparez `totalDocsExamined` pour `{ hashtags: "#nosql" }` (indexé) et `{ duree: 42 }` (pas indexé). Créez l'index manquant et recomparez.
- Écrivez une pagination par curseur sur `videos` triées par `vues` décroissantes, 5 par page, sans `skip`.
- Les 3 pays dont les utilisateurs ont publié le plus de vues cumulées (`$lookup` ou deux requêtes : laquelle est la plus propre ?).
