# 🔷 ZF-HALO Core

Backend API para el sistema de gestión de préstamos de activos patrimoniales.

## Stack Tecnológico

- **NestJS 11** - Framework modular con inyección de dependencias
- **Prisma 7** - ORM con type-safety y migraciones
- **PostgreSQL 15** - Base de datos relacional
- **Passport + JWT** - Autenticación segura
- **bcrypt** - Hash de contraseñas con salt (12 rounds)
- **Helmet** - Headers de seguridad OWASP
- **class-validator** - Validación de DTOs

## Estructura del Proyecto (Arquitectura Hexagonal)

```
src/
├── domain/                # Capa de dominio (core business)
│   ├── entities/          # Entidades de dominio (User, etc.)
│   ├── value-objects/     # Objetos de valor (Email, Role)
│   └── repositories/      # Interfaces de repositorios (puertos)
│
├── application/           # Capa de aplicación
│   ├── dtos/              # Data Transfer Objects por feature
│   │   ├── auth/          # DTOs de autenticación
│   │   ├── loan/          # DTOs de préstamos (placeholder)
│   │   └── asset/         # DTOs de activos (placeholder)
│   └── services/          # Servicios de aplicación
│       └── auth.service.ts
│
├── infrastructure/        # Capa de infraestructura (adaptadores)
│   ├── http/
│   │   ├── controllers/   # Controladores REST
│   │   ├── decorators/    # @Roles(), @CurrentUser()
│   │   ├── guards/        # JwtAuthGuard, RolesGuard
│   │   └── strategies/    # JWT Strategy
│   └── persistence/
│       └── prisma/        # PrismaService, Repository implementations
│
├── modules/               # Módulos NestJS
│   └── auth.module.ts
│
├── app.module.ts          # Módulo raíz
└── main.ts                # Entry point

generated/
└── prisma/                # Cliente Prisma generado
```


## Instalación

```bash
# Instalar dependencias
pnpm install

# Generar cliente Prisma
pnpm prisma generate
```

## Variables de Entorno

Copia `.env.example` a `.env` y configura:

```env
DATABASE_URL="postgresql://user_zf:password_zf@localhost:5432/zf_halo?schema=public"
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d
PORT=3000
```

## API

### Versionado

La API usa **URL versioning** para garantizar compatibilidad:

```
/api/v1/auth/register   POST   Registrar usuario
/api/v1/auth/login      POST   Iniciar sesión
/api/v1/auth/me         GET    Usuario actual (JWT)
```

### Rate Limiting

Protección global: **10 requests por 60 segundos** por IP.

```typescript
// @nestjs/throttler
ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }])
```

## Base de Datos

```bash
# Levantar PostgreSQL con Docker
docker-compose up -d postgres

# Crear migración inicial
pnpm prisma migrate dev --name init

# Ver base de datos (opcional)
pnpm prisma studio
```

## Prisma ORM v7 Configuration

Este proyecto utiliza **Prisma ORM v7** con las siguientes mejores prácticas:

### Arquitectura

```
prisma/
├── schema.prisma     # Schema con generator + modelos
├── migrations/       # Migraciones SQL
└── prisma.config.ts  # Config CLI (datasource URL)

node_modules/@generated/prisma/  # Cliente generado
```

### Características v7

| Característica | Implementación |
|----------------|----------------|
| Generator Provider | `prisma-client-js` (CJS compatible con Jest) |
| Driver Adapter | `@prisma/adapter-pg` para PostgreSQL directo |
| Config File | `prisma.config.ts` con datasource URL |
| Output Path | `node_modules/@generated/prisma` |

> **Nota**: Usamos `prisma-client-js` en lugar de `prisma-client` porque el nuevo generador ESM (`prisma-client`) usa `import.meta` que no es compatible con Jest.

### PrismaService con Driver Adapter

```typescript
// src/infrastructure/persistence/prisma/prisma.service.ts
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@generated/prisma';

export class PrismaService extends PrismaClient {
    constructor() {
        const adapter = new PrismaPg({
            connectionString: process.env.DATABASE_URL
        });
        super({ adapter });
    }
}
```

### Comandos Prisma v7

```bash
# Generar cliente (obligatorio después de cambios en schema)
pnpm prisma generate

# Migrar base de datos
pnpm prisma migrate dev --name <nombre>

# Seeding (v7 ya no lo hace automáticamente)
pnpm prisma db seed
```

> **Nota**: En Prisma v7, `migrate dev` y `db push` ya no ejecutan `generate` automáticamente.


## Ejecución

```bash
# Desarrollo
pnpm start:dev

# Producción
pnpm build
pnpm start:prod
```

## API de Autenticación

### POST /api/auth/register
Registra un nuevo usuario.

```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe"
}
```

### POST /api/auth/login
Inicia sesión y obtiene token JWT.

```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER"
  }
}
```

### GET /api/auth/me
Obtiene el usuario autenticado (requiere token).

```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <TOKEN>"
```

## Roles del Sistema

| Rol | Permisos |
|-----|----------|
| `USER` | Solicita préstamos, visualiza catálogo |
| `MANAGER` | Autoriza préstamos de su equipo |
| `ADMIN` | Gestión completa de activos y préstamos |
| `AUDITOR` | Acceso de solo lectura + exportación |

## Seguridad Implementada

| Característica | Implementación |
|----------------|----------------|
| Password hashing | bcrypt con 12 salt rounds |
| JWT tokens | RS256, expira en 7 días |
| CORS | Configurado para frontend |
| Headers seguros | Helmet (XSS, CSRF, etc.) |
| Validación | class-validator con whitelist |
| RBAC | Guards con decoradores |

## Testing

```bash
pnpm test        # Unit tests
pnpm test:e2e    # E2E tests
pnpm test:cov    # Coverage
```
