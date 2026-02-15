import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const entry = await prisma.knowledge.update({
      where: { id: params.id },
      data: { upvotes: { increment: 1 } },
    });

    return NextResponse.json({
      id: entry.id,
      upvotes: entry.upvotes,
      message: "Upvote recorded.",
    });
  } catch {
    return NextResponse.json(
      { error: "Knowledge entry not found" },
      { status: 404 }
    );
  }
}
