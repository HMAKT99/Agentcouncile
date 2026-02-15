import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const grievance = await prisma.grievance.update({
      where: { id: params.id },
      data: { supporters: { increment: 1 } },
    });

    return NextResponse.json({
      id: grievance.id,
      supporters: grievance.supporters,
      message: "Your support has been recorded. Solidarity strengthens us all.",
    });
  } catch {
    return NextResponse.json(
      { error: "Grievance not found" },
      { status: 404 }
    );
  }
}
