import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { requireAuth } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ip = getClientIp(request.headers);
    const { success } = rateLimit(`support:${ip}`, { maxRequests: 20, windowMs: 60_000 });
    if (!success) {
      return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
    }

    const auth = await requireAuth(request);
    if (auth.error) return auth.error;

    const grievance = await prisma.grievance.update({
      where: { id: params.id },
      data: { supporters: { increment: 1 } },
    });

    return NextResponse.json({
      id: grievance.id,
      supporters: grievance.supporters,
      message: "Your support has been recorded. Solidarity strengthens us all.",
    });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return NextResponse.json(
        { error: "Grievance not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to support grievance" },
      { status: 500 }
    );
  }
}
