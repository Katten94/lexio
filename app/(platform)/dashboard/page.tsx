import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const kurser = [
  { id: 1, titel: "Markedsanalyse og forbrugeradfærd", fag: "Afsætning A", niveau: "GF2 · HF1", moduler: 6, varighed: "2,5 timer", farve: "blue" },
  { id: 2, titel: "Salgspsykologi og kundehåndtering", fag: "Salg og service", niveau: "HF1", moduler: 5, varighed: "2 timer", farve: "teal" },
  { id: 3, titel: "Budgettering og regnskabsforståelse", fag: "Erhvervsøkonomi B", niveau: "GF2", moduler: 5, varighed: "2 timer", farve: "green" },
  { id: 4, titel: "Digital kommunikation og branding", fag: "Kommunikation", niveau: "GF2", moduler: 4, varighed: "1,5 timer", farve: "purple" },
  { id: 5, titel: "AI i den merkantile undervisning", fag: "Didaktik", niveau: "Alle niveauer", moduler: 4, varighed: "1,5 timer", farve: "amber" },
]

const farveKlasser: Record<string, { badge: string; badgeText: string }> = {
  blue:   { badge: "bg-blue-100",   badgeText: "text-blue-700" },
  teal:   { badge: "bg-teal-100",   badgeText: "text-teal-700" },
  green:  { badge: "bg-green-100",  badgeText: "text-green-700" },
  purple: { badge: "bg-purple-100", badgeText: "text-purple-700" },
  amber:  { badge: "bg-amber-100",  badgeText: "text-amber-700" },
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

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect('/login') }

  const initialer = user.email?.slice(0, 2).toUpperCase() ?? '??'

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col min-h-screen fixed top-0 left-0">
        <div className="px-5 py-5 border-b border-gray-100">
          <Logo />
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <div className="px-3 py-1.5 text-xs font-medium text-gray-400 uppercase tracking-wider">Menu</div>
          <a href="/dashboard" className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium">
            <span>📊</span> Oversigt
          </a>
          <a href="/kurser" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 text-sm">
            <span>🎓</span> Kurser
          </a>
          <a href="/kompetencer" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 text-sm">
            <span>📜</span> Mine beviser
          </a>
        </nav>
        <div className="px-3 py-4 border-t border-gray-100">
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-xs font-semibold text-orange-600">
              {initialer}
            </div>
            <p className="text-xs text-gray-600 truncate">{user.email}</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 ml-56 px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900">God dag 👋</h2>
          <p className="text-gray-500 mt-1">Her er din faglige udvikling på <span className="font-bold text-blue-900">DIDANTO</span><span style={{ marginLeft: '3px', color: '#F97316' }}>.</span></p>
        </div>

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

        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Tilgængelige kurser</h3>
          <span className="text-sm text-gray-400">{kurser.length} kurser</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {kurser.map((kursus) => {
            const f = farveKlasser[kursus.farve]
            return (
              <a key={kursus.id} href={`/kurser/${kursus.id}`}>
                <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-orange-200 hover:shadow-sm transition-all cursor-pointer">
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
                      <div className="bg-orange-400 h-1.5 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                    <span className="text-xs text-gray-400">0%</span>
                  </div>
                </div>
              </a>
            )
          })}
        </div>
      </main>
    </div>
  )
}