import { convertEnvNumber } from '@utils/index';
import { IAppConfig } from './interfaces';

export default (): {
  APP_CONFIG: IAppConfig;
} => ({
  APP_CONFIG: {
    SERVICE_TAG: process.env.SERVICE_TAG || 'Base',
    PORT: convertEnvNumber(process.env.PORT) ?? 3000,
  },
});
