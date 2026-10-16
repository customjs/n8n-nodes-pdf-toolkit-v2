import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { ApiHelper } from '../ApiHelper';

export const URL_TO_BASE64_CODE = "const url = String(input.url || '').trim(); if (!url) throw new Error('No URL provided'); if (!/^https?:\\/\\//i.test(url)) throw new Error('URL must start with http:// or https://'); const res = await fetch(url, { redirect: 'follow' }); if (!res.ok) throw new Error('HTTP ' + res.status + ' when fetching ' + url); const buf = Buffer.from(await res.arrayBuffer()); const max = 8 * 1024 * 1024; if (buf.length > max) throw new Error('File is larger than 8 MB (' + buf.length + ' bytes)'); const ctHeader = res.headers.get('content-type'); const contentType = ctHeader ? String(ctHeader).split(';')[0].trim() : 'application/octet-stream'; const base64 = buf.toString('base64'); return { base64: base64, dataUri: 'data:' + contentType + ';base64,' + base64, contentType: contentType, bytes: buf.length };";

export async function executeUrlToBase64(
    executeFunctions: IExecuteFunctions,
    apiHelper: ApiHelper,
    itemIndex: number
): Promise<INodeExecutionData> {
    const url = executeFunctions.getNodeParameter('url', itemIndex) as string;

    const body = {
        input: { url },
        code: URL_TO_BASE64_CODE,
        returnBinary: 'false',
    };

    const response = await apiHelper.makeRequest('n8n/urlToBase64', body, false, itemIndex);
    return { json: { result: response }, pairedItem: { item: itemIndex } };
}
