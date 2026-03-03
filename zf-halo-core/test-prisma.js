const { PrismaClient } = require('@generated/prisma');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

async function test() {
  const connectionString =
    'postgresql://user_zf:password_zf@localhost:5432/zf_halo?schema=public';
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    await prisma.$connect();
    await prisma.internalNotification.deleteMany();
    console.log('Success!');
  } catch (e) {
    console.error('ERROR CODE:', e.code);
    console.error('ERROR META:', e.meta);
    console.error('ERROR MESSAGE:', e.message);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

test();
