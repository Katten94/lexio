'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

const KURSUS_INFO: Record<string, { titel: string; fag: string }> = {
  "1": { titel: "Markedsanalyse og forbrugeradfærd", fag: "Afsætning" },
  "2": { titel: "Prissætning og prisstrategi", fag: "Afsætning" },
  "3": { titel: "Digital markedsføring i praksis", fag: "Afsætning" },
  "4": { titel: "Salgspsykologi og kundehåndtering", fag: "Salg og service" },
  "7": { titel: "Budgettering og regnskabsforståelse", fag: "Erhvervsøkonomi" },
  "10": { titel: "Digital kommunikation og branding", fag: "Kommunikation" },
  "22": { titel: "AI i den merkantile undervisning", fag: "Didaktik / Pædagogik" },
}

function downloadFil(base64: string, filnavn: string, mimeType: string) {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  const blob = new Blob([bytes], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filnavn
  a.click()
  URL.revokeObjectURL(url)
}

export default function GennemfoertPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: kursusId } = use(params)
  const router = useRouter()
  const kursus = KURSUS_INFO[kursusId]

  const [status, setStatus] = useState<'loading' | 'klar' | 'fejl'>('loading')
  const [fejlBesked, setFejlBesked] = useState('')
  const [pptxData, setPptxData] = useState<{ base64: string; filnavn: string } | null>(null)
  const [docxData, setDocxData] = useState<{ base64: string; filnavn: string } | null>(null)
  const [dlPptx, setDlPptx] = useState(false)
  const [dlDocx, setDlDocx] = useState(false)

  const generer = async () => {
    setStatus('loading')
    setFejlBesked('')
    try {
      const res = await fetch('/api/generer-pptx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kursus_id: parseInt(kursusId) })
      })
      const raw = await res.text()
      const data = JSON.parse(raw)
      if (data.success && data.pptx && data.docx) {
        setPptxData(data.pptx)
        setDocxData(data.docx)
        setStatus('klar')
      } else {
        setFejlBesked(data.error || 'Uventet svar fra serveren')
        setStatus('fejl')
      }
    } catch (e: any) {
      setFejlBesked(`Fejl: ${e.message}`)
      setStatus('fejl')
    }
  }

  useEffect(() => { generer() }, [kursusId])

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#F9FAFB' }}>
      <Sidebar />

      <main className="flex-1 ml-52 px-10 py-8 max-w-3xl">

        {/* Tillykke boks */}
        <div className="rounded-lg p-8 mb-6 text-center"
          style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
          <div className="text-4xl mb-4">🎉</div>
          <h1 className="font-bold mb-2"
            style={{ fontSize: '20px', color: '#111827', fontFamily: 'Arial' }}>
            Kursus gennemført og bestået!
          </h1>
          <p className="mb-4"
            style={{ fontSize: '13px', color: '#6B7280', fontFamily: 'Arial' }}>
            {kursus?.titel || `Kursus ${kursusId}`}
          </p>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium"
            style={{ backgroundColor: 'white', border: '1px solid #BBF7D0', color: '#166534', fontFamily: 'Arial' }}>
            ✓ Bestået · {new Date().toLocaleDateString('da-DK', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>

        {/* Materialer */}
        <p className="font-semibold mb-3"
          style={{ fontSize: '13px', color: '#111827', fontFamily: 'Arial' }}>
          Din undervisningsmaterialepakke
        </p>
        <p className="text-xs mb-5"
          style={{ color: '#6B7280', fontFamily: 'Arial' }}>
          Fagligt forankret i bekendtgørelsen for {kursus?.fag} — klar til direkte brug i undervisningen
        </p>

        {status === 'loading' && (
          <div className="rounded-lg p-8 text-center"
            style={{ backgroundColor: 'white', border: '1px solid #E5E7EB' }}>
            <div className="w-8 h-8 border-4 border-gray-200 rounded-full animate-spin mx-auto mb-3"
              style={{ borderTopColor: '#0F2A5E' }}></div>
            <p className="text-xs" style={{ color: '#9CA3AF', fontFamily: 'Arial' }}>
              Sammensætter dine undervisningsmaterialer...
            </p>
          </div>
        )}

        {status === 'fejl' && (
          <div className="rounded-lg p-5"
            style={{ backgroundColor: 'white', border: '1px solid #E5E7EB' }}>
            <p className="text-sm font-medium mb-1" style={{ color: '#111827', fontFamily: 'Arial' }}>
              Noget gik galt
            </p>
            <p className="text-xs mb-3 font-mono" style={{ color: '#6B7280' }}>{fejlBesked}</p>
            <button onClick={generer}
              className="text-xs font-medium px-3 py-1.5 rounded-md"
              style={{ backgroundColor: '#0F2A5E', color: 'white', fontFamily: 'Arial' }}>
              Prøv igen
            </button>
          </div>
        )}

        {status === 'klar' && pptxData && docxData && (
          <div className="flex flex-col gap-2">

            <div className="rounded-lg px-5 py-4 flex items-center justify-between"
              style={{ backgroundColor: 'white', border: '1px solid #E5E7EB' }}>
              <div className="flex-1">
                <p className="font-medium mb-0.5"
                  style={{ fontSize: '13px', color: '#111827', fontFamily: 'Arial' }}>
                  📊 Præsentation til eleverne
                </p>
                <p className="text-xs" style={{ color: '#9CA3AF', fontFamily: 'Arial' }}>
                  13 slides · Alle modeller visuelt forklaret · Case gennemgående
                </p>
              </div>
              <button
                onClick={() => {
                  setDlPptx(true)
                  downloadFil(pptxData.base64, pptxData.filnavn, 'application/vnd.openxmlformats-officedocument.presentationml.presentation')
                  setTimeout(() => setDlPptx(false), 2000)
                }}
                disabled={dlPptx}
                className="text-xs font-medium px-4 py-2 rounded-md flex-shrink-0 ml-4"
                style={{ backgroundColor: '#0F2A5E', color: 'white', fontFamily: 'Arial' }}>
                {dlPptx ? 'Downloader...' : '⬇ Download .pptx'}
              </button>
            </div>

            <div className="rounded-lg px-5 py-4 flex items-center justify-between"
              style={{ backgroundColor: 'white', border: '1px solid #E5E7EB' }}>
              <div className="flex-1">
                <p className="font-medium mb-0.5"
                  style={{ fontSize: '13px', color: '#111827', fontFamily: 'Arial' }}>
                  📋 Forberedelsesark til underviseren
                </p>
                <p className="text-xs" style={{ color: '#9CA3AF', fontFamily: 'Arial' }}>
                  Tidsoversigt · Didaktiske tips · Differentiering · Vurdering
                </p>
              </div>
              <button
                onClick={() => {
                  setDlDocx(true)
                  downloadFil(docxData.base64, docxData.filnavn, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
                  setTimeout(() => setDlDocx(false), 2000)
                }}
                disabled={dlDocx}
                className="text-xs font-medium px-4 py-2 rounded-md flex-shrink-0 ml-4"
                style={{ backgroundColor: '#0F2A5E', color: 'white', fontFamily: 'Arial' }}>
                {dlDocx ? 'Downloader...' : '⬇ Download .docx'}
              </button>
            </div>

          </div>
        )}

        {/* Knapper */}
        <div className="flex gap-3 mt-6">
          <button onClick={() => router.push('/dashboard')}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium"
            style={{ backgroundColor: '#0F2A5E', color: 'white', fontFamily: 'Arial' }}>
            Tilbage til oversigt
          </button>
          <button onClick={() => router.push('/kurser')}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium"
            style={{ backgroundColor: 'white', border: '1px solid #E5E7EB', color: '#374151', fontFamily: 'Arial' }}>
            Se alle kurser
          </button>
        </div>

      </main>
    </div>
  )
}