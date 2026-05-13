import { Response, NextFunction } from 'express';
import { supabaseAdmin } from '../services/supabase';
import { AuthRequest } from './auth';

/**
 * Middleware: requireAdmin
 * Ensures the request is from an authenticated user with is_admin = true.
 * Must be used AFTER requireAuth middleware.
 */
export async function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', req.userId)
      .single();

    if (error || !data || data.is_admin !== true) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch {
    return res.status(403).json({ error: 'Admin verification failed' });
  }
}
