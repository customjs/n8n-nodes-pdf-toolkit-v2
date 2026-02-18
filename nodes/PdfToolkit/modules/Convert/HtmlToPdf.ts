import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { ApiHelper } from '../ApiHelper';

export async function executeHtmlToPdf(
    executeFunctions: IExecuteFunctions,
    apiHelper: ApiHelper,
    itemIndex: number
): Promise<INodeExecutionData> {
    const item = executeFunctions.getInputData()[itemIndex];
    const html = executeFunctions.getNodeParameter('html', itemIndex) as string;
    const pdfWidthMm = executeFunctions.getNodeParameter('pdfWidthMm', itemIndex, 210) as number;
    const pdfHeightMm = executeFunctions.getNodeParameter('pdfHeightMm', itemIndex, 297) as number;

    const body: any = {
        input: html,
        code: `const { HTML2PDF } = require('./utils'); return HTML2PDF(input, {"pdfWidthMm": ${pdfWidthMm}, "pdfHeightMm": ${pdfHeightMm} })`,
        returnBinary: 'true',
    };

    const response = await apiHelper.makeRequest('n8n/generatePDF', body, true, itemIndex);
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
