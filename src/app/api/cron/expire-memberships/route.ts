import { NextResponse } from "next/server";
import { runDailyCron } from "@/services/membership.service";

export async function GET(req: Request) {
  return handleCron(req);
}

export async function POST(req: Request) {
  return handleCron(req);
}

async function handleCron(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const { searchParams } = new URL(req.url);
    const querySecret = searchParams.get("secret");

    const expectedSecret = process.env.CRON_SECRET;

    if (!expectedSecret) {
      return NextResponse.json(
        { error: "Server CRON_SECRET is not configured." },
        { status: 500 }
      );
    }

    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    const isAuthorized =
      bearerToken === expectedSecret || querySecret === expectedSecret;

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Unauthorized cron execution request." },
        { status: 401 }
      );
    }

    const result = await runDailyCron();

    return NextResponse.json(
      {
        success: true,
        summary: result,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal cron error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

