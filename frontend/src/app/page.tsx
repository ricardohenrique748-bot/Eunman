'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Truck, Lock, User } from 'lucide-react'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Mock login delay
    setTimeout(() => {
      router.push('/dashboard')
    }, 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Minimalist Glow - Only Green */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-sm p-8 z-10 relative">
        <div className="flex flex-col items-center mb-10">
          <div className="relative w-32 h-32 mb-6">
            <Image src="/logo.png" alt="Eunaman" fill className="object-contain drop-shadow-2xl" />
          </div>
          {/* Removed Text Title - Logo speaks for itself in minimalist design */}
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider font-semibold text-gray-400">Email Corporativo</label>
            <div className="relative group">
              <User className="absolute left-3 top-3 w-5 h-5 text-gray-500 group-focus-within:text-primary transition-colors" />
              <input
                type="email"
                placeholder="usuario@eunaman.com"
                className="w-full bg-surface-highlight border border-border-color rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider font-semibold text-gray-400">Senha</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500 group-focus-within:text-primary transition-colors" />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-surface-highlight border border-border-color rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              />
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)]"
          >
            {loading ? 'AUTENTICANDO...' : 'ENTRAR NO SISTEMA'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-dashed border-gray-700 pt-6">
          <div className="flex justify-center space-x-4 text-gray-600">
            <span className="text-xs flex items-center gap-1">🔒 SSL Secure</span>
            <span className="text-xs flex items-center gap-1">🛡️ Protected</span>
          </div>
          <p className="text-[10px] text-gray-700 mt-4 uppercase tracking-widest">v1.0.0 • Eunaman Corp</p>
        </div>
      </div>
    </div>
  )
}
