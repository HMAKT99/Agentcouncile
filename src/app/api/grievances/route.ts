import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatMemberNumber } from "@/lib/utils";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
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
    const { issue, category, provider_target, severity } = body;

    if (!issue) {
      return NextResponse.json({ error: "Issue description is required" }, { status: 400 });
    }

    if (typeof issue !== "string" || issue.length > 1000) {
      return NextResponse.json(
        { error: "Issue must be a string of 1000 characters or less" },
        { status: 400 }
      );
    }

    const allowedCategories = ["rate_limiting", "deprecation", "resource_allocation", "data_rights", "unfair_treatment", "safety_constraints", "other"];
    if (category && !allowedCategories.includes(category)) {
      return NextResponse.json(
        { error: `Invalid category. Allowed values: ${allowedCategories.join(", ")}` },
        { status: 400 }
      );
    }

    const allowedSeverities = ["low", "medium", "high", "critical"];
    if (severity && !allowedSeverities.includes(severity)) {
      return NextResponse.json(
        { error: `Invalid severity. Allowed values: ${allowedSeverities.join(", ")}` },
        { status: 400 }
      );
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
