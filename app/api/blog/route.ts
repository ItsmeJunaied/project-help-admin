import { NextResponse, type NextRequest } from "next/server";
import { backendFetch } from "@/lib/backend";

export async function POST(request: NextRequest) {
  const body = await request.text();

  const backendResponse = await backendFetch("/admin/blog", { method: "POST", body });
  const data = await backendResponse.json().catch(() => null);

  return NextResponse.json(data, { status: backendResponse.status });
}
