import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { ApiHelper } from '../ApiHelper';

export async function executeGetAll(
    executeFunctions: IExecuteFunctions,
    apiHelper: ApiHelper,
    itemIndex: number
): Promise<INodeExecutionData> {
    const responseData = await apiHelper.request('GET', 'https://api.app.customjs.io/pages/api/page');

    if (Array.isArray(responseData)) {
        responseData.forEach((item: any) => {
            if (item.htmlFileUrl) {
                item.htmlFileUrl = apiHelper.replaceDomain(item.htmlFileUrl);
            }
        });
    }


    return {
        json: responseData,
        pairedItem: {
            item: itemIndex,
        },
    };
}
