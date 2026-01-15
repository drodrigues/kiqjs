import { Configuration, Value } from '@kiqjs/core';

/**
 * Application configuration class demonstrating @Configuration decorator
 */
@Configuration()
export class AppConfiguration {
  @Value('app.name')
  appName!: string;

  @Value('app.version')
  appVersion!: string;

  @Value('app.description')
  appDescription!: string;

  getAppInfo(): string {
    return `${this.appName} v${this.appVersion} - ${this.appDescription}`;
  }
}
