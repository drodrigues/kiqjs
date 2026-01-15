import { Configuration, Value } from '@kiqjs/core';

/**
 * Application configuration
 */
@Configuration()
export class AppConfiguration {
  @Value('app.name')
  appName!: string;

  @Value('app.version')
  appVersion!: string;

  @Value('app.description')
  appDescription!: string;

  @Value('worker.shutdownTimeoutMs')
  shutdownTimeoutMs!: number;

  getAppInfo(): string {
    return `${this.appName} v${this.appVersion} - ${this.appDescription}`;
  }
}
