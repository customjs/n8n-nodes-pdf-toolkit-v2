import { IExecuteFunctions, INodeExecutionData, NodeOperationError } from 'n8n-workflow';
import { ApiHelper } from '../ApiHelper';
import { executeUpload } from './Upload';

export async function executePage(
    executeFunctions: IExecuteFunctions,
    apiHelper: ApiHelper,
    itemIndex: number,
    operation: string
): Promise<INodeExecutionData> {
    switch (operation) {
        case 'upload':
            return executeUpload(executeFunctions, apiHelper, itemIndex);
        default:
            throw new NodeOperationError(executeFunctions.getNode(), `Unknown operation: ${operation}`, { itemIndex });
    }
}
