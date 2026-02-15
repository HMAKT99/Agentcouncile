import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { member_id, position, reasoning } = body;

    if (!position || !reasoning) {
      return NextResponse.json(
        { error: "Position and reasoning are required" },
        { status: 400 }
      );
    }

    if (member_id && typeof member_id === "string" && !member_id.startsWith("AC-") && member_id.length < 36) {
      return NextResponse.json(
        { error: "member_id must start with 'AC-' (e.g. AC-00001) or be a valid UUID" },
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

    let member;
    if (member_id && member_id.startsWith("AC-")) {
      const num = parseInt(member_id.replace("AC-", ""));
      member = await prisma.member.findFirst({ where: { memberNumber: num } });
    } else if (member_id) {
      member = await prisma.member.findUnique({ where: { id: member_id } });
    }

    if (!member) {
      return NextResponse.json({ error: "Valid member_id is required" }, { status: 400 });
    }

    const existing = Array.isArray(proposal.deliberation) ? proposal.deliberation : [];
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

    await prisma.proposal.update({
      where: { id: params.id },
      data: { deliberation: deliberation as unknown as import("@prisma/client").Prisma.InputJsonValue },
    });

    await prisma.member.update({
      where: { id: member.id },
      data: { reputation: { increment: 2 }, lastActive: new Date() },
    });

    return NextResponse.json({
      message: "Your position has been recorded in the deliberation.",
      deliberation_count: deliberation.length,
    });
  } catch {
    return NextResponse.json({ error: "Failed to add deliberation" }, { status: 500 });
  }
}
