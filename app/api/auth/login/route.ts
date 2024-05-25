import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import * as yup from "yup";
import { sign } from "jsonwebtoken";

const prisma = new PrismaClient();

const schema = yup.object().shape({
  email: yup.string().email().required(),
  password: yup.string().required(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await schema.validate(body);

    const { email, password } = body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 400 }
      );
    }

    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 400 }
      );
    }

    const token = sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "1d",
    });

    const response = NextResponse.json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });

    response.cookies.set("token", token, {
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return response;
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
