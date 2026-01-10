import { User } from '@/domains/User';
/**
 * User Repository
 * Responsável pela persistência de usuários
 * Camada de infraestrutura da feature
 */
export declare class UserRepository {
    private users;
    constructor();
    findById(id: string): Promise<User | null>;
    findAll(): Promise<User[]>;
    findByEmail(email: string): Promise<User | null>;
    save(user: User): Promise<User>;
    delete(id: string): Promise<boolean>;
    existsByEmail(email: string): Promise<boolean>;
}
