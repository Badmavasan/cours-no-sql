# Cours NoSQL

Cours de bases de données NoSQL en français : une séance de cours (MongoDB, de l'architecture au document) et un TP sur un jeu de données réel.

## Structure

```
cours-no-sql/
├── cours-1/                      Séance 1 · 9h00 → 13h45
│   ├── slides/nosql-seance-1.pdf   Le deck (72 écrans)
│   ├── README.md                   Comment présenter et lancer le lab
│   └── lab/                        Hands-on « Zwipe » (MongoDB 7 en Docker, port 27017)
│       ├── docker-compose.yml
│       ├── seed.js                 Jeu de données déterministe
│       ├── exercices.md            Feuille étudiants
│       └── solutions.md, solutions.js
└── tp-1/                         TP noté · restaurants de New York
    ├── TP.md                       Énoncé (5 questions)
    ├── README.md                   Mise en route, accès avec MongoDB Compass
    ├── docker-compose.yml          MongoDB 7 en Docker (port 27018), import automatique
    ├── data/download.sh, init.sh   Téléchargement et import du jeu de données
    └── corrige/                    (vide pour l'instant)
```

## Démarrer

Prérequis : Docker et Docker Compose.

```bash
# Lab de la séance 1
cd cours-1/lab && docker compose up -d
docker exec zwipe-mongo mongosh --quiet zwipe --file /seed.js

# TP 1
cd tp-1 && ./data/download.sh && docker compose up -d
```

Les deux piles tournent en même temps (ports 27017 et 27018). Accès graphique : MongoDB Compass (voir `tp-1/README.md`) ou mongo-express sur http://localhost:8081 et http://localhost:8082.
