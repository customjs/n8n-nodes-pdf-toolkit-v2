import { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { ApiHelper } from '../ApiHelper';

export async function executeUpsert(
    executeFunctions: IExecuteFunctions,
    apiHelper: ApiHelper,
    itemIndex: number
): Promise<INodeExecutionData> {
    const name = executeFunctions.getNodeParameter('pageName', itemIndex) as string;
    const htmlContent = executeFunctions.getNodeParameter('htmlContent', itemIndex) as string;

    const pages = await apiHelper.request('GET', 'https://api.app.customjs.io/pages/api/page', undefined, undefined, { 'customjs-origin': 'n8n/htmlPages' });

    const existingPage = pages.find((p: any) => p.name === name);

    let responseData;

    if (existingPage) {
        const body: IDataObject = {
            htmlContent,
            name,
        };
        responseData = await apiHelper.request('PUT', `https://api.app.customjs.io/pages/api/page/id/${existingPage.pageId}/update-html`, body, undefined, { 'customjs-origin': 'n8n/updateHtml' });
    } else {
        const body = {
            name,
            htmlContent,
        };
        responseData = await apiHelper.request('POST', 'https://api.app.customjs.io/pages/page/upload-html', body, undefined, { 'customjs-origin': 'n8n/uploadHtml' });
    }

    return {
        json: responseData,
        pairedItem: {
            item: itemIndex,
        },
    };
}
