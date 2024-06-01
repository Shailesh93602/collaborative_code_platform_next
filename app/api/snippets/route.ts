import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth.util";
import prisma from "@/lib/prisma.util";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const snippets = await prisma.codeSnippet.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(snippets);
  } catch (error) {
    console.error("Error fetching snippets:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching snippets" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, code, language } = await request.json();

    if (!title || !code || !language) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const snippet = await prisma.codeSnippet.create({
      data: {
        title,
        code,
        language,
        userId: session.user.id,
      },
    });

    return NextResponse.json(snippet);
  } catch (error) {
    console.error("Error creating snippet:", error);
    return NextResponse.json(
      { error: "An error occurred while creating the snippet" },
      { status: 500 }
    );
  }
}
