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

## Estructura del Proyecto

```
src/
├── application/           # Capa de aplicación
│   ├── dtos/              # Data Transfer Objects
│   │   └── auth/          # DTOs de autenticación
│   └── services/          # Servicios de aplicación
│       └── auth.service.ts
│
├── infrastructure/        # Capa de infraestructura
│   ├── http/
│   │   ├── controllers/   # Controladores REST
│   │   ├── decorators/    # @Roles(), @CurrentUser()
│   │   ├── guards/        # JwtAuthGuard, RolesGuard
│   │   └── strategies/    # JWT Strategy
│   └── persistence/
│       └── prisma/        # PrismaService
│
├── modules/               # Módulos NestJS
│   └── auth.module.ts
│
├── app.module.ts          # Módulo raíz
└── main.ts                # Entry point
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

## Base de Datos

```bash
# Levantar PostgreSQL con Docker
docker-compose up -d postgres

# Crear migración inicial
pnpm prisma migrate dev --name init

# Ver base de datos (opcional)
pnpm prisma studio
```

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
