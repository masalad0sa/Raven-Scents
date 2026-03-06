import { Request, Response } from 'express';
import { supabaseAdmin } from '../services/supabase';
import { handleError, AppError } from '../middleware/errorHandler';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(2).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// POST /api/auth/register
export async function register(req: Request, res: Response) {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message });
    }
    const { email, password, full_name } = parsed.data;

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { full_name },
      email_confirm: true, // auto-confirm for now
    });

    if (error) {
      if (error.message.includes('already registered')) {
        throw new AppError(409, 'An account with this email already exists');
      }
      throw error;
    }

    // Sign in immediately after registration to get tokens
    const { data: session, error: signInError } = await supabaseAdmin.auth.signInWithPassword({ email, password });
    if (signInError) throw signInError;

    res.status(201).json({
      user: {
        id: data.user.id,
        email: data.user.email,
        full_name: data.user.user_metadata?.full_name,
      },
      access_token: session.session?.access_token,
      refresh_token: session.session?.refresh_token,
    });
  } catch (err) {
    handleError(err, res);
  }
}

// POST /api/auth/login
export async function login(req: Request, res: Response) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message });
    }
    const { email, password } = parsed.data;

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password });
    if (error) throw new AppError(401, 'Invalid email or password');

    res.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        full_name: data.user.user_metadata?.full_name,
      },
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });
  } catch (err) {
    handleError(err, res);
  }
}

// POST /api/auth/refresh
export async function refreshToken(req: Request, res: Response) {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) throw new AppError(400, 'refresh_token is required');

    const { data, error } = await supabaseAdmin.auth.refreshSession({ refresh_token });
    if (error) throw new AppError(401, 'Invalid refresh token');

    res.json({
      access_token: data.session?.access_token,
      refresh_token: data.session?.refresh_token,
    });
  } catch (err) {
    handleError(err, res);
  }
}

// POST /api/auth/logout
export async function logout(req: Request, res: Response) {
  const token = req.headers.authorization?.slice(7);
  if (token) {
    await supabaseAdmin.auth.admin.signOut(token).catch(() => {});
  }
  res.json({ message: 'Logged out successfully' });
}
