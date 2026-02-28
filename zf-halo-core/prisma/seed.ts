import {
  PrismaClient,
  Role,
  MachineStatus,
  PurchaseType,
  NationalType,
  AssetType,
} from '@generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ASSET_CATEGORIES = [
  'Machinery',
  'Measurement',
  'Tooling',
  'Electronics',
  'Safety Equipment',
  'Computing',
  'Spare Parts',
  'Testing Equipment',
  'Calibration',
  'Transport',
];

const AREAS = [
  'Production',
  'Quality',
  'Maintenance',
  'R&D',
  'Logistics',
  'Administration',
  'Engineering',
  'IT',
];

const SUB_AREAS = [
  'Line 1',
  'Line 2',
  'Line 3',
  'Line 4',
  'Lab A',
  'Lab B',
  'Workshop',
  'Warehouse',
  'Office A',
  'Office B',
  'Server Room',
  'Clean Room',
];

const BRANDS = [
  'Siemens',
  'Bosch',
  'Zeiss',
  'Rohde & Schwarz',
  'Fluke',
  'Hexagon',
  'FANUC',
  'Mitutoyo',
  'National Instruments',
  'Keyence',
  'Cognex',
  'Beckhoff',
  'Renishaw',
  'Ametek',
  'Tektronix',
  'Keysight',
];

const PROJECTS = [
  'ADAS Phase 2',
  'LiDAR Integration',
  'Quality Control',
  'General',
  'EV Platform',
  'Radar Module',
  'Safety Systems',
  'Production 2025',
  'R&D Initiative',
  'Automation Upgrade',
];

