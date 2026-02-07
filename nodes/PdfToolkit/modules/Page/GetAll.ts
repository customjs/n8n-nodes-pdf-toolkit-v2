import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { ApiHelper } from '../ApiHelper';

export async function executeGetAll(
    executeFunctions: IExecuteFunctions,
    apiHelper: ApiHelper,
    itemIndex: number
): Promise<INodeExecutionData> {
    const responseData = await apiHelper.request('GET', 'https://api.app.customjs.io/pages/api/page');

    return {
        json: responseData,
        pairedItem: {
            item: itemIndex,
        },
    };
}
