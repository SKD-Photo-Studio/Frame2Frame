import { supabase } from '../DB/supabase';
import { Request, Response, NextFunction } from 'express';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {

  const authHeader = req.headers.authorization;
  const { path, method } = req;

  // Allow public access to tenant info for branding on login screen
  if (path === "/tenant" && method === "GET") {
    return next();
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error('Auth error:', error);
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Add user to request object
    (req as any).user = user;
    next();
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(401).json({ error: 'Unauthorized' });
  }
};
