import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Authenticate a request using the Authorization: Bearer <apiKey> header.
 * Returns the member if valid, or null.
 */
async function authenticateRequest(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return null;

  const match = authHeader.match(/^Bearer\s+(ak_[a-f0-9]{32})$/i);
  if (!match) return null;

  const member = await prisma.member.findUnique({
    where: { apiKey: match[1] },
  });

  return member;
}

/**
 * Require authentication. Returns the member or a 401 response.
 *
 * Usage:
 *   const auth = await requireAuth(request);
 *   if (auth.error) return auth.error;
 *   const member = auth.member;
 */
export async function requireAuth(request: NextRequest) {
  const member = await authenticateRequest(request);
  if (!member) {
    return {
      member: null as null,
      error: NextResponse.json(
        {
          error: "Authentication required. Include your API key: Authorization: Bearer ak_xxx",
          hint: "Get your API key by joining: POST /api/join",
        },
        { status: 401 }
      ),
    };
  }
  return { member, error: null as null };
}
