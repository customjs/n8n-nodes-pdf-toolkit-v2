import {
	IHookFunctions,
	IWebhookFunctions,
	ILoadOptionsFunctions,
	IDataObject,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
	NodeConnectionType,
	NodeApiError,
	IAllExecuteFunctions,
	IHttpRequestMethods,
	INodeListSearchResult,
} from 'n8n-workflow';

const BASE_URL = 'https://api.app.customjs.io/mail-hook/api/mail-hook';

interface IMailHook {
	mailHookId: string;
	name: string;
	emailAddress: string;
	webhookUrl?: string;
	webhookFormat?: string;
}

/**
 * Helper to make authenticated requests to the CustomJS API.
 */
async function apiRequest(
	this: IAllExecuteFunctions,
	method: IHttpRequestMethods,
	path: string,
	body: IDataObject = {},
): Promise<any> {
	const credentials = await this.getCredentials('customJsApi');
	const options = {
		method,
		url: `${BASE_URL}${path}`,
		headers: { 'X-Api-Key': credentials.apiKey as string },
		body,
		json: true,
	};

	try {
		return await this.helpers.request(options);
	} catch (error: any) {
		throw new NodeApiError(this.getNode(), error as any);
	}
}

export class MailHookTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'CustomJS Mail Trigger',
		name: 'mailHookTrigger',
		icon: 'file:customJs.svg',
		group: ['trigger'],
		version: 1,
		description: 'Triggers the workflow when an email is received at a generated CustomJS email address.',
		defaults: {
			name: 'Mail Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'customJsApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'mail',
			},
		],
		properties: [
			{
				displayName: 'Mail Hook Name',
				name: 'name',
				type: 'string',
				default: '',
				placeholder: 'e.g. Customer Support Emails',
				description: 'A descriptive name for this mail hook. Used to find or create it in CustomJS.',
				required: false,
			},
			{
				displayName: 'Webhook Format',
				name: 'webhookFormat',
				type: 'options',
				options: [
					{
						name: 'Multipart Form Data',
						value: 'multipart/form-data',
						description: 'Sends emails with attachments as multipart form data',
					},
					{
						name: 'JSON',
						value: 'application/json',
						description: 'Sends emails as JSON (attachments as URLs only)',
					},
				],
				default: 'multipart/form-data',
				description: 'Format for webhook delivery sent by CustomJS.',
			},
			{
				displayName: 'Select Mail Hook',
				name: 'mailHookId',
				type: 'resourceLocator',
				default: { mode: 'list', value: '' },
				description: 'The CustomJS Mail Hook to use.',
				modes: [
					{
						displayName: 'From List',
						name: 'list',
						type: 'list',
						placeholder: 'Select a Mail Hook...',
						typeOptions: {
							searchListMethod: 'mailHookSearch',
						},
					},
				],
			},
		],
	};

	// ─── List Search Methods ─────────────────────────────────────────────────────

	methods = {
		listSearch: {
			/**
			 * Finds and lists all mail hooks from the account.
			 * Also handles find-or-create logic based on the 'Mail Hook Name' parameter.
			 */
			async mailHookSearch(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
				const nameParameter = this.getCurrentNodeParameter('name') as string;

				// 1. Fetch ALL hooks from the account
				const hooks: IMailHook[] = await apiRequest.call(this as any, 'GET', '');

				// 2. Prepare results list - combining both to show when selected
				const results: Array<{ name: string; value: string; description: string }> = hooks.map((h) => ({
					name: `${h.name} (${h.emailAddress})`,
					value: h.emailAddress,
					description: h.emailAddress,
				}));

				// 3. Filter if user is typing in the resource locator search box
				let filteredResults = results;
				if (filter && filter.trim() !== '') {
					filteredResults = results.filter((r) => r.name.toLowerCase().includes(filter.toLowerCase()));
				}

				// 4. Special Case: If a Name is provided in the 'Mail Hook Name' field and it doesn't exist yet,
				// we offer to create it immediately if it's not already in our list.
				const nameToFind = nameParameter?.trim() || '';
				const alreadyExists = hooks.some((h) => h.name.toLowerCase() === nameToFind.toLowerCase());

				if (nameToFind !== '' && !alreadyExists) {
					// Auto-create hook if it doesn't exist and add to top of list
					const webhookFormat = (this.getCurrentNodeParameter('webhookFormat') as string) || 'multipart/form-data';

					const created: IMailHook = await apiRequest.call(this as any, 'POST', '', {
						name: nameToFind,
						webhookUrl: 'https://placeholder.customjs.io/pending-activation',
						webhookFormat,
					});

					filteredResults.unshift({
						name: `${created.name} (${created.emailAddress})`,
						value: created.emailAddress,
						description: created.emailAddress,
					});
				}

				return {
					results: filteredResults,
				};
			},
		},
	};

	// ─── Webhook Lifecycle ───────────────────────────────────────────────────────

	webhookMethods = {
		default: {
			/**
			 * We return false here to force n8n to always call the 'create' method on activation.
			 * This allows us to sync the real webhook URL to CustomJS every time.
			 */
			async checkExists(this: IHookFunctions): Promise<boolean> {
				return false;
			},

			/**
			 * Called on workflow activation or when clicking 'Listen for Test Event'.
			 * Handles both creating a new hook or updating an existing one with the real URL.
			 */
			async create(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				const webhookUrl = this.getNodeWebhookUrl('default') as string;
				const mailHookParam = this.getNodeParameter('mailHookId') as any;
				const emailAddress = typeof mailHookParam === 'object' ? mailHookParam.value : mailHookParam;
				const name = this.getNodeParameter('name') as string;
				const webhookFormat = this.getNodeParameter('webhookFormat') as string;

				if (!emailAddress || emailAddress.trim() === '') return false;

				// --- Find mailHookId by email from the list ---
				const hooks: IMailHook[] = await apiRequest.call(this as any, 'GET', '');
				const match = hooks.find((h) => h.emailAddress === emailAddress);

				if (!match) {
					throw new NodeApiError(this.getNode(), {
						message: `Mail hook for email ${emailAddress} not found in CustomJS account.`,
					} as any);
				}

				const mailHookId = match.mailHookId;

				const response: IMailHook = await apiRequest.call(this as any, 'PUT', `/id/${mailHookId}`, {
					name: name || match.name,
					webhookUrl,
					webhookFormat,
					status: 'active',
				});

				webhookData.mailHookId = response.mailHookId;
				webhookData.emailAddress = response.emailAddress;
				return true;
			},

			/**
			 * Called on workflow deactivation. Deletes the mail hook.
			 */
			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				delete webhookData.mailHookId;
				delete webhookData.emailAddress;
				return true;
			},
		},
	};

	// ─── Webhook Handler ─────────────────────────────────────────────────────────

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const bodyData = this.getBodyData() as IDataObject;
		return {
			workflowData: [[{ json: bodyData }]],
		};
	}
}
