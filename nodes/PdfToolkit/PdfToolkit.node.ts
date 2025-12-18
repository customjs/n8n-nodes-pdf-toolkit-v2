import {
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
    NodeOperationError,
    NodeConnectionType,
} from 'n8n-workflow';

import { ApiHelper } from './modules/ApiHelper';
import { executeConvert } from './modules/Convert';
import { executePDF } from './modules/PDF';
import { executeWeb } from './modules/Web';
import { executeData } from './modules/Data';

export class PdfToolkit implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'CustomJS (PDF & File Toolkit)',
        name: 'pdfToolkit',
        icon: 'file:customJs.svg',
        group: ['transform'],
        version: 1,
        description: 'All-in-one toolkit for PDF, HTML, JSON, and file conversions.',
        defaults: {
            name: 'PDF Toolkit',
        },
        inputs: [NodeConnectionType.Main],
        outputs: [NodeConnectionType.Main],
        credentials: [
            {
                name: 'customJsApi',
                required: true,
            },
        ],
        properties: [
            {
                displayName: 'Resource',
                name: 'resource',
                type: 'options',
                noDataExpression: true,
                options: [
                    {
                        name: 'Convert',
                        value: 'convert',
                    },
                    {
                        name: 'PDF',
                        value: 'pdf',
                    },
                    {
                        name: 'Web',
                        value: 'web',
                    },
                    {
                        name: 'Data',
                        value: 'data',
                    },
                ],
                default: 'convert',
            },
            // Operations for Convert Resource
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                displayOptions: {
                    show: {
                        resource: ['convert'],
                    },
                },
                options: [
                    {
                        name: 'PDF to PNG',
                        value: 'pdfToPng',
                        action: 'Convert PDF to PNG',
                    },
                    {
                        name: 'PDF to Text',
                        value: 'pdfToText',
                        action: 'Convert PDF to Text',
                    },
                    {
                        name: 'HTML to DOCX',
                        value: 'htmlToDocx',
                        action: 'Convert HTML to DOCX',
                    },
                    {
                        name: 'HTML to PDF',
                        value: 'htmlToPdf',
                        action: 'Convert HTML to PDF',
                    },
                    {
                        name: 'JSON to TOON',
                        value: 'jsonToToon',
                        action: 'Convert JSON to TOON',
                    },
                    {
                        name: 'TOON to JSON',
                        value: 'toonToJson',
                        action: 'Convert TOON to JSON',
                    },
                    {
                        name: 'Markdown to HTML',
                        value: 'markdownToHtml',
                        action: 'Convert Markdown to HTML',
                    },
                ],
                default: 'pdfToPng',
            },
            // Operations for PDF Resource
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                displayOptions: {
                    show: {
                        resource: ['pdf'],
                    },
                },
                options: [
                    {
                        name: 'Compress',
                        value: 'compress',
                        action: 'Compress PDF',
                    },
                    {
                        name: 'Merge',
                        value: 'merge',
                        action: 'Merge PDFs',
                    },
                    {
                        name: 'Extract Pages',
                        value: 'extractPages',
                        action: 'Extract Pages from PDF',
                    },
                    {
                        name: 'Get Form Fields',
                        value: 'getFormFields',
                        action: 'Get PDF Form Fields',
                    },
                    {
                        name: 'Fill Form',
                        value: 'fillForm',
                        action: 'Fill PDF Form',
                    },
                    {
                        name: 'Generate Invoice',
                        value: 'generateInvoice',
                        action: 'Generate Invoice PDF',
                    },
                ],
                default: 'compress',
            },
            // Operations for Web Resource
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                displayOptions: {
                    show: {
                        resource: ['web'],
                    },
                },
                options: [
                    {
                        name: 'Scrape',
                        value: 'scrape',
                        action: 'Scrape Website',
                    },
                    {
                        name: 'Screenshot',
                        value: 'screenshot',
                        action: 'Take Screenshot',
                    },
                    {
                        name: 'SSL Check',
                        value: 'sslCheck',
                        action: 'Check SSL',
                    },
                ],
                default: 'scrape',
            },
            // Operations for Data Resource
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                displayOptions: {
                    show: {
                        resource: ['data'],
                    },
                },
                options: [
                    {
                        name: 'JSON Select',
                        value: 'jsonSelect',
                        action: 'Select JSON Data',
                    },
                    {
                        name: 'Regex',
                        value: 'regex',
                        action: 'Regex Tool',
                    },
                ],
                default: 'jsonSelect',
            },

            // --- Inputs ---

            // Input Type (Binary/URL)
            {
                displayName: 'Input Type',
                name: 'inputType',
                type: 'options',
                options: [
                    {
                        name: 'Binary',
                        value: 'binary',
                    },
                    {
                        name: 'URL',
                        value: 'url',
                    },
                ],
                default: 'binary',
                displayOptions: {
                    show: {
                        resource: ['convert', 'pdf'],
                        operation: ['pdfToPng', 'pdfToText', 'compress', 'merge', 'extractPages', 'getFormFields', 'fillForm'],
                    },
                },
            },
            // Binary Property Name
            {
                displayName: 'Input Binary Field',
                name: 'binaryPropertyName',
                type: 'string',
                default: 'data',
                required: true,
                displayOptions: {
                    show: {
                        inputType: ['binary'],
                        resource: ['convert', 'pdf'],
                        operation: ['pdfToPng', 'pdfToText', 'compress', 'merge', 'extractPages', 'getFormFields', 'fillForm'],
                    },
                },
                description: 'The name of the binary property containing the data.',
            },
            // URL Input
            {
                displayName: 'URL',
                name: 'url',
                type: 'string',
                default: '',
                required: true,
                displayOptions: {
                    show: {
                        inputType: ['url'],
                        resource: ['convert', 'pdf'],
                        operation: ['pdfToPng', 'pdfToText', 'compress', 'extractPages'],
                    },
                },
                description: 'URL of the file to process.',
            },
            // URL Input for Merge (Array)
            {
                displayName: 'URLs',
                name: 'urls',
                type: 'string',
                default: '',
                required: true,
                displayOptions: {
                    show: {
                        inputType: ['url'],
                        resource: ['pdf'],
                        operation: ['merge'],
                    },
                },
                description: 'Comma-separated URLs of the files to process.',
            },
            // HTML Input
            {
                displayName: 'HTML',
                name: 'html',
                type: 'string',
                typeOptions: {
                    rows: 10,
                },
                default: '',
                required: true,
                displayOptions: {
                    show: {
                        resource: ['convert'],
                        operation: ['htmlToDocx', 'htmlToPdf'],
                    },
                },
                description: 'HTML content to convert.',
            },
            // JSON Input
            {
                displayName: 'JSON',
                name: 'json',
                type: 'json',
                typeOptions: {
                    rows: 10,
                },
                default: '{}',
                required: true,
                displayOptions: {
                    show: {
                        resource: ['convert', 'data'],
                        operation: ['jsonToToon', 'jsonSelect'],
                    },
                },
                description: 'JSON content to process.',
            },
            // TOON Input
            {
                displayName: 'TOON String',
                name: 'toon',
                type: 'string',
                typeOptions: {
                    rows: 5,
                },
                default: '',
                required: true,
                displayOptions: {
                    show: {
                        resource: ['convert'],
                        operation: ['toonToJson'],
                    },
                },
                description: 'TOON string to convert.',
            },
            // Markdown Input
            {
                displayName: 'Markdown',
                name: 'markdown',
                type: 'string',
                typeOptions: {
                    rows: 10,
                },
                default: '',
                required: true,
                displayOptions: {
                    show: {
                        resource: ['convert'],
                        operation: ['markdownToHtml'],
                    },
                },
                description: 'Markdown content to convert.',
            },
            // Page Range (Extract Pages)
            {
                displayName: 'Page Range',
                name: 'pageRange',
                type: 'string',
                default: '1',
                description: 'The range of pages to extract. Default is first page. (ex: 1-3, or 4)',
                displayOptions: {
                    show: {
                        resource: ['pdf'],
                        operation: ['extractPages'],
                    },
                },
            },
            // Form Fields (Fill Form)
            {
                displayName: 'Form Fields',
                name: 'formFields',
                type: 'fixedCollection',
                typeOptions: {
                    multipleValues: true,
                },
                default: {},
                options: [
                    {
                        name: 'field',
                        displayName: 'Field',
                        values: [
                            {
                                displayName: 'Name',
                                name: 'name',
                                type: 'string',
                                default: '',
                                description: 'Name of the form field',
                            },
                            {
                                displayName: 'Value',
                                name: 'value',
                                type: 'string',
                                default: '',
                                description: 'Value of the form field',
                            },
                        ],
                    },
                ],
                displayOptions: {
                    show: {
                        resource: ['pdf'],
                        operation: ['fillForm'],
                    },
                },
            },
            // Invoice Generator Inputs
            {
                displayName: 'PDF Template',
                name: 'pdfTemplate',
                type: 'options',
                required: true,
                default: '1-en',
                options: [
                    {
                        name: 'Template 1 (EN)',
                        value: '1-en',
                    },
                ],
                displayOptions: {
                    show: {
                        resource: ['pdf'],
                        operation: ['generateInvoice'],
                    },
                },
            },
            // ... Invoice Generator Fixed Collections (Issuer, Payment, Recipient, Billing, Items) ...
            {
                displayName: 'Issuer (Sender Information)',
                name: 'issuer',
                type: 'fixedCollection',
                typeOptions: { multipleValues: false },
                default: {},
                displayOptions: { show: { resource: ['pdf'], operation: ['generateInvoice'] } },
                options: [
                    {
                        name: 'issuerValues',
                        displayName: 'Issuer',
                        values: [
                            { displayName: 'Company Name', name: 'companyName', type: 'string', default: '' },
                            { displayName: 'Address', name: 'address', type: 'string', typeOptions: { multiLine: true }, default: '' },
                        ]
                    }
                ],
            },
            {
                displayName: 'Recipient (Customer Information)',
                name: 'recipient',
                type: 'fixedCollection',
                typeOptions: { multipleValues: false },
                default: {},
                displayOptions: { show: { resource: ['pdf'], operation: ['generateInvoice'] } },
                options: [
                    {
                        name: 'recipientValues',
                        displayName: 'Recipient',
                        values: [
                            { displayName: 'Customer Name', name: 'name', type: 'string', default: '' },
                            { displayName: 'Address', name: 'address', type: 'string', typeOptions: { multiLine: true }, default: '' },
                        ]
                    }
                ],
            },
            {
                displayName: 'Items Input Mode',
                name: 'itemsMode',
                type: 'options',
                options: [
                    { name: 'Define Manually', value: 'define' },
                    { name: 'Use JSON Input', value: 'json' },
                ],
                default: 'define',
                displayOptions: { show: { resource: ['pdf'], operation: ['generateInvoice'] } },
            },
            {
                displayName: 'Items JSON',
                name: 'itemsJson',
                type: 'json',
                default: '[{"description":"Item 1","quantity":2,"unitPrice":50}]',
                displayOptions: {
                    show: {
                        resource: ['pdf'],
                        operation: ['generateInvoice'],
                        itemsMode: ['json'],
                    },
                },
            },
            // Web Scraper Inputs
            {
                displayName: 'Website URL',
                name: 'url',
                type: 'string',
                default: '',
                required: true,
                displayOptions: {
                    show: {
                        resource: ['web'],
                        operation: ['scrape', 'screenshot'],
                    },
                },
            },
            {
                displayName: 'Return Type',
                name: 'returnValueType',
                type: 'options',
                options: [
                    { name: 'Raw HTML', value: 'text' },
                    { name: 'Screenshot (PNG)', value: 'binary' },
                ],
                default: 'text',
                displayOptions: {
                    show: {
                        resource: ['web'],
                        operation: ['scrape'],
                    },
                },
            },
            {
                displayName: 'Debug Mode',
                name: 'debug',
                type: 'boolean',
                default: true,
                displayOptions: {
                    show: {
                        resource: ['web'],
                        operation: ['scrape'],
                    },
                },
            },
            // SSL Check Inputs
            {
                displayName: 'Domain',
                name: 'domain',
                type: 'string',
                default: '',
                required: true,
                displayOptions: {
                    show: {
                        resource: ['web'],
                        operation: ['sslCheck'],
                    },
                },
            },
            // Data Inputs
            {
                displayName: 'Selector Path',
                name: 'path',
                type: 'string',
                default: '',
                required: true,
                displayOptions: {
                    show: {
                        resource: ['data'],
                        operation: ['jsonSelect'],
                    },
                },
                description: 'JSON-PATH Example: $[0].obj[*].item',
            },
            {
                displayName: 'Input Text',
                name: 'textData',
                type: 'string',
                default: '',
                required: true,
                displayOptions: {
                    show: {
                        resource: ['data'],
                        operation: ['regex'],
                    },
                },
            },
            {
                displayName: 'Regex Pattern',
                name: 'regexPattern',
                type: 'string',
                default: '',
                required: true,
                displayOptions: {
                    show: {
                        resource: ['data'],
                        operation: ['regex'],
                    },
                },
            },
            {
                displayName: 'Regex Flags',
                name: 'regexFlags',
                type: 'string',
                default: 'g',
                required: true,
                displayOptions: {
                    show: {
                        resource: ['data'],
                        operation: ['regex'],
                    },
                },
            },
            {
                displayName: 'Regex Operation',
                name: 'regexOperation',
                type: 'options',
                options: [
                    { name: 'Extract', value: 'extract' },
                    { name: 'Replace', value: 'replace' },
                    { name: 'Test', value: 'test' },
                    { name: 'Split', value: 'split' },
                ],
                default: 'extract',
                displayOptions: {
                    show: {
                        resource: ['data'],
                        operation: ['regex'],
                    },
                },
            },
            {
                displayName: 'Replacement',
                name: 'replacement',
                type: 'string',
                default: '',
                displayOptions: {
                    show: {
                        resource: ['data'],
                        operation: ['regex'],
                        regexOperation: ['replace'],
                    },
                },
            },

            // Output Filename (PDF)
            {
                displayName: 'Output Filename',
                name: 'outputFilenamePdf',
                type: 'string',
                default: 'output.pdf',
                required: false,
                displayOptions: {
                    show: {
                        resource: ['convert', 'pdf'],
                        operation: ['htmlToPdf', 'compress', 'merge', 'extractPages', 'fillForm', 'generateInvoice'],
                    },
                },
                description: 'Name of the output file (including extension).',
            },
            // Output Filename (PNG)
            {
                displayName: 'Output Filename',
                name: 'outputFilenamePng',
                type: 'string',
                default: 'output.png',
                required: false,
                displayOptions: {
                    show: {
                        resource: ['convert', 'web'],
                        operation: ['pdfToPng', 'screenshot'],
                    },
                },
                description: 'Name of the output file (including extension).',
            },
            // Output Filename (PNG) for Scraper
            {
                displayName: 'Output Filename',
                name: 'outputFilenamePng',
                type: 'string',
                default: 'output.png',
                required: false,
                displayOptions: {
                    show: {
                        resource: ['web'],
                        operation: ['scrape'],
                        returnValueType: ['binary'],
                    },
                },
                description: 'Name of the output file (including extension).',
            },
            // Output Filename (DOCX)
            {
                displayName: 'Output Filename',
                name: 'outputFilenameDocx',
                type: 'string',
                default: 'output.docx',
                required: false,
                displayOptions: {
                    show: {
                        resource: ['convert'],
                        operation: ['htmlToDocx'],
                    },
                },
                description: 'Name of the output file (including extension).',
            },
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];
        const resource = this.getNodeParameter('resource', 0) as string;
        const operation = this.getNodeParameter('operation', 0) as string;
        const apiHelper = new ApiHelper(this);

        for (let i = 0; i < items.length; i++) {
            try {
                let result: INodeExecutionData;
                if (resource === 'convert') {
                    result = await executeConvert(this, apiHelper, i, operation);
                } else if (resource === 'pdf') {
                    result = await executePDF(this, apiHelper, i, operation);
                } else if (resource === 'web') {
                    result = await executeWeb(this, apiHelper, i, operation);
                } else if (resource === 'data') {
                    result = await executeData(this, apiHelper, i, operation);
                } else {
                    throw new Error(`Unknown resource: ${resource}`);
                }
                returnData.push(result);
            } catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({ json: { error: (error as Error).message }, pairedItem: { item: i } });
                    continue;
                }
                throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
            }
        }

        return [returnData];
    }
}
