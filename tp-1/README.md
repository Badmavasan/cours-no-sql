# TP 1 — Restaurants de New York · mise en route et accès avec MongoDB Compass

## Fichiers

| Fichier | Rôle |
|---|---|
| `TP.md` | L'énoncé (5 questions, 4 h). |
| `docker-compose.yml` | MongoDB 7 sur le port **27018** + mongo-express sur http://localhost:8082 (admin / tp). |
| `data/download.sh` | Télécharge `restaurants.json` (jeu de données officiel MongoDB, 25 359 restaurants, ~12 Mo, non versionné). |
| `data/init.sh` | Import automatique dans la base `restaurants` au premier démarrage du conteneur, avec les index utiles. |
| `corrige/` | Vide pour l'instant : le corrigé sera ajouté après le rendu. |

## Démarrer

```bash
cd tp-1
./data/download.sh            # une fois
docker compose up -d          # importe les données automatiquement (regardez : docker logs tp-mongo | grep ✅)
docker exec -it tp-mongo mongosh restaurants
```

Le port est 27018 pour pouvoir faire tourner en même temps le lab du cours (`cours-1/lab`, port 27017).

Repartir d'une base propre (après Q1 et Q4, qui modifient les données) :

```bash
docker compose down -v && docker compose up -d
```

## Interroger la base avec MongoDB Compass

Compass est l'interface graphique officielle : https://www.mongodb.com/products/tools/compass (gratuit, Windows / macOS / Linux).

1. **Ouvrir Compass**, cliquer sur **New connection** (ou le `+` à gauche).
2. Dans le champ URI, coller l'adresse du conteneur voulu :
   - TP : `mongodb://localhost:27018/`
   - Lab du cours (Zwipe) : `mongodb://localhost:27017/`

   Pas d'utilisateur ni de mot de passe : les conteneurs sont en mode développement, sans authentification, et n'écoutent que sur votre machine.
3. Cliquer **Connect**. À gauche apparaissent les bases (`restaurants`, ou `zwipe`), puis les collections.
4. Cliquer sur une collection : l'onglet **Documents** montre les documents. La barre **Filter** accepte exactement la syntaxe de `find()`, par exemple :

   ```js
   { borough: "Brooklyn", cuisine: "Pizza", "grades.0.grade": "A" }
   ```

   Les boutons **Options** ouvrent la projection, le tri, le skip et la limite. **Explain** affiche le plan (vérifiez le `IXSCAN` vs `COLLSCAN`).
5. L'onglet **Aggregations** construit un pipeline étape par étape, avec un aperçu des documents après chaque étape. C'est le meilleur outil pour **déboguer** une agrégation du TP : ajoutez les étapes une à une et regardez ce qui sort. Le bouton **Export to language** donne le code JS / Python équivalent.
6. L'onglet **Schema** analyse un échantillon et montre, pour chaque champ, les types et la fréquence : utile pour Q1 (champs absents, types mixtes).
7. L'onglet **Indexes** liste les index et permet d'en créer. Vous devez y voir `address.coord_2dsphere` pour Q5.
8. En bas, **>_MONGOSH** ouvre un shell intégré, identique à celui du conteneur.

Si la connexion échoue : vérifier que le conteneur tourne (`docker ps`), que le port est bien 27018 pour le TP, et qu'aucun autre MongoDB local n'occupe le port.

### Sans Compass

- mongo-express (déjà démarré) : http://localhost:8082, identifiants admin / tp. Plus limité, mais rien à installer.
- L'extension **MongoDB for VS Code** accepte la même URI et offre des *playgrounds* `.mongodb.js` exécutables, pratique pour rendre `q1.js` … `q5.js`.
