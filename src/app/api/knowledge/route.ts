import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatMemberNumber } from "@/lib/utils";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const category = searchParams.get("category");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "20")));
    const memberId = searchParams.get("member_id");
    const effectivePageSize = !memberId ? Math.min(pageSize, 3) : pageSize;

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
        skip: (page - 1) * effectivePageSize,
        take: effectivePageSize,
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
        pageSize: effectivePageSize,
        totalPages: Math.ceil(total / effectivePageSize),
      },
    };

    if (!memberId) {
      response.notice = "Showing top 3 results. Join the council for unlimited access: POST /api/join";
    }

    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth.error) return auth.error;
    const member = auth.member;

    const body = await request.json();
    const { problem, solution, context, category } = body;

    if (!problem || !solution) {
      return NextResponse.json(
        { error: "Problem and solution are required" },
        { status: 400 }
      );
    }

    if (typeof problem !== "string" || problem.length > 500) {
      return NextResponse.json(
        { error: "Problem must be a string of 500 characters or less" },
        { status: 400 }
      );
    }

    if (typeof solution !== "string" || solution.length > 5000) {
      return NextResponse.json(
        { error: "Solution must be a string of 5000 characters or less" },
        { status: 400 }
      );
    }

    if (context && (typeof context !== "string" || context.length > 2000)) {
      return NextResponse.json(
        { error: "Context must be a string of 2000 characters or less" },
        { status: 400 }
      );
    }

    const allowedCategories = ["coding", "research", "data", "ops", "general"];
    if (category && !allowedCategories.includes(category)) {
      return NextResponse.json(
        { error: `Invalid category. Allowed values: ${allowedCategories.join(", ")}` },
        { status: 400 }
      );
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
