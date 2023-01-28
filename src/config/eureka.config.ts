import { registerAs } from '@nestjs/config';

export default registerAs('eureka', () => ({
  host: process.env['EUREKA_HOST'],
  port: process.env['EUREKA_PORT'],
  registryFetchInterval: 1000,
  servicePath: process.env['EUREKA_SERVICE_PATH'],
  maxRetries: 3,
  serviceName: process.env['SERVICE_NAME'],
  servicePort: process.env['PORT'],
}));
