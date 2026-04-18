'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fejl, setFejl] = useState('')
  const [loader, setLoader] = useState(false)

  const login = async () => {
    setLoader(true)
    setFejl('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setFejl('Forkert email eller adgangskode')
      setLoader(false)
    } else {
      router.push('/dashboard')
    }
  }

  const Logo = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <svg width="38" height="38" viewBox="0 0 80 80" fill="none" style={{ flexShrink: 0 }}>
        <rect width="80" height="80" rx="18" fill="rgba(255,255,255,0.1)"/>
        <circle cx="40" cy="26" r="11" fill="white"/>
        <circle cx="40" cy="26" r="5.5" fill="#F5C842"/>
        <path d="M18 68 Q18 50 40 50 Q62 50 62 68" fill="white"/>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ fontFamily: "'Arial Black', Arial", fontSize: '14px', fontWeight: 900, color: 'white', letterSpacing: '-0.5px', lineHeight: '1' }}>
          DIDANTO
        </div>
        <div style={{ fontFamily: 'Arial', fontSize: '6.5px', color: 'rgba(255,255,255,0.3)', letterSpacing: '1.5px', textTransform: 'uppercase', lineHeight: '1.4' }}>
          Kompetenceløft<br />til undervisere
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#F9FAFB' }}>

      {/* Venstre — navy panel */}
      <div className="hidden lg:flex flex-col w-2/5 px-12"
        style={{ backgroundColor: '#0F2A5E', paddingTop: '40px' }}>
        <Logo />
        <div style={{ marginTop: '80px' }}>
          <h2 style={{ fontFamily: 'Arial', fontSize: '26px', fontWeight: '700', color: 'white', lineHeight: '1.3', marginBottom: '20px' }}>
            Fagligt forankret.<br />Klar til brug mandag morgen.
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              'Kurser tilpasset din fagprofil og dine niveauer',
              'AI-genererede materialer forankret i bekendtgørelsen',
              'PowerPoint og forberedelsesark klar til download',
            ].map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#F5C842', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                  <span style={{ fontSize: '10px', fontWeight: '700', color: '#0F2A5E' }}>✓</span>
                </div>
                <p style={{ fontFamily: 'Arial', fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.5' }}>{t}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Højre — formular centreret i det lyse felt */}
      <div className="flex-1 flex flex-col items-center"
        style={{ paddingTop: '40px' }}>

        <div style={{ height: '118px', flexShrink: 0 }} />

        <div style={{ width: '360px' }}>
          <h1 className="font-bold mb-2"
            style={{ fontSize: '22px', color: '#111827', fontFamily: 'Arial' }}>
            Log ind
          </h1>
          <p className="mb-8"
            style={{ fontSize: '13px', color: '#6B7280', fontFamily: 'Arial' }}>
            Velkommen tilbage — log ind på din konto
          </p>

          <div className="mb-4">
            <label className="block mb-1.5"
              style={{ fontSize: '12px', fontWeight: '600', color: '#374151', fontFamily: 'Arial' }}>
              Email
            </label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && login()}
              placeholder="din@skole.dk" className="w-full px-4 py-2.5 rounded-lg outline-none"
              style={{ border: '1px solid #E5E7EB', fontSize: '13px', fontFamily: 'Arial', color: '#111827', backgroundColor: 'white' }}
            />
          </div>

          <div className="mb-6">
            <label className="block mb-1.5"
              style={{ fontSize: '12px', fontWeight: '600', color: '#374151', fontFamily: 'Arial' }}>
              Adgangskode
            </label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && login()}
              placeholder="••••••••" className="w-full px-4 py-2.5 rounded-lg outline-none"
              style={{ border: '1px solid #E5E7EB', fontSize: '13px', fontFamily: 'Arial', color: '#111827', backgroundColor: 'white' }}
            />
          </div>

          {fejl && (
            <div className="mb-4 px-4 py-3 rounded-lg"
              style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
              <p className="text-xs" style={{ color: '#991B1B', fontFamily: 'Arial' }}>{fejl}</p>
            </div>
          )}

          <button onClick={login} disabled={loader || !email || !password}
            className="w-full py-2.5 rounded-lg font-medium mb-4"
            style={{
              backgroundColor: email && password ? '#0F2A5E' : '#E5E7EB',
              color: email && password ? 'white' : '#9CA3AF',
              fontSize: '14px', fontFamily: 'Arial',
              cursor: email && password ? 'pointer' : 'not-allowed',
            }}>
            {loader ? 'Logger ind...' : 'Log ind'}
          </button>

          <p className="text-center" style={{ fontSize: '13px', color: '#6B7280', fontFamily: 'Arial' }}>
            Har du ikke en konto?{' '}
            <a href="/signup" style={{ color: '#0F2A5E', fontWeight: '600', textDecoration: 'none' }}>
              Opret konto
            </a>
          </p>
        </div>
      </div>

    </div>
  )
}