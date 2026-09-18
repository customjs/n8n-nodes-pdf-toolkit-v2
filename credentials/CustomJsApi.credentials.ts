import {
  IAuthenticateGeneric,
  Icon,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from "n8n-workflow";

export class CustomJsApi implements ICredentialType {
  name = "customJsApi";
  displayName = "CustomJS API";
  documentationUrl = "https://www.customjs.space/";
  icon: Icon = {
    light: "file:customJs.svg",
    dark: "file:customJs.dark.svg",
  };
  properties: INodeProperties[] = [
    {
      displayName: "API Key",
      name: "apiKey",
      type: "string",
      typeOptions: { password: true },
      default: "",
      description: "You can get an API Key for CustomJS from https://www.customjs.space/",
      required: true,
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: "generic",
    properties: {
      headers: {
        "x-api-key": "={{$credentials.apiKey}}",
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: "https://e.customjs.io",
      url: "=/__js1-{{$credentials.apiKey}}",
      method: "POST",
      headers: {
        "customjs-origin": "n8n/credential-test",
      },
      body: {
        input: "test",
        code: "return 'ok'",
        returnBinary: "false",
      },
    },
  };
}
