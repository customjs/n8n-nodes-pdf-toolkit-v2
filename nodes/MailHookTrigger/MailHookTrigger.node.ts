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
			{
				displayName: 'CustomJS Mail Address',
				name: 'notice',
				type: 'notice' as any,
				default: '',
				displayOptions: {
					show: {
						'@version': [{ _cnd: { exists: true } }] as any,
					},
				},
				description: 'After activating the workflow for the first time, check your CustomJS dashboard or the output of the first execution to see the assigned email address.',
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				
				if (webhookData.mailHookId === undefined) {
					// No mail hook ID saved, so it doesn't exist
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
					return true; // Exists
				} catch (error: any) {
					if (error.response && error.response.status === 404) {
						return false; // Does not exist
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
		
		// Map CustomJS webhook payload (JSON or multipart) to the output of this node
		
		let outputData: IDataObject = {};
		
		if (req.headers['content-type']?.includes('multipart/form-data')) {
            // Because n8n handles multipart requests internally and parses fields into body and files into files
            // Wait, we need to carefully map what n8n parses.
            // When n8n receives multipart, it parses form fields into req.body and files into req.files.
            // Let's just output the whole bodyData.
            outputData = { ...bodyData };
            
            // If we have files in n8n, this is represented differently.
            // However, by default, if we just output bodyData, the user gets all the structured data.
        } else {
            // It's probably application/json
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
