# THREAD Architecture Example

> **Arquitetura de Software Orientada a Domínio, Produto e Execução**

Este exemplo demonstra como implementar a **THREAD Architecture** usando **KiqJS** e **Spring Boot-style decorators**.

## O que é THREAD Architecture?

A THREAD Architecture é um padrão arquitetural que prioriza:

- **Domínio explícito no código** - Regras de negócio claras e isoladas
- **Entregas verticais** - Features completas do início ao fim
- **Eventos como linguagem** - Comunicação desacoplada
- **Nomes claros** - Responsabilidade óbvia de cada arquivo
- **Uma razão para mudar** - Single Responsibility Principle na prática

## Estrutura do Projeto

```
src/
├── Application.ts                          # Entry point
├── config/
│   └── AppConfig.ts                        # Configurações explícitas
├── core/
│   ├── Result.ts                           # Result type pattern
│   └── DomainEvent.ts                      # Base para eventos
├── domains/
│   └── User.ts                             # Entidade de domínio pura
└── features/
    └── user/                               # Feature vertical completa
        ├── UserDto.ts                      # Data transfer objects
        ├── UserRepository.ts               # Persistência
        ├── UserService.ts                  # Lógica de negócio
        ├── UserHttpController.ts           # Endpoints HTTP
        ├── UserEventPublisher.ts           # Publicação de eventos
        ├── UserCreatedEvent.ts             # Evento de criação
        └── UserUpdatedEvent.ts             # Evento de atualização
```

## Camadas e Responsabilidades

### `domains/` - Modelo de Negócio Puro

Contém **entidades**, **value objects** e **regras invariantes**.

- ✅ Não depende de framework
- ✅ Não depende de banco de dados
- ✅ Apenas lógica de domínio

```typescript
// domains/User.ts
export class User {
  activate(): User {
    if (this.status !== UserStatus.PENDING) {
      throw new Error('Only pending users can be activated');
    }
    return new User(/* ... */);
  }
}
```

### `features/<feature>/` - Execução do Produto

Cada **feature** é uma **fatia vertical completa**:

- HTTP Controller → Service → Repository → Events
- Um arquivo por responsabilidade
- Nome do arquivo indica claramente a função

```typescript
// features/user/UserHttpController.ts
@RestController('/api/users')
export class UserHttpController {
  @PostMapping()
  async createUser(@RequestBody() dto: CreateUserDto) {
    // ...
  }
}
```

### `core/` - Abstrações Reutilizáveis

Tipos e padrões neutros de domínio:

- `Result<T, E>` - Pattern para operações que podem falhar
- `DomainEvent` - Base para eventos de domínio

```typescript
// core/Result.ts
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };
```

### `config/` - Configurações Explícitas

Configurações de infraestrutura e feature flags.

```typescript
// config/AppConfig.ts
@Configuration()
export class AppConfig {
  @Bean()
  serverConfig() {
    return { port: 3000, host: 'localhost' };
  }
}
```

## Fluxo de uma Requisição

```
HTTP Request
    ↓
UserHttpController        ← Entrada HTTP
    ↓
UserService               ← Orquestração + Regras
    ↓
User (Domain)             ← Validações de domínio
    ↓
UserRepository            ← Persistência
    ↓
UserEventPublisher        ← Publicação de evento
    ↓
Kafka/Redis (futuro)
```

## Padrão de Nomenclatura

Todos os arquivos seguem **PascalCase** com sufixo indicando a responsabilidade:

- `UserHttpController.ts` - Controller HTTP
- `UserService.ts` - Serviço de aplicação
- `UserRepository.ts` - Camada de dados
- `UserCreatedEvent.ts` - Evento de domínio
- `UserEventPublisher.ts` - Publicador de eventos
- `UserDto.ts` - Data transfer objects

## Como Executar

```bash
# Instalar dependências
pnpm install

# Rodar em modo desenvolvimento
pnpm dev
```

O servidor iniciará em `http://localhost:3000`

## Endpoints Disponíveis

### Listar usuários
```bash
curl http://localhost:3000/api/users
```

### Filtrar por status
```bash
curl "http://localhost:3000/api/users?status=ACTIVE"
```

### Buscar usuário por ID
```bash
curl http://localhost:3000/api/users/1
```

### Criar usuário
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

### Ativar usuário
```bash
curl -X PATCH http://localhost:3000/api/users/2/activate
```

### Desativar usuário
```bash
curl -X PATCH http://localhost:3000/api/users/1/deactivate
```

### Deletar usuário
```bash
curl -X DELETE http://localhost:3000/api/users/1
```

## Princípios Aplicados

### 1. Domínio acima do framework
```typescript
// ✅ Domínio puro
class User {
  activate(): User { /* ... */ }
}

// ❌ Domínio acoplado ao framework
class User extends KoaModel { /* ... */ }
```

### 2. Entrega vertical sempre
Cada feature contém **tudo** que precisa:
- Controller (HTTP)
- Service (Negócio)
- Repository (Dados)
- Events (Comunicação)

### 3. Um motivo para mudar
Cada arquivo tem **uma única responsabilidade**:
- `UserHttpController` - Só cuida de HTTP
- `UserService` - Só orquestra negócio
- `UserRepository` - Só persiste dados

### 4. Eventos como linguagem
```typescript
// Sistema comunica via eventos
await this.publisher.publishUserCreated(new UserCreatedEvent(user));
```

### 5. Nomes são contratos
- `UserHttpController` → Óbvio que trata HTTP
- `UserCreatedEvent` → Óbvio que é um evento de criação
- `UserRepository` → Óbvio que persiste dados

## Benefícios da THREAD Architecture

✅ **Clareza** - Qualquer dev entende a estrutura rapidamente
✅ **Escalabilidade** - Adicionar features não afeta outras
✅ **Testabilidade** - Domínio isolado é fácil de testar
✅ **Manutenibilidade** - Mudanças são localizadas
✅ **Onboarding rápido** - Estrutura previsível
✅ **AI-friendly** - Fácil indexação e análise

## Comparação: Antes vs. Depois

### ❌ Estrutura Tradicional
```
src/
├── controllers/
│   ├── UserController.ts
│   ├── OrderController.ts
│   └── ProductController.ts
├── services/
│   ├── UserService.ts
│   ├── OrderService.ts
│   └── ProductService.ts
└── repositories/
    ├── UserRepository.ts
    └── ...
```
**Problema**: Features espalhadas por múltiplas pastas

### ✅ THREAD Architecture
```
src/
├── features/
│   ├── user/
│   │   ├── UserHttpController.ts
│   │   ├── UserService.ts
│   │   └── UserRepository.ts
│   ├── order/
│   │   ├── OrderHttpController.ts
│   │   ├── OrderService.ts
│   │   └── OrderRepository.ts
```
**Vantagem**: Feature completa em um só lugar

## Próximos Passos

Para uma implementação completa de produção, adicione:

- [ ] Integração real com Kafka/Redis
- [ ] Banco de dados (PostgreSQL, MongoDB, etc)
- [ ] Authentication/Authorization
- [ ] Request validation com class-validator
- [ ] Logging estruturado
- [ ] Metrics e observability
- [ ] Testes automatizados

## Referências

- [THREAD Architecture - Documentação Completa](https://thread.com.br/architecture)
- [KiqJS - Documentação](../../packages/core/README.md)
- [Spring Boot](https://spring.io/projects/spring-boot)
