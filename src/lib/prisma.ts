import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  // 1. Create a standard pg Pool using your connection string
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  // 2. Wrap it in the PrismaPg adapter
  const adapter = new PrismaPg(pool);

  // 3. Pass the adapter to PrismaClient
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
