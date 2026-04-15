import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const kurser = [
  {
    id: 1,
    titel: "Markedsanalyse og forbrugeradfærd",
    fag: "Afsætning A",
    niveau: "GF2 · HF1",
    moduler: 6,
    varighed: "2,5 timer",
    farve: "blue",
  },
  {
    id: 2,
    titel: "Salgspsykologi og kundehåndtering",
    fag: "Salg og service",
    niveau: "HF1",
    moduler: 5,
    varighed: "2 timer",
    farve: "teal",
  },
  {
    id: 3,
    titel: "Budgettering og regnskabsforståelse",
    fag: "Erhvervsøkonomi B",
    niveau: "GF2",
    moduler: 5,
    varighed: "2 timer",
    farve: "green",
  },
  {
    id: 4,
    titel: "Digital kommunikation og branding",
    fag: "Kommunikation",
    niveau: "GF2",
    moduler: 4,
    varighed: "1,5 timer",
    farve: "purple",
  },
  {
    id: 5,
    titel: "AI i den merkantile undervisning",
    fag: "Didaktik",
    niveau: "Alle niveauer",
    moduler: 4,
    varighed: "1,5 timer",
    farve: "amber",
  },
]

const farveKlasser: Record<string, { bg: string; text: string; badge: string; badgeText: string }> = {
  blue:   { bg: "bg-blue-50",   text: "text-blue-700",   badge: "bg-blue-100",   badgeText: "text-blue-700" },
  teal:   { bg: "bg-teal-50",   text: "text-teal-700",   badge: "bg-teal-100",   badgeText: "text-teal-700" },
  green:  { bg: "bg-green-50",  text: "text-green-700",  badge: "bg-green-100",  badgeText: "text-green-700" },
  purple: { bg: "bg-purple-50", text: "text-purple-700", badge: "bg-purple-100", badgeText: "text-purple-700" },
  amber:  { bg: "bg-amber-50",  text: "text-amber-700",  badge: "bg-amber-100",  badgeText: "text-amber-700" },
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect('/login') }

  const initialer = user.email?.slice(0, 2).toUpperCase() ?? "??"

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col min-h-screen fixed top-0 left-0">
        <div className="px-5 py-5 border-b border-gray-100">
          <h1 className="text-lg font-semibold">
            <span className="text-blue-600">Edu</span>fino
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">EUD Merkantil</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <div className="px-3 py-1.5 text-xs font-medium text-gray-400 uppercase tracking-wider">
            Menu
          </div>
          <a href="/dashboard" className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium">
            <span>📊</span> Oversigt
          </a>
          <a href="/dashboard/kurser" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 text-sm">
            <span>🎓</span> Kurser
          </a>
          <a href="/dashboard/kompetencer" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 text-sm">
            <span>📜</span> Mine beviser
          </a>
        </nav>

        <div className="px-3 py-4 border-t border-gray-100">
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-700">
              {initialer}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-600 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Hovedindhold */}
      <main className="flex-1 ml-56 px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900">God dag 👋</h2>
          <p className="text-gray-500 mt-1">Her er din faglige udvikling på Edufino</p>
        </div>

        {/* Statistik */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Igangværende kurser</p>
            <p className="text-3xl font-semibold text-gray-900">0</p>
            <p className="text-xs text-gray-400 mt-1">Start dit første kursus</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Gennemførte kurser</p>
            <p className="text-3xl font-semibold text-gray-900">0</p>
            <p className="text-xs text-gray-400 mt-1">Ingen endnu</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Kursusbevis</p>
            <p className="text-3xl font-semibold text-gray-900">0</p>
            <p className="text-xs text-gray-400 mt-1">Gennemfør et kursus</p>
          </div>
        </div>

        {/* Kurser */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Tilgængelige kurser</h3>
          <span className="text-sm text-gray-400">{kurser.length} kurser</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {kurser.map((kursus) => {
            const f = farveKlasser[kursus.farve]
            return (
              <div key={kursus.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div className={`px-2.5 py-1 rounded-md text-xs font-medium ${f.badge} ${f.badgeText}`}>
                    {kursus.fag}
                  </div>
                  <span className="text-xs text-gray-400">{kursus.varighed}</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-1 leading-snug">{kursus.titel}</h4>
                <p className="text-xs text-gray-400 mb-4">{kursus.niveau} · {kursus.moduler} moduler</p>
                <div className="flex items-center justify-between">
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5 mr-3">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                  <span className="text-xs text-gray-400">0%</span>
                </div>
              </div>
            )
          })}
        </div>

      </main>
    </div>
  )
}