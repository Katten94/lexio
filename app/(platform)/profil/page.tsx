'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

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
  { id: "gf1", label: "GF1", beskrivelse: "Grundforløb 1" },
  { id: "gf2", label: "GF2", beskrivelse: "Grundforløb 2" },
  { id: "hf1", label: "HF1", beskrivelse: "Hovedforløb 1" },
  { id: "hf2", label: "HF2", beskrivelse: "Hovedforløb 2" },
  { id: "hf3", label: "HF3", beskrivelse: "Hovedforløb 3" },
  { id: "hf4", label: "HF4", beskrivelse: "Hovedforløb 4" },
]

const Logo = () => (
  <div className="flex items-center gap-2">
    <svg width="26" height="26" viewBox="0 0 30 30" fill="none">
      <rect width="30" height="30" rx="8" fill="#F97316"/>
      <polygon points="15,8 24,13 15,18 6,13" fill="white"/>
      <path d="M15 18v8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <path d="M9 15.5v6" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="9" cy="22.5" r="2.2" fill="white"/>
    </svg>
    <h1 className="text-lg font-bold tracking-normal">
      <span className="text-blue-900">DIDANTO</span><span style={{ marginLeft: '4px', color: '#F97316' }}>.</span>
    </h1>
  </div>
)

export default function ProfilPage() {
  const [navn, setNavn] = useState('')
  const [skole, setSkole] = useState('')
  const [email, setEmail] = useState('')
  const [valgtefag, setValgtefag] = useState<string[]>([])
  const [fagprofil, setFagprofil] = useState<Record<string, string[]>>({})
  const [valgtforloeb, setValgtforloeb] = useState<string[]>([])
  const [gemt, setGemt] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const hentBruger = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setEmail(user.email || '')
      setNavn(user.user_metadata?.navn || '')
      setSkole(user.user_metadata?.skole || '')
      const fp = user.user_metadata?.fagprofil || {}
      setFagprofil(fp)
      setValgtefag(Object.keys(fp))
      setValgtforloeb(user.user_metadata?.forloeb || [])
    }
    hentBruger()
  }, [])

  const toggleFag = (fag: string) => {
    setValgtefag(prev =>
      prev.includes(fag) ? prev.filter(f => f !== fag) : [...prev, fag]
    )
    if (fagprofil[fag]) {
      const updated = { ...fagprofil }
      delete updated[fag]
      setFagprofil(updated)
    }
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

  const gem = async () => {
    setLoading(true)
    const { error } = await supabase.auth.updateUser({
      data: { navn, skole, fagprofil, forloeb: valgtforloeb }
    })
    setLoading(false)
    if (!error) {
      setGemt(true)
      setTimeout(() => setGemt(false), 3000)
    }
  }

  const initialer = navn
    ? navn.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : email.slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col min-h-screen fixed top-0 left-0">
        <div className="px-5 py-5 border-b border-gray-100">
          <Logo />
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <div className="px-3 py-1.5 text-xs font-medium text-gray-400 uppercase tracking-wider">Menu</div>
          <a href="/dashboard" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 text-sm">
            <span>📊</span> Oversigt
          </a>
          <a href="/kurser" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 text-sm">
            <span>🎓</span> Kurser
          </a>
          <a href="/kompetencer" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 text-sm">
            <span>📜</span> Mine beviser
          </a>
          <a href="/profil" className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium">
            <span>👤</span> Min profil
          </a>
        </nav>
        <div className="px-3 py-4 border-t border-gray-100">
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-xs font-semibold text-orange-600">
              {initialer}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-700 truncate">{navn || email}</p>
              <p className="text-xs text-gray-400 truncate">{email}</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 ml-56 px-8 py-8 max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Min profil</h2>
            <p className="text-gray-500 mt-1">Opdater dine fag, niveauer og forløb når din undervisning ændrer sig</p>
          </div>
          <button onClick={gem} disabled={loading}
            className="bg-blue-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-50 flex items-center gap-2">
            {loading ? 'Gemmer...' : gemt ? '✓ Gemt' : 'Gem ændringer'}
          </button>
        </div>

        {gemt && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-green-700 font-medium">✓ Din profil er opdateret — dine kurser er nu tilpasset</p>
          </div>
        )}

        {/* Grundoplysninger */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Grundoplysninger</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Navn</label>
              <input type="text" value={navn} onChange={(e) => setNavn(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Skole</label>
              <input type="text" value={skole} onChange={(e) => setSkole(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
              <input type="email" value={email} disabled
                className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
            </div>
          </div>
        </div>

        {/* Fag */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Mine fag</h3>
          <p className="text-xs text-gray-400 mb-4">Vælg alle fag du underviser i</p>
          <div className="grid grid-cols-3 gap-2">
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

        {/* Niveauer */}
        {valgtefag.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Mine niveauer</h3>
            <p className="text-xs text-gray-400 mb-4">Vælg alle niveauer for hvert fag</p>
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
        )}

        {/* Forløb */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Mine forløb</h3>
          <p className="text-xs text-gray-400 mb-4">Vælg alle forløb du underviser på</p>
          <div className="grid grid-cols-2 gap-2">
            {FORLOEB.map((forloeb) => (
              <button key={forloeb.id} type="button" onClick={() => toggleForloeb(forloeb.id)}
                className={`text-left px-4 py-3 rounded-xl border transition-all ${
                  valgtforloeb.includes(forloeb.id)
                    ? 'bg-blue-900 text-white border-blue-900'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                }`}>
                <span className="font-medium text-sm block">{forloeb.label}</span>
                <span className={`text-xs ${valgtforloeb.includes(forloeb.id) ? 'text-blue-200' : 'text-gray-400'}`}>
                  {forloeb.beskrivelse}
                </span>
              </button>
            ))}
          </div>
        </div>

        <button onClick={gem} disabled={loading}
          className="w-full bg-blue-900 text-white py-3 rounded-xl text-sm font-medium hover:bg-blue-800 disabled:opacity-50">
          {loading ? 'Gemmer...' : gemt ? '✓ Profil gemt' : 'Gem ændringer'}
        </button>
      </main>
    </div>
  )
}
