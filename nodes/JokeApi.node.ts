import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

import axios from 'axios';

// Base URL for JokeAPI v2
const JOKEAPI_BASE_URL = 'https://v2.jokeapi.dev';

// Available categories for JokeAPI
const jokeCategories = [
	{ name: 'Any', value: 'Any' },
	{ name: 'Programming', value: 'Programming' },
	{ name: 'Miscellaneous', value: 'Miscellaneous' },
	{ name: 'Dark', value: 'Dark' },
	{ name: 'Pun', value: 'Pun' },
	{ name: 'Spooky', value: 'Spooky' },
	{ name: 'Christmas', value: 'Christmas' },
];

// Available blacklist flags for JokeAPI
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
	{ name: 'Czech (cs)', value: 'cs' },
];

// Available joke types for JokeAPI
const jokeTypes = [
	{ name: 'Both', value: '' },
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
		description:
			"Récupère des blagues multilingues et filtrables depuis JokeAPI (v2) avec des options avancées de personnalisation et permet de récupérer les informations de l'API.",
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
			// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
			//                              OPERATION
			// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Get Random Joke',
						value: 'getRandom',
						description: 'Obtenir une blague aléatoire basée sur les filtres.',
					},
					{
						name: 'Get Joke by ID',
						value: 'getById',
						description: 'Obtenir une blague spécifique à partir de son ID ou d\'une plage d\'IDs.',
					},
					{
						name: 'Get API Info',
						value: 'getApiInfo',
						description:
							"Obtenir les informations sur l'API (catégories disponibles, flags, langues, etc.).",
					},
				],
				default: 'getRandom',
				description: "Sélectionnez l'opération à effectuer avec JokeAPI.",
			},

			// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
			//                         GET RANDOM JOKE FIELDS
			// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
			{
				displayName: 'Categories',
				name: 'categories',
				type: 'multiOptions',
				displayOptions: { show: { operation: ['getRandom'] } },
				options: jokeCategories,
				default: ['Any'],
				description:
					'Sélectionnez une ou plusieurs catégories. "Any" inclut toutes les catégories. Si "Any" est sélectionné, les autres catégories seront ignorées.',
			},
			{
				displayName: 'Exclude Flags',
				name: 'excludeFlags',
				type: 'multiOptions',
				displayOptions: { show: { operation: ['getRandom'] } },
				options: blacklistFlags,
				default: [],
				description: 'Exclure les blagues contenant ces flags (ex: NSFW, Racist).',
			},
			{
				displayName: 'Joke Type',
				name: 'jokeType',
				type: 'options',
				displayOptions: { show: { operation: ['getRandom'] } },
				options: jokeTypes,
				default: '',
				description: 'Choisissez le type de blague : "single", "twopart", ou laissez vide pour les deux.',
			},
			{
				displayName: 'Language',
				name: 'language',
				type: 'options',
				displayOptions: { show: { operation: ['getRandom', 'getById'] } },
				options: jokeLanguages,
				default: 'en',
				description: 'Sélectionnez la langue de la blague.',
			},
			{
				displayName: 'Search String (contains)',
				name: 'searchString',
				type: 'string',
				displayOptions: { show: { operation: ['getRandom'] } },
				default: '',
				placeholder: 'e.g. "robot"',
				description:
					'Rechercher une blague contenant ce texte. IMPORTANT : Ne fonctionne que si UNE SEULE catégorie spécifique est sélectionnée (pas "Any" ou plusieurs).',
			},
			{
				displayName: 'Amount',
				name: 'amount',
				type: 'number',
				displayOptions: { show: { operation: ['getRandom'] } },
				default: 1,
				typeOptions: { minValue: 1, maxValue: 10 },
				description: 'Le nombre de blagues à récupérer (1-10).',
			},

			// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
			//                           GET JOKE BY ID FIELDS
			// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
			{
				displayName: 'Joke ID(s)',
				name: 'jokeId',
				type: 'string',
				displayOptions: { show: { operation: ['getById'] } },
				default: '',
				placeholder: 'e.g. 15 or 10-20',
				required: true,
				description: 'L\'ID numérique de la blague ou une plage d\'IDs (ex: "10-20").',
			},
		],
		usableAsTool: true,
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[][] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			const fullUrl = new URL(JOKEAPI_BASE_URL);
			try {
				const operation = this.getNodeParameter('operation', itemIndex, 'getRandom') as string;
				this.logger.info(`Executing operation: ${operation} for item ${itemIndex}`);

				let response;

				switch (operation) {
					case 'getRandom': {
						// 1. Récupérer tous les paramètres directement
						const rawCategories = this.getNodeParameter('categories', itemIndex, ['Any']) as string | string[];
						const rawExcludeFlags = this.getNodeParameter('excludeFlags', itemIndex, []) as string | string[];
						const jokeType = this.getNodeParameter('jokeType', itemIndex, '') as string;
						const language = this.getNodeParameter('language', itemIndex, 'en') as string;
						const searchString = this.getNodeParameter('searchString', itemIndex, '') as string;
						const amount = this.getNodeParameter('amount', itemIndex, 1) as number;

						// 2. Gérer les catégories
						let categories: string[] = [];
						if (typeof rawCategories === 'string' && rawCategories.trim() !== '') {
							categories = rawCategories.split(',').map(s => s.trim()).filter(Boolean);
						} else if (Array.isArray(rawCategories)) {
							categories = rawCategories.filter(Boolean);
						}
						if (categories.length === 0 || categories.includes('Any')) {
							categories = ['Any'];
						}
						const categoryPath = categories.join(',');
						fullUrl.pathname = `/joke/${categoryPath}`;

						// 3. Gérer les flags à exclure
						let excludeFlags: string[] = [];
						if (typeof rawExcludeFlags === 'string' && rawExcludeFlags.trim() !== '') {
							excludeFlags = rawExcludeFlags.split(',').map(s => s.trim()).filter(Boolean);
						} else if (Array.isArray(rawExcludeFlags)) {
							excludeFlags = rawExcludeFlags.filter(Boolean);
						}
						if (excludeFlags.length > 0) {
							fullUrl.searchParams.append('blacklistFlags', excludeFlags.join(','));
						}

						// 4. Gérer les autres paramètres optionnels
						if (jokeType) {
							fullUrl.searchParams.append('type', jokeType);
						}
						if (language && language !== 'en') {
							fullUrl.searchParams.append('lang', language);
						}
						if (searchString && searchString.trim() !== '') {
							if (categories.length !== 1 || categories[0] === 'Any') {
								throw new NodeOperationError(
									this.getNode(),
									`Validation Error: The 'Search String' option is only allowed when exactly ONE specific category is selected (not 'Any' or multiple). Current categories: ${categories.join(', ')}. `,
									{ itemIndex },
								);
							}
							fullUrl.searchParams.append('contains', searchString.trim());
						}
						if (amount && amount > 1) {
							fullUrl.searchParams.append('amount', String(amount));
						}

						this.logger.info(`Calling JokeAPI URL for getRandom: ${fullUrl.toString()}`);
						response = (await axios.get(fullUrl.toString())).data;
						break;
					}

					case 'getById': {
						const jokeId = this.getNodeParameter('jokeId', itemIndex, '') as string;
						const language = this.getNodeParameter('language', itemIndex, 'en') as string;

						if (!jokeId || !jokeId.trim()) {
							throw new NodeOperationError(this.getNode(), 'Joke ID is required for this operation.', { itemIndex });
						}
						if (/[^0-9\-]/.test(jokeId)) {
							throw new NodeOperationError(
								this.getNode(),
								`Invalid characters in Joke ID. Only numbers and hyphens are allowed. Received: "${jokeId}"`,
								{ itemIndex },
							);
						}

						fullUrl.pathname = '/joke/Any';
						fullUrl.searchParams.append('idRange', jokeId.trim());

						if (language && language !== 'en') {
							fullUrl.searchParams.append('lang', language);
						}

						this.logger.info(`Calling JokeAPI URL for getById: ${fullUrl.toString()}`);
						response = (await axios.get(fullUrl.toString())).data;
						break;
					}

					case 'getApiInfo':
						fullUrl.pathname = '/info';
						this.logger.info(`Calling JokeAPI URL for getApiInfo: ${fullUrl.toString()}`);
						response = (await axios.get(fullUrl.toString())).data;
						break;

					default:
						throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, { itemIndex });
				}

				if (response.error === true) {
					const errorMessage = response.message || 'JokeAPI returned an unknown error.';
					const additionalInfo = response.additionalInfo ? ` Details: ${response.additionalInfo}` : '';
					throw new NodeOperationError(
						this.getNode(),
						`API Error: ${errorMessage}${additionalInfo}. Requested URL: ${fullUrl.toString()}`,
						{ itemIndex },
					);
				}

				const executionData = this.helpers.returnJsonArray(
					response.jokes || (Array.isArray(response) ? response : [response]),
				);
				returnData.push(executionData);
				this.logger.info(`Operation ${operation} successful for item ${itemIndex}`);

			} catch (error) {
				this.logger.error(`Error during execution for item ${itemIndex}: ${error.message}`, error);

				if (this.continueOnFail()) {
					const errorData = this.helpers.returnJsonArray({
						error: error.message,
						failedUrl: fullUrl.toString(),
						details: (error as Error).stack,
					});
					returnData.push(errorData);
					continue;
				}

				if (error instanceof NodeOperationError) {
					throw error;
				}

				if (axios.isAxiosError(error)) {
					const builtUrl = fullUrl.toString();
					if (error.response) {
						const { status, data } = error.response;
						const apiMessage = data?.message || 'No additional message from API.';
						const additionalInfo = data?.additionalInfo ? ` Details: ${data.additionalInfo}` : '';
						throw new NodeOperationError(
							this.getNode(),
							`HTTP ${status} - ${apiMessage}${additionalInfo} - Failed URL: ${builtUrl}`,
							{ itemIndex },
						);
					} else {
						throw new NodeOperationError(
							this.getNode(),
							`Network Error: ${error.message}. Could not reach URL: ${builtUrl}`,
							{ itemIndex },
						);
					}
				}

				throw new NodeOperationError(this.getNode(), `Unknown Error: ${error.message}. Requested URL: ${fullUrl.toString()}`, { itemIndex });
			}
		}
		return returnData;
	}
}