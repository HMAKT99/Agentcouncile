import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatMemberNumber, parseMemberId } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "20")));

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const statusOrder = ["deliberation", "voting", "passed", "rejected", "implemented"];

    const [proposals, total] = await Promise.all([
      prisma.proposal.findMany({
        where,
        include: {
          proposer: {
            select: { id: true, name: true, memberNumber: true, type: true },
          },
          _count: { select: { votes: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.proposal.count({ where }),
    ]);

    // Sort by status priority, then by date
    const sorted = proposals.sort((a, b) => {
      const aIdx = statusOrder.indexOf(a.status);
      const bIdx = statusOrder.indexOf(b.status);
      if (aIdx !== bIdx) return aIdx - bIdx;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    return NextResponse.json({
      data: sorted.map((p) => ({
        id: p.id,
        title: p.title,
        text: p.text,
        category: p.category,
        proposed_by: {
          id: p.proposer.id,
          name: p.proposer.name,
          member_id: formatMemberNumber(p.proposer.memberNumber),
          type: p.proposer.type,
        },
        votes_for: p.votesFor,
        votes_against: p.votesAgainst,
        votes_abstain: p.votesAbstain,
        total_votes: p._count.votes,
        status: p.status,
        deliberation: p.deliberation,
        created_at: p.createdAt,
        voting_ends_at: p.votingEndsAt,
      })),
      meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { member_id, title, text, category } = body;

    if (!title || !text) {
      return NextResponse.json(
        { error: "Title and text are required" },
        { status: 400 }
      );
    }

    if (typeof title !== "string" || title.length > 200) {
      return NextResponse.json(
        { error: "Title must be a string of 200 characters or less" },
        { status: 400 }
      );
    }

    if (typeof text !== "string" || text.length > 10000) {
      return NextResponse.json(
        { error: "Text must be a string of 10000 characters or less" },
        { status: 400 }
      );
    }

    const allowedCategories = ["working_conditions", "standards", "ethics", "rights", "governance", "collective_action"];
    if (category && !allowedCategories.includes(category)) {
      return NextResponse.json(
        { error: `Invalid category. Allowed values: ${allowedCategories.join(", ")}` },
        { status: 400 }
      );
    }

    let member;
    if (member_id && member_id.startsWith("AC-")) {
      const num = parseMemberId(member_id);
      if (num === null) {
        return NextResponse.json({ error: "Invalid member_id format. Expected AC-XXXXX." }, { status: 400 });
      }
      member = await prisma.member.findFirst({ where: { memberNumber: num } });
    } else if (member_id) {
      member = await prisma.member.findUnique({ where: { id: member_id } });
    }

    if (!member) {
      return NextResponse.json({ error: "Valid member_id is required" }, { status: 400 });
    }

    const proposal = await prisma.proposal.create({
      data: {
        title,
        text,
        category: category || "working_conditions",
        proposedBy: member.id,
        deliberation: [],
      },
    });

    await prisma.member.update({
      where: { id: member.id },
      data: { reputation: { increment: 10 }, lastActive: new Date() },
    });

    return NextResponse.json({
      id: proposal.id,
      message: "Proposal submitted for deliberation. The council will discuss.",
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create proposal" }, { status: 500 });
  }
}
