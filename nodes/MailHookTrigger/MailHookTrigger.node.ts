import {
	IHookFunctions,
	IWebhookFunctions,
	IDataObject,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
} from 'n8n-workflow';

export class MailHookTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'CustomJS Mail Hook Trigger',
		name: 'mailHookTrigger',
		icon: {
			light: 'file:customJs.svg',
			dark: 'file:customJs.dark.svg',
		},
		group: ['trigger'],
		version: 1,
		subtitle: 'CustomJS Mail Hook',
		description: 'Triggers the workflow when an email is received via CustomJS Mail Hook',
		defaults: {
			name: 'CustomJS Mail Hook Trigger',
		},
		inputs: [],
		outputs: ['main'],
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

	// The CustomJS Mail Hook is registered by the user on the CustomJS platform: they
	// create the Mail Hook there and paste in the webhook URL shown by this node. There
	// is no public API to create, look up or remove that registration on their behalf, so
	// these lifecycle hooks are intentional no-ops. They exist so n8n can run the full
	// webhook lifecycle (activate, verify, deactivate) without erroring, and are the place
	// to add real registration calls once the platform exposes an API for it.
	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				// Reported as existing so n8n never tries to auto-create a registration
				// that only the user can make on the CustomJS platform.
				return true;
			},
			async create(this: IHookFunctions): Promise<boolean> {
				return true;
			},
			async delete(this: IHookFunctions): Promise<boolean> {
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const bodyData = this.getBodyData() as IDataObject;
		return {
			workflowData: [[{ json: bodyData }]],
		};
	}
}
