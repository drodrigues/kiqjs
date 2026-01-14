import { Bean, Configuration, Value } from '@kiqjs/core';

@Configuration()
export class AppConfig {
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

  @Bean()
  appSettings() {
    return {
      name: this.appName,
      version: this.appVersion,
      env: process.env.NODE_ENV || 'development',
    };
  }

  @Bean()
  serverConfig() {
    return {
      port: this.serverPort,
      host: this.serverHost,
      prefix: this.serverPrefix,
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
