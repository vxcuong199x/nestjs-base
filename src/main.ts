import { IAppConfig } from '@configurations/interfaces';
import { LOGGER } from '@constants/index';
import { AbstractLoggerGwAdp } from '@modules/logger';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  CustomHttpExceptionFilter,
  UncatchedExceptionsFilter,
} from './filters';
import { I18nService } from 'nestjs-i18n';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const configService = app.get(ConfigService);
  const logger = app.get(AbstractLoggerGwAdp);
  const httpAdapterHost = app.get(HttpAdapterHost);
  const i18nService: I18nService = app.get(I18nService);
  const appConfig = configService.get<IAppConfig>('APP_CONFIG');

  app.useGlobalFilters(
    new UncatchedExceptionsFilter(
      httpAdapterHost,
      configService,
      logger,
      i18nService,
    ),
    new CustomHttpExceptionFilter(
      httpAdapterHost,
      configService,
      logger,
      i18nService,
    ),
  );

  const { PORT } = appConfig;

  await app.listen(PORT, () => {
    logger.log(
      `Server running on port ${PORT}`,
      'Bootstrap',
      LOGGER.DEBUG_LEVEL.FORCE,
    );
  });
}
bootstrap();
