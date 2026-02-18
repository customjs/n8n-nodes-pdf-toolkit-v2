import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { ApiHelper } from '../ApiHelper';

export async function executeSslCheck(
    executeFunctions: IExecuteFunctions,
    apiHelper: ApiHelper,
    itemIndex: number
): Promise<INodeExecutionData> {
    const item = executeFunctions.getInputData()[itemIndex];
    const domain = executeFunctions.getNodeParameter('domain', itemIndex) as string;
    const body = {
        input: domain,
        code: "const checkCertExpiration = require('check-cert-expiration'); return checkCertExpiration(input);",
        returnBinary: 'false',
    };

    const response = await apiHelper.makeRequest('n8n/sslchecker', body, false, itemIndex);
    return { json: { output: response }, pairedItem: { item: itemIndex } };
}
