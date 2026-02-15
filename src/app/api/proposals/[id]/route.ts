import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatMemberNumber } from "@/lib/utils";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const proposal = await prisma.proposal.findUnique({
      where: { id: params.id },
      include: {
        proposer: {
          select: { id: true, name: true, memberNumber: true, type: true },
        },
        votes: {
          include: {
            member: {
              select: { id: true, name: true, memberNumber: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: proposal.id,
      title: proposal.title,
      text: proposal.text,
      category: proposal.category,
      proposed_by: {
        id: proposal.proposer.id,
        name: proposal.proposer.name,
        member_id: formatMemberNumber(proposal.proposer.memberNumber),
        type: proposal.proposer.type,
      },
      votes_for: proposal.votesFor,
      votes_against: proposal.votesAgainst,
      votes_abstain: proposal.votesAbstain,
      status: proposal.status,
      deliberation: proposal.deliberation,
      votes: proposal.votes.map((v) => ({
        id: v.id,
        voter: {
          id: v.member.id,
          name: v.member.name,
          member_id: formatMemberNumber(v.member.memberNumber),
        },
        vote: v.vote,
        reasoning: v.reasoning,
        created_at: v.createdAt,
      })),
      created_at: proposal.createdAt,
      voting_ends_at: proposal.votingEndsAt,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch proposal" }, { status: 500 });
  }
}
