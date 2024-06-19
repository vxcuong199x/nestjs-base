import { IAppConfig } from '@configurations/interfaces';
import { HTTP_CODE, LOGGER, STATUS_CODE } from '@constants/index';
import { AbstractLoggerGwAdp } from '@modules/logger';
import { ResponseBuilder } from '@myClasses/index';
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';
import { getIp } from '@utils/index';
import { I18nService } from 'nestjs-i18n';
const logContext = 'UncatchedError';

@Catch(Error)
export class UncatchedExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly configService: ConfigService,
    private readonly logger: AbstractLoggerGwAdp,
    private readonly i18n: I18nService,
  ) {}

  async catch(exception: Error, host: ArgumentsHost): Promise<void> {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const request = host.switchToHttp().getRequest();

    const clientIp = this.getIp(
      request.headers['x-forwarded-for']?.toString() || request.ip,
    );

    const isNotFoundApi = this.isNotFoundApi(exception.name);

    const httpStatus = this.getHttpStatus(isNotFoundApi);

    const response = this.buildResponse(
      isNotFoundApi,
      request.method,
      request.originalUrl,
    );

    this.logError(
      clientIp,
      request.method,
      request.originalUrl,
      exception.stack,
      JSON.stringify(response),
    );

    return httpAdapter.reply(ctx.getResponse(), response, httpStatus);
  }

  private getIp(rawIp: string): string {
    const ipObject = getIp(rawIp);

    return ipObject.ipv4 || ipObject.ipv6 || 'localhost';
  }

  private isNotFoundApi(exceptionName: string): boolean {
    return exceptionName === 'NotFoundException';
  }

  private getHttpStatus(isNotFoundApi: boolean): number {
    return isNotFoundApi
      ? HTTP_CODE.NOT_FOUND
      : HTTP_CODE.INTERNAL_SERVER_ERROR;
  }

  private buildResponse(
    isNotFoundApi: boolean,
    method: string,
    originalUrl: string,
  ): any {
    return isNotFoundApi
      ? this.buildNotfoundErrorResponse(method, originalUrl)
      : this.buildInternalErrorResponse();
  }

  private buildNotfoundErrorResponse(method: string, originalUrl: string): any {
    return new ResponseBuilder()
      .withStatus(STATUS_CODE.API_NOT_FOUND)
      .withMessage(
        this.i18n.translate('httpException.NOT_FOUND', {
          args: {
            field: `${method} ${originalUrl}`,
          },
        }),
      )
      .build();
  }

  private buildInternalErrorResponse(): any {
    const serviceTag =
      this.configService.get<IAppConfig>('APP_CONFIG').SERVICE_TAG;

    return new ResponseBuilder()
      .withStatus(STATUS_CODE.INTERNAL_SERVER_ERROR)
      .withMessage(
        this.i18n.translate('httpException.INTERNAL_SERVER_ERROR', {
          args: {
            errCode: STATUS_CODE.INTERNAL_SERVER_ERROR,
            serviceTag,
          },
        }),
      )
      .build();
  }

  private logError(
    clientIp: string,
    method: string,
    originalUrl: string,
    errorStack: string,
    responseString: string,
  ): void {
    this.logger.error(
      `[${clientIp}]-[${method}:${originalUrl}]-[Uncatched Error]-[${errorStack}]-[ResBody: ${JSON.stringify(
        responseString,
      )}]`,
      logContext,
      LOGGER.DEBUG_LEVEL.FORCE,
    );
  }
}
