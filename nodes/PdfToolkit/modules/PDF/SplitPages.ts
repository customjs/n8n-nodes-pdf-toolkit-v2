import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { ApiHelper } from '../ApiHelper';

export async function executeSplitPages(
    executeFunctions: IExecuteFunctions,
    apiHelper: ApiHelper,
    itemIndex: number
): Promise<INodeExecutionData[]> {
    const item = executeFunctions.getInputData()[itemIndex];
    const inputType = executeFunctions.getNodeParameter('inputType', itemIndex) as string;
    const filenamePrefix = executeFunctions.getNodeParameter('outputFilenamePrefix', itemIndex, 'page') as string;

    let fileInput: Buffer | string;

    if (inputType === 'binary') {
        const binaryPropertyName = executeFunctions.getNodeParameter('binaryPropertyName', itemIndex) as string;
        fileInput = await executeFunctions.helpers.getBinaryDataBuffer(itemIndex, binaryPropertyName);
    } else {
        fileInput = executeFunctions.getNodeParameter('url', itemIndex) as string;
    }

    // Step 1: get page count
    const countBody: any = {
        code: `
            const { PDF_PAGE_COUNT } = require('./utils');
            const src = input.file ? Buffer.from(input.file, 'base64') : input.url;
            return PDF_PAGE_COUNT(src);
        `,
        input: inputType === 'binary' ? { file: fileInput } : { url: fileInput },
    };

    const countResponse = await apiHelper.makeRequest('n8n/splitPages', countBody, false, itemIndex);
    const pageCount: number = countResponse?.output ?? countResponse;
    if (!pageCount || pageCount < 1) {
        return [{ json: item.json, pairedItem: { item: itemIndex } }];
    }

    // Step 2: extract each page in parallel
    const pagePromises = Array.from({ length: pageCount }, (_, i) => {
        const pageNumber = i + 1;
        const body: any = {
            code: `
                const { EXTRACT_PAGES_FROM_PDF } = require('./utils');
                const src = input.file ? Buffer.from(input.file, 'base64') : input.url;
                return EXTRACT_PAGES_FROM_PDF(src, input.pageRange);
            `,
            returnBinary: 'true',
            input: {
                ...(inputType === 'binary' ? { file: fileInput } : { url: fileInput }),
                pageRange: `${pageNumber}-${pageNumber}`,
            },
        };
        return apiHelper.makeRequest('n8n/splitPages', body, true, itemIndex).then(async (response) => {
            if (!response || (Buffer.isBuffer(response) && response.length === 0)) {
                return { json: { ...item.json, page: pageNumber, totalPages: pageCount }, pairedItem: { item: itemIndex } } as INodeExecutionData;
            }
            const filename = `${filenamePrefix}_${pageNumber}.pdf`;
            const binaryData = await executeFunctions.helpers.prepareBinaryData(response, filename);
            return {
                json: { ...item.json, page: pageNumber, totalPages: pageCount },
                binary: { data: binaryData },
                pairedItem: { item: itemIndex },
            } as INodeExecutionData;
        });
    });

    return Promise.all(pagePromises);
}
