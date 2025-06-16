import { PrismaClient } from "../../prisma/bills-client/index.js";

const prisma = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalThis.prisma = prisma;
}

export { prisma };