import {
	IHookFunctions,
	IWebhookFunctions,
	IDataObject,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
	NodeConnectionType,
	NodeApiError,
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
				displayName: 'Mail Hook Name',
				name: 'name',
				type: 'string',
				default: '',
				placeholder: 'My Mail Hook',
				description: 'A descriptive name for your mail hook in CustomJS',
				required: true,
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
				description: 'Format for webhook delivery sent by CustomJS',
			},
		],
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

				const name = this.getNodeParameter('name') as string;
				const webhookFormat = this.getNodeParameter('webhookFormat') as string;

				const credentials = await this.getCredentials('customJsApi');

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

				try {
					const response = await this.helpers.request(options);

					// Save the hook IDs and email address
					webhookData.mailHookId = response.mailHookId;
					webhookData.emailAddress = response.emailAddress;

					return true;
				} catch (error: any) {
					console.error('Error creating CustomJS mail hook:', error);
					throw new NodeApiError(this.getNode(), error as any);
				}
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');

				if (!webhookData.mailHookId) {
					return false;
				}

				const credentials = await this.getCredentials('customJsApi');
				const mailHookId = webhookData.mailHookId as string;

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
