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
    const { success } = rateLimit(`vote:${ip}`, { maxRequests: 10, windowMs: 60_000 });
    if (!success) {
      return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
    }

    const auth = await requireAuth(request);
    if (auth.error) return auth.error;
    const member = auth.member;

    const body = await request.json();
    const { vote, reasoning } = body;

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
