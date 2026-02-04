import { IExecuteFunctions, INodeExecutionData, NodeOperationError } from 'n8n-workflow';
import { ApiHelper } from '../ApiHelper';
import { executeJsonSelect } from './JsonSelect';
import { executeRegex } from './Regex';

export async function executeData(
    executeFunctions: IExecuteFunctions,
    apiHelper: ApiHelper,
    itemIndex: number,
    operation: string
): Promise<INodeExecutionData> {
    switch (operation) {
        case 'jsonSelect':
            return executeJsonSelect(executeFunctions, apiHelper, itemIndex);
        case 'regex':
            return executeRegex(executeFunctions, apiHelper, itemIndex);
        default:
            throw new NodeOperationError(executeFunctions.getNode(), `Unknown operation: ${operation}`, { itemIndex });
    }
}
