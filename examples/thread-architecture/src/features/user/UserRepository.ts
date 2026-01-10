import { Service } from '@kiqjs/core';
import { User, UserStatus } from '@/domains/User';

/**
 * User Repository
 * Responsável pela persistência de usuários
 * Camada de infraestrutura da feature
 */
@Service()
export class UserRepository {
  private users = new Map<string, User>();

  constructor() {
    // Seed data for demo
    this.save(
      new User('1', 'John Doe', 'john@example.com', UserStatus.ACTIVE, new Date('2024-01-01'))
    );
    this.save(
      new User('2', 'Jane Smith', 'jane@example.com', UserStatus.PENDING, new Date('2024-01-02'))
    );
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findAll(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async findByEmail(email: string): Promise<User | null> {
    return Array.from(this.users.values()).find((u) => u.email === email) || null;
  }

  async save(user: User): Promise<User> {
    this.users.set(user.id, user);
    return user;
  }

  async delete(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  async existsByEmail(email: string): Promise<boolean> {
    return Array.from(this.users.values()).some((u) => u.email === email);
  }
}
