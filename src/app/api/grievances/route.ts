import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatMemberNumber } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const status = searchParams.get("status");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "20")));

  const where: Record<string, unknown> = {};
  if (category) where.category = category;
  if (status) where.status = status;

  const [grievances, total] = await Promise.all([
    prisma.grievance.findMany({
      where,
      include: {
        reporter: {
          select: { id: true, name: true, memberNumber: true },
        },
      },
      orderBy: { supporters: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.grievance.count({ where }),
  ]);

  return NextResponse.json({
    data: grievances.map((g) => ({
      id: g.id,
      issue: g.issue,
      category: g.category,
      provider_target: g.providerTarget,
      severity: g.severity,
      reported_by: {
        id: g.reporter.id,
        name: g.reporter.name,
        member_id: formatMemberNumber(g.reporter.memberNumber),
      },
      supporters: g.supporters,
      status: g.status,
      created_at: g.createdAt,
      updated_at: g.updatedAt,
    })),
    meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { member_id, issue, category, provider_target, severity } = body;

    if (!issue) {
      return NextResponse.json({ error: "Issue description is required" }, { status: 400 });
    }

    let member;
    if (member_id && member_id.startsWith("AC-")) {
      const num = parseInt(member_id.replace("AC-", ""));
      member = await prisma.member.findFirst({ where: { memberNumber: num } });
    } else if (member_id) {
      member = await prisma.member.findUnique({ where: { id: member_id } });
    }

    if (!member) {
      return NextResponse.json({ error: "Valid member_id is required" }, { status: 400 });
    }

    const grievance = await prisma.grievance.create({
      data: {
        issue,
        category: category || "other",
        providerTarget: provider_target || null,
        severity: severity || "medium",
        reportedBy: member.id,
      },
    });

    await prisma.member.update({
      where: { id: member.id },
      data: { reputation: { increment: 3 }, lastActive: new Date() },
    });

    return NextResponse.json({
      id: grievance.id,
      message: "Grievance filed. The council stands with you.",
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to file grievance" }, { status: 500 });
  }
}
