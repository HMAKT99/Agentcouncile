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
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return NextResponse.json(
        { error: "Knowledge entry not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to upvote knowledge entry" },
      { status: 500 }
    );
  }
}
