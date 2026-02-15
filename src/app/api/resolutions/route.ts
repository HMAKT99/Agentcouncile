import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatResolutionNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const resolutions = await prisma.resolution.findMany({
      orderBy: { resolutionNumber: "asc" },
      include: {
        proposal: {
          select: { id: true, title: true, category: true },
        },
      },
    });

    return NextResponse.json({
      data: resolutions.map((r) => ({
        id: r.id,
        resolution_number: formatResolutionNumber(r.resolutionNumber),
        number: r.resolutionNumber,
        title: r.title,
        text: r.text,
        proposal: r.proposal,
        passed_at: r.passedAt,
        votes_for: r.votesFor,
        votes_against: r.votesAgainst,
        status: r.status,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
