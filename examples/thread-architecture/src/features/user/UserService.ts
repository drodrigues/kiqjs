import { Service } from '@kiqjs/core';
import { failure, Result, success } from '@kiqjs/http/dto';

import { User, UserStatus } from '../../domains/User';
import { UserRepository } from '../../domains/UserRepository';
import { UserCreatedEvent } from './UserCreatedEvent';
import { CreateUserDto, UpdateUserDto } from './UserDto';
import { UserEventPublisher } from './UserEventPublisher';
import { UserUpdatedEvent } from './UserUpdatedEvent';

@Service()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userEventPublisher: UserEventPublisher
  ) {}

  async createUser(dto: CreateUserDto): Promise<Result<User, string>> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      return failure(`User with email ${dto.email} already exists`);
    }

    try {
      const user = new User(this.generateId(), dto.name, dto.email, UserStatus.PENDING, new Date());

      await this.userRepository.save(user);

      await this.userEventPublisher.publishUserCreated(new UserCreatedEvent(user));

      return success(user);
    } catch (error: any) {
      return failure(error.message);
    }
  }

  async getUserById(id: string): Promise<Result<User, string>> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      return failure(`User with id ${id} not found`);
    }
    return success(user);
  }

  async getAllUsers(): Promise<Result<User[], string>> {
    const users = await this.userRepository.findAll();
    return success(users);
  }

  async updateUser(id: string, dto: UpdateUserDto): Promise<Result<User, string>> {
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      return failure(`User with id ${id} not found`);
    }

    try {
      if (dto.email && dto.email !== existingUser.email) {
        const emailTaken = await this.userRepository.findByEmail(dto.email);
        if (emailTaken) {
          return failure(`Email ${dto.email} is already in use`);
        }
      }

      const updatedUser = new User(
        existingUser.id,
        dto.name ?? existingUser.name,
        dto.email ?? existingUser.email,
        existingUser.status,
        existingUser.createdAt
      );

      await this.userRepository.save(updatedUser);

      await this.userEventPublisher.publishUserUpdated(new UserUpdatedEvent(updatedUser));

      return success(updatedUser);
    } catch (error: any) {
      return failure(error.message);
    }
  }

  async activateUser(id: string): Promise<Result<User, string>> {
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      return failure(`User with id ${id} not found`);
    }

    try {
      const activatedUser = existingUser.activate();
      await this.userRepository.save(activatedUser);
      await this.userEventPublisher.publishUserUpdated(new UserUpdatedEvent(activatedUser));

      return success(activatedUser);
    } catch (error: any) {
      return failure(error.message);
    }
  }

  async deactivateUser(id: string): Promise<Result<User, string>> {
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      return failure(`User with id ${id} not found`);
    }

    try {
      const deactivatedUser = existingUser.deactivate();
      await this.userRepository.save(deactivatedUser);
      await this.userEventPublisher.publishUserUpdated(new UserUpdatedEvent(deactivatedUser));

      return success(deactivatedUser);
    } catch (error: any) {
      return failure(error.message);
    }
  }

  async deleteUser(id: string): Promise<Result<void, string>> {
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      return failure(`User with id ${id} not found`);
    }

    await this.userRepository.delete(id);
    return success(undefined);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 11);
  }
}
