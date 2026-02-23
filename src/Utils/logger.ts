const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';

class Logger {
  info(...args: unknown[]) {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.info('[INFO]', ...args);
    }
  }

  warn(...args: unknown[]) {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.warn('[WARN]', ...args);
    }
  }

  error(...args: unknown[]) {
    // eslint-disable-next-line no-console
    console.error('[ERROR]', ...args);
  }
}

export const logger = new Logger();

