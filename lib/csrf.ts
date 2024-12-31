import { NextApiRequest, NextApiResponse } from 'next';
import Tokens from 'csrf';
import { getDictionary } from '@/get-dictionaries';

const tokens = new Tokens();

export function generateCSRFToken() {
  return tokens.create(process.env.CSRF_SECRET ?? '');
}

export function validateCSRFToken(token: string) {
  return tokens.verify(process.env.CSRF_SECRET ?? '', token);
}

export async function csrfProtection(req: NextApiRequest, res: NextApiResponse, next: any) {
  const dictionary = await getDictionary(req.query.lang as 'en' | 'hi' | 'gu');
  if (!validateCSRFToken(req.headers['x-csrf-token'] as string)) {
    res.status(403).json({ error: dictionary?.csrf?.invalidCSRFToken });
    return;
  }
  next();
}
