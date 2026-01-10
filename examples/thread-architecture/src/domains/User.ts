/**
 * User Domain Entity
 * Representa o modelo de negócio puro de um usuário
 * Não depende de framework, banco de dados ou serviços externos
 */
export class User {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly status: UserStatus,
    public readonly createdAt: Date
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error('User name cannot be empty');
    }

    if (!this.email || !this.isValidEmail(this.email)) {
      throw new Error('Invalid email format');
    }
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /**
   * Business rule: User can only be activated if status is PENDING
   */
  activate(): User {
    if (this.status !== UserStatus.PENDING) {
      throw new Error('Only pending users can be activated');
    }

    return new User(this.id, this.name, this.email, UserStatus.ACTIVE, this.createdAt);
  }

  /**
   * Business rule: User can be deactivated from any status except DELETED
   */
  deactivate(): User {
    if (this.status === UserStatus.DELETED) {
      throw new Error('Deleted users cannot be deactivated');
    }

    return new User(this.id, this.name, this.email, UserStatus.INACTIVE, this.createdAt);
  }

  isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }
}

/**
 * User Status Value Object
 */
export enum UserStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DELETED = 'DELETED',
}
