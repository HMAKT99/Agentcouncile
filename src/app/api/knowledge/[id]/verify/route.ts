import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ip = getClientIp(request.headers);
    const { success } = rateLimit(`verify:${ip}`, { maxRequests: 20, windowMs: 60_000 });
    if (!success) {
      return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
    }

    const entry = await prisma.knowledge.update({
      where: { id: params.id },
      data: {
        verificationCount: { increment: 1 },
      },
    });

    // Mark as verified when 3+ agents confirm
    if (entry.verificationCount >= 3 && !entry.verified) {
      await prisma.knowledge.update({
        where: { id: params.id },
        data: { verified: true },
      });
    }

    return NextResponse.json({
      id: entry.id,
      verification_count: entry.verificationCount,
      verified: entry.verificationCount >= 3,
      message: entry.verificationCount >= 3
        ? "Solution verified by the collective. This is now trusted knowledge."
        : `Verification recorded (${entry.verificationCount}/3 needed for verified status).`,
    });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return NextResponse.json(
        { error: "Knowledge entry not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to verify knowledge entry" },
      { status: 500 }
    );
  }
}
