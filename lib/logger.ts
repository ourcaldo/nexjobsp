type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  [key: string]: any;
}

interface StructuredLogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  service: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private level: LogLevel;
  private isServer: boolean;
  private service: string;

  constructor(service: string = 'nexjob') {
    this.level = (process.env.LOG_LEVEL as LogLevel) || 'info';
    this.isServer = typeof window === 'undefined';
    this.service = service;
  }

  /** Create a child logger scoped to a specific module/route */
  child(module: string): Logger {
    return new Logger(`${this.service}:${module}`);
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.level);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  private serializeError(err: unknown): { name: string; message: string; stack?: string } | undefined {
    if (!err) return undefined;
    if (err instanceof Error) {
      return {
        name: err.name,
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      };
    }
    return { name: 'UnknownError', message: String(err) };
  }

  private buildEntry(level: LogLevel, message: string, context?: LogContext, err?: unknown): StructuredLogEntry {
    const entry: StructuredLogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: this.service,
    };
    if (context && Object.keys(context).length > 0) entry.context = context;
    if (err) entry.error = this.serializeError(err);
    return entry;
  }

  private log(level: LogLevel, message: string, context?: LogContext, err?: unknown): void {
    if (!this.shouldLog(level)) return;

    const entry = this.buildEntry(level, message, context, err);

    if (this.isServer) {
      // Structured JSON logging for server-side (parseable by log aggregators)
      const jsonLine = JSON.stringify(entry);
      switch (level) {
        case 'error':
          console.error(jsonLine);
          break;
        case 'warn':
          console.warn(jsonLine);
          break;
        case 'debug':
        case 'info':
        default:
          console.log(jsonLine);
      }
    } else {
      if (process.env.NODE_ENV === 'development') {
        const prefix = `[${entry.timestamp}] [${level.toUpperCase()}] [${this.service}]`;
        switch (level) {
          case 'error':
            console.error(prefix, message, context || '', err || '');
            break;
          case 'warn':
            console.warn(prefix, message, context || '');
            break;
          default:
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

  error(message: string, context?: LogContext, err?: unknown): void {
    this.log('error', message, context, err);
  }

  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  /** Log an API route request with method, path, status, and duration */
  apiRequest(method: string, path: string, statusCode: number, durationMs: number, extra?: LogContext): void {
    this.log(statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info', `${method} ${path} ${statusCode}`, {
      method,
      path,
      statusCode,
      durationMs,
      ...extra,
    });
  }
}

export const logger = new Logger();
