// src/app/reset-password/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClientBrowser } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [pwd, setPwd] = useState('')
  const [pwd2, setPwd2] = useState('')
  const [loading, setLoading] = useState(false)

  // Habilita o formulário quando houver sessão de recovery (ou após pequeno fallback)
  useEffect(() => {
    const supabase = createClientBrowser()

    const init = async () => {
      // qualquer chamada já "acorda" a sessão se o hash está presente
      await supabase.auth.getSession()
      setReady(true)
    }
    init()

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      setReady(true)
    })

    const t = setTimeout(() => setReady(true), 1200)
    return () => {
      sub.subscription.unsubscribe()
      clearTimeout(t)
    }
  }, [])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    if (pwd.length < 8) return toast.error('A senha deve ter pelo menos 8 caracteres.')
    if (pwd !== pwd2) return toast.error('As senhas não conferem.')

    setLoading(true)
    const supabase = createClientBrowser()
    const { error } = await supabase.auth.updateUser({ password: pwd })
    setLoading(false)

    if (error) {
      toast.error('Não foi possível atualizar a senha', { description: error.message })
      return
    }

    toast.success('Senha atualizada com sucesso!')
    // encerra a sessão de recovery e envia para o login
    await supabase.auth.signOut()
    router.replace('/login')
  }

  if (!ready) {
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <p>Validando link…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Definir nova senha</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pwd">Nova senha</Label>
              <Input
                id="pwd"
                type="password"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pwd2">Confirmar nova senha</Label>
              <Input
                id="pwd2"
                type="password"
                value={pwd2}
                onChange={(e) => setPwd2(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Atualizando…' : 'Atualizar senha'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
