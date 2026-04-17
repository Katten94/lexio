'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

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

interface Props {
  navn: string
  email: string
  fagprofil: Record<string, string[]>
  forloeb: string[]
}

export default function ProfilClient({ navn, email, fagprofil: initFagprofil, forloeb: initForloeb }: Props) {
  const [fagprofil, setFagprofil] = useState<Record<string, string[]>>(initFagprofil)
  const [forloeb, setForloeb] = useState<string[]>(initForloeb)
  const [gemmer, setGemmer] = useState(false)
  const [gemt, setGemt] = useState(false)

  const toggleNiveau = (fag: string, niveau: string) => {
    setFagprofil(prev => {
      const nuv = prev[fag] || []
      const nyNiveauer = nuv.includes(niveau)
        ? nuv.filter(n => n !== niveau)
        : [...nuv, niveau]
      if (nyNiveauer.length === 0) {
        const { [fag]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [fag]: nyNiveauer }
    })
  }

  const toggleForloeb = (f: string) => {
    setForloeb(prev =>
      prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]
    )
  }

  const gem = async () => {
    setGemmer(true)
    const supabase = createClient()
    await supabase.auth.updateUser({
      data: { fagprofil, forloeb }
    })
    setGemmer(false)
    setGemt(true)
    setTimeout(() => setGemt(false), 3000)
  }

  return (
    <div className="flex flex-col gap-3">

      {/* Navn */}
      <div className="rounded-lg px-5 py-4"
        style={{ backgroundColor: 'white', border: '1px solid #E5E7EB' }}>
        <p className="text-xs mb-1"
          style={{ color: '#9CA3AF', fontFamily: 'Arial', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
          Navn
        </p>
        <p className="font-medium" style={{ fontSize: '13px', color: '#111827', fontFamily: 'Arial' }}>
          {navn || '—'}
        </p>
      </div>

      {/* Email */}
      <div className="rounded-lg px-5 py-4"
        style={{ backgroundColor: 'white', border: '1px solid #E5E7EB' }}>
        <p className="text-xs mb-1"
          style={{ color: '#9CA3AF', fontFamily: 'Arial', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
          Email
        </p>
        <p className="font-medium" style={{ fontSize: '13px', color: '#111827', fontFamily: 'Arial' }}>
          {email}
        </p>
      </div>

      {/* Fag og niveauer */}
      <div className="rounded-lg px-5 py-4"
        style={{ backgroundColor: 'white', border: '1px solid #E5E7EB' }}>
        <p className="text-xs mb-4"
          style={{ color: '#9CA3AF', fontFamily: 'Arial', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
          Fag og niveauer
        </p>
        <div className="flex flex-col gap-4">
          {Object.entries(ALLE_FAG).map(([fag, niveauer]) => {
            const stil = FAG_STIL[fag] || { bg: '#F9FAFB', tekst: '#374151' }
            const valgteNiveauer = fagprofil[fag] || []
            return (
              <div key={fag}>
                <p className="text-xs font-semibold mb-2"
                  style={{ color: '#374151', fontFamily: 'Arial' }}>
                  {fag}
                </p>
                <div className="flex flex-wrap gap-2">
                  {niveauer.map(niveau => {
                    const valgt = valgteNiveauer.includes(niveau)
                    return (
                      <button key={niveau}
                        onClick={() => toggleNiveau(fag, niveau)}
                        className="text-xs font-medium px-3 py-1 rounded"
                        style={{
                          backgroundColor: valgt ? stil.tekst : stil.bg,
                          color: valgt ? 'white' : stil.tekst,
                          fontFamily: 'Arial',
                          border: `1px solid ${stil.tekst}`,
                          cursor: 'pointer',
                        }}>
                        {niveau}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Forløb */}
      <div className="rounded-lg px-5 py-4"
        style={{ backgroundColor: 'white', border: '1px solid #E5E7EB' }}>
        <p className="text-xs mb-4"
          style={{ color: '#9CA3AF', fontFamily: 'Arial', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
          Forløb
        </p>
        <div className="flex flex-wrap gap-2">
          {ALLE_FORLOEB.map(f => {
            const valgt = forloeb.includes(f)
            return (
              <button key={f}
                onClick={() => toggleForloeb(f)}
                className="text-xs font-medium px-3 py-1 rounded"
                style={{
                  backgroundColor: valgt ? '#0F2A5E' : 'white',
                  color: valgt ? 'white' : '#374151',
                  fontFamily: 'Arial',
                  border: `1px solid ${valgt ? '#0F2A5E' : '#E5E7EB'}`,
                  cursor: 'pointer',
                }}>
                {f}
              </button>
            )
          })}
        </div>
      </div>

      {/* Gem */}
      <div className="flex items-center gap-3">
        <button onClick={gem} disabled={gemmer}
          className="px-5 py-2.5 rounded-lg text-sm font-medium"
          style={{ backgroundColor: '#0F2A5E', color: 'white', fontFamily: 'Arial', cursor: gemmer ? 'not-allowed' : 'pointer' }}>
          {gemmer ? 'Gemmer...' : 'Gem ændringer'}
        </button>
        {gemt && (
          <p className="text-xs font-medium" style={{ color: '#166534', fontFamily: 'Arial' }}>
            ✓ Gemt
          </p>
        )}
      </div>

    </div>
  )
}