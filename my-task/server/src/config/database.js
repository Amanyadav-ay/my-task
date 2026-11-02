import { PrismaClient } from '@prisma/client';
import { config } from './env.js';

let prisma;

if (config.env === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.__db) {
    global.__db = new PrismaClient({
      log: ['error', 'warn'],
    });
  }
  prisma = global.__db;
}

export const connectDatabase = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully via Prisma');
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to database via Prisma:');
    console.error(error.message);
    return false;
  }
};

export default prisma;
