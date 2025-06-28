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
                // Ligne 'description' supprimée ici (Correction Erreur 1)
            },
        ],
        properties: [
            // --- Basic Operation Selection ---
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

            // --- Parameters for 'Get Random Joke' Operation ---
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
                description: 'Configurez les filtres pour la blague aléatoire.',
                default: {}, // Correction Erreur 2: Ajout de la propriété 'default'
                    options: [
                        {
                            displayName: 'Categories',
                            name: 'categories',
                            type: 'multiOptions',
                            options: jokeCategories,
                default: ['Any'],
                    description: 'Sélectionnez une ou plusieurs catégories de blagues à inclure. "Any" inclut toutes les catégories.',
                        },
                        {
                            displayName: 'Exclude Flags',
                            name: 'excludeFlags',
                            type: 'multiOptions',
                            options: blacklistFlags,
                default: [],
                    description: 'Sélectionnez les drapeaux de blagues à exclure. Si une blague contient un drapeau sélectionné, elle sera filtrée (ex: NSFW, Racist).',
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
                    description: 'Recherchez une blague contenant ce texte. Note : cette option ne fonctionne que si UNE SEULE catégorie est sélectionnée (pas "Any" et pas plusieurs catégories).',
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

            // --- Parameters for 'Get Joke by ID' Operation ---
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
                    description: 'L\'ID numérique de la blague à récupérer, ou une plage d\'IDs séparée par un tiret (ex: "10-20").',
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
                            categories: string[];
                            excludeFlags: string[];
                            jokeType: string;
                            language: string;
                            searchString: string;
                            amount: number;
                        };

                        const categories = randomJokeOptions.categories;
                        const excludeFlags = randomJokeOptions.excludeFlags;
                        const jokeType = randomJokeOptions.jokeType;
                        const language = randomJokeOptions.language;
                        const searchString = randomJokeOptions.searchString;
                        const amount = randomJokeOptions.amount;

                        const categoryPath = (categories.length > 0 && !categories.includes('Any'))
                        ? categories.join(',')
                        : 'Any';

                        url = JOKEAPI_BASE_URL + `${categoryPath}`;

                        if (excludeFlags.length > 0) {
                            queryParams.push(`blacklistFlags=${excludeFlags.join(',')}`);
                        }
                        if (jokeType) {
                            queryParams.push(`type=${jokeType}`);
                        }
                        if (language) {
                            queryParams.push(`lang=${language}`);
                        }
                        if (searchString) {
                            if (categories.length !== 1 || categories[0] === 'Any') {
                                this.logger.warn('Search String (contains) only works when exactly ONE specific category is selected (not "Any" or multiple). Ignoring searchString.');
                            } else {
                                queryParams.push(`contains=${encodeURIComponent(searchString)}`);
                            }
                        }
                        if (amount && amount > 1) {
                            queryParams.push(`amount=${amount}`);
                        }

                        if (apiKey) {
                            // Placeholder for future API key usage if needed by JokeAPI
                        }

                        if (queryParams.length > 0) {
                            url += `?${queryParams.join('&')}`;
                        }

                        this.logger.info(`Calling JokeAPI URL for getRandom: ${url}`);
                        response = (await axios.get(url)).data;
                        break;

                        case 'getById':
                            const jokeId = this.getNodeParameter('jokeId', itemIndex) as string;
                            if (!jokeId) {
                                throw new NodeOperationError(this.getNode(), 'Joke ID is required for this operation.', { itemIndex });
                            }
                            url = JOKEAPI_BASE_URL + `Any?idRange=${encodeURIComponent(jokeId)}`;

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
                    const errorMessage = response.message || 'JokeAPI returned an error.';
                    const errorCauses = response.causedBy ? ` Caused by: ${response.causedBy.join(', ')}.` : '';
                    throw new NodeOperationError(this.getNode(), `${errorMessage}${errorCauses}`, { itemIndex });
                }

                const executionData = this.helpers.returnJsonArray(Array.isArray(response) ? response : [response]);
                returnData.push(executionData);
                this.logger.info(`Operation ${operation} successful for item ${itemIndex}`);

            } catch (error) {
                this.logger.error(`Error during execution for item ${itemIndex}: ${error.message}`, error);
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
