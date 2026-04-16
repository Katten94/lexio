import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const ALLE_KURSER = [
  { id: 1, titel: "Markedsanalyse og forbrugeradfærd", fag: "Afsætning", niveau: ["A", "B"], forloeb: ["gf2", "hf1", "hf2"], farve: "blue", varighed: "2,5 timer", moduler: 6 },
  { id: 2, titel: "Prissætning og prisstrategi", fag: "Afsætning", niveau: ["A", "B", "C"], forloeb: ["gf2", "hf1", "hf2"], farve: "blue", varighed: "2 timer", moduler: 5 },
  { id: 3, titel: "Digital markedsføring i praksis", fag: "Afsætning", niveau: ["A", "B"], forloeb: ["hf1", "hf2"], farve: "blue", varighed: "2 timer", moduler: 5 },
  { id: 4, titel: "Salgspsykologi og kundehåndtering", fag: "Salg og service", niveau: ["GF2", "HF1", "HF2"], forloeb: ["gf2", "hf1", "hf2"], farve: "teal", varighed: "2 timer", moduler: 5 },
  { id: 5, titel: "Reklamation og svær kundedialog", fag: "Salg og service", niveau: ["HF1", "HF2"], forloeb: ["hf1", "hf2"], farve: "teal", varighed: "1,5 timer", moduler: 4 },
  { id: 6, titel: "Digitalt salg og e-handel", fag: "Salg og service", niveau: ["GF2", "HF1"], forloeb: ["gf2", "hf1"], farve: "teal", varighed: "1,5 timer", moduler: 4 },
  { id: 7, titel: "Budgettering og regnskabsforståelse", fag: "Erhvervsøkonomi", niveau: ["A", "B", "C"], forloeb: ["gf2", "hf1"], farve: "green", varighed: "2 timer", moduler: 5 },
  { id: 8, titel: "Investeringsteori og finansiering", fag: "Erhvervsøkonomi", niveau: ["A", "B"], forloeb: ["hf1", "hf2"], farve: "green", varighed: "2 timer", moduler: 5 },
  { id: 9, titel: "Nøgletal og virksomhedsanalyse", fag: "Erhvervsøkonomi", niveau: ["A", "B", "C"], forloeb: ["gf2", "hf1", "hf2"], farve: "green", varighed: "1,5 timer", moduler: 4 },
  { id: 10, titel: "Digital kommunikation og branding", fag: "Kommunikation", niveau: ["GF2", "HF1", "HF2"], forloeb: ["gf2", "hf1", "hf2"], farve: "purple", varighed: "1,5 timer", moduler: 4 },
  { id: 11, titel: "Målgruppe og kanalvalg", fag: "Kommunikation", niveau: ["GF2", "HF1"], forloeb: ["gf2", "hf1"], farve: "purple", varighed: "1,5 timer", moduler: 4 },
  { id: 12, titel: "Krisekommunikation og mediehåndtering", fag: "Kommunikation", niveau: ["HF1", "HF2"], forloeb: ["hf1", "hf2"], farve: "purple", varighed: "2 timer", moduler: 5 },
  { id: 13, titel: "Funktioner og grafer i erhvervskontekst", fag: "Matematik", niveau: ["C", "B"], forloeb: ["gf2", "hf1"], farve: "amber", varighed: "2 timer", moduler: 5 },
  { id: 14, titel: "Statistik og sandsynlighedsregning", fag: "Matematik", niveau: ["C", "B"], forloeb: ["hf1", "hf2"], farve: "amber", varighed: "2 timer", moduler: 5 },
  { id: 15, titel: "Procentregning og finansiel matematik", fag: "Matematik", niveau: ["D", "E", "F"], forloeb: ["gf1", "gf2"], farve: "amber", varighed: "1,5 timer", moduler: 4 },
  { id: 16, titel: "Mundtlig kommunikation og præsentation", fag: "Dansk", niveau: ["C", "D"], forloeb: ["gf2", "hf1"], farve: "coral", varighed: "1,5 timer", moduler: 4 },
  { id: 17, titel: "Skriftlig fremstilling til erhvervslivet", fag: "Dansk", niveau: ["C", "D", "E"], forloeb: ["gf1", "gf2"], farve: "coral", varighed: "2 timer", moduler: 5 },
  { id: 18, titel: "Business English — præsentation og forhandling", fag: "Engelsk", niveau: ["C", "B"], forloeb: ["hf1", "hf2"], farve: "indigo", varighed: "2 timer", moduler: 5 },
  { id: 19, titel: "Engelsk til daglig erhvervskommunikation", fag: "Engelsk", niveau: ["D", "E"], forloeb: ["gf2", "hf1"], farve: "indigo", varighed: "1,5 timer", moduler: 4 },
  { id: 20, titel: "Databaser og datamodellering", fag: "Informatik", niveau: ["A", "B"], forloeb: ["hf1", "hf2"], farve: "sky", varighed: "2 timer", moduler: 5 },
  { id: 21, titel: "Programmering og algoritmer i undervisningen", fag: "Informatik", niveau: ["A", "B", "C"], forloeb: ["gf2", "hf1", "hf2"], farve: "sky", varighed: "2 timer", moduler: 5 },
  { id: 22, titel: "AI i den merkantile undervisning", fag: "Didaktik / Pædagogik", niveau: ["Alle niveauer"], forloeb: ["gf1", "gf2", "hf1", "hf2", "hf3", "hf4"], farve: "rose", varighed: "1,5 timer", moduler: 4 },
  { id: 23, titel: "Differentieret undervisning på EUD", fag: "Didaktik / Pædagogik", niveau: ["Alle niveauer"], forloeb: ["gf1", "gf2", "hf1", "hf2", "hf3", "hf4"], farve: "rose", varighed: "1,5 timer", moduler: 4 },
  { id: 24, titel: "Feedback og evaluering i erhvervsuddannelsen", fag: "Didaktik / Pædagogik", niveau: ["Alle niveauer"], forloeb: ["gf1", "gf2", "hf1", "hf2", "hf3", "hf4"], farve: "rose", varighed: "1,5 timer", moduler: 4 },
]

