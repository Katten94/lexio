'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const ALLE_FAG: Record<string, string[]> = {
  'Afsætning':              ['A', 'B', 'C'],
  'Salg og service':        ['GF1', 'GF2', 'HF1', 'HF2'],
  'Erhvervsøkonomi':        ['A', 'B', 'C'],
  'Kommunikation':          ['GF1', 'GF2', 'HF1', 'HF2'],
  'Matematik':              ['B', 'C', 'D', 'E', 'F'],
  'Dansk':                  ['C', 'D', 'E'],
  'Engelsk':                ['B', 'C', 'D', 'E'],
  'Informatik':             ['A', 'B', 'C'],
  'Didaktik / Pædagogik':   ['Alle niveauer'],
}

const ALLE_FORLOEB = ['GF1', 'GF2', 'HF1', 'HF2', 'HF3', 'HF4']

const FAG_STIL: Record<string, { bg: string; tekst: string }> = {
  'Afsætning':              { bg: '#EFF6FF', tekst: '#1E40AF' },
  'Salg og service':        { bg: '#F0FDFA', tekst: '#0F766E' },
  'Erhvervsøkonomi':        { bg: '#F0FDF4', tekst: '#166534' },
  'Kommunikation':          { bg: '#F5F3FF', tekst: '#5B21B6' },
  'Matematik':              { bg: '#FFFBEB', tekst: '#92400E' },
  'Dansk':                  { bg: '#FFF1F2', tekst: '#9F1239' },
  'Engelsk':                { bg: '#EFF6FF', tekst: '#1E3A8A' },
  'Informatik':             { bg: '#ECFEFF', tekst: '#164E63' },
  'Didaktik / Pædagogik':   { bg: '#FDF4FF', tekst: '#6B21A8' },
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

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()

  const [trin, setTrin] = useState(1)
  const [navn, setNavn] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fagprofil, setFagprofil] = useState<Record<string, string[]>>({})
  const [forloeb, setForloeb] = useState<string[]>([])
  const [fejl, setFejl] = useState('')
  const [loader, setLoader] = useState(false)

  const toggleNiveau = (fag: string, niveau: string) => {
    setFagprofil(prev => {
      const nuv = prev[fag] || []
      const ny = nuv.includes(niveau) ? nuv.filter(n => n !== niveau) : [...nuv, niveau]
      if (ny.length === 0) { const { [fag]: _, ...rest } = prev; return rest }
      return { ...prev, [fag]: ny }
    })
  }

  const toggleForloeb = (f: string) => {
    setForloeb(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])
  }

  const opret = async () => {
    setLoader(true)
    setFejl('')
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { navn, fagprofil, forloeb } }
    })
    if (error) {
      setFejl(error.message)
      setLoader(false)
    } else {
      router.push('/dashboard')
    }
  }

  const Trin = ({ nr, label, aktiv, faerdig }: { nr: number; label: string; aktiv: boolean; faerdig: boolean }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{
        width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
        backgroundColor: faerdig ? '#F5C842' : aktiv ? 'white' : 'rgba(255,255,255,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: '10px', fontWeight: '700', color: faerdig ? '#0F2A5E' : aktiv ? '#0F2A5E' : 'rgba(255,255,255,0.5)' }}>
          {faerdig ? '✓' : nr}
        </span>
      </div>
      <span style={{ fontSize: '12px', fontFamily: 'Arial', color: aktiv ? 'white' : 'rgba(255,255,255,0.4)', fontWeight: aktiv ? '600' : '400' }}>
        {label}
      </span>
    </div>
  )

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#F9FAFB' }}>

      {/* Venstre — navy panel */}
      <div className="hidden lg:flex flex-col w-2/5 px-12"
        style={{ backgroundColor: '#0F2A5E', paddingTop: '40px' }}>

        <Logo />

        <div style={{ marginTop: '80px' }}>
          <p style={{ fontFamily: 'Arial', fontSize: '13px', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '20px' }}>
            Opret din konto
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Trin nr={1} label="Dine oplysninger" aktiv={trin === 1} faerdig={trin > 1} />
            <div style={{ width: '1px', height: '16px', backgroundColor: 'rgba(255,255,255,0.15)', marginLeft: '11px' }} />
            <Trin nr={2} label="Dine fag og niveauer" aktiv={trin === 2} faerdig={trin > 2} />
            <div style={{ width: '1px', height: '16px', backgroundColor: 'rgba(255,255,255,0.15)', marginLeft: '11px' }} />
            <Trin nr={3} label="Dine forløb" aktiv={trin === 3} faerdig={trin > 3} />
            <div style={{ width: '1px', height: '16px', backgroundColor: 'rgba(255,255,255,0.15)', marginLeft: '11px' }} />
            <Trin nr={4} label="Bekræft og opret" aktiv={trin === 4} faerdig={false} />
          </div>
        </div>
      </div>

      {/* Højre — formular centreret i det lyse felt */}
      <div className="flex-1 flex flex-col items-center"
        style={{ paddingTop: '40px' }}>

        <div style={{ height: '118px', flexShrink: 0 }} />

        <div style={{ width: '360px' }}>

          {trin === 1 && (
            <div>
              <h1 className="font-bold mb-1" style={{ fontSize: '22px', color: '#111827', fontFamily: 'Arial' }}>Opret din konto</h1>
              <p className="mb-8" style={{ fontSize: '13px', color: '#6B7280', fontFamily: 'Arial' }}>Trin 1 af 4 — dine oplysninger</p>
              <div className="mb-4">
                <label className="block mb-1.5" style={{ fontSize: '12px', fontWeight: '600', color: '#374151', fontFamily: 'Arial' }}>Fulde navn</label>
                <input type="text" value={navn} onChange={e => setNavn(e.target.value)}
                  placeholder="Dit navn" className="w-full px-4 py-2.5 rounded-lg outline-none"
                  style={{ border: '1px solid #E5E7EB', fontSize: '13px', fontFamily: 'Arial', color: '#111827', backgroundColor: 'white' }}
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1.5" style={{ fontSize: '12px', fontWeight: '600', color: '#374151', fontFamily: 'Arial' }}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="din@skole.dk" className="w-full px-4 py-2.5 rounded-lg outline-none"
                  style={{ border: '1px solid #E5E7EB', fontSize: '13px', fontFamily: 'Arial', color: '#111827', backgroundColor: 'white' }}
                />
              </div>
              <div className="mb-8">
                <label className="block mb-1.5" style={{ fontSize: '12px', fontWeight: '600', color: '#374151', fontFamily: 'Arial' }}>Adgangskode</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Mindst 6 tegn" className="w-full px-4 py-2.5 rounded-lg outline-none"
                  style={{ border: '1px solid #E5E7EB', fontSize: '13px', fontFamily: 'Arial', color: '#111827', backgroundColor: 'white' }}
                />
              </div>
              <button onClick={() => { if (navn && email && password.length >= 6) setTrin(2) }}
                disabled={!navn || !email || password.length < 6}
                className="w-full py-2.5 rounded-lg font-medium mb-4"
                style={{
                  backgroundColor: navn && email && password.length >= 6 ? '#0F2A5E' : '#E5E7EB',
                  color: navn && email && password.length >= 6 ? 'white' : '#9CA3AF',
                  fontSize: '14px', fontFamily: 'Arial',
                  cursor: navn && email && password.length >= 6 ? 'pointer' : 'not-allowed',
                }}>
                Fortsæt →
              </button>
              <p className="text-center" style={{ fontSize: '13px', color: '#6B7280', fontFamily: 'Arial' }}>
                Har du allerede en konto?{' '}
                <a href="/login" style={{ color: '#0F2A5E', fontWeight: '600', textDecoration: 'none' }}>Log ind</a>
              </p>
            </div>
          )}

          {trin === 2 && (
            <div>
              <h1 className="font-bold mb-1" style={{ fontSize: '22px', color: '#111827', fontFamily: 'Arial' }}>Dine fag og niveauer</h1>
              <p className="mb-6" style={{ fontSize: '13px', color: '#6B7280', fontFamily: 'Arial' }}>Trin 2 af 4 — vælg de fag du underviser i og på hvilke niveauer</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                {Object.entries(ALLE_FAG).map(([fag, niveauer]) => {
                  const stil = FAG_STIL[fag] || { bg: '#F9FAFB', tekst: '#374151' }
                  const valgte = fagprofil[fag] || []
                  return (
                    <div key={fag}>
                      <p className="text-xs font-semibold mb-2" style={{ color: '#374151', fontFamily: 'Arial' }}>{fag}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {niveauer.map(niveau => {
                          const valgt = valgte.includes(niveau)
                          return (
                            <button key={niveau} onClick={() => toggleNiveau(fag, niveau)}
                              className="text-xs font-medium px-3 py-1 rounded"
                              style={{ backgroundColor: valgt ? stil.tekst : stil.bg, color: valgt ? 'white' : stil.tekst, border: `1px solid ${stil.tekst}`, fontFamily: 'Arial', cursor: 'pointer' }}>
                              {niveau}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setTrin(1)} className="flex-1 py-2.5 rounded-lg font-medium"
                  style={{ backgroundColor: 'white', border: '1px solid #E5E7EB', color: '#374151', fontSize: '14px', fontFamily: 'Arial' }}>← Tilbage</button>
                <button onClick={() => setTrin(3)} className="flex-1 py-2.5 rounded-lg font-medium"
                  style={{ backgroundColor: '#0F2A5E', color: 'white', fontSize: '14px', fontFamily: 'Arial', cursor: 'pointer' }}>Fortsæt →</button>
              </div>
            </div>
          )}

          {trin === 3 && (
            <div>
              <h1 className="font-bold mb-1" style={{ fontSize: '22px', color: '#111827', fontFamily: 'Arial' }}>Dine forløb</h1>
              <p className="mb-6" style={{ fontSize: '13px', color: '#6B7280', fontFamily: 'Arial' }}>Trin 3 af 4 — hvilke forløb underviser du på?</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '32px' }}>
                {ALLE_FORLOEB.map(f => {
                  const valgt = forloeb.includes(f)
                  return (
                    <button key={f} onClick={() => toggleForloeb(f)}
                      className="font-medium px-5 py-2.5 rounded-lg"
                      style={{ backgroundColor: valgt ? '#0F2A5E' : 'white', color: valgt ? 'white' : '#374151', border: `1px solid ${valgt ? '#0F2A5E' : '#E5E7EB'}`, fontSize: '13px', fontFamily: 'Arial', cursor: 'pointer' }}>
                      {f}
                    </button>
                  )
                })}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setTrin(2)} className="flex-1 py-2.5 rounded-lg font-medium"
                  style={{ backgroundColor: 'white', border: '1px solid #E5E7EB', color: '#374151', fontSize: '14px', fontFamily: 'Arial' }}>← Tilbage</button>
                <button onClick={() => setTrin(4)} className="flex-1 py-2.5 rounded-lg font-medium"
                  style={{ backgroundColor: '#0F2A5E', color: 'white', fontSize: '14px', fontFamily: 'Arial', cursor: 'pointer' }}>Fortsæt →</button>
              </div>
            </div>
          )}

          {trin === 4 && (
            <div>
              <h1 className="font-bold mb-1" style={{ fontSize: '22px', color: '#111827', fontFamily: 'Arial' }}>Bekræft og opret</h1>
              <p className="mb-6" style={{ fontSize: '13px', color: '#6B7280', fontFamily: 'Arial' }}>Trin 4 af 4 — tjek dine oplysninger og opret din konto</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                <div className="rounded-lg px-4 py-3" style={{ backgroundColor: 'white', border: '1px solid #E5E7EB' }}>
                  <p className="text-xs mb-0.5" style={{ color: '#9CA3AF', fontFamily: 'Arial', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Navn</p>
                  <p className="text-sm font-medium" style={{ color: '#111827', fontFamily: 'Arial' }}>{navn}</p>
                </div>
                <div className="rounded-lg px-4 py-3" style={{ backgroundColor: 'white', border: '1px solid #E5E7EB' }}>
                  <p className="text-xs mb-0.5" style={{ color: '#9CA3AF', fontFamily: 'Arial', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</p>
                  <p className="text-sm font-medium" style={{ color: '#111827', fontFamily: 'Arial' }}>{email}</p>
                </div>
                <div className="rounded-lg px-4 py-3" style={{ backgroundColor: 'white', border: '1px solid #E5E7EB' }}>
                  <p className="text-xs mb-2" style={{ color: '#9CA3AF', fontFamily: 'Arial', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fag og niveauer</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {Object.entries(fagprofil).length === 0 ? (
                      <p className="text-xs" style={{ color: '#9CA3AF', fontFamily: 'Arial' }}>Ingen valgt</p>
                    ) : Object.entries(fagprofil).map(([fag, niv]) => {
                      const stil = FAG_STIL[fag] || { bg: '#F9FAFB', tekst: '#374151' }
                      return niv.map(n => (
                        <span key={`${fag}-${n}`} className="text-xs px-2 py-0.5 rounded"
                          style={{ backgroundColor: stil.bg, color: stil.tekst, fontFamily: 'Arial' }}>{fag} {n}</span>
                      ))
                    })}
                  </div>
                </div>
                <div className="rounded-lg px-4 py-3" style={{ backgroundColor: 'white', border: '1px solid #E5E7EB' }}>
                  <p className="text-xs mb-2" style={{ color: '#9CA3AF', fontFamily: 'Arial', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Forløb</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {forloeb.length === 0 ? (
                      <p className="text-xs" style={{ color: '#9CA3AF', fontFamily: 'Arial' }}>Ingen valgt</p>
                    ) : forloeb.map(f => (
                      <span key={f} className="text-xs px-2 py-0.5 rounded"
                        style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', color: '#374151', fontFamily: 'Arial' }}>{f}</span>
                    ))}
                  </div>
                </div>
              </div>
              {fejl && (
                <div className="mb-4 px-4 py-3 rounded-lg" style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
                  <p className="text-xs" style={{ color: '#991B1B', fontFamily: 'Arial' }}>{fejl}</p>
                </div>
              )}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setTrin(3)} className="flex-1 py-2.5 rounded-lg font-medium"
                  style={{ backgroundColor: 'white', border: '1px solid #E5E7EB', color: '#374151', fontSize: '14px', fontFamily: 'Arial' }}>← Tilbage</button>
                <button onClick={opret} disabled={loader} className="flex-1 py-2.5 rounded-lg font-medium"
                  style={{ backgroundColor: '#0F2A5E', color: 'white', fontSize: '14px', fontFamily: 'Arial', cursor: loader ? 'not-allowed' : 'pointer' }}>
                  {loader ? 'Opretter...' : 'Opret konto'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  )
}