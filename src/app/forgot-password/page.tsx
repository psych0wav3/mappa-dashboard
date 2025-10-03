// src/app/forgot-password/page.tsx
'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createClientBrowser, getBaseUrl } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    const supabase = createClientBrowser()

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${getBaseUrl()}/reset-password`,
    })

    setLoading(false)

    if (error) {
      toast.error('Não foi possível enviar o e-mail', { description: error.message })
    } else {
      toast.success('Enviamos o link de recuperação', {
        description: 'Verifique sua caixa de entrada e o spam.',
      })
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Recuperar senha</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="voce@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Enviando…' : 'Enviar link'}
            </Button>
            <p className="text-xs text-neutral-500">
              Você será redirecionado para a página de redefinição.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
