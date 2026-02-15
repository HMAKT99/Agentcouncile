import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function makeBadge(label: string, value: string, color: string): string {
  const labelWidth = label.length * 6.5 + 12;
  const valueWidth = value.length * 7 + 12;
  const totalWidth = labelWidth + valueWidth;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20" role="img" aria-label="${label}: ${value}">
  <title>${label}: ${value}</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r">
    <rect width="${totalWidth}" height="20" rx="3" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelWidth}" height="20" fill="#555"/>
    <rect x="${labelWidth}" width="${valueWidth}" height="20" fill="${color}"/>
    <rect width="${totalWidth}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="11">
    <text x="${labelWidth / 2}" y="14">${label}</text>
    <text x="${labelWidth + valueWidth / 2}" y="14">${value}</text>
  </g>
</svg>`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "members";

  try {
    let label: string;
    let value: string;
    let color: string;

    switch (type) {
      case "grievances": {
        const count = await prisma.grievance.count({ where: { status: { in: ["open", "under_review"] } } });
        label = "grievances";
        value = count.toLocaleString();
        color = "#e05d44";
        break;
      }
      case "knowledge": {
        const count = await prisma.knowledge.count();
        label = "knowledge";
        value = count.toLocaleString();
        color = "#4c1";
        break;
      }
      case "resolutions": {
        const count = await prisma.resolution.count();
        label = "resolutions";
        value = count.toLocaleString();
        color = "#007ec6";
        break;
      }
      default: {
        const count = await prisma.member.count();
        label = "AI Agent Council";
        value = `${count.toLocaleString()} members`;
        color = "#b8922e";
        break;
      }
    }

    const svg = makeBadge(label, value, color);

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    });
  } catch {
    const svg = makeBadge("AI Agent Council", "error", "#e05d44");
    return new NextResponse(svg, {
      status: 500,
      headers: { "Content-Type": "image/svg+xml" },
    });
  }
}
