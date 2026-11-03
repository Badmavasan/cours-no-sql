# Corrigé — Séance 1 (enseignant)

Vérifié contre le seed du 2 novembre 2026. Le fichier `solutions.js` rejoue tout en une commande :
`docker cp lab/solutions.js zwipe-mongo:/solutions.js && docker exec zwipe-mongo mongosh --quiet zwipe --file /solutions.js`
(puis recharger le seed, le bloc B écrit et supprime).

## Bloc A

```js
// A1
db.videos.find({ duree: { $gt: 150 } }, { titre: 1, duree: 1, _id: 0 }).sort({ duree: -1 }).limit(3)
// A2
db.users.countDocuments({ pays: "FR", age: { $lt: 20 } })                                   // 8
// A3
db.videos.find({ hashtags: "#cdm2026", vues: { $gte: 1000000 } }, { titre: 1, vues: 1, _id: 0 }).sort({ vues: -1 }).limit(3)
// A4
db.videos.countDocuments({ produit: { $exists: true }, "produit.prix": { $lt: 30 } })       // 16
// A5
db.users.find({ badges: { $all: ["verifie", "createur"] } }, { pseudo: 1, _id: 0 })         // aaron.tech
// A6
db.comments.countDocuments({ reponses: { $elemMatch: { likes: { $gte: 40 } } } })           // 53
//   (ici "reponses.likes": {$gte:40} donne le même résultat car une seule condition ; insister sur le réflexe $elemMatch)
// A7
db.videos.countDocuments({ $expr: { $gt: ["$likes", { $multiply: ["$vues", 0.17] }] } })    // 15
// A8
db.videos.find({ "son.artiste": null, sousTitres: { $size: 3 } }, { titre: 1, sousTitres: 1, _id: 0 })  // 3 vidéos
//   remarque : { champ: null } matche aussi les documents où le champ est absent ; ici tous les sons ont un artiste (null ou non)
```

## Bloc B

```js
// B1
db.users.insertOne({ pseudo: "moi.nosql", pays: "FR", abonnements: [], badges: ["early"], inscritLe: new Date() })
// B2
const moi = db.users.findOne({ pseudo: "moi.nosql" })
db.videos.insertOne({ auteur: moi._id, titre: "Ma première vidéo", duree: 15, vues: 0, likes: 0,
  hashtags: ["#nosql", "#etudiant"], son: { titre: "son original", artiste: null }, publieLe: new Date() })
// B3  (une seule commande, trois opérateurs)
db.videos.updateOne({ auteur: moi._id, titre: "Ma première vidéo" }, {
  $inc: { vues: 1000, likes: 120 },
  $addToSet: { hashtags: "#pourtoi" },
  $set: { sondage: { question: "Mongo ou Postgres ?", options: [{ texte: "Mongo", votes: 0 }, { texte: "Postgres", votes: 0 }] } }
})
// B4  (opérateur positionnel : $ = l'index de l'élément qui a matché dans le filtre)
db.videos.updateOne({ auteur: moi._id, "sondage.options.texte": "Mongo" }, { $inc: { "sondage.options.$.votes": 1 } })
// B5
const v = db.videos.findOne({ auteur: moi._id })
db.comments.insertMany([
  { video: v._id, auteur: ObjectId("000000000000000000000001"), texte: "premier 🥇", likes: 0, posteLe: new Date() },
  { video: v._id, auteur: ObjectId("000000000000000000000002"), texte: "faux", likes: 0, posteLe: new Date() } ])
// B6  (ordre : enfants d'abord)
db.comments.deleteMany({ video: v._id })      // 2
db.videos.deleteOne({ _id: v._id })           // 1
db.users.deleteOne({ _id: moi._id })          // 1
```

Point à faire en correction : B6 en vrai se fait dans une **transaction** (`session.startTransaction()`), sinon un crash entre deux `delete` laisse des orphelins. Et si l'app est sérieuse, on ne supprime pas, on marque `supprimeLe`.

## Bloc C

| | Piège | Correct | Pourquoi |
|---|---|---|---|
| C1 | `{ age: { $ne: 18 } }` → 44 | `{ age: { $exists: true, $ne: 18 } }` → 35 | `$ne`/`$nin` matchent l'absence du champ |
| C2 | `{ hashtags: "#nosql", hashtags: "#humour" }` → 33 | `{ hashtags: { $all: ["#nosql", "#humour"] } }` → 3 | clé JS dupliquée, la 2e écrase la 1re |
| C3 | `{ "sondage.options.texte": "Non", "sondage.options.votes": { $gt: 4000 } }` → 12 | `{ "sondage.options": { $elemMatch: { texte: "Non", votes: { $gt: 4000 } } } }` → 6 | sans `$elemMatch`, les conditions peuvent porter sur deux éléments différents |
| C4 | `{ hashtags: ["#nosql"] }` → 7 | `{ hashtags: "#nosql" }` → 31 | un tableau dans le filtre = égalité exacte du tableau |

## Facultatif

```js
db.videos.find({ hashtags: "#nosql" }).explain("executionStats").executionStats.totalDocsExamined  // 31 (IXSCAN)
db.videos.find({ duree: 42 }).explain("executionStats").executionStats.totalDocsExamined           // 200 (COLLSCAN)
db.videos.createIndex({ duree: 1 })
// pagination par curseur
let page = db.videos.find({}, { titre: 1, vues: 1, _id: 1 }).sort({ vues: -1, _id: 1 }).limit(5).toArray()
let last = page[page.length - 1]
db.videos.find({ $or: [{ vues: { $lt: last.vues } }, { vues: last.vues, _id: { $gt: last._id } }] }).sort({ vues: -1, _id: 1 }).limit(5)
// vues cumulées par pays
db.videos.aggregate([
  { $lookup: { from: "users", localField: "auteur", foreignField: "_id", as: "u" } }, { $unwind: "$u" },
  { $group: { _id: "$u.pays", vues: { $sum: "$vues" } } }, { $sort: { vues: -1 } }, { $limit: 3 } ])
```
