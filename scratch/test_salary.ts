import prisma from "../src/db/client";
import { performance } from "perf_hooks";

async function test() {
  const gym = await prisma.gym.findFirst({ select: { id: true } });
  if (!gym) return;
  const gymId = gym.id;
  const month = "2026-11";
  
  for (let i = 0; i < 3; i++) {
    const t0 = performance.now();
    const records = await prisma.$queryRaw<any[]>`
      SELECT 
        sr."id",
        sr."trainerId",
        u."name" AS "trainerName",
        u."email" AS "trainerEmail",
        u."phone" AS "trainerPhone",
        sr."month",
        sr."amount"::double precision AS "amount",
        sr."status",
        sr."paidAt",
        tp."salaryDueDay"
      FROM "SalaryRecord" sr
      JOIN "TrainerProfile" tp ON tp."userId" = sr."trainerId"
      JOIN "User" u ON u."id" = tp."userId"
      WHERE sr."gymId" = ${gymId} AND sr."month" = ${month}
      ORDER BY u."name" ASC;
    `;
    const t1 = performance.now();
    console.log(`Run ${i+1}: ${(t1 - t0).toFixed(1)}ms (${records.length} records)`);
  }
  await prisma.$disconnect();
}

test();
