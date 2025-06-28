import {
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
    NodeOperationError,
} from 'n8n-workflow';

import axios from 'axios';

// Base URL for JokeAPI v2
const JOKEAPI_BASE_URL = 'https://v2.jokeapi.dev/joke/';
const JOKEAPI_INFO_URL = 'https://v2.jokeapi.dev/info'; // Endpoint pour les informations de l'API

// Available categories for JokeAPI
const jokeCategories = [
    { name: 'Any', value: 'Any' }, // Special category for any joke
{ name: 'Programming', value: 'Programming' },
{ name: 'Miscellaneous', value: 'Miscellaneous' },
{ name: 'Dark', value: 'Dark' },
{ name: 'Pun', value: 'Pun' },
{ name: 'Spooky', value: 'Spooky' },
{ name: 'Christmas', value: 'Christmas' },
];

// Available blacklist flags for JokeAPI (for excluding certain joke types)
const blacklistFlags = [
    { name: 'NSFW (Not Safe For Work)', value: 'nsfw' },
    { name: 'Religious', value: 'religious' },
{ name: 'Political', value: 'political' },
{ name: 'Racist', value: 'racist' },
{ name: 'Sexist', value: 'sexist' },
{ name: 'Explicit', value: 'explicit' },
];

// Available languages for JokeAPI
const jokeLanguages = [
    { name: 'English (en)', value: 'en' },
    { name: 'German (de)', value: 'de' },
    { name: 'Spanish (es)', value: 'es' },
    { name: 'French (fr)', value: 'fr' },
    { name: 'Portuguese (pt)', value: 'pt' },
    { name: 'Czech (cz)', value: 'cz' },
];

// Available joke types for JokeAPI
const jokeTypes = [
    { name: 'Single-part joke', value: 'single' },
{ name: 'Two-part joke (setup & delivery)', value: 'twopart' },
];

