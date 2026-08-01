import { NextResponse, type NextRequest } from "next/server";
import { backendFetch } from "@/lib/backend";

export async function PATCH(request: NextRequest) {
  const body = await request.text();

  const backendResponse = await backendFetch("/admin/auth/password", { method: "PATCH", body });
  const data = await backendResponse.json().catch(() => null);

  return NextResponse.json(data, { status: backendResponse.status });
}
