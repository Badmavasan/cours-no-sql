# Cours NoSQL — Séance 1 : « Quand les tableaux ne suffisent plus »

Séance en français, 9h00 → 13h45 (3h de cours puis TP `../tp-1/`) : ice-breaker « Zwipe » (concevoir une app de vidéos courtes en SQL, puis la casser), outils vs technologies, introduction à MongoDB de l'architecture au document, hands-on CRUD et filtrage, quand (ne pas) choisir Mongo.

## Contenu

| Fichier | Rôle |
|---|---|
| `slides/nosql-seance-1.pdf` | Le deck (72 écrans, 16:9, toutes les animations dépliées). |
| `slides/nosql-session-1-en.pdf` | Le même deck en anglais. |
| `lab/docker-compose.yml` | MongoDB 7 + mongo-express. |
| `lab/seed.js` | Jeu de données « Zwipe » déterministe (50 users, 200 vidéos, 500 commentaires, 2000 événements). |
| `lab/exercices.md` | Feuille d'exercices étudiants, résultats attendus repliés. |
| `lab/solutions.md`, `lab/solutions.js` | Corrigé enseignant, rejouable. |

## Présenter

Ouvrir `slides/nosql-seance-1.pdf` en plein écran (une page = un écran). Le deck source interactif (reveal.js, timer de l'ice-breaker, mode sombre) n'est pas versionné ici.

## Lab

```bash
cd lab
docker compose up -d
docker exec zwipe-mongo mongosh --quiet zwipe --file /seed.js   # charge les données
docker exec -it zwipe-mongo mongosh zwipe                        # shell
# interface web facultative : http://localhost:8081 (admin / zwipe)
docker compose down -v                                           # tout effacer
```

Le seed est déterministe : les sorties affichées dans les slides et les résultats attendus des exercices correspondent exactement à ce que les étudiants obtiennent. Le recharger après le bloc B des exercices.

## Accès avec MongoDB Compass

Même procédure que pour le TP (voir `../tp-1/README.md`) : URI `mongodb://localhost:27017/`, sans authentification, base `zwipe`.
