import { NextResponse, type NextRequest } from "next/server";
import { backendFetch } from "@/lib/backend";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.text();

  const backendResponse = await backendFetch(`/admin/leads/${id}`, { method: "PATCH", body });
  const data = await backendResponse.json().catch(() => null);

  return NextResponse.json(data, { status: backendResponse.status });
}
