// test_node_import.js
const path = require('path');

// --- CHEMINS À VÉRIFIER ET AJUSTER SI NÉCESSAIRE ---
// Le chemin complet vers votre dossier n8n-nodes-jokeapi
// Assurez-vous que ce chemin est correct sur votre machine
const nodeProjectRoot = path.resolve(__dirname, './'); // Si test_node_import.js est à la racine de n8n-nodes-jokeapi
// Ou si test_node_import.js est dans le répertoire parent de n8n-nodes-jokeapi:
// const nodeProjectRoot = path.resolve(__dirname, './n8n-nodes-jokeapi');


// Chemin vers le fichier JokeApi.node.js compilé dans votre projet
const pathToNodeFile = path.join(nodeProjectRoot, 'dist/nodes/JokeApi.node.js');

// Chemin vers le fichier JokeApiCredentials.credentials.js compilé (si vous en avez un)
const pathToCredentialsFile = path.join(nodeProjectRoot, 'dist/credentials/JokeApiCredentials.credentials.js');

console.log(`Attempting to load node from: ${pathToNodeFile}`);

try {
    const nodeModule = require(pathToNodeFile);
    console.log('Node module loaded successfully!');
    console.log('Node class name:', nodeModule.JokeApi.name); // Accédez à la classe exportée
    console.log('Node description display name:', new nodeModule.JokeApi().description.displayName);
} catch (error) {
    console.error('\n--- ERROR LOADING NODE MODULE ---');
    console.error(error); // C'est ici que nous verrons l'erreur détaillée !
    console.error('--- END ERROR LOADING NODE MODULE ---\n');
}

// --- TEST DU FICHIER DE CREDENTIALS ---
console.log(`\nAttempting to load credentials from: ${pathToCredentialsFile}`);
try {
    const credentialsModule = require(pathToCredentialsFile);
    console.log('Credentials module loaded successfully!');
    console.log('Credentials class name:', credentialsModule.JokeApiCredentials.name); // Accédez à la classe exportée
} catch (error) {
    console.error('\n--- ERROR LOADING CREDENTIALS MODULE ---');
    console.error(error); // Et ici pour les credentials
    console.error('--- END ERROR LOADING CREDENTIALS MODULE ---\n');
}