const farveKlasser: Record<string, { badge: string; badgeText: string }> = {
  blue:   { badge: "bg-blue-100",   badgeText: "text-blue-700" },
  teal:   { badge: "bg-teal-100",   badgeText: "text-teal-700" },
  green:  { badge: "bg-green-100",  badgeText: "text-green-700" },
  purple: { badge: "bg-purple-100", badgeText: "text-purple-700" },
  amber:  { badge: "bg-amber-100",  badgeText: "text-amber-700" },
  coral:  { badge: "bg-orange-100", badgeText: "text-orange-700" },
  indigo: { badge: "bg-indigo-100", badgeText: "text-indigo-700" },
  sky:    { badge: "bg-sky-100",    badgeText: "text-sky-700" },
  rose:   { badge: "bg-rose-100",   badgeText: "text-rose-700" },
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

  const fagprofil: Record<string, string[]> = user.user_metadata?.fagprofil || {}
  const forloeb: string[] = user.user_metadata?.forloeb || []
  const navn = user.user_metadata?.navn || ''
  const initialer = navn
    ? navn.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : user.email?.slice(0, 2).toUpperCase() ?? '??'

  const harProfil = Object.keys(fagprofil).length > 0 && forloeb.length > 0

  const relevantekurser = ALLE_KURSER.filter(kursus => {
    if (!harProfil) return true
    const brugerNiveauer = fagprofil[kursus.fag] || []
    const fagMatch = brugerNiveauer.some(n =>
      kursus.niveau.includes(n) || kursus.niveau.includes("Alle niveauer")
    )
    const forloebMatch = forloeb.some(f => kursus.forloeb.includes(f))
    return fagMatch && forloebMatch
  })

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
          <a href="/profil" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 text-sm">
            <span>👤</span> Min profil
          </a>
        </nav>
        <div className="px-3 py-4 border-t border-gray-100">
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-xs font-semibold text-orange-600">
              {initialer}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-700 truncate">{navn || user.email}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 ml-56 px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900">
            God dag{navn ? `, ${navn.split(' ')[0]}` : ''} 👋
          </h2>
          <p className="text-gray-500 mt-1">
            Her er din faglige udvikling på <span className="font-bold text-blue-900">DIDANTO</span><span style={{ marginLeft: '3px', color: '#F97316' }}>.</span>
          </p>
        </div>

        {!harProfil && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-800">Din fagprofil er ikke komplet</p>
              <p className="text-xs text-orange-600 mt-0.5">Opdater din profil så vi kan vise dig de rigtige kurser</p>
            </div>
            <a href="/profil" className="text-xs font-medium text-orange-700 bg-orange-100 px-3 py-1.5 rounded-lg hover:bg-orange-200">
              Opdater profil →
            </a>
          </div>
        )}

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
          <h3 className="text-lg font-semibold text-gray-900">
            {harProfil ? 'Kurser for dig' : 'Alle kurser'}
          </h3>
          <span className="text-sm text-gray-400">{relevantekurser.length} kurser</span>
        </div>

        {relevantekurser.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-500 text-sm mb-2">Ingen kurser matcher din fagprofil endnu</p>
            <p className="text-xs text-gray-400 mb-4">Vi tilføjer løbende nye kurser</p>
            <a href="/profil" className="text-xs text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100">
              Tilpas din fagprofil →
            </a>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {relevantekurser.map((kursus) => {
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
                  <p className="text-xs text-gray-400 mb-4">
                    {kursus.niveau.join(' · ')} · {kursus.moduler} moduler
                  </p>
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