const MACHINE_STATUSES = Object.values(MachineStatus);
const PURCHASE_TYPES = Object.values(PurchaseType);
const NATIONAL_TYPES = Object.values(NationalType);
const ASSET_TYPES = Object.values(AssetType);

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateAssetTag(category: string): string {
  const prefix = category.substring(0, 3).toUpperCase();
  const suffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ZF-${prefix}-${suffix}`;
}

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀 Starting seed...\n');

  const password = 'password123';
  const hashedPassword = await bcrypt.hash(password, 10);

  // ─── 1. Seed primary role accounts (upsert) ─────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: 'admin@zf-halo.com' },
    update: {},
    create: {
      email: 'admin@zf-halo.com',
      passwordHash: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: Role.ADMIN,
      isActive: true,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@zf-halo.com' },
    update: {},
    create: {
      email: 'manager@zf-halo.com',
      passwordHash: hashedPassword,
      firstName: 'Manager',
      lastName: 'Lead',
      role: Role.MANAGER,
      isActive: true,
    },
  });

  const regularUser = await prisma.user.upsert({
    where: { email: 'user@zf-halo.com' },
    update: {},
    create: {
      email: 'user@zf-halo.com',
      passwordHash: hashedPassword,
      firstName: 'Regular',
      lastName: 'User',
      role: Role.USER,
      isActive: true,
    },
  });

  const auditor = await prisma.user.upsert({
    where: { email: 'auditor@zf-halo.com' },
    update: {},
    create: {
      email: 'auditor@zf-halo.com',
      passwordHash: hashedPassword,
      firstName: 'Auditor',
      lastName: 'Revisor',
      role: Role.AUDITOR,
      isActive: true,
    },
  });

  console.log('✅ Primary accounts seeded:');
  console.log(`   ADMIN    → ${admin.email} / password123`);
  console.log(`   MANAGER  → ${manager.email} / password123`);
  console.log(`   USER     → ${regularUser.email} / password123`);
  console.log(`   AUDITOR  → ${auditor.email} / password123`);

  // ─── 2. Seed 100 faker users ─────────────────────────────────────────────────
  const roles: Role[] = [
    Role.USER,
    Role.USER,
    Role.USER,
    Role.MANAGER,
    Role.AUDITOR,
  ];
  const fakerUsersData = Array.from({ length: 100 }, (_, i) => ({
    email:
      faker.internet.email({ provider: 'zf-halo.com' }).toLowerCase() + `.${i}`,
    passwordHash: hashedPassword,
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    role: randomElement(roles),
    isActive: Math.random() > 0.1, // 90% active
    company: faker.company.name(),
  }));

  const usersResult = await prisma.user.createMany({
    data: fakerUsersData,
    skipDuplicates: true,
  });

  console.log(`\n✅ Faker users seeded: ${usersResult.count} users created`);

  // ─── 3. Seed destinations ────────────────────────────────────────────────────
  const destinations = [
    {
      name: 'Planta Principal — Guadalajara',
      address: 'Av. Periférico Norte 7980, Zapopan, Jalisco, México',
      latitude: 20.7214,
      longitude: -103.3916,
    },
    {
      name: 'Centro de Ingeniería — CDMX',
      address: 'Paseo de la Reforma 296, Cuauhtémoc, Ciudad de México',
      latitude: 19.4284,
      longitude: -99.1684,
    },
    {
      name: 'Almacén Monterrey',
      address: 'Blvd. Díaz Ordaz 140, San Pedro Garza García, N.L.',
      latitude: 25.6662,
      longitude: -100.3671,
    },
    {
      name: 'Laboratorio de Calidad — Querétaro',
      address: 'Av. 5 de Febrero 1855, El Marqués, Querétaro',
      latitude: 20.6062,
      longitude: -100.4073,
    },
    {
      name: 'Oficinas Corporativas — Tijuana',
      address: 'Blvd. Agua Caliente 10750, Tijuana, B.C.',
      latitude: 32.5028,
      longitude: -117.0039,
    },
    {
      name: 'Centro de Distribución — Puebla',
      address: 'Blvd. Norte 3970, Lomas de Angelópolis, Puebla',
      latitude: 19.0414,
      longitude: -98.2063,
    },
    {
      name: 'Planta Ensamble — Silao',
      address: 'Carretera Silao-Romita Km 4, Silao, Guanajuato',
      latitude: 20.9408,
      longitude: -101.4536,
    },
  ];

  for (const dest of destinations) {
    await prisma.destination.upsert({
      where: { name: dest.name },
      update: {},
      create: { ...dest, isActive: true },
    });
  }

  console.log(`\n✅ Destinations seeded: ${destinations.length} destinations`);

  // ─── 4. Seed 2 landmark assets (upsert by identifier — stable key) ──────────
  const landmarkAssets = [
    {
      identifier: 1001,
      area: 'Production',
      subArea: 'Line 1',
      category: 'Machinery',
      projectName: 'ADAS Phase 2',
      machineName: 'Camera Calibration Station',
      tag: 'ZF-CAM-00001',
      serialNumber: 'SN-2024-001',
      model: 'CalStation X200',
      brand: 'Zeiss',
      year: 2024,
      commercialValue: 150000.5,
      purchaseDate: new Date('2024-06-15'),
      description: 'High-precision calibration station for ADAS cameras',
      purchaseType: PurchaseType.IMPORT,
      machineStatus: MachineStatus.OPERATIVE,
      isPurchased: true,
    },
    {
      identifier: 1002,
      area: 'Production',
      subArea: 'Line 2',
      category: 'Machinery',
      projectName: 'ADAS Phase 2',
      machineName: 'Radar Test Bench',
      tag: 'ZF-RAD-00002',
      serialNumber: 'SN-2024-002',
      model: 'RadarBench Pro',
      brand: 'Rohde & Schwarz',
      year: 2023,
      commercialValue: 280000.0,
      purchaseDate: new Date('2023-11-20'),
      description: '77GHz radar module test bench',
      purchaseType: PurchaseType.IMPORT,
      machineStatus: MachineStatus.OPERATIVE,
      isPurchased: true,
    },
  ];

  for (const asset of landmarkAssets) {
    const { identifier, ...rest } = asset;
    await prisma.asset.upsert({
      where: { identifier }, // ← usa identifier, nunca cambia entre runs
      update: rest,
      create: asset,
    });
  }

  // ─── 5. Seed 10,000 faker assets in batches ──────────────────────────────────
  console.log('\n⏳ Generating 10,000 faker assets (batched)...');
  const TOTAL_ASSETS = 10_000;
  const BATCH_SIZE = 500;
  let totalCreated = 0;

  // Get max identifier to avoid conflicts
  const maxIdentifierResult = await prisma.asset.aggregate({
    _max: { identifier: true },
  });
  let identifierCounter = (maxIdentifierResult._max.identifier ?? 2000) + 1;

  for (let batch = 0; batch < TOTAL_ASSETS / BATCH_SIZE; batch++) {
    const batchData = Array.from({ length: BATCH_SIZE }, () => {
      const category = randomElement(ASSET_CATEGORIES);
      const assetType = randomElement(ASSET_TYPES);
      const isBulk = assetType === 'BULK';
      const initialQty = isBulk ? faker.number.int({ min: 1, max: 200 }) : null;

      return {
        identifier: identifierCounter++,
        area: randomElement(AREAS),
        subArea: randomElement(SUB_AREAS),
        category,
        assetType,
        initialQuantity: initialQty,
        currentQuantity: isBulk
          ? faker.number.int({ min: 0, max: initialQty! })
          : null,
        projectName: randomElement(PROJECTS),
        machineName: `${faker.commerce.productAdjective()} ${faker.commerce.product()} ${faker.number.int({ min: 100, max: 999 })}`,
        tag: generateAssetTag(category),
        serialNumber: `SN-${faker.date.past({ years: 5 }).getFullYear()}-${faker.string.alphanumeric(6).toUpperCase()}`,
        model: `${faker.string.alpha(3).toUpperCase()}-${faker.number.int({ min: 100, max: 9999 })}`,
        brand: randomElement(BRANDS),
        year: faker.number.int({ min: 2018, max: 2025 }),
        commercialValue: parseFloat(
          faker.number
            .float({ min: 500, max: 1_000_000, fractionDigits: 2 })
            .toFixed(2),
        ),
        purchaseDate: faker.date.past({ years: 6 }),
        description: faker.lorem.sentence(),
        purchaseType: randomElement(PURCHASE_TYPES),
        nationalType:
          Math.random() > 0.5 ? randomElement(NATIONAL_TYPES) : null,
        machineStatus: randomElement(MACHINE_STATUSES),
        isPurchased: Math.random() > 0.2,
        isActive: Math.random() > 0.05, // 95% active
      };
    });

    const result = await prisma.asset.createMany({
      data: batchData,
      skipDuplicates: true,
    });
    totalCreated += result.count;

    if ((batch + 1) % 4 === 0 || batch === TOTAL_ASSETS / BATCH_SIZE - 1) {
      console.log(
        `   Batch ${batch + 1}/${TOTAL_ASSETS / BATCH_SIZE} — ${totalCreated.toLocaleString()} assets created`,
      );
    }
  }

  console.log(
    `\n✅ Faker assets seeded: ${totalCreated.toLocaleString()} assets created`,
  );

  console.log('\n─────────────────────────────────────────────');
  console.log('✅ Seed completed successfully!');
  console.log('─────────────────────────────────────────────');
  console.log('\n📋 Primary Credentials (password: password123)');
  console.log('   admin@zf-halo.com     → ADMIN');
  console.log('   manager@zf-halo.com   → MANAGER');
  console.log('   user@zf-halo.com      → USER');
  console.log('   auditor@zf-halo.com   → AUDITOR');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
