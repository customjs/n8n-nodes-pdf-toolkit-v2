import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { ApiHelper } from '../ApiHelper';

export async function executeExtractPages(
    executeFunctions: IExecuteFunctions,
    apiHelper: ApiHelper,
    itemIndex: number
): Promise<INodeExecutionData> {
    const item = executeFunctions.getInputData()[itemIndex];
    const inputType = executeFunctions.getNodeParameter('inputType', itemIndex) as string;
    const pageRange = executeFunctions.getNodeParameter('pageRange', itemIndex) as string;
    const body: any = {
        code: `
			const { EXTRACT_PAGES_FROM_PDF } = require('./utils'); 
			const pdfBuffer = input.file ? Buffer.from(input.file, 'base64') : input.urls; 
			return EXTRACT_PAGES_FROM_PDF(pdfBuffer, input.pageRange);`,
        returnBinary: 'true',
    };

    if (inputType === 'binary') {
        const binaryPropertyName = executeFunctions.getNodeParameter('binaryPropertyName', itemIndex) as string;
        const buffer = await executeFunctions.helpers.getBinaryDataBuffer(itemIndex, binaryPropertyName);
        body.input = { file: buffer, pageRange };
    } else {
        const url = executeFunctions.getNodeParameter('url', itemIndex) as string;
        body.input = { urls: url, pageRange };
    }

    const response = await apiHelper.makeRequest('n8n/extractPages', body, true, itemIndex);
    const outputFilename = executeFunctions.getNodeParameter('outputFilenamePdf', itemIndex, 'output.pdf') as string;

    if (!response || (Buffer.isBuffer(response) && response.length === 0)) {
        return { json: item.json, pairedItem: { item: itemIndex } };
    }

    const binaryData = await executeFunctions.helpers.prepareBinaryData(response, outputFilename);
    return {
        json: item.json,
        binary: { data: binaryData },
        pairedItem: { item: itemIndex }
    };
}
