import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { ApiHelper } from '../ApiHelper';

export async function executeToonToJson(
    executeFunctions: IExecuteFunctions,
    apiHelper: ApiHelper,
    itemIndex: number
): Promise<INodeExecutionData> {
    const item = executeFunctions.getInputData()[itemIndex];
    const toon = executeFunctions.getNodeParameter('toon', itemIndex) as string;
    const body = {
        input: toon,
        code: "const toon = require('./utils/toon-cjs'); return await toon.decode(input);",
        returnBinary: 'false',
    };

    const response = await apiHelper.makeRequest('n8n/toonToJson', body, false, itemIndex);
    return { json: { json: response }, pairedItem: { item: itemIndex } };
}
