import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { ApiHelper } from '../ApiHelper';

export async function executeUpload(
    executeFunctions: IExecuteFunctions,
    apiHelper: ApiHelper,
    itemIndex: number
): Promise<INodeExecutionData> {
    const name = executeFunctions.getNodeParameter('pageName', itemIndex) as string;
    const htmlContent = executeFunctions.getNodeParameter('htmlContent', itemIndex) as string;

    const body = {
        name,
        htmlContent,
    };

    const responseData = await apiHelper.request('POST', 'https://api.app.customjs.io/pages/page/upload-html', body);

    if (responseData.htmlFileUrl) {
        responseData.htmlFileUrl = apiHelper.replaceDomain(responseData.htmlFileUrl);
    }


    return {
        json: responseData,
        pairedItem: {
            item: itemIndex,
        },
    };
}
