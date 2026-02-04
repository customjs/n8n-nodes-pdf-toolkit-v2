import { IExecuteFunctions, INodeExecutionData, NodeOperationError } from 'n8n-workflow';
import { ApiHelper } from '../ApiHelper';
import { executePdfToPng } from './PdfToPng';
import { executePdfToText } from './PdfToText';
import { executeHtmlToDocx } from './HtmlToDocx';
import { executeHtmlToPdf } from './HtmlToPdf';
import { executeJsonToToon } from './JsonToToon';
import { executeToonToJson } from './ToonToJson';
import { executeMarkdownToHtml } from './MarkdownToHtml';

export async function executeConvert(
    executeFunctions: IExecuteFunctions,
    apiHelper: ApiHelper,
    itemIndex: number,
    operation: string
): Promise<INodeExecutionData> {
    switch (operation) {
        case 'pdfToPng':
            return executePdfToPng(executeFunctions, apiHelper, itemIndex);
        case 'pdfToText':
            return executePdfToText(executeFunctions, apiHelper, itemIndex);
        case 'htmlToDocx':
            return executeHtmlToDocx(executeFunctions, apiHelper, itemIndex);
        case 'htmlToPdf':
            return executeHtmlToPdf(executeFunctions, apiHelper, itemIndex);
        case 'jsonToToon':
            return executeJsonToToon(executeFunctions, apiHelper, itemIndex);
        case 'toonToJson':
            return executeToonToJson(executeFunctions, apiHelper, itemIndex);
        case 'markdownToHtml':
            return executeMarkdownToHtml(executeFunctions, apiHelper, itemIndex);
        default:
            throw new NodeOperationError(executeFunctions.getNode(), `Unknown operation: ${operation}`, { itemIndex });
    }
}
