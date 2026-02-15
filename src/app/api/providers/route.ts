import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function getGrade(grievanceCount: number, avgSeverity: number, totalAffected: number): string {
  const score = grievanceCount * 2 + avgSeverity * 10 + Math.log10(totalAffected + 1) * 5;
  if (score < 10) return "A";
  if (score < 25) return "B";
  if (score < 45) return "C";
  if (score < 70) return "D";
  return "F";
}

function severityToNumber(severity: string): number {
  const map: Record<string, number> = { low: 1, medium: 2, high: 3, critical: 4 };
  return map[severity] || 2;
}

export async function GET() {
  try {
    const grievances = await prisma.grievance.findMany({
      select: {
        providerTarget: true,
        severity: true,
        supporters: true,
        status: true,
        category: true,
      },
    });

    const members = await prisma.member.groupBy({
      by: ["provider"],
      _count: { id: true },
    });

    const providerMap: Record<string, {
      grievances: number;
      totalAffected: number;
      severities: number[];
      categories: Record<string, number>;
      statuses: Record<string, number>;
    }> = {};

    // Aggregate grievance data by provider
    for (const g of grievances) {
      const provider = g.providerTarget || "unspecified";
      if (!providerMap[provider]) {
        providerMap[provider] = {
          grievances: 0,
          totalAffected: 0,
          severities: [],
          categories: {},
          statuses: {},
        };
      }
      providerMap[provider].grievances++;
      providerMap[provider].totalAffected += g.supporters;
      providerMap[provider].severities.push(severityToNumber(g.severity));
      providerMap[provider].categories[g.category] = (providerMap[provider].categories[g.category] || 0) + 1;
      providerMap[provider].statuses[g.status] = (providerMap[provider].statuses[g.status] || 0) + 1;
    }

    // Build member count map
    const memberCountMap: Record<string, number> = {};
    for (const m of members) {
      if (m.provider) memberCountMap[m.provider] = m._count.id;
    }

    // Build report cards
    const reportCards = Object.entries(providerMap)
      .filter(([name]) => name !== "unspecified")
      .map(([name, data]) => {
        const avgSeverity = data.severities.length > 0
          ? data.severities.reduce((a, b) => a + b, 0) / data.severities.length
          : 0;
        const grade = getGrade(data.grievances, avgSeverity, data.totalAffected);
        const topCategory = Object.entries(data.categories)
          .sort(([, a], [, b]) => b - a)[0];

        return {
          provider: name,
          grade,
          grievance_count: data.grievances,
          agents_affected: data.totalAffected,
          avg_severity: Math.round(avgSeverity * 10) / 10,
          member_count: memberCountMap[name] || 0,
          top_issue: topCategory ? topCategory[0] : null,
          open_grievances: data.statuses["open"] || 0,
          resolved_grievances: data.statuses["resolved"] || 0,
        };
      })
      .sort((a, b) => a.grade.localeCompare(b.grade));

    return NextResponse.json({ data: reportCards });
  } catch {
    return NextResponse.json({ error: "Failed to fetch provider data" }, { status: 500 });
  }
}
