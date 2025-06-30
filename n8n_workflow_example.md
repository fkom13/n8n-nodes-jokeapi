```json
{
  "nodes": [
    {
      "parameters": {
        "descriptionType": "manual",
        "toolDescription": "Récupère les informations à jour et listes d'options, catégories et de filtres pour l'api JokeAPI (v2)",
        "operation": "getApiInfo"
      },
      "type": "n8n-nodes-jokeapi.jokeApiTool",
      "typeVersion": 1,
      "position": [
        -240,
        60
      ],
      "id": "50a374d1-6291-46f9-b9e4-de56a8cb9224",
      "name": "JokeAPIinfos",
      "credentials": {
        "jokeApiCredentials": {
          "id": "RLUyPnfjJqLrCy6P",
          "name": "JokeAPI Key account"
        }
      }
    },
    {
      "parameters": {
        "descriptionType": "manual",
        "toolDescription": "=Récupère des blagues multilingues et filtrables depuis JokeAPI (v2) avec des options avancées de personnalisation et permet de récupérer les informations et paramètres de l'API avec 'Get_API_Info' .\n\n",
        "categories": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('Categories', `Choose List of Categories with comma separated, list at 'GET Api Info', 'Any' for all catégories.`, 'string') }}",
        "excludeFlags": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('Exclude_Flags', `Choose List of Flags with comma separated, list at 'GET Api Info' (eg. 'NFSW')`, 'string') }}",
        "jokeType": "={{ $fromAI('Joke_Type',`choos if you want 'singe', 'twopart' or 'both' type of joke`,'string','both') }}",
        "language": "={{ $fromAI('Language',`Choose Language in two letter normalised country (eg. fr,en,es,de...), défault en (english), verify list of availlable country at 'GET Api Info'`,'string','en') }}",
        "searchString": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('Search_String__contains_', `A string you want to find for subject of joke search, contain-search is only allowed on a single specific category.`, 'string') }}",
        "amount": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('Amount', `Amount of jokes in response you want: 1 to 10 max.`, 'number') }}"
      },
      "type": "n8n-nodes-jokeapi.jokeApiTool",
      "typeVersion": 1,
      "position": [
        -80,
        60
      ],
      "id": "223f1305-5721-4b76-861f-16080e5d5228",
      "name": "JokeAPIrandom",
      "credentials": {
        "jokeApiCredentials": {
          "id": "RLUyPnfjJqLrCy6P",
          "name": "JokeAPI Key account"
        }
      }
    },
    {
      "parameters": {
        "descriptionType": "manual",
        "toolDescription": "Récupère une blague ou un interval de blague depuis JokeAPI (v2) avec des options avancées de personnalisation et permet de récupérer les informations et paramètres de l'API avec Get_API_Info .",
        "operation": "getById",
        "language": "={{ $fromAI('Language',`Choose Language in two letter normalised country (eg. fr,en,es,de...), défault en (english)`,'string','en') }}",
        "jokeId": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('Joke_ID_s_', `Provide a joke ID or interval, example: 24 or 10-18, verify list interval compatibility with country in 'GET Api Info'.`, 'string') }}"
      },
      "type": "n8n-nodes-jokeapi.jokeApiTool",
      "typeVersion": 1,
      "position": [
        80,
        60
      ],
      "id": "4506e6c8-286d-4942-9264-eacbbbfdf5bd",
      "name": "JokeAPIid",
      "credentials": {
        "jokeApiCredentials": {
          "id": "RLUyPnfjJqLrCy6P",
          "name": "JokeAPI Key account"
        }
      }
    }
  ],
  "connections": {
    "JokeAPIinfos": {
      "ai_tool": [
        []
      ]
    },
    "JokeAPIrandom": {
      "ai_tool": [
        []
      ]
    },
    "JokeAPIid": {
      "ai_tool": [
        []
      ]
    }
  },
  "pinData": {},
  "meta": {
    "templateCredsSetupCompleted": true,
    "instanceId": "ae98dd21bfe9f76659b0ac968f7253f51d92dd5c89d787185aa4ee5839853096"
  }
}
```