import { Bean, Configuration, Value } from '@kiqjs/core';

/**
 * Application-specific configuration
 * Server configuration (port, host, prefix) is handled automatically by @kiqjs/http
 */
@Configuration()
export class AppConfig {
  @Value('app.name')
  appName!: string;

  @Value('app.version')
  appVersion!: string;

  @Value('features.userManagement.enabled')
  userManagementEnabled!: boolean;

  @Value('features.userManagement.maxUsers')
  maxUsers!: number;

  @Value('features.events.enabled')
  eventsEnabled!: boolean;

  @Bean()
  appSettings() {
    return {
      name: this.appName,
      version: this.appVersion,
      env: process.env.NODE_ENV || 'development',
    };
  }

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
