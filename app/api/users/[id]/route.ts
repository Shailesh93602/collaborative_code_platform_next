import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { NextResponse, NextRequest } from 'next/server';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest, { params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ status: 401, error: 'Unauthorized' });
  }

  const { id } = params;

  try {
    const user = await prisma.user.findUnique({
      where: { id: id as string },
      include: {
        profile: true,
        _count: {
          select: {
            followedBy: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ status: 404, error: 'User  not found' });
    }

    const { password, ...userWithoutPassword } = user;
    return NextResponse.json({ status: 200, data: userWithoutPassword });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ status: 500, error: 'Internal server error' });
  }
}
