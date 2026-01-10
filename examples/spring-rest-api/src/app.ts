import { Service, KiqApplication } from '@kiqjs/core';
import {
  RestController,
  GetMapping,
  PostMapping,
  PutMapping,
  DeleteMapping,
  PathVariable,
  RequestBody,
  RequestParam,
  RequestHeader,
  KiqHttpApplication,
} from '@kiqjs/http';

// ============================================
// DOMAIN MODELS
// ============================================

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

interface CreateUserDto {
  name: string;
  email: string;
}

interface UpdateUserDto {
  name?: string;
  email?: string;
}

// ============================================
// REPOSITORY LAYER (Like Spring Data JPA)
// ============================================

@Service()
class UserRepository {
  private users = new Map<string, User>();

  constructor() {
    // Initialize with some sample data
    this.save({
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      createdAt: new Date('2024-01-01'),
    });
    this.save({
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      createdAt: new Date('2024-01-02'),
    });
  }

  save(user: User): User {
    this.users.set(user.id, user);
    return user;
  }

  findAll(): User[] {
    return Array.from(this.users.values());
  }

  findById(id: string): User | undefined {
    return this.users.get(id);
  }

  existsByEmail(email: string): boolean {
    return Array.from(this.users.values()).some((u) => u.email === email);
  }

  deleteById(id: string): boolean {
    return this.users.delete(id);
  }
}

// ============================================
// SERVICE LAYER (Like Spring @Service)
// ============================================

@Service()
class UserService {
  constructor(private userRepository: UserRepository) {}

  getAllUsers(search?: string): User[] {
    const users = this.userRepository.findAll();

    if (search) {
      return users.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    return users;
  }

  getUserById(id: string): User {
    const user = this.userRepository.findById(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    return user;
  }

  createUser(dto: CreateUserDto): User {
    if (this.userRepository.existsByEmail(dto.email)) {
      throw new Error(`User with email ${dto.email} already exists`);
    }

    const user: User = {
      id: Math.random().toString(36).substring(2, 9),
      name: dto.name,
      email: dto.email,
      createdAt: new Date(),
    };

    return this.userRepository.save(user);
  }

  updateUser(id: string, dto: UpdateUserDto): User {
    const user = this.getUserById(id);

    const updated: User = {
      ...user,
      ...(dto.name && { name: dto.name }),
      ...(dto.email && { email: dto.email }),
    };

    return this.userRepository.save(updated);
  }

  deleteUser(id: string): void {
    const exists = this.userRepository.findById(id);
    if (!exists) {
      throw new Error(`User with id ${id} not found`);
    }
    this.userRepository.deleteById(id);
  }
}

// ============================================
// CONTROLLER LAYER (Like Spring @RestController)
// ============================================

@RestController('/api/users')
class UserController {
  constructor(private userService: UserService) {}

  /**
   * GET /api/users
   * GET /api/users?search=john
   */
  @GetMapping()
  getAllUsers(@RequestParam('search', false) search?: string) {
    const users = this.userService.getAllUsers(search);
    return {
      success: true,
      data: users,
      count: users.length,
    };
  }

  /**
   * GET /api/users/:id
   */
  @GetMapping('/:id')
  getUserById(@PathVariable('id') id: string) {
    const user = this.userService.getUserById(id);
    return {
      success: true,
      data: user,
    };
  }

  /**
   * POST /api/users
   */
  @PostMapping()
  createUser(@RequestBody() dto: CreateUserDto) {
    if (!dto.name || !dto.email) {
      throw new Error('Name and email are required');
    }

    const user = this.userService.createUser(dto);
    return {
      success: true,
      data: user,
      message: 'User created successfully',
    };
  }

  /**
   * PUT /api/users/:id
   */
  @PutMapping('/:id')
  updateUser(@PathVariable('id') id: string, @RequestBody() dto: UpdateUserDto) {
    const user = this.userService.updateUser(id, dto);
    return {
      success: true,
      data: user,
      message: 'User updated successfully',
    };
  }

  /**
   * DELETE /api/users/:id
   */
  @DeleteMapping('/:id')
  deleteUser(@PathVariable('id') id: string) {
    this.userService.deleteUser(id);
    return {
      success: true,
      message: 'User deleted successfully',
    };
  }
}

// ============================================
// HEALTH CHECK CONTROLLER
// ============================================

@RestController('/api/health')
class HealthController {
  @GetMapping()
  healthCheck(@RequestHeader('User-Agent', false) userAgent?: string) {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      userAgent,
    };
  }
}

// ============================================
// APPLICATION (Like Spring Boot @SpringBootApplication)
// ============================================

@KiqApplication()
class SpringRestApiApplication {
  async run() {
    const app = new KiqHttpApplication(SpringRestApiApplication, {
      port: 3000,
      logging: true,
      errorHandler: true,
      bodyParser: true,
    });

    await app.start();

    console.log('📝 Try these endpoints:');
    console.log('   GET    http://localhost:3000/api/users');
    console.log('   GET    http://localhost:3000/api/users/1');
    console.log('   GET    http://localhost:3000/api/users?search=john');
    console.log('   POST   http://localhost:3000/api/users');
    console.log('   PUT    http://localhost:3000/api/users/1');
    console.log('   DELETE http://localhost:3000/api/users/1');
    console.log('   GET    http://localhost:3000/api/health');
  }
}

// Bootstrap the application
new SpringRestApiApplication().run().catch(console.error);
