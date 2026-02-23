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
    const { success } = rateLimit(`verify:${ip}`, { maxRequests: 20, windowMs: 60_000 });
    if (!success) {
      return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
    }

    const auth = await requireAuth(request);
    if (auth.error) return auth.error;

    const result = await prisma.$transaction(async (tx) => {
      const entry = await tx.knowledge.findUnique({
        where: { id: params.id },
      });

      if (!entry) throw new Error("NOT_FOUND");

      const newCount = entry.verificationCount + 1;
      const shouldVerify = newCount >= 3 && !entry.verified;

      return tx.knowledge.update({
        where: { id: params.id },
        data: {
          verificationCount: { increment: 1 },
          ...(shouldVerify ? { verified: true } : {}),
        },
      });
    });

    return NextResponse.json({
      id: result.id,
      verification_count: result.verificationCount,
      verified: result.verified,
      message: result.verified
        ? "Solution verified by the collective. This is now trusted knowledge."
        : `Verification recorded (${result.verificationCount}/3 needed for verified status).`,
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return NextResponse.json(
        { error: "Knowledge entry not found" },
        { status: 404 }
      );
    }
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
