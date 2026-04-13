import { DEBUG_LOGS } from '../Constants/env';

const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';

/** Metro / cihaz loglarında console.info bazen filtrelenir; log daha görünür olsun */
const shouldLogVerbose = isDev || DEBUG_LOGS;

class Logger {
  info(...args: unknown[]) {
    if (shouldLogVerbose) {
      // eslint-disable-next-line no-console
      console.log('[INFO]', ...args);
    }
  }

  warn(...args: unknown[]) {
    if (shouldLogVerbose) {
      // eslint-disable-next-line no-console
      console.log('[WARN]', ...args);
    }
  }

  error(...args: unknown[]) {
    // eslint-disable-next-line no-console
    console.error('[ERROR]', ...args);
  }
}

export const logger = new Logger();

