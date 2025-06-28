require('dotenv').config(); // Charge les variables d'environnement depuis .env
const BlaguesAPI = require('blagues-api');

async function runTests() {
    const apiKey = process.env.BLAGUES_API_TOKEN;

    if (!apiKey) {
        console.error('Erreur : Le token API n\'est pas défini dans le fichier .env (variable BLAGUES_API_TOKEN)');
        return;
    }

    const blagues = new BlaguesAPI(apiKey);

    console.log('--- Début des tests du module blagues-api ---');

    // Test 1: Obtenir le nombre total de blagues
    try {
        console.log('\n--- Test 1: Obtenir le nombre total de blagues ---');
        const count = await blagues.count();
        console.log('Résultat:', count);
    } catch (error) {
        console.error('Erreur lors du Test 1 (count):', error.message);
    }

    // Test 2: Obtenir une blague aléatoire (sans exclusion)
    try {
        console.log('\n--- Test 2: Obtenir une blague aléatoire (sans exclusion) ---');
        const randomJoke = await blagues.random();
        console.log('Résultat:', randomJoke);
        // Stocker l'ID pour le test fromId
        if (randomJoke && randomJoke.id) {
            global.lastRandomJokeId = randomJoke.id;
        }
    } catch (error) {
        console.error('Erreur lors du Test 2 (random sans exclusion):', error.message);
    }

    // Test 3: Obtenir une blague aléatoire d'une catégorie spécifique (tests multiples)
    console.log('\n--- Test 3: Obtenir une blague aléatoire par catégorie ---');
    const workingCategories = ['DEV', 'BEAUF', 'DARK', 'BLONDES', 'GLOBAL', 'LIMIT']; // Catégories identifiées comme fonctionnelles par l'agent
    for (const categoryUI of workingCategories) {
        try {
            const categoryAPI = blagues.categories[categoryUI];
            if (!categoryAPI) {
                 console.warn(`Catégorie "${categoryUI}" non trouvée dans blagues.categories. Saut du test.`);
                 continue;
            }
            console.log(`\n  Test 3.${workingCategories.indexOf(categoryUI) + 1}: Catégorie "${categoryUI}" (API: "${categoryAPI}")`);
            const randomCategorizedJoke = await blagues.randomCategorized(categoryAPI);
            console.log('  Résultat:', randomCategorizedJoke);
            if (randomCategorizedJoke && randomCategorizedJoke.type !== categoryAPI) {
                 console.warn(`  Attention: La blague retournée est de type "${randomCategorizedJoke.type}" au lieu de "${categoryAPI}".`);
            }
        } catch (error) {
            console.error(`  Erreur lors du Test 3 (${categoryUI}):`, error.message);
        }
    }

    // Test 4: Obtenir une blague à partir de son ID (utilise l'ID du Test 2)
    if (global.lastRandomJokeId !== undefined) {
        try {
            console.log(`\n--- Test 4: Obtenir une blague à partir de son ID (${global.lastRandomJokeId}) ---`);
            const jokeById = await blagues.fromId(global.lastRandomJokeId);
            console.log('Résultat:', jokeById);
        } catch (error) {
            console.error(`Erreur lors du Test 4 (fromId avec ID ${global.lastRandomJokeId}):`, error.message);
        }
    } else {
        console.log('\n--- Test 4: Obtenir une blague à partir de son ID ---');
        console.log('Test fromId ignoré car aucun ID n\'a pu être récupéré du Test 2.');
    }

    // Test 5: Obtenir une blague aléatoire avec exclusion de catégories (tests multiples)
    console.log('\n--- Test 5: Obtenir une blague aléatoire avec exclusion de catégories ---');

    // Exclure une seule catégorie fonctionnelle (ex: DARK)
    try {
        const disallowed = [blagues.categories.DARK];
        console.log('\n  Test 5.1: Exclure une seule catégorie (DARK)');
        console.log('  Catégories exclues (API):', disallowed);
        const randomJokeDisallowed = await blagues.random({ disallow: disallowed });
        console.log('  Résultat:', randomJokeDisallowed);
        if (randomJokeDisallowed && disallowed.includes(randomJokeDisallowed.type)) {
             console.warn(`  Attention: La blague retournée est de type exclu "${randomJokeDisallowed.type}".`);
        }
    } catch (error) {
        console.error('  Erreur lors du Test 5.1 (exclure DARK):', error.message);
    }

    // Exclure plusieurs catégories fonctionnelles (ex: DARK, BEAUF)
    try {
        const disallowed = [blagues.categories.DARK, blagues.categories.BEAUF];
        console.log('\n  Test 5.2: Exclure plusieurs catégories (DARK, BEAUF)');
        console.log('  Catégories exclues (API):', disallowed);
        const randomJokeDisallowed = await blagues.random({ disallow: disallowed });
        console.log('  Résultat:', randomJokeDisallowed);
         if (randomJokeDisallowed && disallowed.includes(randomJokeDisallowed.type)) {
             console.warn(`  Attention: La blague retournée est de type exclu "${randomJokeDisallowed.type}".`);
        }
    } catch (error) {
        console.error('  Erreur lors du Test 5.2 (exclure DARK, BEAUF):', error.message);
    }

     // Exclure toutes les catégories fonctionnelles
    try {
        const disallowed = workingCategories.map(catUI => blagues.categories[catUI]).filter(Boolean);
        console.log('\n  Test 5.3: Exclure toutes les catégories fonctionnelles');
        console.log('  Catégories exclues (API):', disallowed);
        const randomJokeDisallowed = await blagues.random({ disallow: disallowed });
        console.log('  Résultat:', randomJokeDisallowed);
         if (randomJokeDisallowed && disallowed.includes(randomJokeDisallowed.type)) {
             console.warn(`  Attention: La blague retournée est de type exclu "${randomJokeDisallowed.type}".`);
        }
    } catch (error) {
        console.error('  Erreur lors du Test 5.3 (exclure toutes les fonctionnelles):', error.message);
    }

    // Exclure des catégories non fonctionnelles (selon l'agent)
     try {
        const disallowedUI = ['POLITIQUE', 'RACISTE', 'SEXISTE', 'NOEL'];
        const disallowed = disallowedUI.map(catUI => blagues.categories[catUI]).filter(Boolean);
        console.log('\n  Test 5.4: Exclure des catégories non fonctionnelles (POLITIQUE, RACISTE, SEXISTE, NOEL)');
        console.log('  Catégories exclues (API):', disallowed);
        const randomJokeDisallowed = await blagues.random({ disallow: disallowed });
        console.log('  Résultat:', randomJokeDisallowed);
         if (randomJokeDisallowed && disallowed.includes(randomJokeDisallowed.type)) {
             console.warn(`  Attention: La blague retournée est de type exclu "${randomJokeDisallowed.type}".`);
        }
    } catch (error) {
        console.error('  Erreur lors du Test 5.4 (exclure non fonctionnelles):', error.message);
    }


    // Test 6: Lister les catégories disponibles via blagues.categories
    try {
        console.log('\n--- Test 6: Lister les catégories disponibles ---');
        // blagues.categories est un objet où les clés sont les noms "UI" et les valeurs sont les noms "API"
        console.log('Catégories disponibles (UI -> API):', blagues.categories);
        console.log('Noms des catégories (UI):', Object.keys(blagues.categories));
        console.log('Valeurs des catégories (API):', Object.values(blagues.categories));
    } catch (error) {
        console.error('Erreur lors du Test 6 (listage catégories):', error.message);
    }


    console.log('\n--- Fin des tests du module blagues-api ---');
}

runTests();