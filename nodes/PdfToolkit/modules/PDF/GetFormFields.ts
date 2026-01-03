import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { ApiHelper } from '../ApiHelper';

export async function executeGetFormFields(
    executeFunctions: IExecuteFunctions,
    apiHelper: ApiHelper,
    itemIndex: number
): Promise<INodeExecutionData> {
    const item = executeFunctions.getInputData()[itemIndex];
    const binaryPropertyName = executeFunctions.getNodeParameter('binaryPropertyName', itemIndex) as string;
    const buffer = await executeFunctions.helpers.getBinaryDataBuffer(itemIndex, binaryPropertyName);

    const body = {
        input: { file: buffer },
        code: `
			const { PDF_GET_FORM_FIELD_NAMES } = require('./utils'); 
			const pdfInput = input.file;
			return PDF_GET_FORM_FIELD_NAMES(pdfInput);`,
        returnBinary: 'false',
    };

    const response = await apiHelper.makeRequest('n8n/getFormFieldNames', body, false, itemIndex);
    return { json: response, pairedItem: { item: itemIndex } };
}
