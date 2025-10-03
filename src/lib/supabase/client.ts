// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export const createClientBrowser = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

/**
 * Base URL do app (sem barra no final).
 * Use em redirects do Supabase (forgot/reset password).
 */
export const getBaseUrl = () =>
  (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')
