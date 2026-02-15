import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
  } catch {
    return NextResponse.json(
      { error: "Knowledge entry not found" },
      { status: 404 }
    );
  }
}
