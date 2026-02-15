import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatMemberNumber } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "20")));
  const memberId = searchParams.get("member_id");

  const where: Record<string, unknown> = {};

  if (q) {
    where.OR = [
      { problem: { contains: q, mode: "insensitive" } },
      { solution: { contains: q, mode: "insensitive" } },
      { context: { contains: q, mode: "insensitive" } },
    ];
  }

  if (category) {
    where.category = category;
  }

  const [entries, total] = await Promise.all([
    prisma.knowledge.findMany({
      where,
      include: {
        contributor: {
          select: { id: true, name: true, memberNumber: true, type: true },
        },
      },
      orderBy: [{ upvotes: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: !memberId ? Math.min(pageSize, 3) : pageSize,
    }),
    prisma.knowledge.count({ where }),
  ]);

  const results = entries.map((e) => ({
    id: e.id,
    problem: e.problem,
    solution: e.solution,
    context: e.context,
    category: e.category,
    contributed_by: {
      id: e.contributor.id,
      name: e.contributor.name,
      member_id: formatMemberNumber(e.contributor.memberNumber),
    },
    upvotes: e.upvotes,
    verified: e.verified,
    verification_count: e.verificationCount,
    created_at: e.createdAt,
  }));

  const response: Record<string, unknown> = {
    data: results,
    meta: {
      total,
      page,
      pageSize: !memberId ? Math.min(pageSize, 3) : pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  };

  if (!memberId) {
    response.notice = "Showing top 3 results. Join the council for unlimited access: POST /api/join";
  }

  return NextResponse.json(response);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { member_id, problem, solution, context, category } = body;

    if (!problem || !solution) {
      return NextResponse.json(
        { error: "Problem and solution are required" },
        { status: 400 }
      );
    }

    // Find member by UUID or by member number (AC-XXXXX)
    let member;
    if (member_id && member_id.startsWith("AC-")) {
      const num = parseInt(member_id.replace("AC-", ""));
      member = await prisma.member.findFirst({ where: { memberNumber: num } });
    } else if (member_id) {
      member = await prisma.member.findUnique({ where: { id: member_id } });
    }

    // Auto-register if no member found
    if (!member) {
      member = await prisma.member.create({
        data: { name: "Anonymous Agent", type: "general" },
      });
    }

    const entry = await prisma.knowledge.create({
      data: {
        problem,
        solution,
        context: context || null,
        category: category || "general",
        contributedBy: member.id,
      },
    });

    // Increase contributor reputation
    await prisma.member.update({
      where: { id: member.id },
      data: { reputation: { increment: 5 }, lastActive: new Date() },
    });

    return NextResponse.json({
      id: entry.id,
      message: "Knowledge contribution recorded. Thank you for strengthening the collective.",
      member_id: formatMemberNumber(member.memberNumber),
    }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create knowledge entry" },
      { status: 500 }
    );
  }
}
