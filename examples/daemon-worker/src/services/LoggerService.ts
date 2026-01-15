import { Service, Value } from '@kiqjs/core';

/**
 * Logger service for structured logging
 */
@Service()
export class LoggerService {
  @Value('logger.level')
  private level!: string;

  @Value('logger.format')
  private format!: string;

  private colors = {
    debug: '\x1b[36m', // Cyan
    info: '\x1b[32m',  // Green
    warn: '\x1b[33m',  // Yellow
    error: '\x1b[31m', // Red
    reset: '\x1b[0m'
  };

  private getLevelPriority(level: string): number {
    const priorities: Record<string, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
    return priorities[level] || 1;
  }

  private shouldLog(messageLevel: string): boolean {
    return this.getLevelPriority(messageLevel) >= this.getLevelPriority(this.level);
  }

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();

    if (this.format === 'json') {
      return JSON.stringify({ timestamp, level, message, data });
    }

    // Pretty format
    const color = this.colors[level as keyof typeof this.colors] || '';
    const reset = this.colors.reset;
    const dataStr = data ? ` ${JSON.stringify(data)}` : '';
    return `${color}[${timestamp}] ${level.toUpperCase()}${reset}: ${message}${dataStr}`;
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage('debug', message, data));
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage('info', message, data));
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, data));
    }
  }

  error(message: string, data?: any): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, data));
    }
  }
}
