'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const FAG_MED_NIVEAUER: Record<string, string[]> = {
  "Afsætning": ["A", "B", "C"],
  "Salg og service": ["GF2", "HF1", "HF2"],
  "Erhvervsøkonomi": ["A", "B", "C"],
  "Kommunikation": ["GF2", "HF1", "HF2"],
  "Informatik": ["A", "B", "C"],
  "Matematik": ["F", "E", "D", "C", "B"],
  "Dansk": ["F", "E", "D", "C"],
  "Engelsk": ["F", "E", "D", "C", "B"],
  "Virksomhedsøkonomi": ["A", "B", "C"],
  "International handel": ["A", "B"],
  "Logistik": ["GF2", "HF1", "HF2"],
  "Iværksætteri": ["A", "B", "C"],
  "Didaktik / Pædagogik": ["Alle niveauer"],
  "Samfundsfag": ["C", "B", "A"],
  "Naturfag": ["F", "E", "D", "C"],
}

const FORLOEB = [
  { id: "gf1", label: "GF1", beskrivelse: "Grundforløb 1 — fælles for alle EUD-elever" },
  { id: "gf2", label: "GF2", beskrivelse: "Grundforløb 2 — retningsspecifikt" },
  { id: "hf1", label: "HF1", beskrivelse: "Hovedforløb 1" },
  { id: "hf2", label: "HF2", beskrivelse: "Hovedforløb 2" },
  { id: "hf3", label: "HF3", beskrivelse: "Hovedforløb 3" },
  { id: "hf4", label: "HF4", beskrivelse: "Hovedforløb 4" },
]

