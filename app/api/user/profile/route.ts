import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import * as yup from 'yup';

const profileSchema = yup.object({
  name: yup.string().min(2, 'Name must be at least 2 characters'),
  email: yup.string().email('Invalid email address'),
  bio: yup.string().max(160, 'Bio must be 160 characters or less').optional(),
});

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, email, bio } = body;

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { name, email, bio },
    });

    return NextResponse.json({
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        bio: updatedUser.bio,
      },
    });
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
