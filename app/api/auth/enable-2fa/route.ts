import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { handleApiError } from '@/lib/errorHandling';

export async function POST(request: Request, { params }) {
  const { lang } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      { error: { code: 'Unauthorized', message: 'Unauthorized' } },
      { status: 401 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { error: { code: 'UserNotFound', message: 'User not found' } },
        { status: 404 }
      );
    }

    const secret = speakeasy.generateSecret({
      name: `CollaborativeCodePlatform:${user.email}`,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorSecret: secret.base32 },
    });

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    return NextResponse.json({ secret: secret.base32, qrCode: qrCodeUrl });
  } catch (error) {
    return handleApiError(error, 'An error occurred while enabling 2FA', lang);
  }
}
