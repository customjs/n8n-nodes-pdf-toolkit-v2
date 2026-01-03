import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { ApiHelper } from '../ApiHelper';

export async function executeFillForm(
    executeFunctions: IExecuteFunctions,
    apiHelper: ApiHelper,
    itemIndex: number
): Promise<INodeExecutionData> {
    const item = executeFunctions.getInputData()[itemIndex];
    const binaryPropertyName = executeFunctions.getNodeParameter('binaryPropertyName', itemIndex) as string;
    const buffer = await executeFunctions.helpers.getBinaryDataBuffer(itemIndex, binaryPropertyName);

    const formFields = (executeFunctions.getNodeParameter('formFields', itemIndex) as any)?.field || [];
    const body = {
        input: { file: buffer, fields: formFields },
        code: `
			const { PDF_FILL_FORM } = require('./utils'); 
			const pdfInput = input.file;
			const fieldValues = Object.fromEntries((input.fields || []).map(x => [x.name, x.value]));
			return PDF_FILL_FORM(pdfInput, fieldValues);`,
        returnBinary: 'true',
    };

    const response = await apiHelper.makeRequest('n8n/pdfFormFill', body, true, itemIndex);
    const outputFilename = executeFunctions.getNodeParameter('outputFilenamePdf', itemIndex, 'output.pdf') as string;

    if (!response || (Buffer.isBuffer(response) && response.length === 0)) {
        return { json: item.json, pairedItem: { item: itemIndex } };
    }

    const binaryDataResult = await executeFunctions.helpers.prepareBinaryData(response, outputFilename);
    return {
        json: item.json,
        binary: { data: binaryDataResult },
        pairedItem: { item: itemIndex }
    };
}
