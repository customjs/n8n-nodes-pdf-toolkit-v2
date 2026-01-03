import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { ApiHelper } from '../ApiHelper';

export async function executeMerge(
    executeFunctions: IExecuteFunctions,
    apiHelper: ApiHelper,
    itemIndex: number
): Promise<INodeExecutionData> {
    const item = executeFunctions.getInputData()[itemIndex];
    const inputType = executeFunctions.getNodeParameter('inputType', itemIndex) as string;
    const body: any = {
        code: `
			const { PDF_MERGE } = require('./utils'); 
			input = [...input.files || [],...input.urls || []].filter(i => i); 
			return PDF_MERGE(input);`,
        returnBinary: 'true',
    };

    if (inputType === 'binary') {
        // Merge all items if binary
        if (itemIndex > 0) return { json: {}, pairedItem: { item: itemIndex } }; // Skip subsequent items

        const items = executeFunctions.getInputData();
        const binaryPropertyName = executeFunctions.getNodeParameter('binaryPropertyName', 0) as string;
        const files = await Promise.all(items.map(async (itm, idx) => {
            if (itm.binary && itm.binary[binaryPropertyName]) {
                return await executeFunctions.helpers.getBinaryDataBuffer(idx, binaryPropertyName);
            }
            return null;
        }));
        const validFiles = files.filter(f => f);
        body.input = { files: validFiles };
    } else {
        const urls = executeFunctions.getNodeParameter('urls', itemIndex) as string | string[];
        if (Array.isArray(urls)) {
            body.input = { urls: urls.map(u => u.trim()) };
        } else {
            body.input = { urls: urls.split(',').map(u => u.trim()) };
        }
    }

    const response = await apiHelper.makeRequest('n8n/mergePDFs', body, true, itemIndex);
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
