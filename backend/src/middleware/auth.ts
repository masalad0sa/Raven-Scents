import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../services/supabase';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.slice(7);

  try {
    // Verify the Supabase JWT
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    req.userId = user.id;
    req.userEmail = user.email;
    next();
  } catch {
    return res.status(401).json({ error: 'Token verification failed' });
  }
}

export async function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.slice(7);
  try {
    const { data: { user } } = await supabaseAdmin.auth.getUser(token);
    if (user) {
      req.userId = user.id;
      req.userEmail = user.email;
    }
  } catch {
    // ignore
  }
  next();
}
