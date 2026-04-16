'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Forkert email eller adgangskode. Prøv igen.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-md">
        <div className="mb-8">
          <div className="flex items-center gap-2.5 mb-1">
            <svg width="32" height="32" viewBox="0 0 30 30" fill="none">
              <rect width="30" height="30" rx="8" fill="#F97316"/>
              <polygon points="15,8 24,13 15,18 6,13" fill="white"/>
              <path d="M15 18v8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <path d="M9 15.5v6" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
              <circle cx="9" cy="22.5" r="2.2" fill="white"/>
            </svg>
            <h1 className="text-2xl font-bold tracking-normal">
              <span className="text-blue-900">DIDANTO</span><span style={{ marginLeft: '6px', color: '#F97316' }}>.</span>
            </h1>
          </div>
          <p className="text-gray-500 mt-2">Log ind på din konto</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="din@email.dk"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adgangskode</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-900 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-800 disabled:opacity-50"
          >
            {loading ? 'Logger ind...' : 'Log ind'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Har du ikke en konto?{' '}
          <Link href="/signup" className="text-orange-500 hover:underline">Opret konto</Link>
        </p>
      </div>
    </div>
  )
}