export class JokeApi implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'JokeAPI',
        name: 'jokeApi',
        icon: 'file:JokeApi.icon.png',
        group: ['transform'],
        version: 1,
        description: 'Récupère des blagues multilingues et filtrables depuis JokeAPI (v2) avec des options avancées de personnalisation et permet de récupérer les informations de l\'API.',
        defaults: {
            name: 'JokeAPI',
        },
        inputs: ['main'],
        outputs: ['main'],
        credentials: [
            {
                name: 'jokeApiCredentials',
                required: false,
            },
        ],
        properties: [
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                options: [
                    {
                        name: 'Get Random Joke',
                        value: 'getRandom',
                        description: 'Obtenir une blague aléatoire basée sur les filtres.',
                    },
                    {
                        name: 'Get Joke by ID',
                        value: 'getById',
                        description: 'Obtenir une blague spécifique à partir de son ID.',
                    },
                    {
                        name: 'Get API Info',
                        value: 'getApiInfo',
                        description: 'Obtenir les informations sur l\'API (catégories disponibles, flags, langues, ID range, etc.).',
                    },
                ],
                default: 'getRandom',
                    description: 'Sélectionnez l\'opération à effectuer avec JokeAPI.',
            },

            {
                displayName: 'Random Joke Options',
                name: 'randomJokeOptions',
                type: 'collection',
                displayOptions: {
                    show: {
                        operation: ['getRandom'],
                    },
                },
                placeholder: 'Ajouter des options de blague aléatoire',
                description: 'Configurez les filtres pour la blague aléatoire. Note: Des URLs trop longues dues à de nombreux filtres ou une recherche complexe peuvent entraîner des erreurs.',
                default: {},
                    options: [
                        {
                            displayName: 'Categories',
                            name: 'categories',
                            type: 'multiOptions',
                            options: jokeCategories,
                default: ['Any'],
                    description: 'Sélectionnez une ou plusieurs catégories de blagues à inclure. "Any" inclut toutes les catégories. Note: Un trop grand nombre de catégories peut rendre l\'URL longue.',
                        },
                        {
                            displayName: 'Exclude Flags',
                            name: 'excludeFlags',
                            type: 'multiOptions',
                            options: blacklistFlags,
                default: [],
                    description: 'Sélectionnez les drapeaux de blagues à exclure. Si une blague contient un drapeau sélectionné, elle sera filtrée (ex: NSFW, Racist). Note: Un trop grand nombre de flags peut rendre l\'URL longue.',
                        },
                        {
                            displayName: 'Joke Type',
                            name: 'jokeType',
                            type: 'options',
                            options: jokeTypes,
                default: 'single',
                    description: 'Choisissez le format de la blague : une seule ligne ou une blague en deux parties (question et réponse).',
                        },
                        {
                            displayName: 'Language',
                            name: 'language',
                            type: 'options',
                            options: jokeLanguages,
                default: 'en',
                    description: 'Sélectionnez la langue de la blague souhaitée.',
                        },
                        {
                            displayName: 'Search String (contains)',
                            name: 'searchString',
                            type: 'string',
                default: '',
                    placeholder: 'e.g. "robot"',
                    description: 'Recherchez une blague contenant ce texte. Note : cette option ne fonctionne que si UNE SEULE catégorie est sélectionnée (pas "Any" et pas plusieurs catégories). Une longue chaîne peut rendre l\'URL longue.',
                        },
                        {
                            displayName: 'Amount',
                            name: 'amount',
                            type: 'number',
                default: 1,
                    typeOptions: {
                        minValue: 1,
                        maxValue: 10
                    },
                    description: 'Le nombre de blagues aléatoires à récupérer (entre 1 et 10).',
                        },
                    ],
            },

            {
                displayName: 'Joke ID(s)',
                name: 'jokeId',
                type: 'string',
                default: '',
                    placeholder: 'e.g. 15 or 10-20',
                    required: true,
                    displayOptions: {
                        show: {
                            operation: ['getById'],
                        },
                    },
                    description: 'L\'ID numérique de la blague à récupérer, ou une plage d\'IDs séparée par un tiret (ex: "10-20"). Les IDs négatifs ne sont pas supportés.',
            },
        ],
        usableAsTool: true,
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: INodeExecutionData[][] = [];

        for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
            try {
                const operation = this.getNodeParameter('operation', itemIndex) as string;
                this.logger.info(`Executing operation: ${operation} for item ${itemIndex}`);

                const credentials = await this.getCredentials('jokeApiCredentials');
                const apiKey = credentials?.apiKey as string | undefined;

                let url: string;
                const queryParams: string[] = [];
                let response;

                switch (operation) {
                    case 'getRandom':
                        const randomJokeOptions = this.getNodeParameter('randomJokeOptions', itemIndex) as {
                            categories?: string | string[]; // Rend optionnel et accepte string ou string[]
                            excludeFlags?: string | string[]; // Rend optionnel et accepte string ou string[]
                            jokeType?: string;
                            language?: string;
                            searchString?: string;
                            amount?: number;
                        };

                        // Assure que categories est un tableau, même si undefined, null ou une string vide
                        const categories = (Array.isArray(randomJokeOptions.categories) && randomJokeOptions.categories.length > 0)
                        ? randomJokeOptions.categories
                        : (typeof randomJokeOptions.categories === 'string' && randomJokeOptions.categories.trim() !== '')
                        ? randomJokeOptions.categories.split(',').map(s => s.trim()).filter(Boolean) // split et filtre les vides
                        : [];

                        // Assure que excludeFlags est un tableau
                        const excludeFlags = (Array.isArray(randomJokeOptions.excludeFlags) && randomJokeOptions.excludeFlags.length > 0)
                        ? randomJokeOptions.excludeFlags
                        : (typeof randomJokeOptions.excludeFlags === 'string' && randomJokeOptions.excludeFlags.trim() !== '')
                        ? randomJokeOptions.excludeFlags.split(',').map(s => s.trim()).filter(Boolean)
                        : [];

                        const jokeType = randomJokeOptions.jokeType;
                        const language = randomJokeOptions.language;
                        const searchString = randomJokeOptions.searchString;
                        const amount = randomJokeOptions.amount;

                        // Construire le chemin des catégories (par défaut 'Any' si vide)
                        const categoryPath = (categories.length > 0 && !categories.includes('Any'))
                        ? categories.join(',')
                        : 'Any'; // Utilise 'Any' seulement si aucune catégorie sélectionnée ou 'Any' est la seule sélectionnée

                        url = JOKEAPI_BASE_URL + `${categoryPath}`;

                        // Ajouter les paramètres de requête
                        if (excludeFlags.length > 0) {
                            queryParams.push(`blacklistFlags=${excludeFlags.join(',')}`);
                        }
                        if (jokeType) {
                            queryParams.push(`type=${jokeType}`);
                        }
                        if (language) {
                            queryParams.push(`lang=${language}`);
                        }
                        if (searchString && searchString.trim() !== '') {
                            // Validation pour searchString: fonctionne seulement avec 1 catégorie spécifique
                            if (categories.length !== 1 || categories[0] === 'Any' || categories.some(cat => cat === 'Any')) {
                                this.logger.warn(`Search String (contains) will be ignored for item ${itemIndex} because it only works when exactly ONE specific category is selected (not "Any" or multiple).`);
                            } else {
                                queryParams.push(`contains=${encodeURIComponent(searchString.trim())}`);
                            }
                        }
                        if (amount && amount > 1) { // Seulement si amount est un nombre et > 1
                            queryParams.push(`amount=${amount}`);
                        }

                        if (apiKey) {
                            // Placeholder for future API key usage if needed by JokeAPI
                            // queryParams.push(`apiKey=${apiKey}`);
                        }

                        if (queryParams.length > 0) {
                            url += `?${queryParams.join('&')}`;
                        }

                        this.logger.info(`Calling JokeAPI URL for getRandom: ${url}`);
                        response = (await axios.get(url)).data;
                        break;

                        case 'getById':
                            const jokeId = this.getNodeParameter('jokeId', itemIndex) as string;
                            if (!jokeId || jokeId.trim() === '') {
                                throw new NodeOperationError(this.getNode(), 'Joke ID is required for this operation.', { itemIndex });
                            }
                            // Validation des IDs négatifs
                            const idParts = jokeId.split('-').map(part => parseInt(part.trim(), 10));
                            if (idParts.some(part => isNaN(part) || part < 0)) {
                                throw new NodeOperationError(this.getNode(), `Invalid Joke ID(s) provided. IDs must be positive numbers or a range of positive numbers (e.g., "15" or "10-20"). Received: "${jokeId}"`, { itemIndex });
                            }

                            url = JOKEAPI_BASE_URL + `Any?idRange=${encodeURIComponent(jokeId.trim())}`;

                            this.logger.info(`Calling JokeAPI URL for getById: ${url}`);
                            response = (await axios.get(url)).data;
                            break;

                        case 'getApiInfo':
                            url = JOKEAPI_INFO_URL;
                            this.logger.info(`Calling JokeAPI URL for getApiInfo: ${url}`);
                            response = (await axios.get(url)).data;
                            break;

                        default:
                            throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, { itemIndex });
                }

                if (response.error === true) {
                    const errorMessage = response.message || 'JokeAPI returned an unknown error.';
                    const errorCauses = response.causedBy ? ` Caused by: ${response.causedBy.join(', ')}.` : '';
                    throw new NodeOperationError(this.getNode(), `${errorMessage}${errorCauses}`, { itemIndex });
                }

                const executionData = this.helpers.returnJsonArray(Array.isArray(response) ? response : [response]);
                returnData.push(executionData);
                this.logger.info(`Operation ${operation} successful for item ${itemIndex}`);

            } catch (error) {
                this.logger.error(`Error during execution for item ${itemIndex}: ${error.message}`, error);
                // Gérer spécifiquement les erreurs Axios (par exemple, 414 URI Too Long)
                if (axios.isAxiosError(error) && error.response) {
                    if (error.response.status === 414) {
                        const userFriendlyMessage = 'Request failed (HTTP 414 URI Too Long). This often happens when too many categories, exclusion flags, or a very long search string are used. Please reduce the number of filters or the length of the search string.';
                        throw new NodeOperationError(this.getNode(), userFriendlyMessage, { itemIndex });
                    }
                    // Pour d'autres erreurs HTTP de l'API
                    if (error.response.status >= 400 && error.response.status < 500) {
                        const apiErrorMessage = error.response.data?.message || `API returned status ${error.response.status}`;
                        throw new NodeOperationError(this.getNode(), `API Error: ${apiErrorMessage}`, { itemIndex });
                    }
                }

                if (this.continueOnFail()) {
                    const errorData = this.helpers.returnJsonArray({ error: error.message, details: (error as Error).stack });
                    returnData.push(errorData);
                    continue;
                }
                if (error instanceof NodeOperationError) {
                    throw error;
                }
                throw new NodeOperationError(this.getNode(), error, { itemIndex });
            }
        }
        return returnData;
    }
}
