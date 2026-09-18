import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { ApiHelper } from '../ApiHelper';

export const PARSE_AI_JSON_CODE = "const raw = input.jsonText; if (raw === null || raw === undefined || raw === '') throw new Error('No input text provided'); if (typeof raw !== 'string') return { result: raw, wasRepaired: false, notes: ['Input was already structured data, passed through unchanged'] }; const strict = String(input.strict) === 'true'; const notes = []; let text = raw.trim(); const fence = text.match(/^```[a-zA-Z0-9]*\\s*([\\s\\S]*?)\\s*```\\s*$/); if (fence) { text = fence[1].trim(); notes.push('Removed markdown code fences'); } if (!/^[\\[{\"]/.test(text)) { const candidates = ['{', '['].map(c => text.indexOf(c)).filter(i => i >= 0); if (candidates.length) { const start = Math.min.apply(null, candidates); const close = text[start] === '{' ? '}' : ']'; const end = text.lastIndexOf(close); if (end > start) { text = text.slice(start, end + 1); notes.push('Extracted JSON block from surrounding text'); } } } const tryParse = s => { try { return { ok: true, value: JSON.parse(s) }; } catch (e) { return { ok: false, error: e.message }; } }; let attempt = tryParse(text); if (attempt.ok && typeof attempt.value === 'string') { const inner = tryParse(attempt.value); if (inner.ok && typeof inner.value === 'object' && inner.value !== null) { notes.push('Unwrapped double-serialized JSON string'); attempt = inner; } } if (!attempt.ok && !strict) { const repaired = text .replace(/[\\u201C\\u201D\\u201E]/g, '\"') .replace(/[\\u2018\\u2019]/g, \"'\") .replace(/\\bTrue\\b/g, 'true') .replace(/\\bFalse\\b/g, 'false') .replace(/\\bNone\\b/g, 'null') .replace(/\\bNaN\\b/g, 'null') .replace(/\\bundefined\\b/g, 'null') .replace(/,\\s*([}\\]])/g, '$1'); const second = tryParse(repaired); if (second.ok) { notes.push('Repaired common issues (smart quotes, trailing commas, Python/JS literals)'); attempt = second; } } if (!attempt.ok) throw new Error('Could not parse JSON' + (strict ? ' (strict mode, no content repairs attempted)' : ' after cleanup') + ': ' + attempt.error); return { result: attempt.value, wasRepaired: notes.length > 0, notes: notes };";

export async function executeParseAiJson(
    executeFunctions: IExecuteFunctions,
    apiHelper: ApiHelper,
    itemIndex: number
): Promise<INodeExecutionData> {
    const jsonText = executeFunctions.getNodeParameter('jsonText', itemIndex) as string;
    const strict = executeFunctions.getNodeParameter('strict', itemIndex, false) as boolean;

    const body = {
        input: { jsonText, strict },
        code: PARSE_AI_JSON_CODE,
        returnBinary: 'false',
    };

    const response = await apiHelper.makeRequest('n8n/parseAiJson', body, false, itemIndex);
    return { json: { result: response }, pairedItem: { item: itemIndex } };
}
