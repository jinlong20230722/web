interface CloudFunctionEvent {
  personnelId: string | number;
}

interface CloudFunctionResponse {
  success: boolean;
  message: string;
  data?: any;
}

export declare function main(event: CloudFunctionEvent, context: any): Promise<CloudFunctionResponse>;