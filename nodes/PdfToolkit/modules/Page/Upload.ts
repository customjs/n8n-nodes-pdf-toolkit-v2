import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { ApiHelper } from '../ApiHelper';

export async function executeUpload(
    executeFunctions: IExecuteFunctions,
    apiHelper: ApiHelper,
    itemIndex: number
): Promise<INodeExecutionData> {
    const workspaceId = await apiHelper.getWorkspaceId();
    const name = executeFunctions.getNodeParameter('pageName', itemIndex) as string;
    const htmlContent = executeFunctions.getNodeParameter('htmlContent', itemIndex) as string;

    const body = {
        name,
        htmlContent,
    };

    const responseData = await apiHelper.makePageRequest(workspaceId, body);

    return {
        json: responseData,
        pairedItem: {
            item: itemIndex,
        },
    };
}
