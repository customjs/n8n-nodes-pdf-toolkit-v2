import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { ApiHelper } from '../ApiHelper';

export const PARSE_NUMBER_CODE = "const raw = input.value; if (raw === null || raw === undefined || String(raw).trim() === '') throw new Error('No value provided'); if (typeof raw === 'number') { if (!Number.isFinite(raw)) throw new Error('Value is not a finite number'); return { number: raw, rounded: Math.round(raw * 100) / 100, isNegative: raw < 0, detectedFormat: 'number', originalText: String(raw) }; } const original = String(raw).trim(); const neg = /-/.test(original) || /^\\(.*\\)$/.test(original); let s = original.replace(/[()\\-]/g, ''); s = s.replace(/[^0-9.,'\\u00A0\\u202F\\s]/g, ''); s = s.replace(/[\\u00A0\\u202F\\s]/g, '').replace(/'/g, ''); if (!s) throw new Error('Could not find any digits in: ' + original); const style = String(input.format || 'auto'); const lastComma = s.lastIndexOf(','); const lastDot = s.lastIndexOf('.'); let normalized; let detected; if (style === 'eu') { normalized = s.replace(/\\./g, '').replace(/,([0-9]*)$/, '.$1').replace(/,/g, ''); detected = 'eu'; } else if (style === 'us') { normalized = s.replace(/,/g, ''); detected = 'us'; } else if (lastComma < 0 && lastDot < 0) { normalized = s; detected = 'plain'; } else if (lastComma > lastDot) { normalized = s.replace(/\\./g, '').split(',').length > 2 ? s.replace(/\\./g, '').replace(/,(?![^,]*$)/g, '').replace(',', '.') : s.replace(/\\./g, '').replace(',', '.'); detected = 'decimal comma (eu)'; } else { const groupingOnly = /^[0-9]{1,3}(\\.[0-9]{3})+$/.test(s) && lastComma < 0; normalized = groupingOnly ? s.replace(/\\./g, '') : s.replace(/,/g, ''); detected = groupingOnly ? 'dot grouping (eu)' : 'decimal point (us)'; } const n = parseFloat(normalized); if (!Number.isFinite(n)) throw new Error('Could not parse a number from: ' + original); const value = neg ? -n : n; return { number: value, rounded: Math.round(value * 100) / 100, isNegative: value < 0, detectedFormat: detected, originalText: original };";

export async function executeParseNumber(
    executeFunctions: IExecuteFunctions,
    apiHelper: ApiHelper,
    itemIndex: number
): Promise<INodeExecutionData> {
    const value = executeFunctions.getNodeParameter('value', itemIndex) as string;
    const format = executeFunctions.getNodeParameter('format', itemIndex, 'auto') as string;

    const body = {
        input: { value, format },
        code: PARSE_NUMBER_CODE,
        returnBinary: 'false',
    };

    const response = await apiHelper.makeRequest('n8n/parseNumber', body, false, itemIndex);
    return { json: { result: response }, pairedItem: { item: itemIndex } };
}
