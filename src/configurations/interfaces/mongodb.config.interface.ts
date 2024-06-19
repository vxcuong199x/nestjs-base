export interface IMongodbConfig {
  SERVERS: string[];
  DB: string;
  USERNAME: string;
  PASSWORD: string;
  AUTH_SOURCE: string;
  REPL: string;
}
