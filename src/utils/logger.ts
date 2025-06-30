/**
 * Professional logging utility for V8 Media Player
 * Provides structured logging with levels and production safety
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private logLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.WARN;

  private formatMessage(level: LogLevel, message: string, context?: Record<string, unknown>): LogEntry {
    return {
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
    };
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog(level)) return;

    const entry = this.formatMessage(level, message, context);
    
    // In development, use console for immediate feedback
    if (this.isDevelopment) {
      const prefix = `[V8Player:${LogLevel[level]}]`;
      const output = context ? [prefix, message, context] : [prefix, message];
      
      switch (level) {
        case LogLevel.ERROR:
          console.error(...output);
          break;
        case LogLevel.WARN:
          console.warn(...output);
          break;
        case LogLevel.INFO:
          console.info(...output);
          break;
        case LogLevel.DEBUG:
          console.log(...output);
          break;
      }
    }
    
    // In production, could send to logging service
    // this.sendToLoggingService(entry);
    // Prevent unused variable warning
    void entry;
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, message, context);
  }

  // Specialized methods for common patterns
  localStorage(action: string, key: string, value?: unknown): void {
    this.debug(`localStorage ${action}`, { key, value });
  }

  colorExtraction(message: string, context?: Record<string, unknown>): void {
    this.debug(`Color extraction: ${message}`, context);
  }

  deviceDetection(context: Record<string, unknown>): void {
    this.debug('Device detection', context);
  }
}

// Export singleton instance
export const logger = new Logger();