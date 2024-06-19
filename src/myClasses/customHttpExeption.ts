import { HttpException } from '@nestjs/common';
export interface IOptions {
  description?: string;
  i18nArgs?: Record<string, any>;
  context?: string;
  extraInfo?: string;
}

export class CustomHttpException extends HttpException {
  message: string;
  httpCode: number;
  statusCode: number;
  customOptions: IOptions = {};
  constructor(
    message: string,
    httpCode: number,
    statusCode: number,
    customOptions?: IOptions,
  ) {
    super(message, httpCode);

    this.message = message;
    this.httpCode = httpCode;
    this.statusCode = statusCode;
    this.customOptions = customOptions ||  this.customOptions
  }
}
