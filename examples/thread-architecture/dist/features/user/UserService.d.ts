import { User } from '@/domains/User';
import { Result } from '@/core/Result';
import { UserRepository } from '@/features/user/UserRepository';
import { UserEventPublisher } from '@/features/user/UserEventPublisher';
import { CreateUserDto, UpdateUserDto } from '@/features/user/UserDto';
/**
 * User Service
 * Orquestra as operações de negócio relacionadas a usuários
 * Coordena entre domínio, repositório e eventos
 */
export declare class UserService {
    private readonly userRepository;
    private readonly userEventPublisher;
    constructor(userRepository: UserRepository, userEventPublisher: UserEventPublisher);
    createUser(dto: CreateUserDto): Promise<Result<User, string>>;
    getUserById(id: string): Promise<Result<User, string>>;
    getAllUsers(): Promise<Result<User[], string>>;
    updateUser(id: string, dto: UpdateUserDto): Promise<Result<User, string>>;
    activateUser(id: string): Promise<Result<User, string>>;
    deactivateUser(id: string): Promise<Result<User, string>>;
    deleteUser(id: string): Promise<Result<void, string>>;
    private generateId;
}
