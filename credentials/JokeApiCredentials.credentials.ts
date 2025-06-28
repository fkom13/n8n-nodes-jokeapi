import {
    ICredentialType,
    INodeProperties,
} from 'n8n-workflow';

export class JokeApiCredentials implements ICredentialType {
    name = 'jokeApiCredentials'; // Doit correspondre à la valeur dans la section credentials de JokeApi.node.ts et package.json
    displayName = 'JokeAPI API Key';
    properties: INodeProperties[] = [
        {
            displayName: 'API Key (Optional)', // Indique qu'elle est optionnelle pour cette API
            name: 'apiKey',
            type: 'string',
            default: '',
                typeOptions: {
                    password: true, // Pour masquer la saisie
                },
                description: 'Votre clé API pour JokeAPI (non requise pour la plupart des appels).',
        },
    ];
}
