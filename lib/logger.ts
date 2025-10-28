type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private level: LogLevel;
  private isServer: boolean;

  constructor() {
    this.level = (process.env.LOG_LEVEL as LogLevel) || 'info';
    this.isServer = typeof window === 'undefined';
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.level);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  private log(level: LogLevel, message: string, context?: LogContext): void {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message, context);

    if (this.isServer) {
      switch (level) {
        case 'error':
          console.error(formattedMessage);
          break;
        case 'warn':
          console.warn(formattedMessage);
          break;
        case 'debug':
        case 'info':
        default:
          // Server-side logging only, not visible in browser
          process.stdout.write(formattedMessage + '\n');
      }
    } else {
      if (process.env.NODE_ENV === 'development') {
        switch (level) {
          case 'error':
            console.error(formattedMessage);
            break;
          case 'warn':
            console.warn(formattedMessage);
            break;
          default:
            // No client-side info/debug logs in production
            break;
        }
      }
    }
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: LogContext): void {
    this.log('error', message, context);
  }

  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }
}

export const logger = new Logger();
