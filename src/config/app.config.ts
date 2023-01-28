import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
    clientId: process.env['CLIENT_ID'],
    clientSecret: process.env['CLIENT_SECRET'],
    redistHost: process.env["REDIS_HOST"],
    redisPort: process.env["REDIS_PORT"],
    adminEmail: process.env["ADMIN_EMAIL"]
}));
