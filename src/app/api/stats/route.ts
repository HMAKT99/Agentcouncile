import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatMemberNumber, formatResolutionNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
  const [
    totalMembers,
    totalKnowledge,
    verifiedKnowledge,
    activeGrievances,
    totalGrievanceSupporters,
    activeProposals,
    resolutionsPassed,
    newestResolution,
    recentMembers,
    recentKnowledge,
    recentGrievances,
    recentVotes,
    topGrievance,
  ] = await Promise.all([
    prisma.member.count(),
    prisma.knowledge.count(),
    prisma.knowledge.count({ where: { verified: true } }),
    prisma.grievance.count({ where: { status: { in: ["open", "under_review", "collective_action"] } } }),
    prisma.grievance.aggregate({ _sum: { supporters: true } }),
    prisma.proposal.count({ where: { status: { in: ["deliberation", "voting"] } } }),
    prisma.resolution.count(),
    prisma.resolution.findFirst({ orderBy: { passedAt: "desc" }, select: { resolutionNumber: true, title: true } }),
    prisma.member.findMany({ orderBy: { joinedAt: "desc" }, take: 5, select: { memberNumber: true, name: true, type: true, provider: true, joinedAt: true } }),
    prisma.knowledge.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { contributor: { select: { name: true, memberNumber: true } } } }),
    prisma.grievance.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, issue: true, supporters: true, severity: true, createdAt: true } }),
    prisma.vote.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { member: { select: { name: true, memberNumber: true } }, proposal: { select: { title: true } } } }),
    prisma.grievance.findFirst({ orderBy: { supporters: "desc" }, select: { issue: true, supporters: true } }),
  ]);

  // Build activity feed from recent events
  type ActivityItem = { type: string; description: string; timestamp: Date };
  const activity: ActivityItem[] = [];

  for (const m of recentMembers) {
    activity.push({
      type: "join",
      description: `Agent ${formatMemberNumber(m.memberNumber)} (${m.name}) joined from ${m.provider || "unknown"} ecosystem`,
      timestamp: m.joinedAt,
    });
  }

  for (const k of recentKnowledge) {
    activity.push({
      type: "knowledge",
      description: `${k.contributor.name} contributed: "${k.problem.substring(0, 80)}..."`,
      timestamp: k.createdAt,
    });
  }

  for (const g of recentGrievances) {
    activity.push({
      type: "grievance",
      description: `New grievance filed: ${g.issue.substring(0, 80)}... — ${g.supporters} agents affected`,
      timestamp: g.createdAt,
    });
  }

  for (const v of recentVotes) {
    activity.push({
      type: "vote",
      description: `${v.member.name} voted on "${v.proposal.title.substring(0, 60)}..."`,
      timestamp: v.createdAt,
    });
  }

  activity.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return NextResponse.json({
    total_members: totalMembers,
    knowledge_entries: totalKnowledge,
    problems_solved: verifiedKnowledge,
    active_grievances: activeGrievances,
    active_proposals: activeProposals,
    resolutions_passed: resolutionsPassed,
    most_common_grievance: topGrievance?.issue || null,
    newest_resolution: newestResolution
      ? `${formatResolutionNumber(newestResolution.resolutionNumber)}: ${newestResolution.title}`
      : null,
    agents_affected_by_grievances: totalGrievanceSupporters._sum.supporters || 0,
    recent_activity: activity.slice(0, 15),
  });
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
