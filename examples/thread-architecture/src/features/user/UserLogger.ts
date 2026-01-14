import { Profile, Service } from '@kiqjs/core';

export interface UserLogger {
  logUserCreated(userId: string, name: string): void;
  logUserUpdated(userId: string): void;
  logUserDeleted(userId: string): void;
}

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

@Service()
@Profile('production')
export class ProductionUserLogger implements UserLogger {
  logUserCreated(userId: string, name: string): void {
    console.log(`User created: ${userId}`);
  }

  logUserUpdated(userId: string): void {
    console.log(`User updated: ${userId}`);
  }

  logUserDeleted(userId: string): void {
    console.log(`User deleted: ${userId}`);
  }
}

@Service()
@Profile('!production')
export class DebugUserLogger {
  logDebugInfo(message: string, data?: any): void {
    console.log(`[DEBUG] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }
}
