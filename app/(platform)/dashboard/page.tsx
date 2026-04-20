'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

const SENESTE_KURSER = [
  { id: 1, fag: 'Afsætning', titel: 'Markedsanalyse og forbrugeradfærd', niveauer: ['A', 'B'], moduler: 6, timer: 2.5 },
  { id: 4, fag: 'Salg og service', titel: 'Salgspsykologi og kundehåndtering', niveauer: ['GF2', 'HF1', 'HF2'], moduler: 5, timer: 2 },
  { id: 7, fag: 'Erhvervsøkonomi', titel: 'Budgettering og regnskabsforståelse', niveauer: ['A', 'B', 'C'], moduler: 5, timer: 2 },
]

const FAG_FARVER: Record<string, { bg: string; tekst: string }> = {
  'Afsætning':       { bg: '#EFF6FF', tekst: '#1E40AF' },
  'Salg og service': { bg: '#F0FDFA', tekst: '#0F766E' },
  'Erhvervsøkonomi': { bg: '#F0FDF4', tekst: '#166534' },
}

const TIPS = [
  { ikon: '📋', titel: 'Opdater din fagprofil', sub: 'Få kurser der matcher dine fag og niveauer præcist', href: '/profil' },
  { ikon: '📊', titel: 'Start dit første kursus', sub: 'Download PowerPoint og forberedelsesark klar til mandag', href: '/kurser' },
  { ikon: '🎓', titel: 'Tjen dit første bevis', sub: 'Gennemfør et kursus og få dokumentation for dit kompetenceløft', href: '/kompetencer' },
]

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [navn, setNavn] = useState('')
  const [dato, setDato] = useState('')

  useEffect(() => {
    const hent = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const n = user.user_metadata?.navn || user.email?.split('@')[0] || 'underviser'
      setNavn(n.charAt(0).toUpperCase() + n.slice(1).split(' ')[0])
    }
    hent()
    setDato(new Date().toLocaleDateString('da-DK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))
  }, [])

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#F9FAFB' }}>
      <Sidebar />

      <main className="flex-1 ml-52 px-8 py-8">
        {/* Begrænser bredden til maks 900px */}
        <div style={{ maxWidth: '900px' }}>

          {/* Hilsen */}
          <h1 className="font-bold mb-1" style={{ fontSize: '20px', color: '#111827', fontFamily: 'Arial' }}>
            God dag, {navn} 👋
          </h1>
          <p className="mb-5" style={{ fontSize: '12px', color: '#9CA3AF', fontFamily: 'Arial' }}>
            {dato}
          </p>

          {/* Navy banner */}
          <div className="rounded-xl px-6 py-5 mb-5 flex items-center justify-between"
            style={{ backgroundColor: '#0F2A5E' }}>
            <div>
              <h2 className="font-bold mb-1" style={{ fontSize: '15px', color: 'white', fontFamily: 'Arial' }}>
                Klar til at styrke din undervisning?
              </h2>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', fontFamily: 'Arial' }}>
                8 kurser klar — fagligt forankret i bekendtgørelsen
              </p>
            </div>
            <button onClick={() => router.push('/kurser')}
              className="font-bold text-xs px-4 py-2 rounded-lg flex-shrink-0 ml-6"
              style={{ backgroundColor: '#F5C842', color: '#0F2A5E', fontFamily: 'Arial' }}>
              Se alle kurser →
            </button>
          </div>

          {/* Statistik — 4 faste bokse */}
          <div className="flex gap-3 mb-6">
            {[
              { num: '8', lbl: 'Tilgængelige kurser', accent: true },
              { num: '0', lbl: 'Igangværende', accent: false },
              { num: '0', lbl: 'Gennemførte', accent: false },
              { num: '0', lbl: 'Materialer hentet', accent: false },
            ].map(({ num, lbl, accent }) => (
              <div key={lbl} className="rounded-xl px-4 py-4"
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderTop: accent ? '3px solid #F5C842' : '1px solid #E5E7EB',
                  width: '120px',
                  flexShrink: 0,
                }}>
                <p className="font-bold mb-1" style={{ fontSize: '28px', color: '#0F2A5E', fontFamily: 'Arial', lineHeight: 1 }}>{num}</p>
                <p style={{ fontSize: '11px', color: '#9CA3AF', fontFamily: 'Arial' }}>{lbl}</p>
              </div>
            ))}
          </div>

          {/* To kolonner */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

            {/* Venstre — anbefalede kurser */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold" style={{ fontSize: '13px', color: '#111827', fontFamily: 'Arial' }}>
                  Anbefalede kurser
                </h2>
                <button onClick={() => router.push('/kurser')}
                  style={{ fontSize: '11px', color: '#0F2A5E', fontWeight: '600', fontFamily: 'Arial', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Se alle →
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {SENESTE_KURSER.map(k => {
                  const farve = FAG_FARVER[k.fag] || { bg: '#F9FAFB', tekst: '#374151' }
                  return (
                    <div key={k.id}
                      onClick={() => router.push(`/kurser/${k.id}`)}
                      className="rounded-xl p-4 cursor-pointer"
                      style={{ backgroundColor: 'white', border: '1px solid #E5E7EB' }}
                      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)')}
                      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full inline-block mb-2"
                        style={{ backgroundColor: farve.bg, color: farve.tekst, fontFamily: 'Arial' }}>
                        {k.fag}
                      </span>
                      <p className="font-semibold mb-2" style={{ fontSize: '13px', color: '#111827', fontFamily: 'Arial', lineHeight: '1.3' }}>
                        {k.titel}
                      </p>
                      <div className="flex items-center justify-between">
                        <p style={{ fontSize: '11px', color: '#9CA3AF', fontFamily: 'Arial' }}>
                          {k.niveauer.join(' · ')} · {k.moduler} moduler
                        </p>
                        <p style={{ fontSize: '11px', color: '#9CA3AF', fontFamily: 'Arial' }}>
                          {k.timer} t
                        </p>
                      </div>
                      <div className="mt-2 rounded-full" style={{ height: '3px', backgroundColor: '#F3F4F6' }} />
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Højre — kom i gang */}
            <div>
              <h2 className="font-semibold mb-3" style={{ fontSize: '13px', color: '#111827', fontFamily: 'Arial' }}>
                Kom godt i gang
              </h2>
              <div className="flex flex-col gap-2">
                {TIPS.map(({ ikon, titel, sub, href }) => (
                  <div key={titel}
                    onClick={() => router.push(href)}
                    className="rounded-xl p-4 cursor-pointer flex items-start gap-3"
                    style={{ backgroundColor: 'white', border: '1px solid #E5E7EB' }}
                    onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)')}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}>
                    <div className="rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ width: '34px', height: '34px', backgroundColor: '#EFF6FF', fontSize: '16px' }}>
                      {ikon}
                    </div>
                    <div>
                      <p className="font-semibold mb-1" style={{ fontSize: '13px', color: '#111827', fontFamily: 'Arial' }}>{titel}</p>
                      <p style={{ fontSize: '11px', color: '#9CA3AF', fontFamily: 'Arial', lineHeight: '1.4' }}>{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}