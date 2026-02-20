<div align="center">

# 🔷 ZF-HALO

### **Hardware Asset Loan Operations**

Sistema integral de gestión de préstamos de activos patrimoniales con trazabilidad completa, notificaciones automatizadas y análisis predictivo impulsado por IA.

[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![TanStack](https://img.shields.io/badge/TanStack-Query%20%26%20Router-FF4154?style=for-the-badge)](https://tanstack.com/)

</div>

---

## 📋 Tabla de Contenidos

- [Descripción General](#-descripción-general)
- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [Stack Tecnológico](#-stack-tecnológico)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Requisitos Funcionales](#-requisitos-funcionales)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Variables de Entorno](#-variables-de-entorno)
- [Ejecución](#-ejecución)
- [API Reference](#-api-reference)
- [Testing](#-testing)
- [Contribución](#-contribución)

---

## 🎯 Descripción General

**ZF-HALO** (Hardware Asset Loan Operations) es un sistema empresarial diseñado para la gestión integral del ciclo de vida de préstamos de activos patrimoniales. El sistema permite:

- 📦 **Catalogación completa** de activos con códigos QR únicos
- 🔄 **Flujo de préstamos** con autorizaciones multinivel
- ⏰ **Recordatorios automáticos** y escalaciones inteligentes
- 📊 **Dashboard ejecutivo** con KPIs en tiempo real
- 🤖 **Análisis predictivo** de demanda mediante IA
- 📱 **Experiencia mobile-first** optimizada para trabajo en campo

---

## 🏗 Arquitectura del Sistema

### Arquitectura Hexagonal (Ports & Adapters)

El backend implementa **Arquitectura Hexagonal** para garantizar separación de responsabilidades, testabilidad y mantenibilidad a largo plazo.

```
┌─────────────────────────────────────────────────────────────────────┐
│                           INFRASTRUCTURE                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │   REST API   │  │   GraphQL    │  │   WebSocket  │   ← Adapters  │
│  │  (Express)   │  │  (Optional)  │  │   (Socket)   │     Primarios │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘               │
│         │                 │                 │                        │
│  ┌──────┴─────────────────┴─────────────────┴───────┐               │
│  │                    PORTS (IN)                     │               │
│  │         Controllers / Use Case Interfaces         │               │
│  └──────────────────────┬────────────────────────────┘               │
│                         │                                            │
│  ┌──────────────────────┴────────────────────────────┐               │
│  │                 APPLICATION LAYER                  │               │
│  │  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │               │
│  │  │  Use Cases  │  │   DTOs      │  │  Services  │ │               │
│  │  │  (Commands) │  │ (Requests)  │  │  (Queries) │ │               │
│  │  └─────────────┘  └─────────────┘  └────────────┘ │               │
│  └──────────────────────┬────────────────────────────┘               │
│                         │                                            │
│  ┌──────────────────────┴────────────────────────────┐               │
│  │                   DOMAIN LAYER                     │               │
│  │  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │               │
│  │  │  Entities   │  │   Value     │  │   Domain   │ │               │
│  │  │  (Aggreg.)  │  │  Objects    │  │   Events   │ │               │
│  │  └─────────────┘  └─────────────┘  └────────────┘ │               │
│  │  ┌─────────────────────────────────────────────┐  │               │
│  │  │           Repository Interfaces             │  │               │
│  │  └─────────────────────────────────────────────┘  │               │
│  └──────────────────────┬────────────────────────────┘               │
│                         │                                            │
│  ┌──────────────────────┴────────────────────────────┐               │
│  │                   PORTS (OUT)                      │               │
│  │           Repository / Service Interfaces          │               │
│  └──────────────────────┬────────────────────────────┘               │
│                         │                                            │
│  ┌──────┬───────────────┴───────────────┬──────────────┐             │
│  │      │                               │              │  ← Adapters │
│  │ ┌────┴────┐  ┌──────────────┐  ┌─────┴─────┐       │   Secundarios│
│  │ │ Prisma  │  │    Redis     │  │  External │       │             │
│  │ │ (SQL)   │  │   (Cache)    │  │   APIs    │       │             │
│  └─┴─────────┴──┴──────────────┴──┴───────────┴───────┘             │
└─────────────────────────────────────────────────────────────────────┘
```

### Diagrama de Arquitectura General

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENTS                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │   📱 PWA     │  │   🖥️ Web     │  │   📷 Kiosk   │                   │
│  │  (Mobile)    │  │  (Desktop)   │  │   (QR Scan)  │                   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                   │
└─────────┼──────────────────┼──────────────────┼─────────────────────────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │ HTTPS
          ┌──────────────────┴──────────────────┐
          │            🔷 zf-halo-client        │
          │    React 19 + Vite + TanStack       │
          │      PWA Mobile-First + shadcn      │
          └──────────────────┬──────────────────┘
                             │ REST API
          ┌──────────────────┴──────────────────┐
          │            🔷 zf-halo-core          │
          │   NestJS + Hexagonal Architecture   │
          │     Prisma + BullMQ + Helmet        │
          └──────────────────┬──────────────────┘
                             │
     ┌───────────┬───────────┼───────────┬───────────┐
     │           │           │           │           │
┌────┴────┐ ┌────┴────┐ ┌────┴────┐ ┌────┴────┐ ┌────┴────┐
│   🐘    │ │   🔴    │ │   📊    │ │   📈    │ │   🤖    │
│PostgreSQL│ │  Redis  │ │Prometheus│ │ Grafana │ │ AI/ML   │
│  (Data) │ │ (Cache) │ │ (Metrics)│ │ (Dash)  │ │(Predict)│
└─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘
```

---

## 🛠 Stack Tecnológico

### Backend (`zf-halo-core`)

| Categoría | Tecnología | Propósito |
|-----------|------------|-----------|
| **Framework** | NestJS 11 | Framework modular con inyección de dependencias |
| **ORM** | Prisma 7 | Type-safe database access con migraciones |
| **Database** | PostgreSQL 15 | Base de datos relacional ACID |
| **Cache** | Redis 7 | Cache distribuido y cola de mensajes |
| **Queue** | BullMQ | Procesamiento de jobs en background |
| **Security** | Helmet + CORS | Protección contra vulnerabilidades OWASP |
| **Metrics** | Prometheus | Exportación de métricas para observabilidad |
| **Accounts & Permissions** | NestJS Guards/Decorators |
  - Two-step registration flow: Sign-up -> Admin Approval -> Active User.
  - Role-Based Access Control (RBAC) with granular permissions (e.g., `loan:approve`, `asset:manage`).
  - Guards and Decorators for secure endpoint protection.
| **Validation** | class-validator | Validación de DTOs y request bodies |
| **Testing** | Jest + Supertest | Unit tests y E2E tests |

### Frontend (`zf-halo-client`)

| Categoría | Tecnología | Propósito |
|-----------|------------|-----------|
| **Framework** | React 19 | UI library con concurrent features |
| **Bundler** | Vite 7 | Build tool ultrarrápido con HMR |
| **Routing** | TanStack Router | Type-safe routing con code splitting |
| **State** | TanStack Query | Server state management con cache |
| **UI Components** | shadcn/ui | Componentes accesibles y customizables |
| **Styling** | Tailwind CSS 4 | Utility-first CSS framework |
| **Icons** | Lucide React | Iconografía moderna y consistente |
| **HTTP Client** | Axios | Cliente HTTP con interceptors |
| **PWA** | vite-plugin-pwa | Service workers y manifest |
| **Charts** | Recharts | Gráficos interactivos para dashboard |

### DevOps & Observabilidad

| Categoría | Tecnología | Propósito |
|-----------|------------|-----------|
| **Containers** | Docker + Compose | Containerización y orquestación |
| **Metrics** | Prometheus | Recolección de métricas |
| **Dashboard** | Grafana | Visualización de métricas |
| **CI/CD** | GitHub Actions | Automatización de pipelines |

---

## 📁 Estructura del Proyecto

```
zf-halo/
├── 📄 docker-compose.yml          # Orquestación de servicios
├── 📄 prometheus.yml              # Configuración de Prometheus
├── 📄 README.md                   # Este archivo
│
├── 🔷 zf-halo-core/               # Backend NestJS
│   ├── prisma/
│   │   └── schema.prisma          # Modelo de datos
│   │
│   └── src/
│       ├── 📂 domain/             # 🎯 CAPA DE DOMINIO
│       │   ├── entities/          # Entidades y agregados
│       │   │   ├── asset.entity.ts
│       │   │   ├── loan.entity.ts
│       │   │   ├── user.entity.ts
│       │   │   └── destination.entity.ts
│       │   ├── value-objects/     # Value Objects inmutables
│       │   │   ├── asset-status.vo.ts
│       │   │   ├── loan-status.vo.ts
│       │   │   └── email.vo.ts
│       │   ├── events/            # Domain Events
│       │   │   ├── loan-requested.event.ts
│       │   │   ├── loan-approved.event.ts
│       │   │   └── loan-overdue.event.ts
│       │   └── repositories/      # Interfaces de repositorios
│       │       ├── asset.repository.interface.ts
│       │       ├── loan.repository.interface.ts
│       │       └── user.repository.interface.ts
│       │
│       ├── 📂 application/        # 🎯 CAPA DE APLICACIÓN
│       │   ├── use-cases/         # Casos de uso (Commands)
│       │   │   ├── loans/
│       │   │   │   ├── request-loan.use-case.ts
│       │   │   │   ├── approve-loan.use-case.ts
│       │   │   │   ├── checkout-asset.use-case.ts
│       │   │   │   └── checkin-asset.use-case.ts
│       │   │   ├── assets/
│       │   │   │   ├── register-asset.use-case.ts
│       │   │   │   └── update-asset.use-case.ts
│       │   │   └── notifications/
│       │   │       └── send-reminder.use-case.ts
│       │   ├── queries/           # Casos de uso (Queries)
│       │   │   ├── get-asset-history.query.ts
│       │   │   ├── get-dashboard-kpis.query.ts
│       │   │   └── get-overdue-loans.query.ts
│       │   ├── dtos/              # Data Transfer Objects
│       │   │   ├── request-loan.dto.ts
│       │   │   ├── create-asset.dto.ts
│       │   │   └── user-response.dto.ts
│       │   └── services/          # Servicios de aplicación
│       │       ├── notification.service.ts
│       │       └── report.service.ts
│       │
│       ├── 📂 infrastructure/     # 🎯 CAPA DE INFRAESTRUCTURA
│       │   ├── persistence/       # Adaptadores de persistencia
│       │   │   ├── prisma/
│       │   │   │   ├── prisma.service.ts
│       │   │   │   ├── asset.prisma.repository.ts
│       │   │   │   ├── loan.prisma.repository.ts
│       │   │   │   └── user.prisma.repository.ts
│       │   │   └── redis/
│       │   │       └── cache.service.ts
│       │   ├── http/              # Adaptadores HTTP (Controllers)
│       │   │   ├── controllers/
│       │   │   │   ├── asset.controller.ts
│       │   │   │   ├── loan.controller.ts
│       │   │   │   ├── user.controller.ts
│       │   │   │   └── report.controller.ts
│       │   │   ├── guards/
│       │   │   │   ├── jwt-auth.guard.ts
│       │   │   │   └── roles.guard.ts
│       │   │   ├── decorators/
│       │   │   │   ├── roles.decorator.ts
│       │   │   │   └── current-user.decorator.ts
│       │   │   └── filters/
│       │   │       └── http-exception.filter.ts
│       │   ├── messaging/         # Adaptadores de mensajería
│       │   │   ├── telegram/
│       │   │   │   └── telegram-notification.adapter.ts
│       │   │   └── email/
│       │   │       └── smtp-notification.adapter.ts
│       │   ├── jobs/              # Background jobs
│       │   │   ├── reminder.processor.ts
│       │   │   └── escalation.processor.ts
│       │   └── external/          # APIs externas
│       │       └── ai-prediction.adapter.ts
│       │
│       ├── 📂 modules/            # Módulos NestJS
│       │   ├── asset.module.ts
│       │   ├── loan.module.ts
│       │   ├── user.module.ts
│       │   ├── auth.module.ts
│       │   ├── notification.module.ts
│       │   └── report.module.ts
│       │
│       ├── app.module.ts          # Módulo raíz
│       └── main.ts                # Entry point
│
└── 🔷 zf-halo-client/             # Frontend React
    ├── public/
    │   ├── manifest.json          # PWA manifest
    │   └── sw.js                  # Service Worker
    │
    └── src/
        ├── 📂 app/                # Configuración de app
        │   ├── router.tsx         # TanStack Router config
        │   ├── query-client.ts    # TanStack Query config
        │   └── providers.tsx      # Context providers
        │
        ├── 📂 routes/             # Rutas (file-based routing)
        │   ├── __root.tsx         # Layout raíz
        │   ├── index.tsx          # Dashboard
        │   ├── assets/
        │   │   ├── index.tsx      # Lista de activos
        │   │   ├── $id.tsx        # Detalle de activo
        │   │   └── new.tsx        # Crear activo
        │   ├── loans/
        │   │   ├── index.tsx      # Mis préstamos
        │   │   ├── request.tsx    # Solicitar préstamo
        │   │   └── $id.tsx        # Detalle de préstamo
        │   ├── admin/
        │   │   ├── users.tsx      # Gestión de usuarios
        │   │   └── reports.tsx    # Reportes
        │   └── kiosk/
        │       └── scan.tsx       # Modo kiosko con scanner
        │
        ├── 📂 components/         # Componentes UI
        │   ├── ui/                # shadcn/ui components
        │   │   ├── button.tsx
        │   │   ├── card.tsx
        │   │   ├── dialog.tsx
        │   │   ├── input.tsx
        │   │   └── ...
        │   ├── layout/
        │   │   ├── header.tsx
        │   │   ├── sidebar.tsx
        │   │   └── mobile-nav.tsx
        │   ├── assets/
        │   │   ├── asset-card.tsx
        │   │   ├── asset-qr.tsx
        │   │   └── qr-scanner.tsx
        │   ├── loans/
        │   │   ├── loan-timeline.tsx
        │   │   └── loan-form.tsx
        │   └── dashboard/
        │       ├── kpi-cards.tsx
        │       ├── top-overdue.tsx
        │       └── usage-chart.tsx
        │
        ├── 📂 hooks/              # Custom hooks
        │   ├── use-assets.ts      # TanStack Query hooks
        │   ├── use-loans.ts
        │   ├── use-auth.ts
        │   └── use-camera.ts
        │
        ├── 📂 lib/                # Utilidades
        │   ├── api.ts             # Axios instance
        │   ├── constants.ts
        │   └── utils.ts
        │
        ├── 📂 stores/             # Estado global (si necesario)
        │   └── auth.store.ts
        │
        └── 📂 types/              # TypeScript types
            ├── asset.types.ts
            ├── loan.types.ts
            └── user.types.ts
```

---

## ✅ Requisitos Funcionales

### 👥 Roles del Sistema (22% de la rúbrica)

| Rol | Permisos | Descripción |
|-----|----------|-------------|
| **Usuario** | `READ`, `REQUEST` | Solicita préstamos, visualiza catálogo |
| **Gerente/Líder** | `READ`, `REQUEST`, `APPROVE` | Autoriza préstamos de su equipo |
| **Administrador Patrimonial** | `FULL_ACCESS` | Gestión completa de activos y préstamos |
| **Auditor** | `READ`, `EXPORT` | Acceso de solo lectura + exportación |

### 🔄 Flujo de Préstamo

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  SOLICITUD  │────▶│ AUTORIZACIÓN│────▶│  CHECK-OUT  │
│   Request   │     │   Approval  │     │   Pickup    │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
┌─────────────┐     ┌─────────────┐     ┌──────┴──────┐
│  CHECK-IN   │◀────│  EN USO     │◀────│             │
│   Return    │     │  (Active)   │     │   48h/24h   │
└─────────────┘     └──────┬──────┘     │  Reminders  │
                          │             └─────────────┘
                    ┌─────┴─────┐
                    │ ¿VENCIDO? │
                    └─────┬─────┘
                          │ SÍ
              ┌───────────┼───────────┐
              ▼           ▼           ▼
        ┌─────────┐ ┌─────────┐ ┌─────────┐
        │  DÍA 1  │ │  DÍA 3  │ │  DÍA 7  │
        │ Escalate│ │ Escalate│ │ Escalate│
        │   L1    │ │   L2    │ │   L3    │
        └─────────┘ └─────────┘ └─────────┘
```

### 📦 Catálogo de Activos

Cada activo debe contener:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único del sistema |
| `code` | String | Código interno (ej: ZF-LAP-001) |
| `brand` | String | Marca del activo |
| `model` | String | Modelo del activo |
| `serialNumber` | String | Número de serie del fabricante |
| `partNumber` | String | Número de parte |
| `name` | String | Nombre descriptivo |
| `description` | Text | Descripción detallada |
| `category` | Enum | Categoría (LAPTOP, PROJECTOR, TOOL, etc.) |
| `status` | Enum | AVAILABLE, IN_USE, MAINTENANCE, RETIRED |
| `location` | String | Ubicación física actual |
| `qrCode` | String | URL del perfil del activo (para QR) |
| `imageUrl` | String | Foto del activo |
| `createdAt` | DateTime | Fecha de registro |
| `updatedAt` | DateTime | Última actualización |

### 🏢 Catálogo de Destinos (Instituciones Externas)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único |
| `name` | String | Nombre de la institución |
| `address` | String | Dirección física |
| `contactName` | String | Nombre del contacto |
| `contactEmail` | String | Email del contacto |
| `contactPhone` | String | Teléfono del contacto |
| `activeLoans` | Relation | Préstamos activos a esta institución |

---

## 🚀 Instalación y Configuración

### Prerrequisitos

- **Node.js** >= 20.x
- **pnpm** >= 9.x (recomendado) o npm
- **Docker** >= 24.x y Docker Compose >= 2.x
- **Git** >= 2.x

### Clonar el Repositorio

```bash
git clone https://github.com/josuedev-afk/zf-halo.git
cd zf-halo
```

### Instalación de Dependencias

```bash
# Backend
cd zf-halo-core
pnpm install

# Frontend
cd ../zf-halo-client
pnpm install
```

### Configurar Base de Datos

```bash
# 1. Levantar PostgreSQL y Redis con Docker
docker-compose up -d postgres redis

# 2. Configurar variables de entorno
cd zf-halo-core
cp .env.example .env

# 3. Generar cliente Prisma
pnpm prisma generate

# 4. Ejecutar migraciones
pnpm prisma migrate dev --name init

# 5. (Opcional) Ver base de datos
pnpm prisma studio
```

---

## 🔧 Variables de Entorno

### Backend (`zf-halo-core/.env`)

```env
# Database
DATABASE_URL="postgresql://user_zf:password_zf@localhost:5432/zf_halo?schema=public"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d

# Telegram Notifications
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_CHAT_ID=your-telegram-chat-id

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# AI Service (opcional)
AI_SERVICE_URL=http://localhost:5000/predict

# App
PORT=3000
NODE_ENV=development
```

### Frontend (`zf-halo-client/.env`)

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=ZF-HALO
VITE_ENABLE_PWA=true
```

---

## ▶️ Ejecución

### Desarrollo Local (sin Docker)

```bash
# Terminal 1: Backend
cd zf-halo-core
pnpm start:dev

# Terminal 2: Frontend
cd zf-halo-client
pnpm dev
```

### Con Docker Compose (Recomendado)

```bash
# Levantar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f zf-halo-core

# Detener servicios
docker-compose down
```

### Acceso a Servicios

| Servicio | URL | Descripción |
|----------|-----|-------------|
| Frontend | http://localhost:5173 | Aplicación React |
| Backend API | http://localhost:3000/api | REST API |
| API Docs | http://localhost:3000/api/docs | Swagger UI |
| Grafana | http://localhost:3001 | Dashboard de métricas |
| Prometheus | http://localhost:9090 | Métricas raw |

---

## 📡 API Reference

### Autenticación

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

### Assets

```http
# Listar activos (paginado)
GET /api/assets?page=1&limit=20&status=AVAILABLE

# Obtener activo por ID
GET /api/assets/:id

# Crear activo (Admin)
POST /api/assets
Authorization: Bearer <token>

# Actualizar activo
PATCH /api/assets/:id

# Historial del activo
GET /api/assets/:id/history
```

### Loans

```http
# Solicitar préstamo (máximo 3 clics en frontend)
POST /api/loans/request
Authorization: Bearer <token>
{
  "assetId": "uuid",
  "reason": "Presentación cliente",
  "expectedReturnDate": "2026-02-10",
  "destinationId": "uuid" // opcional
}

# Aprobar préstamo (Gerente)
POST /api/loans/:id/approve

# Check-out (Entrega física)
POST /api/loans/:id/checkout

# Check-in (Devolución)
POST /api/loans/:id/checkin
```

### Reports

```http
# KPIs del dashboard
GET /api/reports/dashboard

# Top 10 activos vencidos
GET /api/reports/top-overdue

# Exportar trazabilidad (PDF/Excel)
GET /api/reports/traceability?format=xlsx&from=2026-01-01
```

---

## 🧪 Testing

### Backend

```bash
cd zf-halo-core

# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Coverage
pnpm test:cov

# Watch mode
pnpm test:watch
```

### Frontend

```bash
cd zf-halo-client

# Unit tests
pnpm test

# E2E con Playwright
pnpm test:e2e
```

### Prueba de Carga (Requisito: <2s con 10k activos)

```bash
# Usando k6
k6 run load-tests/assets-load.js

# Usando Artillery
npx artillery run load-tests/scenarios.yml
```

---

## 📊 Dashboard & KPIs

El dashboard interactivo incluye:

| KPI | Descripción | Visualización |
|-----|-------------|---------------|
| **Disponibilidad** | % de activos disponibles vs total | Gauge chart |
| **Top 10 Vencidos** | Activos con mayor tiempo de retraso | Table + alerts |
| **Más Solicitados** | Ranking de activos populares | Bar chart |
| **Uso por Disciplina** | Distribución por categoría | Pie chart |
| **Tendencia Mensual** | Préstamos por mes | Line chart |

---

## 🔒 Seguridad

### Medidas Implementadas (OWASP Top 10)

| Vulnerabilidad | Mitigación |
|----------------|------------|
| **Inyección SQL** | Prisma ORM con queries parametrizados |
| **XSS** | Helmet headers + sanitización de inputs |
| **CSRF** | Tokens de sesión + SameSite cookies |
| **Broken Auth** | JWT + refresh tokens + rate limiting |
| **Sensitive Data** | HTTPS + encripción de passwords (bcrypt) |
| **Broken Access Control** | RBAC con guards en cada endpoint |

---

## 🤖 Innovación y IA

### Módulo de IA (5% de la rúbrica)

- **Análisis Predictivo de Demanda**: Basado en historial de préstamos, predice qué activos tendrán mayor demanda en los próximos 30 días
- **Reportes Automatizados**: Generación automática de reportes de trazabilidad semanales
- **Detección de Anomalías**: Alertas cuando un patrón de uso es inusual

### Innovaciones Adicionales (10% de la rúbrica)

- **Modo Kiosko**: Interfaz simplificada para estaciones de auto-servicio
- **Escaneo QR**: Uso de cámara del dispositivo para identificar activos
- **Mantenimiento Preventivo**: Módulo de programación de mantenimientos e incidencias

---

## 📱 Accesibilidad y UX Mobile-First

### Estándares de Accesibilidad

- **WCAG 2.1 AA** compliance
- Navegación completa por teclado
- Contraste de colores adecuado
- Textos alternativos en imágenes
- Focus visible en elementos interactivos

### Mobile-First Design

- **Máximo 3 clics** para solicitar un activo
- Interfaz táctil optimizada (botones mínimo 44px)
- Offline mode con Service Workers
- Instalable como app nativa (PWA)

---

## 🤝 Contribución

### Flujo de Trabajo Git

```bash
# Crear rama feature
git checkout -b feature/nombre-feature

# Commits semánticos
git commit -m "feat: add loan approval workflow"
git commit -m "fix: resolve overdue notification timing"
git commit -m "docs: update API documentation"

# Push y crear PR
git push origin feature/nombre-feature
```

### Convención de Commits

| Prefijo | Uso |
|---------|-----|
| `feat:` | Nueva funcionalidad |
| `fix:` | Corrección de bug |
| `docs:` | Documentación |
| `style:` | Formato (no afecta lógica) |
| `refactor:` | Refactorización |
| `test:` | Tests |
| `chore:` | Mantenimiento |

---

## 📄 Licencia

Este proyecto es desarrollado para el **ZF Engineering Challenge** y está bajo licencia propietaria de ZF Group.

---

<div align="center">

**Built with ❤️ for ZF Engineering Challenge**

[Documentation](./docs) · [Report Bug](./issues) · [Request Feature](./issues)

</div>
