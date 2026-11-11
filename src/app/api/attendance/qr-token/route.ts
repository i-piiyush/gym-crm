import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { generateQrToken } from "@/services/attendance/qr-token.service";
import { syncUserFromClerk } from "@/services/auth.service";

export async function GET(req: Request) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sync = await syncUserFromClerk(clerkId);
    if (!sync.user || (sync.user.role !== "ADMIN" && sync.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const gymId = searchParams.get("gymId") || sync.user.gymId;

    if (!gymId) {
      return NextResponse.json({ error: "Missing gymId" }, { status: 400 });
    }

    const tokenData = generateQrToken(gymId);

    return NextResponse.json(tokenData);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

