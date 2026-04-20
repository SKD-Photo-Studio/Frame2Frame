import { Request, Response, NextFunction } from 'express';
import { supabase } from '../DB/supabase';

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.split(' ')[1];
  console.log('[Auth] Incoming token:', token.substring(0, 10) + '...');

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error('[Auth] Verification failed:', error?.message || 'No user found');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Attach user to request for further use if needed
    (req as any).user = user;
    next();
  } catch (err) {
    console.error('Auth check failed:', err);
    return res.status(500).json({ error: 'Internal server error during authentication' });
  }
}
