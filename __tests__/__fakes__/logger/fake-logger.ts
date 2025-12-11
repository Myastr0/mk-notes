import winston from 'winston';

export const fakeLogger = winston.createLogger({
  level: 'debug',
  transports: [new winston.transports.Console()],
});
