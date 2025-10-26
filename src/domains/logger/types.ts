export const LOG_LEVELS = ['error', 'warn', 'info', 'debug'] as const;

export type LogLevel = (typeof LOG_LEVELS)[number];

export const isValidVerbosity = (verbosity: string): verbosity is LogLevel => {
  return LOG_LEVELS.includes(verbosity as LogLevel);
};
