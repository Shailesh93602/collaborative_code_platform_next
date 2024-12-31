import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth.util';
import prisma from '@/lib/prisma.util';
import speakeasy from 'speakeasy';
import { handleApiError } from '@/lib/errorHandling';
import { validateAndSanitizeInput } from '@/lib/inputValidation';
import * as yup from 'yup';

const verifySchema = yup.object().shape({
  token: yup.string().required('Token is required'),
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      { error: { code: 'Unauthorized', message: 'Unauthorized' } },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const validatedData = await validateAndSanitizeInput(verifySchema, body);

    const { token } = validatedData;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user?.twoFactorSecret) {
      return NextResponse.json(
        {
          error: {
            code: 'UserNotFound',
            message: 'User not found or 2FA not set up',
          },
        },
        { status: 404 }
      );
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
    });

    if (verified) {
      await prisma.user.update({
        where: { id: user.id },
        data: { twoFactorEnabled: true },
      });
      return NextResponse.json({
        success: true,
        message: '2FA enabled successfully',
      });
    } else {
      return NextResponse.json(
        { error: { code: 'InvalidToken', message: 'Invalid token' } },
        { status: 400 }
      );
    }
  } catch (error) {
    return handleApiError(error, 'An error occurred while verifying 2FA');
  }
}
