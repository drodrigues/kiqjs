import { Profile, Service } from '@kiqjs/core';

/**
 * Logger interface for user operations
 */
export interface UserLogger {
  logUserCreated(userId: string, name: string): void;
  logUserUpdated(userId: string): void;
  logUserDeleted(userId: string): void;
}

/**
 * Development Logger
 * Active only in development profile with detailed console logs
 * Demonstrates @Profile decorator usage
 */
@Service()
@Profile('development')
export class DevelopmentUserLogger implements UserLogger {
  logUserCreated(userId: string, name: string): void {
    console.log(`[DEV] 🎉 User created: { id: "${userId}", name: "${name}" }`);
  }

  logUserUpdated(userId: string): void {
    console.log(`[DEV] ✏️  User updated: ${userId}`);
  }

  logUserDeleted(userId: string): void {
    console.log(`[DEV] 🗑️  User deleted: ${userId}`);
  }
}

/**
 * Production Logger
 * Active only in production profile with minimal logging
 * Demonstrates @Profile decorator usage
 */
@Service()
@Profile('production')
export class ProductionUserLogger implements UserLogger {
  logUserCreated(userId: string, name: string): void {
    // In production, might send to monitoring service
    console.log(`User created: ${userId}`);
  }

  logUserUpdated(userId: string): void {
    console.log(`User updated: ${userId}`);
  }

  logUserDeleted(userId: string): void {
    console.log(`User deleted: ${userId}`);
  }
}

/**
 * Debug Logger
 * Active in all profiles EXCEPT production
 * Demonstrates negation profile (@Profile('!production'))
 */
@Service()
@Profile('!production')
export class DebugUserLogger {
  logDebugInfo(message: string, data?: any): void {
    console.log(`[DEBUG] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }
}
