import { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { ApiHelper } from '../ApiHelper';

export async function executeUpdate(
    executeFunctions: IExecuteFunctions,
    apiHelper: ApiHelper,
    itemIndex: number
): Promise<INodeExecutionData> {
    const pageId = executeFunctions.getNodeParameter('pageId', itemIndex) as string;
    const htmlContent = executeFunctions.getNodeParameter('htmlContent', itemIndex) as string;
    const name = executeFunctions.getNodeParameter('pageName', itemIndex) as string;


    const body: IDataObject = {
        htmlContent,
    };

    if (name) {
        body.name = name;
    }

    const responseData = await apiHelper.request('PUT', `https://api.app.customjs.io/pages/api/page/id/${pageId}/update-html`, body, undefined, { 'customjs-origin': 'n8n/updateHtml' });

    return {
        json: responseData,
        pairedItem: {
            item: itemIndex,
        },
    };
}
