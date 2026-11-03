#!/bin/bash
# Import automatique au premier démarrage du conteneur (docker-entrypoint-initdb.d)
set -e
echo "⏳ Import de restaurants.json dans la base 'restaurants'…"
mongoimport --db restaurants --collection restaurants --file /import/restaurants.json
mongosh --quiet restaurants --eval '
  db.restaurants.createIndex({ cuisine: 1 });
  db.restaurants.createIndex({ borough: 1 });
  db.restaurants.createIndex({ "address.coord": "2dsphere" });
  print("✅ restaurants importés : " + db.restaurants.countDocuments());'
