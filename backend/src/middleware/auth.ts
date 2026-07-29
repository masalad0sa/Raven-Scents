import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../services/supabase';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
  rawBody?: Buffer;
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.slice(7);

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      console.warn('requireAuth failed to verify token:', error?.message || 'No user found');
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    req.userId = user.id; // Supabase stores user UUID in user.id
    req.userEmail = user.email;
    next();
  } catch (err) {
    console.warn('requireAuth failed to verify token:', err instanceof Error ? err.message : err);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export async function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.slice(7);

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (!error && user) {
      req.userId = user.id;
      req.userEmail = user.email;
    }
  } catch (err) {
    console.warn('optionalAuth failed to verify token:', err instanceof Error ? err.message : err);
  }
  next();
}

export async function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', req.userId)
      .single();

    if (error || !profile?.is_admin) {
      return res.status(403).json({ error: 'Forbidden: Admin privilege required' });
    }

    next();
  } catch {
    return res.status(500).json({ error: 'Failed to verify admin authorization' });
  }
}
