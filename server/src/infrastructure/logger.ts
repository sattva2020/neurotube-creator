type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function getLogLevel(): LogLevel {
  const envLevel = (process.env.LOG_LEVEL || 'info').toLowerCase();
  if (envLevel in LOG_LEVELS) return envLevel as LogLevel;
  return 'info';
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[getLogLevel()];
}

function formatMessage(level: LogLevel, context: string, message: string, data?: unknown): string {
  const timestamp = new Date().toISOString();
  const base = `[${timestamp}] ${level.toUpperCase().padEnd(5)} [${context}] ${message}`;
  if (data !== undefined) {
    return `${base} ${JSON.stringify(data)}`;
  }
  return base;
}

export interface Logger {
  debug(message: string, data?: unknown): void;
  info(message: string, data?: unknown): void;
  warn(message: string, data?: unknown): void;
  error(message: string, data?: unknown): void;
}

/** Create a structured logger with context prefix */
export function createLogger(context: string): Logger {
  return {
    debug(message: string, data?: unknown) {
      if (shouldLog('debug')) console.debug(formatMessage('debug', context, message, data));
    },
    info(message: string, data?: unknown) {
      if (shouldLog('info')) console.info(formatMessage('info', context, message, data));
    },
    warn(message: string, data?: unknown) {
      if (shouldLog('warn')) console.warn(formatMessage('warn', context, message, data));
    },
    error(message: string, data?: unknown) {
      if (shouldLog('error')) console.error(formatMessage('error', context, message, data));
    },
  };
}
