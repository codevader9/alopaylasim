import type { Request, Response, NextFunction } from 'express'
import type { SupabaseClient } from '@supabase/supabase-js'
import { supabaseAdmin } from '../config/supabase.js'

export interface AuthRequest extends Request {
  userId?: string
  userRole?: string
  supabase?: SupabaseClient
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token gerekli' })
    return
  }

  const token = authHeader.replace('Bearer ', '')

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)

    if (error || !user) {
      console.error('[Auth] Token doğrulama hatası:', error?.message)
      res.status(401).json({ error: 'Geçersiz token' })
      return
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    req.userId = user.id
    req.userRole = profile?.role || 'user'
    req.supabase = supabaseAdmin
    next()
  } catch (err: any) {
    console.error('[Auth] Hata:', err.message)
    res.status(401).json({ error: 'Token doğrulanamadı' })
  }
}

export function adminOnly(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.userRole !== 'admin') {
    res.status(403).json({ error: 'Admin yetkisi gerekli' })
    return
  }
  next()
}
