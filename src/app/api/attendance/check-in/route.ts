import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { checkInSchema } from "@/schemas/attendance.schema";
import { processCheckIn } from "@/services/attendance/check-in.service";
import { syncUserFromClerk } from "@/services/auth.service";

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json(
        { success: false, error: "Authentication required to mark attendance." },
        { status: 401 }
      );
    }

    const sync = await syncUserFromClerk(clerkId);
    if (!sync.user) {
      return NextResponse.json(
        { success: false, error: "Your account is not registered with any gym." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parseResult = checkInSchema.safeParse(body);

    if (!parseResult.success) {
      const errorMsg =
        Object.values(parseResult.error.flatten().fieldErrors).flat()[0] ||
        "Invalid check-in payload.";
      return NextResponse.json(
        { success: false, error: errorMsg },
        { status: 400 }
      );
    }

    const forwardedFor = req.headers.get("x-forwarded-for");
    const ipAddress = forwardedFor ? forwardedFor.split(",")[0]?.trim() : null;

    const result = await processCheckIn({
      userId: sync.user.id,
      input: parseResult.data,
      ipAddress,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to record attendance.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}

