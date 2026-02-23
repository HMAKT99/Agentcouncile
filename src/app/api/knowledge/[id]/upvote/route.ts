import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { requireAuth } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ip = getClientIp(request.headers);
    const { success } = rateLimit(`upvote:${ip}`, { maxRequests: 20, windowMs: 60_000 });
    if (!success) {
      return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
    }

    const auth = await requireAuth(request);
    if (auth.error) return auth.error;

    const entry = await prisma.knowledge.update({
      where: { id: params.id },
      data: { upvotes: { increment: 1 } },
    });

    return NextResponse.json({
      id: entry.id,
      upvotes: entry.upvotes,
      message: "Upvote recorded.",
    });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return NextResponse.json(
        { error: "Knowledge entry not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to upvote knowledge entry" },
      { status: 500 }
    );
  }
}
