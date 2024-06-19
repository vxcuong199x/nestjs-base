import { STATUS_CODE } from '@constants/index';
import { I18nService } from 'nestjs-i18n';

export interface IResponse<T> {
  status: number;
  message: string;
  data: T;
  serverTime: number;
}

export class ResponseBuilder<T> {
  private status = STATUS_CODE.SUCCESS;
  private message = 'common.SUCCESS';
  private data: T;

  constructor(private i18nService?: I18nService) {}

  withStatus(status: number): this {
    this.status = status;
    return this;
  }

  withData(data: T): this {
    this.data = data;
    return this;
  }

  withMessage(message: string): this {
    this.message = message;
    return this;
  }

  private translateMessage(message: string): string {
    if (!this.i18nService) {
      return message;
    }

    return this.i18nService.t(message);
  }

  build(): IResponse<T> {
    return {
      status: this.status,
      message: this.translateMessage(this.message),
      data: this.data,
      serverTime: Date.now(),
    };
  }
}
