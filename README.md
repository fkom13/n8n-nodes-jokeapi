# n8n-nodes-blagues-api

Nœud communautaire n8n pour interagir avec Blagues API.

## Description

Ce nœud permet de récupérer des blagues françaises depuis [Blagues API](https://www.blagues-api.fr/) en utilisant le module npm `blagues-api`.

## Fonctionnalités

*   Obtenir une blague aléatoire (avec option d'exclusion de catégories).
*   Obtenir une blague aléatoire par catégorie spécifique.
*   Obtenir une blague par son ID.
*   Obtenir le nombre total de blagues disponibles.

## Prérequis

*   Un compte Blagues API et un token d'API valide.
*   Une instance n8n en cours d'exécution.

## Installation

Si ce nœud est publié sur npm, vous pouvez l'installer via l'interface n8n ou en utilisant npm/pnpm dans le répertoire de votre instance n8n :

```bash
npm install n8n-nodes-blagues-api
# ou
pnpm install n8n-nodes-blagues-api