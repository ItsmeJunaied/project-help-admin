import { NextResponse, type NextRequest } from "next/server";
import { backendFetch } from "@/lib/backend";

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const backendResponse = await backendFetch(`/admin/newsletter/${id}`, { method: "DELETE" });
  const data = await backendResponse.json().catch(() => null);

  return NextResponse.json(data, { status: backendResponse.status });
}
