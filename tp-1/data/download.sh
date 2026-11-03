#!/bin/bash
# Télécharge le jeu de données (non versionné dans git, ~12 Mo)
set -e
cd "$(dirname "$0")"
curl -L -o restaurants.json https://raw.githubusercontent.com/mongodb/docs-assets/primer-dataset/primer-dataset.json
echo "✅ $(wc -l < restaurants.json) restaurants téléchargés"
