import { IAppConfig } from '@configurations/interfaces';
import { LOGGER } from '@constants/index';
import { AbstractLoggerGwAdp } from '@modules/logger';
import { CustomHttpException, ResponseBuilder } from '@myClasses/index';
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';
import { getIp } from '@utils/index';
import { I18nService } from 'nestjs-i18n';

@Catch(CustomHttpException)
export class CustomHttpExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly configService: ConfigService,
    private readonly logger: AbstractLoggerGwAdp,
    private readonly i18nService: I18nService,
  ) {}
  catch(exception: CustomHttpException, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const request = host.switchToHttp().getRequest();

    const clientIp = this.getIp(
      request.headers['x-forwarded-for']?.toString() || request.ip,
    );

    const { httpCode, statusCode, message, customOptions } = exception;

    const { description, i18nArgs, context, extraInfo } = customOptions;

    const httpStatus = httpCode;

    const response = this.buildResponse(message, statusCode, i18nArgs);

    this.logError(
      context,
      clientIp,
      request.method,
      request.originalUrl,
      message,
      description,
      JSON.stringify(response),
      extraInfo,
    );

    return httpAdapter.reply(ctx.getResponse(), response, httpStatus);
  }

  private getIp(rawIp: string): string {
    const ipObject = getIp(rawIp);

    return ipObject.ipv4 || ipObject.ipv6 || 'localhost';
  }

  private buildResponse(
    message: string,
    statusCode: number,
    i18nArgs: Record<string, string>,
  ): any {
    const serviceTag =
      this.configService.get<IAppConfig>('APP_CONFIG').SERVICE_TAG;
    const newMessage: string = this.i18nService.t(message, {
      args: { serviceTag, ...i18nArgs },
    });

    return new ResponseBuilder<any>()
      .withStatus(statusCode)
      .withMessage(`${newMessage} (${statusCode})`)
      .build();
  }

  private logError(
    context: string,
    clientIp: string,
    method: string,
    originalUrl: string,
    message: string,
    description: string,
    responseString: string,
    extraInfo: string,
  ): void {
    let logMessage = `[${clientIp}]-[${method}:${originalUrl}]-[Message: ${message}]-[Description: ${description}]-[Response: ${responseString}]-[ExtraInfo: ${extraInfo}]`;

    this.logger.error(logMessage, context, LOGGER.DEBUG_LEVEL.FORCE);
  }
}
