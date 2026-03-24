import { IExecuteFunctions, INodeExecutionData, NodeOperationError } from 'n8n-workflow';
import { ApiHelper } from '../ApiHelper';
import { executeCompress } from './Compress';
import { executeMerge } from './Merge';
import { executeExtractPages } from './ExtractPages';
import { executeGetFormFields } from './GetFormFields';
import { executeFillForm } from './FillForm';
import { executeGenerateInvoice } from './GenerateInvoice';

export async function executePDF(
    executeFunctions: IExecuteFunctions,
    apiHelper: ApiHelper,
    itemIndex: number,
    operation: string
): Promise<INodeExecutionData | INodeExecutionData[]> {
    switch (operation) {
        case 'compress':
            return executeCompress(executeFunctions, apiHelper, itemIndex);
        case 'merge':
            return executeMerge(executeFunctions, apiHelper, itemIndex);
        case 'extractPages':
            return executeExtractPages(executeFunctions, apiHelper, itemIndex);
        case 'getFormFields':
            return executeGetFormFields(executeFunctions, apiHelper, itemIndex);
        case 'fillForm':
            return executeFillForm(executeFunctions, apiHelper, itemIndex);
        case 'generateInvoice':
            return executeGenerateInvoice(executeFunctions, apiHelper, itemIndex);
        default:
            throw new NodeOperationError(executeFunctions.getNode(), `Unknown operation: ${operation}`, { itemIndex });
    }
}
