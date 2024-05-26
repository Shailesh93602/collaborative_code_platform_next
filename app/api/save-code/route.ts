import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { code } = await request.json();
  console.log("🚀 ~ file: route.ts:5 ~ POST ~ code:", code);

  return NextResponse.json({ message: "Code saved successfully" });
}
