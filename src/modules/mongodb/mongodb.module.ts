import { IMongodbConfig } from '@configurations/interfaces';
import { makeMongodbConfig } from '@helpers/index';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  MongooseModule as MongooseLibModule,
  MongooseModuleFactoryOptions,
} from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseLibModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const mongooseConfig =
          configService.get<IMongodbConfig>('MONGODB_CONFIG');
        const { SERVERS, USERNAME, PASSWORD, AUTH_SOURCE, REPL, DB } =
          mongooseConfig;

        const config = {
          SERVERS,
          USERNAME,
          PASSWORD,
          AUTH_SOURCE,
          REPL,
          DB_NAME: DB,
        };

        const uri = makeMongodbConfig(config);

        return <MongooseModuleFactoryOptions>{
          uri,
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class MongooseModule {}
