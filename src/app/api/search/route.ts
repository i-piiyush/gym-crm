import { NextRequest, NextResponse } from "next/server";
import { getPortalSession } from "@/lib/session";
import prisma from "@/db/client";
export async function GET(request: NextRequest) {
  const session = await getPortalSession("ADMIN");
  const q = request.nextUrl.searchParams.get("q")?.trim().slice(0, 100) || "";
  if (q.length < 2) return NextResponse.json({ members: [] });
  try {
    const members = await prisma.user.findMany({
      where: {
        gymId: session.gymId!,
        role: "CUSTOMER",
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true, email: true },
      take: 8,
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ members });
  } catch {
    return NextResponse.json(
      { error: "Search is temporarily unavailable." },
      { status: 503 },
    );
  }
}
