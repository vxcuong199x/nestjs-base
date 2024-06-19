import { LoggerModule } from '@modules/logger';
import { MongooseModule } from '@modules/mongodb';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { appConfig, loggerConfig, mongodbConfig } from './configurations';
import { HeaderResolver, I18nModule,AcceptLanguageResolver } from 'nestjs-i18n';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, loggerConfig, mongodbConfig],
      envFilePath: ['.development.env'],
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'vi',
      resolvers: [
        { use: HeaderResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
    }),
    LoggerModule,
    // MongooseModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
