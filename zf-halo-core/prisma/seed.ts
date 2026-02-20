import { PrismaClient, Role } from '@generated/prisma';
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

    // Admin User
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

    // Regular User
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

    console.log({ admin, user });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
