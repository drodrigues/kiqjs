import { Bean, Configuration, Value } from '@kiqjs/core';

/**
 * Application Configuration
 * Uses Spring Boot style YAML configuration with @Value decorator
 * Configuration is loaded from resources/application.yml and resources/application-{profile}.yml
 */
@Configuration()
export class AppConfig {
  // Inject configuration values from resources/application.yml using @Value decorator
  @Value('app.name')
  appName!: string;

  @Value('app.version')
  appVersion!: string;

  @Value('server.port')
  serverPort!: number;

  @Value('server.host')
  serverHost!: string;

  @Value('server.prefix')
  serverPrefix!: string;

  @Value('features.userManagement.enabled')
  userManagementEnabled!: boolean;

  @Value('features.userManagement.maxUsers')
  maxUsers!: number;

  @Value('features.events.enabled')
  eventsEnabled!: boolean;

  /**
   * Application settings bean
   */
  @Bean()
  appSettings() {
    return {
      name: this.appName,
      version: this.appVersion,
      env: process.env.NODE_ENV || 'development',
    };
  }

  /**
   * Server configuration bean
   */
  @Bean()
  serverConfig() {
    return {
      port: this.serverPort,
      host: this.serverHost,
      prefix: this.serverPrefix,
    };
  }

  /**
   * Feature flags bean
   */
  @Bean()
  featureFlags() {
    return {
      userManagement: {
        enabled: this.userManagementEnabled,
        maxUsers: this.maxUsers,
      },
      events: {
        enabled: this.eventsEnabled,
      },
    };
  }
}
