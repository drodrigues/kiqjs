import { Configuration, Bean } from '@kiqjs/core';

/**
 * Application Configuration
 * Configurações explícitas de infraestrutura
 */
@Configuration()
export class AppConfig {
  @Bean()
  appSettings() {
    return {
      name: 'THREAD Architecture Example',
      version: '1.0.0',
      env: process.env.NODE_ENV || 'development',
    };
  }

  @Bean()
  serverConfig() {
    return {
      port: parseInt(process.env.PORT || '3000', 10),
      host: process.env.HOST || 'localhost',
    };
  }

  @Bean()
  featureFlags() {
    return {
      userCreation: true,
      userActivation: true,
      eventPublishing: true,
    };
  }
}
