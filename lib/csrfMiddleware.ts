import { NextApiRequest, NextApiResponse } from 'next';
import csrf from 'csurf';

const csrfProtection = csrf({
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
  },
});

export function csrfMiddleware(req: NextApiRequest, res: NextApiResponse, next: () => void) {
  return new Promise((resolve, reject) => {
    csrfProtection(req, res, (error) => {
      if (error) {
        reject(error);
      } else {
        next();
        resolve('');
      }
    });
  });
}

export function getCsrfToken(req: NextApiRequest) {
  return (req as any).csrfToken();
}
