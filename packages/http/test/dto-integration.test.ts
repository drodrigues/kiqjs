import 'reflect-metadata';
import { Container, runApplication, KiqApplication } from '@kiqjs/core';
import Router from '@koa/router';
import { registerControllers, HttpError } from '../src/router';
import { RestController, PostMapping, RequestBody, Valid } from '../src/index';
import { IsString, IsEmail, MinLength, IsOptional } from '../src/dto';

// Test DTO
class CreateUserDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  address?: string;
}

describe('DTO Integration', () => {
  describe('@Body decorator with validation', () => {
    it('should validate and pass valid DTO to controller', async () => {
      let receivedUser: CreateUserDto | undefined;

      @RestController('/users')
      class UserController {
        @PostMapping()
        createUser(@RequestBody() @Valid() user: CreateUserDto) {
          receivedUser = user;
          return { success: true, user };
        }
      }

      @KiqApplication()
      class TestApp {}

      const container = await runApplication(TestApp);
      const router = new Router();

      registerControllers(container, router);

      const ctx: any = {
        params: {},
        query: {},
        headers: {},
        request: {
          body: {
            name: 'John Doe',
            email: 'john@example.com',
            address: '123 Main St',
          },
        },
        get: () => '',
      };

      const route = router.stack.find((r) => r.path === '/users');
      await route!.stack[0](ctx, async () => {});

      expect(receivedUser).toBeDefined();
      expect(receivedUser).toBeInstanceOf(CreateUserDto);
      expect(receivedUser!.name).toBe('John Doe');
      expect(receivedUser!.email).toBe('john@example.com');
      expect(receivedUser!.address).toBe('123 Main St');
    });

    it('should reject invalid DTO with validation errors', async () => {
      @RestController('/users-invalid')
      class UserController {
        @PostMapping()
        createUser(@RequestBody() @Valid() user: CreateUserDto) {
          return { success: true, user };
        }
      }

      @KiqApplication()
      class TestApp {}

      const container = await runApplication(TestApp);
      const router = new Router();

      registerControllers(container, router);

      const ctx: any = {
        params: {},
        query: {},
        headers: {},
        request: {
          body: {
            name: 'Jo', // Too short
            email: 'invalid-email', // Invalid email
          },
        },
        get: () => '',
      };

      const route = router.stack.find((r) => r.path === '/users-invalid');

      await expect(route!.stack[0](ctx, async () => {})).rejects.toThrow(HttpError);

      try {
        await route!.stack[0](ctx, async () => {});
      } catch (error: any) {
        expect(error).toBeInstanceOf(HttpError);
        expect(error.status).toBe(400);
        expect(error.message).toBe('Validation failed');
        expect(error.details).toBeDefined();
        expect(error.details.name).toBeDefined();
        expect(error.details.email).toBeDefined();
      }
    });

    it('should handle missing required fields', async () => {
      @RestController('/users-missing')
      class UserController {
        @PostMapping()
        createUser(@RequestBody() @Valid() user: CreateUserDto) {
          return { success: true, user };
        }
      }

      @KiqApplication()
      class TestApp {}

      const container = await runApplication(TestApp);
      const router = new Router();

      registerControllers(container, router);

      const ctx: any = {
        params: {},
        query: {},
        headers: {},
        request: {
          body: {
            name: 'John Doe',
            // Missing email
          },
        },
        get: () => '',
      };

      const route = router.stack.find((r) => r.path === '/users-missing');

      await expect(route!.stack[0](ctx, async () => {})).rejects.toThrow(HttpError);

      try {
        await route!.stack[0](ctx, async () => {});
      } catch (error: any) {
        expect(error.details.email).toBeDefined();
      }
    });

    it('should handle optional fields correctly', async () => {
      let receivedUser: CreateUserDto | undefined;

      @RestController('/users-optional')
      class UserOptionalController {
        @PostMapping()
        createUser(@RequestBody() @Valid() user: CreateUserDto) {
          receivedUser = user;
          return { success: true, user };
        }
      }

      @KiqApplication()
      class TestApp {}

      const container = await runApplication(TestApp);
      const router = new Router();

      registerControllers(container, router);

      const ctx: any = {
        params: {},
        query: {},
        headers: {},
        request: {
          body: {
            name: 'John Doe',
            email: 'john@example.com',
            // address is optional, not provided
          },
        },
        get: () => '',
      };

      const route = router.stack.find((r) => r.path === '/users-optional');
      await route!.stack[0](ctx, async () => {});

      expect(receivedUser).toBeDefined();
      expect(receivedUser!.name).toBe('John Doe');
      expect(receivedUser!.email).toBe('john@example.com');
      expect(receivedUser!.address).toBeUndefined();
    });

    it('should strip unknown properties from DTO', async () => {
      let receivedUser: any;

      @RestController('/users-strip')
      class UserStripController {
        @PostMapping()
        createUser(@RequestBody() @Valid() user: CreateUserDto) {
          receivedUser = user;
          return { success: true, user };
        }
      }

      @KiqApplication()
      class TestApp {}

      const container = await runApplication(TestApp);
      const router = new Router();

      registerControllers(container, router);

      const ctx: any = {
        params: {},
        query: {},
        headers: {},
        request: {
          body: {
            name: 'John Doe',
            email: 'john@example.com',
            unknownField: 'should be stripped',
            anotherUnknown: 123,
          },
        },
        get: () => '',
      };

      const route = router.stack.find((r) => r.path === '/users-strip');
      await route!.stack[0](ctx, async () => {});

      expect(receivedUser).toBeDefined();
      expect(receivedUser.name).toBe('John Doe');
      expect(receivedUser.email).toBe('john@example.com');
      expect(receivedUser.unknownField).toBeUndefined();
      expect(receivedUser.anotherUnknown).toBeUndefined();
    });
  });
});
