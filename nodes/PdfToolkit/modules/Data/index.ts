import { IExecuteFunctions, INodeExecutionData, NodeOperationError } from 'n8n-workflow';
import { ApiHelper } from '../ApiHelper';
import { executeJsonSelect } from './JsonSelect';
import { executeParseAiJson } from './ParseAiJson';
import { executeParseNumber } from './ParseNumber';
import { executeRegex } from './Regex';
import { executeUrlToBase64 } from './UrlToBase64';

export async function executeData(
    executeFunctions: IExecuteFunctions,
    apiHelper: ApiHelper,
    itemIndex: number,
    operation: string
): Promise<INodeExecutionData | INodeExecutionData[]> {
    switch (operation) {
        case 'jsonSelect':
            return executeJsonSelect(executeFunctions, apiHelper, itemIndex);
        case 'parseAiJson':
            return executeParseAiJson(executeFunctions, apiHelper, itemIndex);
        case 'parseNumber':
            return executeParseNumber(executeFunctions, apiHelper, itemIndex);
        case 'regex':
            return executeRegex(executeFunctions, apiHelper, itemIndex);
        case 'urlToBase64':
            return executeUrlToBase64(executeFunctions, apiHelper, itemIndex);
        default:
            throw new NodeOperationError(executeFunctions.getNode(), `Unknown operation: ${operation}`, { itemIndex });
    }
}
