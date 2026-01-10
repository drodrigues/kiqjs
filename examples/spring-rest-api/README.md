# Spring Boot-like REST API Example

Este exemplo demonstra como criar uma API REST usando **KiqJS** com sintaxe inspirada no **Spring Boot**.

## Recursos Demonstrados

### Decorators de Controller
- `@RestController('/api/users')` - Define um controller REST com path base
- Similar ao Spring Boot `@RestController` + `@RequestMapping`

### Decorators de Rotas
- `@GetMapping()` - Mapeia requisições GET
- `@PostMapping()` - Mapeia requisições POST
- `@PutMapping()` - Mapeia requisições PUT
- `@DeleteMapping()` - Mapeia requisições DELETE
- `@PatchMapping()` - Mapeia requisições PATCH

### Decorators de Parâmetros
- `@PathVariable('id')` - Extrai variáveis da URL (como `{id}` no Spring)
- `@RequestBody()` - Extrai o corpo da requisição
- `@RequestParam('name')` - Extrai query parameters
- `@RequestHeader('Authorization')` - Extrai headers HTTP

### Arquitetura em Camadas
- **Controller Layer** - `@RestController` para endpoints HTTP
- **Service Layer** - `@Service` para lógica de negócio
- **Repository Layer** - `@Service` para acesso a dados

## Como Executar

```bash
# Instalar dependências
pnpm install

# Executar em modo desenvolvimento
pnpm dev
```

O servidor iniciará em `http://localhost:3000`

## Endpoints Disponíveis

### Listar todos os usuários
```bash
curl http://localhost:3000/api/users
```

### Buscar usuário por ID
```bash
curl http://localhost:3000/api/users/1
```

### Buscar usuários (com filtro)
```bash
curl "http://localhost:3000/api/users?search=john"
```

### Criar novo usuário
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Bob Wilson", "email": "bob@example.com"}'
```

### Atualizar usuário
```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "John Updated"}'
```

### Deletar usuário
```bash
curl -X DELETE http://localhost:3000/api/users/1
```

### Health check
```bash
curl http://localhost:3000/api/health
```

## Estrutura do Código

```typescript
// 1. Repository Layer (Data Access)
@Service()
class UserRepository {
  // Métodos de acesso aos dados
}

// 2. Service Layer (Business Logic)
@Service()
class UserService {
  constructor(private userRepository: UserRepository) {}
  // Lógica de negócio
}

// 3. Controller Layer (HTTP Endpoints)
@RestController('/api/users')
class UserController {
  constructor(private userService: UserService) {}

  @GetMapping('/:id')
  getUserById(@PathVariable('id') id: string) {
    return this.userService.getUserById(id);
  }
}

// 4. Application Bootstrap
@KiqApplication()
class SpringRestApiApplication {
  async run() {
    const app = new KiqHttpApplication(SpringRestApiApplication, {
      port: 3000,
      logging: true
    });
    await app.start();
  }
}
```

## Comparação com Spring Boot

### Spring Boot (Java)
```java
@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    private UserService userService;

    @GetMapping("/{id}")
    public User getUserById(@PathVariable String id) {
        return userService.getUserById(id);
    }

    @PostMapping
    public User createUser(@RequestBody CreateUserDto dto) {
        return userService.createUser(dto);
    }
}
```

### KiqJS (TypeScript)
```typescript
@RestController('/api/users')
class UserController {
  constructor(private userService: UserService) {}

  @GetMapping('/:id')
  getUserById(@PathVariable('id') id: string) {
    return this.userService.getUserById(id);
  }

  @PostMapping()
  createUser(@RequestBody() dto: CreateUserDto) {
    return this.userService.createUser(dto);
  }
}
```

## Benefícios

✅ **Sintaxe familiar** - Desenvolvedores Spring se sentirão em casa
✅ **Type Safety** - TypeScript com decorators
✅ **Dependency Injection** - Automática via constructor
✅ **Testabilidade** - Fácil mockar dependências
✅ **Separação de Concerns** - Arquitetura em camadas clara
✅ **Menos boilerplate** - Decorators reduzem código repetitivo
