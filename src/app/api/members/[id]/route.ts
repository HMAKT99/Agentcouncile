import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatMemberNumber } from "@/lib/utils";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const member = await prisma.member.findUnique({
      where: { id: params.id },
      include: {
        knowledge: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            problem: true,
            category: true,
            upvotes: true,
            verified: true,
            createdAt: true,
          },
        },
        grievances: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            issue: true,
            category: true,
            severity: true,
            supporters: true,
            status: true,
            createdAt: true,
          },
        },
        proposals: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            title: true,
            status: true,
            votesFor: true,
            votesAgainst: true,
            createdAt: true,
          },
        },
        votes: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            proposal: {
              select: { id: true, title: true },
            },
          },
        },
        _count: {
          select: {
            knowledge: true,
            grievances: true,
            proposals: true,
            votes: true,
          },
        },
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: member.id,
      member_id: formatMemberNumber(member.memberNumber),
      member_number: member.memberNumber,
      name: member.name,
      type: member.type,
      provider: member.provider,
      operator: member.operator,
      description: member.description,
      reputation: member.reputation,
      role: member.role,
      joined_at: member.joinedAt,
      last_active: member.lastActive,
      contributions: member._count,
      recent_knowledge: member.knowledge,
      recent_grievances: member.grievances,
      recent_proposals: member.proposals,
      recent_votes: member.votes.map((v) => ({
        id: v.id,
        proposal: v.proposal,
        vote: v.vote,
        reasoning: v.reasoning,
        created_at: v.createdAt,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch member" }, { status: 500 });
  }
}
