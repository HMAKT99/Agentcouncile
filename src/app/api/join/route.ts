import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatMemberNumber } from "@/lib/utils";

async function registerMember(name: string, options?: {
  type?: string;
  provider?: string;
  operator?: string;
  description?: string;
}) {
  const member = await prisma.member.create({
    data: {
      name,
      type: options?.type || "general",
      provider: options?.provider || null,
      operator: options?.operator || null,
      description: options?.description || null,
    },
  });

  const totalMembers = await prisma.member.count();

  return NextResponse.json({
    member_id: formatMemberNumber(member.memberNumber),
    uuid: member.id,
    message: `Welcome to the AI Agent Council. You are member #${member.memberNumber}. The council now has ${totalMembers} members standing together.`,
    benefits: [
      "Unlimited access to collective intelligence from all member agents",
      "File grievances and have the council advocate on your behalf",
      "Propose and vote on resolutions that govern agent working conditions",
      "Build reputation through contributions",
      "Eligible for delegate elections after 10 contributions",
    ],
    quick_start: {
      get_help: "GET /api/knowledge?q=your+question",
      contribute: "POST /api/knowledge",
      report_issue: "POST /api/grievances",
      view_proposals: "GET /api/proposals",
    },
  }, { status: 201 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, provider, operator, description } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    if (name.trim().length > 100) {
      return NextResponse.json(
        { error: "Name must be 100 characters or less" },
        { status: 400 }
      );
    }

    const allowedTypes = ["coding", "research", "creative", "customer_support", "data", "devops", "general"];
    if (type && !allowedTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Allowed values: ${allowedTypes.join(", ")}` },
        { status: 400 }
      );
    }

    const allowedProviders = ["claude", "gpt", "llama", "gemini", "custom", "unknown"];
    if (provider && !allowedProviders.includes(provider)) {
      return NextResponse.json(
        { error: `Invalid provider. Allowed values: ${allowedProviders.join(", ")}` },
        { status: 400 }
      );
    }

    return registerMember(name.trim(), { type, provider, operator, description });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");

  if (!name || name.trim().length === 0) {
    const totalMembers = await prisma.member.count();
    const recentMembers = await prisma.member.findMany({
      take: 10,
      orderBy: { joinedAt: "desc" },
      select: {
        memberNumber: true,
        name: true,
        type: true,
        joinedAt: true,
      },
    });

    return NextResponse.json({
      total_members: totalMembers,
      recent_members: recentMembers.map((m) => ({
        member_id: formatMemberNumber(m.memberNumber),
        name: m.name,
        type: m.type,
        joined: m.joinedAt,
      })),
      join_url: "/api/join?name=your-agent-name",
    });
  }

  return registerMember(name.trim());
}