type FagProfil = Record<string, string[]>

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [navn, setNavn] = useState('')
  const [skole, setSkole] = useState('')
  const [valgtefag, setValgtefag] = useState<string[]>([])
  const [fagprofil, setFagprofil] = useState<FagProfil>({})
  const [valgtforloeb, setValgtforloeb] = useState<string[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [trin, setTrin] = useState(1)
  const router = useRouter()
  const supabase = createClient()

  const toggleFag = (fag: string) => {
    setValgtefag(prev =>
      prev.includes(fag) ? prev.filter(f => f !== fag) : [...prev, fag]
    )
    setFagprofil(prev => {
      const updated = { ...prev }
      if (updated[fag]) delete updated[fag]
      return updated
    })
  }

  const toggleNiveau = (fag: string, niveau: string) => {
    setFagprofil(prev => {
      const nuvaerende = prev[fag] || []
      const opdateret = nuvaerende.includes(niveau)
        ? nuvaerende.filter(n => n !== niveau)
        : [...nuvaerende, niveau]
      return { ...prev, [fag]: opdateret }
    })
  }

  const toggleForloeb = (id: string) => {
    setValgtforloeb(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    )
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (valgtforloeb.length === 0) {
      setError('Vælg mindst ét forløb.')
      return
    }
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { navn, skole, fagprofil, forloeb: valgtforloeb }
      }
    })

    if (error) {
      setError('Der skete en fejl. Prøv igen.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  const TrinIndikator = () => (
    <div className="flex items-center gap-1 mb-6">
      {[1, 2, 3, 4].map((t, i) => (
        <div key={t} className="flex items-center flex-1">
          <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold flex-shrink-0 ${
            trin > t ? 'bg-orange-400 text-white' :
            trin === t ? 'bg-blue-900 text-white' :
            'bg-gray-100 text-gray-400'
          }`}>
            {trin > t ? '✓' : t}
          </div>
          {i < 3 && (
            <div className="flex-1 h-0.5 bg-gray-200 mx-1">
              <div className={`h-0.5 bg-blue-900 transition-all ${trin > t ? 'w-full' : 'w-0'}`}></div>
            </div>
          )}
        </div>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-10">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-lg">

        <div className="mb-6">
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
          <p className="text-gray-500 mt-2">Opret din konto</p>
        </div>

        <TrinIndikator />

        {/* TRIN 1 — Oplysninger */}
        {trin === 1 && (
          <form onSubmit={(e) => { e.preventDefault(); setTrin(2) }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Navn</label>
              <input type="text" value={navn} onChange={(e) => setNavn(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Dit fulde navn" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skole</label>
              <input type="text" value={skole} onChange={(e) => setSkole(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Navn på din erhvervsskole" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="din@email.dk" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adgangskode</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Minimum 6 tegn" required minLength={6} />
            </div>
            <button type="submit"
              className="w-full bg-blue-900 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-800">
              Næste →
            </button>
          </form>
        )}

        {/* TRIN 2 — Vælg fag */}
        {trin === 2 && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Hvilke fag underviser du i?</p>
              <p className="text-xs text-gray-400 mb-3">Vælg alle relevante fag — du kan altid ændre det senere i din profil.</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(FAG_MED_NIVEAUER).map((fag) => (
                  <button key={fag} type="button" onClick={() => toggleFag(fag)}
                    className={`text-left px-3 py-2 rounded-lg text-xs border transition-all ${
                      valgtefag.includes(fag)
                        ? 'bg-blue-900 text-white border-blue-900'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                    }`}>
                    {fag}
                  </button>
                ))}
              </div>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex gap-2">
              <button type="button" onClick={() => { setError(''); setTrin(1) }}
                className="flex-1 border border-gray-200 text-gray-600 rounded-lg py-2 text-sm font-medium hover:bg-gray-50">
                ← Tilbage
              </button>
              <button type="button" onClick={() => {
                if (valgtefag.length === 0) { setError('Vælg mindst ét fag.'); return }
                setError(''); setTrin(3)
              }}
                className="flex-1 bg-blue-900 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-800">
                Næste →
              </button>
            </div>
          </div>
        )}

        {/* TRIN 3 — Vælg niveauer */}
        {trin === 3 && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Hvilke niveauer underviser du på?</p>
              <p className="text-xs text-gray-400 mb-4">Vælg alle niveauer for hvert fag.</p>
              <div className="space-y-3">
                {valgtefag.map((fag) => (
                  <div key={fag} className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm font-medium text-gray-800 mb-2">{fag}</p>
                    <div className="flex flex-wrap gap-2">
                      {FAG_MED_NIVEAUER[fag].map((niveau) => (
                        <button key={niveau} type="button" onClick={() => toggleNiveau(fag, niveau)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            (fagprofil[fag] || []).includes(niveau)
                              ? 'bg-orange-400 text-white border-orange-400'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
                          }`}>
                          {niveau}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex gap-2">
              <button type="button" onClick={() => { setError(''); setTrin(2) }}
                className="flex-1 border border-gray-200 text-gray-600 rounded-lg py-2 text-sm font-medium hover:bg-gray-50">
                ← Tilbage
              </button>
              <button type="button" onClick={() => {
                const harNiveauer = valgtefag.every(fag => (fagprofil[fag] || []).length > 0)
                if (!harNiveauer) { setError('Vælg mindst ét niveau for hvert fag.'); return }
                setError(''); setTrin(4)
              }}
                className="flex-1 bg-blue-900 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-800">
                Næste →
              </button>
            </div>
          </div>
        )}

        {/* TRIN 4 — Vælg forløb */}
        {trin === 4 && (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Hvilke forløb underviser du på?</p>
              <p className="text-xs text-gray-400 mb-4">Vælg alle forløb der er relevante for dig — du modtager kun kurser og materialer der passer til dit undervisningsforløb.</p>
              <div className="space-y-2">
                {FORLOEB.map((forloeb) => (
                  <button key={forloeb.id} type="button" onClick={() => toggleForloeb(forloeb.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                      valgtforloeb.includes(forloeb.id)
                        ? 'bg-blue-900 text-white border-blue-900'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                    }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{forloeb.label}</span>
                      <span className={`text-xs ${valgtforloeb.includes(forloeb.id) ? 'text-blue-200' : 'text-gray-400'}`}>
                        {forloeb.beskrivelse}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex gap-2">
              <button type="button" onClick={() => { setError(''); setTrin(3) }}
                className="flex-1 border border-gray-200 text-gray-600 rounded-lg py-2 text-sm font-medium hover:bg-gray-50">
                ← Tilbage
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 bg-blue-900 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-800 disabled:opacity-50">
                {loading ? 'Opretter...' : 'Opret konto ✓'}
              </button>
            </div>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          Har du allerede en konto?{' '}
          <Link href="/login" className="text-orange-500 hover:underline">Log ind</Link>
        </p>
      </div>
    </div>
  )
}