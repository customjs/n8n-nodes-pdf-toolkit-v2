import { IExecuteFunctions, INodeExecutionData, NodeOperationError } from 'n8n-workflow';
import { ApiHelper } from '../ApiHelper';
import { executeUpload } from './Upload';
import { executeGetAll } from './GetAll';
import { executeUpdate } from './Update';
import { executeUpsert } from './Upsert';

export async function executePage(
    executeFunctions: IExecuteFunctions,
    apiHelper: ApiHelper,
    itemIndex: number,
    operation: string
): Promise<INodeExecutionData[] | INodeExecutionData> {
    switch (operation) {
        case 'upload':
            return executeUpload(executeFunctions, apiHelper, itemIndex);
        case 'getAll':
            return executeGetAll(executeFunctions, apiHelper, itemIndex);
        case 'update':
            return executeUpdate(executeFunctions, apiHelper, itemIndex);
        case 'upsert':
            return executeUpsert(executeFunctions, apiHelper, itemIndex);
        default:
            throw new NodeOperationError(executeFunctions.getNode(), `Unknown operation: ${operation}`, { itemIndex });
    }
}
