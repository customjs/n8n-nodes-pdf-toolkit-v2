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
		displayName: 'CustomJS Email Trigger',
		name: 'mailHookTrigger',
		icon: 'file:customJs.svg',
		group: ['trigger'],
		version: 1,
		description: 'Triggers the workflow when an email is received via CustomJS Mail Hook',
		defaults: {
			name: 'CustomJS Email Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionType.Main],
		credentials: [],
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
				displayName: 'To use this trigger, follow these steps:<br><br>1. Copy the <strong>Test URL</strong> or <strong>Production URL</strong> shown above when you activate this workflow<br>2. Go to <a href="https://app.customjs.io/#/mail-hooks" target="_blank">CustomJS Mail Hooks Platform</a><br>3. Create a new Mail Hook and paste the webhook URL<br>4. Use the generated email address to receive emails that trigger this workflow',
				name: 'notice',
				type: 'notice',
				default: '',
			},
		],
	};

	// ─── List Search Methods ─────────────────────────────────────────────────────


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
				return true;
			},

			/**
			 * Called on workflow deactivation. Deletes the mail hook.
			 */
			async delete(this: IHookFunctions): Promise<boolean> {
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
