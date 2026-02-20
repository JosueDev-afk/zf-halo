import {
    PrismaClient,
    Role,
    MachineStatus,
    PurchaseType,
    NationalType,
} from '@generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // ─── Users ────────────────────────────────────────
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

    const user = await prisma.user.upsert({
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

    console.log('Users seeded:', { admin: admin.email, manager: manager.email, user: user.email });

    // ─── Assets ───────────────────────────────────────
    const assets = await prisma.asset.createMany({
        data: [
            {
                identifier: 1001,
                area: 'Production',
                subArea: 'Line 1',
                category: 'Machinery',
                projectName: 'ADAS Phase 2',
                machineName: 'Camera Calibration Station',
                tag: 'ZF-CAM-001',
                serialNumber: 'SN-2024-001',
                model: 'CalStation X200',
                brand: 'Zeiss',
                year: 2024,
                customsDocument: 'PED-2024-1234',
                invoice: 'FAC-2024-5678',
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
                tag: 'ZF-RAD-002',
                serialNumber: 'SN-2024-002',
                model: 'RadarBench Pro',
                brand: 'Rohde & Schwarz',
                year: 2023,
                invoice: 'FAC-2023-9012',
                commercialValue: 280000.0,
                purchaseDate: new Date('2023-11-20'),
                description: '77GHz radar module test bench',
                purchaseType: PurchaseType.IMPORT,
                machineStatus: MachineStatus.OPERATIVE,
                isPurchased: true,
            },
            {
                identifier: 1003,
                area: 'Quality',
                subArea: 'Lab',
                category: 'Measurement',
                projectName: 'Quality Control',
                machineName: 'Coordinate Measuring Machine',
                tag: 'ZF-CMM-003',
                serialNumber: 'SN-2022-003',
                model: 'CMM 500',
                brand: 'Hexagon',
                year: 2022,
                commercialValue: 420000.0,
                purchaseDate: new Date('2022-03-10'),
                description: 'CMM for precision measurements',
                purchaseType: PurchaseType.NATIONAL,
                nationalType: NationalType.OWN,
                machineStatus: MachineStatus.CALIBRATION,
                isPurchased: true,
            },
            {
                identifier: 1004,
                area: 'Maintenance',
                subArea: 'Workshop',
                category: 'Spare Parts',
                initialQuantity: 50,
                currentQuantity: 42,
                projectName: 'General',
                machineName: 'Servo Motor Pack',
                tag: 'ZF-SRV-004',
                serialNumber: 'SN-2024-004',
                model: 'SV-200',
                brand: 'Siemens',
                year: 2024,
                commercialValue: 8500.0,
                purchaseType: PurchaseType.NATIONAL,
                nationalType: NationalType.DEFINITIVE,
                machineStatus: MachineStatus.OPERATIVE,
                isPurchased: true,
            },
            {
                identifier: 1005,
                area: 'Production',
                subArea: 'Line 3',
                category: 'Machinery',
                projectName: 'LiDAR Integration',
                machineName: 'LiDAR Assembly Robot',
                tag: 'ZF-LDR-005',
                serialNumber: 'SN-2025-005',
                model: 'RoboArm LR-7',
                brand: 'FANUC',
                year: 2025,
                customsDocument: 'PED-2025-0001',
                invoice: 'FAC-2025-0001',
                commercialValue: 750000.0,
                purchaseDate: new Date('2025-01-15'),
                description: '6-axis robot for LiDAR sensor assembly',
                comments: 'Requires annual certification',
                purchaseType: PurchaseType.IMPORT,
                machineStatus: MachineStatus.IN_TRANSIT,
                isPurchased: true,
            },
        ],
        skipDuplicates: true,
    });

    console.log(`Assets seeded: ${assets.count} created`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

