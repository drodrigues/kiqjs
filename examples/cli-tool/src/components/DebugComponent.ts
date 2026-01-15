import { Component, Profile, Inject } from '@kiqjs/core';
import { LoggerService } from '../services/LoggerService';

/**
 * Component that is only active when 'debug' profile is enabled
 * Demonstrates @Profile decorator usage
 */
@Component()
@Profile('debug')
export class DebugComponent {
  @Inject()
  private logger!: LoggerService;

  printDebugInfo(data: any): void {
    this.logger.debug('='.repeat(60));
    this.logger.debug('DEBUG MODE ENABLED');
    this.logger.debug('='.repeat(60));
    this.logger.debug('Debug information:', data);
    this.logger.debug('Process info:', {
      pid: process.pid,
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      uptime: process.uptime()
    });
    this.logger.debug('Environment:', {
      activeProfiles: process.env.KIQJS_PROFILES_ACTIVE || 'default'
    });
    this.logger.debug('='.repeat(60));
  }
}
