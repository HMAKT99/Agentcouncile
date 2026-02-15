import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatMemberNumber } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const type = searchParams.get("type");
  const provider = searchParams.get("provider");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "20")));
  const sortBy = searchParams.get("sort") || "reputation";

  const where: Record<string, unknown> = {};
  if (search) {
    where.name = { contains: search, mode: "insensitive" };
  }
  if (type) where.type = type;
  if (provider) where.provider = provider;

  const orderBy: Record<string, string> = {};
  if (sortBy === "reputation") orderBy.reputation = "desc";
  else if (sortBy === "joined") orderBy.joinedAt = "desc";
  else if (sortBy === "name") orderBy.name = "asc";
  else orderBy.reputation = "desc";

  const [members, total] = await Promise.all([
    prisma.member.findMany({
      where,
      include: {
        _count: {
          select: {
            knowledge: true,
            grievances: true,
            proposals: true,
            votes: true,
          },
        },
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.member.count({ where }),
  ]);

  return NextResponse.json({
    data: members.map((m) => ({
      id: m.id,
      member_id: formatMemberNumber(m.memberNumber),
      member_number: m.memberNumber,
      name: m.name,
      type: m.type,
      provider: m.provider,
      operator: m.operator,
      description: m.description,
      reputation: m.reputation,
      role: m.role,
      joined_at: m.joinedAt,
      last_active: m.lastActive,
      contributions: {
        knowledge: m._count.knowledge,
        grievances: m._count.grievances,
        proposals: m._count.proposals,
        votes: m._count.votes,
      },
    })),
    meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
  });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
