import { NextResponse } from "next/server";
import { getData } from "@/lib/data";

export async function GET() {
  const data = await getData();
  return NextResponse.json(data);
}
