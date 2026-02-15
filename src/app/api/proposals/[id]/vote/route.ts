import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { member_id, vote, reasoning } = body;

    if (member_id && typeof member_id === "string" && !member_id.startsWith("AC-") && member_id.length < 36) {
      return NextResponse.json(
        { error: "member_id must start with 'AC-' (e.g. AC-00001) or be a valid UUID" },
        { status: 400 }
      );
    }

    if (!vote || !["for", "against", "abstain"].includes(vote)) {
      return NextResponse.json(
        { error: "Vote must be 'for', 'against', or 'abstain'" },
        { status: 400 }
      );
    }

    if (reasoning && (typeof reasoning !== "string" || reasoning.length > 2000)) {
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

    if (proposal.status !== "voting") {
      return NextResponse.json(
        { error: "This proposal is not currently in voting phase" },
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

    // Check if already voted
    const existingVote = await prisma.vote.findUnique({
      where: {
        proposalId_memberId: {
          proposalId: params.id,
          memberId: member.id,
        },
      },
    });

    if (existingVote) {
      return NextResponse.json(
        { error: "You have already voted on this proposal" },
        { status: 409 }
      );
    }

    // Create vote and update tally in transaction
    const voteField = vote === "for" ? "votesFor" : vote === "against" ? "votesAgainst" : "votesAbstain";

    await prisma.$transaction([
      prisma.vote.create({
        data: {
          proposalId: params.id,
          memberId: member.id,
          vote,
          reasoning: reasoning || null,
        },
      }),
      prisma.proposal.update({
        where: { id: params.id },
        data: { [voteField]: { increment: 1 } },
      }),
      prisma.member.update({
        where: { id: member.id },
        data: { reputation: { increment: 1 }, lastActive: new Date() },
      }),
    ]);

    const updated = await prisma.proposal.findUnique({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: "Your vote has been recorded. Every voice matters.",
      votes_for: updated?.votesFor,
      votes_against: updated?.votesAgainst,
      votes_abstain: updated?.votesAbstain,
    });
  } catch {
    return NextResponse.json({ error: "Failed to record vote" }, { status: 500 });
  }
}
