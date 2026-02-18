import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { ApiHelper } from '../ApiHelper';

export async function executeRegex(
    executeFunctions: IExecuteFunctions,
    apiHelper: ApiHelper,
    itemIndex: number
): Promise<INodeExecutionData> {
    const item = executeFunctions.getInputData()[itemIndex];
    const textData = executeFunctions.getNodeParameter('textData', itemIndex) as string;
    const regexPattern = executeFunctions.getNodeParameter('regexPattern', itemIndex) as string;
    const regexFlags = executeFunctions.getNodeParameter('regexFlags', itemIndex) as string;
    const regexOperation = executeFunctions.getNodeParameter('regexOperation', itemIndex) as string;
    const replacement = executeFunctions.getNodeParameter('replacement', itemIndex, '') as string;

    const body = {
        input: { textData, regexPattern, regexFlags, operation: regexOperation, replacement },
        code: "const pattern = input.regexPattern.trim().replace(/^['\"]+|['\"]+$/g, ''); return REGEX({ operation: input.operation, inputText: input.textData, pattern: pattern, flags: input.regexFlags, replacement: input.replacement });",
        returnBinary: 'false',
    };

    const response = await apiHelper.makeRequest('n8n/regexTool', body, false, itemIndex);
    return { json: { result: response }, pairedItem: { item: itemIndex } };
}
