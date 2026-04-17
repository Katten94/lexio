'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Spoergsmaal {
  id: number
  spoergsmaal: string
  svar: string[]
  korrekt: number
  forklaring: string
}

interface Props {
  kursusId: string
  modulId: number
  spoergsmaal: Spoergsmaal[]
  erSidste: boolean
  userId: string
}

export default function QuizClient({ kursusId, modulId, spoergsmaal, erSidste, userId }: Props) {
  const router = useRouter()
  const [aktivt, setAktivt] = useState(0)
  const [valgt, setValgt] = useState<number | null>(null)
  const [bekraeftet, setBekraeftet] = useState(false)
  const [svar, setSvar] = useState<boolean[]>([])
  const [faerdig, setFaerdig] = useState(false)
  const [gemmer, setGemmer] = useState(false)

  const nuvaerende = spoergsmaal[aktivt]
  const antalRigtigt = svar.filter(Boolean).length
  const procentRigtigt = Math.round((antalRigtigt / spoergsmaal.length) * 100)
  const bestaaet = procentRigtigt >= 60

  const bekraeft = () => {
    if (valgt === null) return
    setBekraeftet(true)
    setSvar(prev => [...prev, valgt === nuvaerende.korrekt])
  }

  const naeste = async () => {
    if (aktivt < spoergsmaal.length - 1) {
      setAktivt(prev => prev + 1)
      setValgt(null)
      setBekraeftet(false)
    } else {
      setFaerdig(true)
      if (bestaaet) {
        setGemmer(true)
        try {
          await fetch('/api/fremgang', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ kursus_id: parseInt(kursusId), modul_id: modulId, gennemfoert: true })
          })
        } catch (e) { console.error(e) }
        setGemmer(false)
      }
    }
  }

  if (faerdig) {
    return (
      <div className="rounded-lg overflow-hidden"
        style={{ backgroundColor: 'white', border: `1px solid ${bestaaet ? '#BBF7D0' : '#FECACA'}` }}>
        <div className="px-6 py-4"
          style={{ backgroundColor: bestaaet ? '#F0FDF4' : '#FEF2F2', borderBottom: `1px solid ${bestaaet ? '#BBF7D0' : '#FECACA'}` }}>
          <p className="font-bold" style={{ fontSize: '15px', color: '#111827', fontFamily: 'Arial' }}>
            {bestaaet ? '🎉 Godt klaret!' : '📚 Ikke helt i mål endnu'}
          </p>
        </div>
        <div className="px-6 py-6 text-center">
          <p style={{ fontSize: '36px', fontWeight: '700', color: '#111827', fontFamily: 'Arial', lineHeight: 1 }}>
            {procentRigtigt}%
          </p>
          <p className="text-xs mt-1 mb-1" style={{ color: '#6B7280', fontFamily: 'Arial' }}>
            {antalRigtigt} ud af {spoergsmaal.length} rigtige svar
          </p>
          <p className="text-xs mb-6" style={{ color: '#9CA3AF', fontFamily: 'Arial' }}>
            {bestaaet ? 'Modulet er markeret som gennemført' : 'Du skal have mindst 60% for at bestå'}
          </p>
          {bestaaet ? (
            erSidste ? (
              <button onClick={() => router.push(`/kurser/${kursusId}/gennemfoert`)}
                className="px-6 py-2.5 rounded-lg text-sm font-medium"
                style={{ backgroundColor: '#0F2A5E', color: 'white', fontFamily: 'Arial' }}>
                {gemmer ? 'Gemmer...' : 'Hent dine materialer →'}
              </button>
            ) : (
              <button onClick={() => router.push(`/kurser/${kursusId}/modul/${modulId + 1}`)}
                className="px-6 py-2.5 rounded-lg text-sm font-medium"
                style={{ backgroundColor: '#0F2A5E', color: 'white', fontFamily: 'Arial' }}>
                Næste modul →
              </button>
            )
          ) : (
            <button onClick={() => { setAktivt(0); setValgt(null); setBekraeftet(false); setSvar([]); setFaerdig(false) }}
              className="px-6 py-2.5 rounded-lg text-sm font-medium"
              style={{ backgroundColor: '#0F2A5E', color: 'white', fontFamily: 'Arial' }}>
              Prøv igen
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg overflow-hidden"
      style={{ backgroundColor: 'white', border: '1px solid #E5E7EB' }}>

      {/* Header — guld accent */}
      <div className="px-5 py-3 flex items-center justify-between"
        style={{ backgroundColor: '#0F2A5E', borderBottom: '3px solid #F5C842' }}>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {spoergsmaal.map((_, i) => (
            <div key={i}
              style={{
                width: '8px', height: '8px', borderRadius: '50%',
                backgroundColor: i < svar.length
                  ? (svar[i] ? '#F5C842' : '#EF4444')
                  : i === aktivt
                    ? 'rgba(255,255,255,0.9)'
                    : 'rgba(255,255,255,0.25)'
              }} />
          ))}
        </div>
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', fontFamily: 'Arial' }}>
          {aktivt + 1} af {spoergsmaal.length}
        </span>
      </div>

      {/* Body */}
      <div className="px-6 py-5">

        {/* Fremgangsbar */}
        <div className="w-full h-1 rounded-full mb-5" style={{ backgroundColor: '#E5E7EB' }}>
          <div className="h-1 rounded-full transition-all"
            style={{ width: `${(aktivt / spoergsmaal.length) * 100}%`, backgroundColor: '#0F2A5E' }} />
        </div>

        {/* Spørgsmål */}
        <p className="font-bold mb-5"
          style={{ fontSize: '15px', color: '#111827', fontFamily: 'Arial', lineHeight: '1.5' }}>
          {nuvaerende.spoergsmaal}
        </p>

        {/* Svarmuligheder */}
        <div className="flex flex-col gap-2 mb-5">
          {nuvaerende.svar.map((s, i) => {
            const bogstav = String.fromCharCode(65 + i)
            let bgColor = '#F9FAFB'
            let borderColor = '#E5E7EB'
            let textColor = '#374151'
            let prefixBg = '#E5E7EB'
            let prefixColor = '#6B7280'

            if (bekraeftet) {
              if (i === nuvaerende.korrekt) {
                bgColor = '#F0FDF4'; borderColor = '#86EFAC'; textColor = '#166534'
                prefixBg = '#86EFAC'; prefixColor = '#166534'
              } else if (i === valgt && valgt !== nuvaerende.korrekt) {
                bgColor = '#FEF2F2'; borderColor = '#FECACA'; textColor = '#991B1B'
                prefixBg = '#FECACA'; prefixColor = '#991B1B'
              }
            } else if (valgt === i) {
              bgColor = '#EFF6FF'; borderColor = '#0F2A5E'; textColor = '#0F2A5E'
              prefixBg = '#0F2A5E'; prefixColor = 'white'
            }

            return (
              <button key={i}
                onClick={() => !bekraeftet && setValgt(i)}
                disabled={bekraeftet}
                className="text-left px-4 py-3 rounded-lg text-sm flex items-center gap-3"
                style={{ backgroundColor: bgColor, border: `1px solid ${borderColor}`, color: textColor, fontFamily: 'Arial', cursor: bekraeftet ? 'default' : 'pointer' }}>
                <span className="flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: prefixBg, color: prefixColor }}>
                  {bogstav}
                </span>
                {s}
              </button>
            )
          })}
        </div>

        {/* Forklaring */}
        {bekraeftet && (
          <div className="rounded-lg p-4 mb-5"
            style={{
              backgroundColor: valgt === nuvaerende.korrekt ? '#F0FDF4' : '#FEF2F2',
              border: `1px solid ${valgt === nuvaerende.korrekt ? '#BBF7D0' : '#FECACA'}`
            }}>
            <p className="text-xs font-bold mb-1"
              style={{ color: valgt === nuvaerende.korrekt ? '#166534' : '#991B1B', fontFamily: 'Arial' }}>
              {valgt === nuvaerende.korrekt ? '✓ Korrekt!' : '✗ Ikke helt rigtigt'}
            </p>
            <p className="text-xs" style={{ color: '#374151', fontFamily: 'Arial', lineHeight: '1.5' }}>
              {nuvaerende.forklaring}
            </p>
          </div>
        )}

        {/* Knap */}
        <div className="flex justify-end">
          {!bekraeftet ? (
            <button onClick={bekraeft} disabled={valgt === null}
              className="px-5 py-2 rounded-lg text-sm font-medium"
              style={{
                backgroundColor: valgt !== null ? '#0F2A5E' : '#E5E7EB',
                color: valgt !== null ? 'white' : '#9CA3AF',
                fontFamily: 'Arial',
                cursor: valgt !== null ? 'pointer' : 'not-allowed',
              }}>
              Bekræft svar
            </button>
          ) : (
            <button onClick={naeste}
              className="px-5 py-2 rounded-lg text-sm font-medium"
              style={{ backgroundColor: '#0F2A5E', color: 'white', fontFamily: 'Arial' }}>
              {aktivt < spoergsmaal.length - 1 ? 'Næste spørgsmål →' : 'Se resultat →'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}