export const makeMongodbConfig = (mongooseConfig: {
  DB_NAME: string;
  SERVERS: string[];
  USERNAME: string;
  PASSWORD: string;
  AUTH_SOURCE: string;
  REPL: string;
}): string => {
  const {
    SERVERS: servers,
    USERNAME: user,
    PASSWORD: password,
    AUTH_SOURCE: authPath,
    REPL: repl,
    DB_NAME: dbName,
  } = mongooseConfig;

  if (!dbName) {
    throw new Error('Database name is not defined');
  }

  return (() => {
    const url = servers.reduce((prev, cur) => prev + cur + ',', '');

    if (user && password) {
      return (
        `mongodb://${user}:${password}@${url.substring(
          0,
          url.length - 1,
        )}/${dbName}?authSource=` +
        (authPath || 'admin') +
        (repl ? `&replicaSet=${repl}` : '')
      );
    } else {
      return (
        `mongodb://${url.substring(0, url.length - 1)}/${dbName}` +
        (repl ? `?replicaSet=${repl}` : '')
      );
    }
  })();
};
