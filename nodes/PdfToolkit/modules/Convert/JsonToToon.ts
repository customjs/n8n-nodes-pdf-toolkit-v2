import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { ApiHelper } from '../ApiHelper';

export async function executeJsonToToon(
    executeFunctions: IExecuteFunctions,
    apiHelper: ApiHelper,
    itemIndex: number
): Promise<INodeExecutionData> {
    const item = executeFunctions.getInputData()[itemIndex];
    const json = executeFunctions.getNodeParameter('json', itemIndex);
    const body = {
        input: json,
        code: "const toon = require('./utils/toon-cjs'); const data = typeof input === 'string' ? JSON.parse(input) : input; const encoded = await toon.encode(data); return encoded;",
        returnBinary: 'false',
    };

    const response = await apiHelper.makeRequest('n8n/jsonToToon', body, false, itemIndex);
    return { json: { toon: response }, pairedItem: { item: itemIndex } };
}
