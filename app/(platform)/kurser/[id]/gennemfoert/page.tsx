'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'

const KURSUS_INFO: Record<string, { titel: string; fag: string; niveau: string; forloeb: string }> = {
  "1": { titel: "Markedsanalyse og forbrugeradfærd", fag: "Afsætning", niveau: "A", forloeb: "hf1" },
  "2": { titel: "Prissætning og prisstrategi", fag: "Afsætning", niveau: "A", forloeb: "hf1" },
  "3": { titel: "Digital markedsføring i praksis", fag: "Afsætning", niveau: "A", forloeb: "hf1" },
  "4": { titel: "Salgspsykologi og kundehåndtering", fag: "Salg og service", niveau: "HF1", forloeb: "hf1" },
  "7": { titel: "Budgettering og regnskabsforståelse", fag: "Erhvervsøkonomi", niveau: "B", forloeb: "hf1" },
  "10": { titel: "Digital kommunikation og branding", fag: "Kommunikation", niveau: "HF1", forloeb: "hf1" },
  "22": { titel: "AI i den merkantile undervisning", fag: "Didaktik / Pædagogik", niveau: "Alle niveauer", forloeb: "hf1" },
}

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

export default function GennemfoertPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id: kursusId } = use(params)
  const router = useRouter()
  const kursus = KURSUS_INFO[kursusId]

  const [status, setStatus] = useState<'loading' | 'klar' | 'fejl'>('loading')
  const [pptxBase64, setPptxBase64] = useState<string | null>(null)
  const [pptxFilnavn, setPptxFilnavn] = useState<string>('')
  const [downloader, setDownloader] = useState(false)

  const generer = async () => {
    if (!kursus) return
    setStatus('loading')
    try {
      const res = await fetch('/api/generer-pptx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kursus_id: parseInt(kursusId),
          fag: kursus.fag,
          niveau: kursus.niveau,
          forloeb: kursus.forloeb
        })
      })
      const data = await res.json()
      if (data.success) {
        setPptxBase64(data.base64)
        setPptxFilnavn(data.filnavn)
        setStatus('klar')
      } else {
        setStatus('fejl')
      }
    } catch {
      setStatus('fejl')
    }
  }

  useEffect(() => {
    generer()
  }, [kursusId])

  const downloadPptx = () => {
    if (!pptxBase64) return
    setDownloader(true)
    const binary = atob(pptxBase64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    const blob = new Blob([bytes], {
      type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = pptxFilnavn
    a.click()
    URL.revokeObjectURL(url)
    setTimeout(() => setDownloader(false), 2000)
  }

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
          <a href="/kurser" className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium">
            <span>🎓</span> Kurser
          </a>
          <a href="/kompetencer" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 text-sm">
            <span>📜</span> Mine beviser
          </a>
          <a href="/profil" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 text-sm">
            <span>👤</span> Min profil
          </a>
        </nav>
      </aside>

      <main className="flex-1 ml-56 px-8 py-8 max-w-3xl">

        {/* Tillykke banner */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8 mb-8 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Kursus gennemført og bestået!</h2>
          <p className="text-gray-600 mb-3">{kursus?.titel}</p>
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-green-200">
            <span className="text-green-600 text-sm font-medium">✓ Bestået</span>
            <span className="text-gray-300">·</span>
            <span className="text-gray-500 text-sm">
              {new Date().toLocaleDateString('da-DK', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Materialepakke */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Din undervisningsmaterialepakke</h3>
          <p className="text-sm text-gray-500 mb-6">
            Fagligt forankret i bekendtgørelsen for {kursus?.fag} — klar til direkte brug i undervisningen
          </p>

          {status === 'loading' && (
            <div className="text-center py-10">
              <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-400 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500 text-sm">Sammensætter dine undervisningsmaterialer...</p>
            </div>
          )}

          {status === 'fejl' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <p className="text-red-600 text-sm mb-3">Noget gik galt — prøv igen</p>
              <button onClick={generer}
                className="text-xs text-red-700 bg-red-100 px-3 py-1.5 rounded-lg hover:bg-red-200">
                Prøv igen
              </button>
            </div>
          )}

          {status === 'klar' && pptxBase64 && (
            <div className="space-y-4">

              {/* PowerPoint kort */}
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📊</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 mb-0.5">Præsentation til undervisningen</p>
                  <p className="text-xs text-gray-500">
                    7 slides · Kotlers model · SWOT-analyse · Case · Gruppeøvelse · Diskussion
                  </p>
                </div>
                <button
                  onClick={downloadPptx}
                  disabled={downloader}
                  className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-50 flex items-center gap-2 flex-shrink-0"
                >
                  {downloader ? '⏳' : '⬇'} {downloader ? 'Downloader...' : 'Download .pptx'}
                </button>
              </div>

              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p className="text-xs text-blue-700">
                  <span className="font-medium">Præsentationen indeholder:</span> Visuelle modeller (Kotler + SWOT), aktuel dansk erhvervscase, gruppeøvelse og diskussionsspørgsmål — struktureret efter Hiim og Hippes didaktiske relationsmodel.
                </p>
              </div>

            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button onClick={() => router.push('/dashboard')}
            className="flex-1 bg-blue-900 text-white py-3 rounded-xl font-medium hover:bg-blue-800">
            Tilbage til oversigt
          </button>
          <button onClick={() => router.push('/kurser')}
            className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50">
            Se alle kurser
          </button>
        </div>

      </main>
    </div>
  )
}