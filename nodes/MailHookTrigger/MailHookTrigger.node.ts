import {
	IHookFunctions,
	IWebhookFunctions,
	IDataObject,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
	NodeConnectionType,
	NodeApiError,
	ILoadOptionsFunctions,
	INodePropertyOptions,
} from 'n8n-workflow';

export class MailHookTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'CustomJS Mail Trigger',
		name: 'mailHookTrigger',
		icon: 'file:customJs.svg',
		group: ['trigger'],
		version: 1,
		description: 'Triggers the workflow when an email is received via CustomJS.',
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
				displayName: 'Mode',
				name: 'mode',
				type: 'options',
				options: [
					{
						name: 'Create New Hook',
						value: 'new',
						description: 'Create a new mail hook and get a new email address',
					},
					{
						name: 'Use Existing Hook',
						value: 'existing',
						description: 'Connect to an existing mail hook by selecting from the list',
					},
				],
				default: 'existing',
				noDataExpression: true,
			},
			// --- CREATE NEW MODE ---
			{
				displayName: 'Mail Hook Name',
				name: 'name',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						mode: ['new'],
					},
				},
				placeholder: 'e.g. Invoice Emails',
				description: 'A name for your new mail hook. A unique email address will be generated for it.',
				required: true,
			},
			{
				displayName: '📧 Once you activate this workflow, your unique email address will be created and visible in the <a href="https://app.customjs.io" target="_blank">CustomJS dashboard</a> under <strong>Mail Hooks</strong>.',
				name: 'createNotice',
				type: 'notice',
				default: '',
				displayOptions: {
					show: {
						mode: ['new'],
					},
				},
			},
			// --- EXISTING MODE ---
			{
				displayName: 'Mail Hook',
				name: 'mailHookId',
				type: 'options',
				displayOptions: {
					show: {
						mode: ['existing'],
					},
				},
				typeOptions: {
					loadOptionsMethod: 'getMailHooks',
				},
				default: '',
				placeholder: 'Select a mail hook...',
				description: 'Select an existing mail hook. The email address is shown next to the name.',
			},
			// --- SHARED ---
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
				description: 'Format for webhook delivery sent by CustomJS',
			},
		],
	};

	methods = {
		loadOptions: {
			async getMailHooks(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const credentials = await this.getCredentials('customJsApi');
				const options: any = {
					method: 'GET',
					url: 'https://api.app.customjs.io/mail-hook/api/mail-hook',
					headers: {
						'X-Api-Key': credentials.apiKey as string,
					},
					json: true,
				};

				const response = await this.helpers.request(options);
				return response.map((hook: any) => ({
					name: `${hook.name}  —  ${hook.emailAddress}`,
					value: hook.mailHookId,
				}));
			},
		},
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');

				if (webhookData.mailHookId === undefined) {
					return false;
				}

				try {
					const credentials = await this.getCredentials('customJsApi');
					const mailHookId = webhookData.mailHookId as string;

					const options: any = {
						method: 'GET',
						url: `https://api.app.customjs.io/mail-hook/api/mail-hook/id/${mailHookId}`,
						headers: {
							'X-Api-Key': credentials.apiKey as string,
						},
						json: true,
					};

					await this.helpers.request(options);
					return true;
				} catch (error: any) {
					if (error.response && error.response.status === 404) {
						return false;
					}
					throw error;
				}
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				const webhookUrl = this.getNodeWebhookUrl('default') as string;
				const mode = this.getNodeParameter('mode') as string;
				const webhookFormat = this.getNodeParameter('webhookFormat') as string;
				const credentials = await this.getCredentials('customJsApi');

				let response: any;

				if (mode === 'new') {
					const name = this.getNodeParameter('name') as string;
					const options: any = {
						method: 'POST',
						url: 'https://api.app.customjs.io/mail-hook/api/mail-hook',
						headers: {
							'X-Api-Key': credentials.apiKey as string,
							'Content-Type': 'application/json',
						},
						body: {
							name,
							webhookUrl,
							webhookFormat,
						},
						json: true,
					};
					response = await this.helpers.request(options);
				} else {
					const mailHookId = this.getNodeParameter('mailHookId') as string;
					const options: any = {
						method: 'PUT',
						url: `https://api.app.customjs.io/mail-hook/api/mail-hook/id/${mailHookId}`,
						headers: {
							'X-Api-Key': credentials.apiKey as string,
							'Content-Type': 'application/json',
						},
						body: {
							webhookUrl,
							webhookFormat,
						},
						json: true,
					};
					response = await this.helpers.request(options);
				}

				webhookData.mailHookId = response.mailHookId;
				webhookData.emailAddress = response.emailAddress;
				webhookData.mode = mode;

				return true;
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				const mode = webhookData.mode as string;

				if (!webhookData.mailHookId) {
					return false;
				}

				const credentials = await this.getCredentials('customJsApi');
				const mailHookId = webhookData.mailHookId as string;

				// For existing hooks: just clear the webhookUrl, don't delete
				if (mode === 'existing') {
					try {
						const options: any = {
							method: 'PUT',
							url: `https://api.app.customjs.io/mail-hook/api/mail-hook/id/${mailHookId}`,
							headers: {
								'X-Api-Key': credentials.apiKey as string,
								'Content-Type': 'application/json',
							},
							body: { webhookUrl: '' },
							json: true,
						};
						await this.helpers.request(options);
					} catch (error) {
						// Ignore errors during cleanup
					}
					delete webhookData.mailHookId;
					delete webhookData.emailAddress;
					return true;
				}

				// For new hooks: delete the hook entirely
				const options: any = {
					method: 'DELETE',
					url: `https://api.app.customjs.io/mail-hook/api/mail-hook/id/${mailHookId}`,
					headers: {
						'X-Api-Key': credentials.apiKey as string,
					},
					json: true,
				};

				try {
					await this.helpers.request(options);
					delete webhookData.mailHookId;
					delete webhookData.emailAddress;
					return true;
				} catch (error: any) {
					if (error.response && error.response.status === 404) {
						delete webhookData.mailHookId;
						delete webhookData.emailAddress;
						return false;
					}
					throw new NodeApiError(this.getNode(), error as any);
				}
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const req = this.getRequestObject();
		const bodyData = this.getBodyData();

		let outputData: IDataObject = {};

		if (req.headers['content-type']?.includes('multipart/form-data')) {
			outputData = { ...bodyData };
		} else {
			outputData = { ...bodyData };
		}
		return {
			workflowData: [
				[
					{
						json: outputData,
					},
				],
			],
		};
	}
}
