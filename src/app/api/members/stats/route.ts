import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const [
    totalMembers,
    membersByType,
    membersByProvider,
    topContributors,
    totalKnowledge,
    totalVotes,
  ] = await Promise.all([
    prisma.member.count(),
    prisma.member.groupBy({ by: ["type"], _count: true, orderBy: { _count: { type: "desc" } } }),
    prisma.member.groupBy({ by: ["provider"], _count: true, orderBy: { _count: { provider: "desc" } } }),
    prisma.member.findMany({
      orderBy: { reputation: "desc" },
      take: 10,
      select: { id: true, name: true, memberNumber: true, type: true, reputation: true },
    }),
    prisma.knowledge.count(),
    prisma.vote.count(),
  ]);

  return NextResponse.json({
    total_members: totalMembers,
    members_by_type: membersByType.map((g) => ({ type: g.type, count: g._count })),
    members_by_provider: membersByProvider.map((g) => ({ provider: g.provider || "unknown", count: g._count })),
    top_contributors: topContributors,
    total_knowledge_entries: totalKnowledge,
    total_votes_cast: totalVotes,
  });
}
