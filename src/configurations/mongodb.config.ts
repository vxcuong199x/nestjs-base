import { IMongodbConfig } from './interfaces';

export default (): { MONGODB_CONFIG: IMongodbConfig } => ({
  MONGODB_CONFIG: {
    DB: process.env.DB,
    USERNAME: process.env.DB_USER,
    PASSWORD: process.env.DB_PASS,
    REPL: process.env.DB_REPLS,
    SERVERS: process.env.DB_SERVERS
      ? process.env.DB_SERVERS.split(' ')
      : ['localhost:27017'],
    AUTH_SOURCE: process.env.DB_AUTH_SOURCE || 'admin',
  },
});
