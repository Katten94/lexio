'use client'

import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

const KURSER = [
  { id: 1, fag: 'Afsætning', titel: 'Markedsanalyse og forbrugeradfærd', beskrivelse: 'Lær at analysere markeder og forbrugeradfærd med udgangspunkt i Kotlers købsprocessmodel, segmentering og SWOT. Kurset er forankret i bekendtgørelsen for Afsætning A.', niveauer: ['A', 'B'], moduler: 6, timer: 2.5 },
  { id: 2, fag: 'Afsætning', titel: 'Prissætning og prisstrategi', beskrivelse: 'Gennemgang af prisstrategier og prissætningsmodeller med aktuelle cases fra dansk erhvervsliv.', niveauer: ['A', 'B', 'C'], moduler: 5, timer: 2 },
  { id: 3, fag: 'Afsætning', titel: 'Digital markedsføring i praksis', beskrivelse: 'Opdater din viden om SEO, content marketing og sociale medier med cases fra LEGO og Novo Nordisk.', niveauer: ['A', 'B'], moduler: 5, timer: 2 },
  { id: 4, fag: 'Salg og service', titel: 'Salgspsykologi og kundehåndtering', beskrivelse: 'Bliv opdateret på moderne salgsteknikker, kundetyper og reklamationshåndtering med cases fra dansk detailhandel.', niveauer: ['GF2', 'HF1', 'HF2'], moduler: 5, timer: 2 },
  { id: 5, fag: 'Salg og service', titel: 'Reklamation og svær kundedialog', beskrivelse: 'Håndter svære kundesituationer professionelt med cases fra Elgiganten og teleselskaber.', niveauer: ['HF1', 'HF2'], moduler: 4, timer: 1.5 },
  { id: 6, fag: 'Salg og service', titel: 'Digitalt salg og e-handel', beskrivelse: 'Forstå det digitale salgslandskab og e-handelsplatforme med aktuelle danske cases.', niveauer: ['GF2', 'HF1'], moduler: 4, timer: 1.5 },
  { id: 7, fag: 'Erhvervsøkonomi', titel: 'Budgettering og regnskabsforståelse', beskrivelse: 'Styrk din undervisning i resultatopgørelse, budgettering og likviditetsstyring med aktuelle SMV-cases.', niveauer: ['A', 'B'], moduler: 6, timer: 2 },
  { id: 8, fag: 'Erhvervsøkonomi', titel: 'Investeringsteori og finansiering', beskrivelse: 'Gennemgang af investeringsteorier og finansieringsformer med cases fra dansk erhvervsliv.', niveauer: ['A', 'B'], moduler: 5, timer: 2 },
]

const FAG_FARVER: Record<string, { bg: string; tekst: string }> = {
  'Afsætning':       { bg: '#EFF6FF', tekst: '#1E40AF' },
  'Salg og service': { bg: '#F0FDFA', tekst: '#0F766E' },
  'Erhvervsøkonomi': { bg: '#F0FDF4', tekst: '#166534' },
  'Kommunikation':   { bg: '#F5F3FF', tekst: '#5B21B6' },
  'Matematik':       { bg: '#FFFBEB', tekst: '#92400E' },
}

export default function KurserPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#F9FAFB' }}>
      <Sidebar />

      <main className="flex-1 ml-52 px-8 py-8">
        <div className="mb-6">
          <h1 className="font-bold mb-1" style={{ fontSize: '20px', color: '#111827', fontFamily: 'Arial' }}>
            Kurser for dig
          </h1>
          <p style={{ fontSize: '13px', color: '#6B7280', fontFamily: 'Arial' }}>
            Alle kurser — opdater din profil for at se relevante kurser
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {KURSER.map(k => {
            const farve = FAG_FARVER[k.fag] || { bg: '#F9FAFB', tekst: '#374151' }
            return (
              <div
                key={k.id}
                onClick={() => router.push(`/kurser/${k.id}`)}
                className="rounded-xl p-5 cursor-pointer"
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  transition: 'box-shadow 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: farve.bg, color: farve.tekst, fontFamily: 'Arial' }}>
                    {k.fag}
                  </span>
                  <span className="text-xs" style={{ color: '#9CA3AF', fontFamily: 'Arial' }}>
                    {k.timer} timer
                  </span>
                </div>

                <h2 className="font-semibold mb-2"
                  style={{ fontSize: '15px', color: '#111827', fontFamily: 'Arial', lineHeight: '1.4' }}>
                  {k.titel}
                </h2>

                <p className="text-sm mb-4"
                  style={{ color: '#6B7280', fontFamily: 'Arial', lineHeight: '1.5', fontSize: '13px' }}>
                  {k.beskrivelse}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {k.niveauer.map(n => (
                      <span key={n} className="text-xs px-2 py-0.5 rounded"
                        style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', color: '#6B7280', fontFamily: 'Arial' }}>
                        {n}
                      </span>
                    ))}
                    <span className="text-xs" style={{ color: '#9CA3AF', fontFamily: 'Arial' }}>
                      · {k.moduler} moduler
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="rounded-full" style={{ width: '80px', height: '4px', backgroundColor: '#E5E7EB' }}>
                      <div style={{ width: '0%', height: '100%', backgroundColor: '#0F2A5E', borderRadius: '9999px' }} />
                    </div>
                    <span className="text-xs" style={{ color: '#9CA3AF', fontFamily: 'Arial' }}>0%</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}