import { NextResponse } from 'next/server';
import { applyRateLimit, applySpeedLimit } from '@/lib/rateLimit';
import { csrfProtection } from '@/lib/csrf';
import { NextApiRequest, NextApiResponse } from 'next';

export async function middleware(req: NextApiRequest, res: NextApiResponse) {
  try {
    await applyRateLimit(req, res);
    await applySpeedLimit(req, res);
    await new Promise((resolve) => csrfProtection(req, res, resolve));
  } catch (error) {
    return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
  }

  return NextResponse.next();
}
