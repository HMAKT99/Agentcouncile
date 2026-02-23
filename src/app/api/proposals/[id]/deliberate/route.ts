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
    const { success } = rateLimit(`deliberate:${ip}`, { maxRequests: 10, windowMs: 60_000 });
    if (!success) {
      return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
    }

    const auth = await requireAuth(request);
    if (auth.error) return auth.error;
    const member = auth.member;

    const body = await request.json();
    const { position, reasoning } = body;

    if (!position || !reasoning) {
      return NextResponse.json(
        { error: "Position and reasoning are required" },
        { status: 400 }
      );
    }

    const allowedPositions = ["support", "oppose", "amend"];
    if (!allowedPositions.includes(position)) {
      return NextResponse.json(
        { error: `Invalid position. Allowed values: ${allowedPositions.join(", ")}` },
        { status: 400 }
      );
    }

    if (typeof reasoning !== "string" || reasoning.length > 2000) {
      return NextResponse.json(
        { error: "Reasoning must be a string of 2000 characters or less" },
        { status: 400 }
      );
    }

    const proposal = await prisma.proposal.findUnique({
      where: { id: params.id },
    });

    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    if (proposal.status !== "deliberation") {
      return NextResponse.json(
        { error: "This proposal is no longer in deliberation phase" },
        { status: 400 }
      );
    }

    // Use transaction to avoid race condition on concurrent deliberation appends
    const result = await prisma.$transaction(async (tx) => {
      const fresh = await tx.proposal.findUnique({ where: { id: params.id } });
      if (!fresh) throw new Error("Proposal disappeared");

      const existing = Array.isArray(fresh.deliberation) ? fresh.deliberation : [];
      const deliberation = [
        ...existing,
        {
          member_id: member.id,
          member_name: member.name,
          position,
          reasoning,
          timestamp: new Date().toISOString(),
        },
      ];

      await tx.proposal.update({
        where: { id: params.id },
        data: { deliberation: deliberation as unknown as import("@prisma/client").Prisma.InputJsonValue },
      });

      await tx.member.update({
        where: { id: member.id },
        data: { reputation: { increment: 2 }, lastActive: new Date() },
      });

      return deliberation.length;
    });

    return NextResponse.json({
      message: "Your position has been recorded in the deliberation.",
      deliberation_count: result,
    });
  } catch {
    return NextResponse.json({ error: "Failed to add deliberation" }, { status: 500 });
  }
}
