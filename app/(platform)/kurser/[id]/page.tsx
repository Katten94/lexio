import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const kurser: Record<number, {
  id: number
  titel: string
  fag: string
  niveau: string
  varighed: string
  beskrivelse: string
  farve: string
  kompetencemaal: string[]
  moduler: { id: number; titel: string; varighed: string; beskrivelse: string }[]
}> = {
  1: {
    id: 1,
    titel: "Markedsanalyse og forbrugeradfærd",
    fag: "Afsætning A",
    niveau: "GF2 · HF1",
    varighed: "2,5 timer",
    farve: "blue",
    beskrivelse: "Dette kursus giver dig opdateret faglig viden om markedsanalyse og forbrugeradfærd forankret i bekendtgørelsen for Afsætning A. Du arbejder med Kotlers købsprocessmodel, segmentering og SWOT med cases fra dansk erhvervsliv.",
    kompetencemaal: [
      "Anvende og vurdere afsætningsøkonomiske modeller til analyse af virksomhedens situation",
      "Analysere forbrugeradfærd og segmentere markeder med henblik på at identificere målgrupper",
      "Planlægge og gennemføre markedsanalyser og vurdere resultaternes anvendelighed",
    ],
    moduler: [
      { id: 1, titel: "Introduktion til markedsanalyse", varighed: "12 min", beskrivelse: "Hvad er markedsanalyse og hvorfor er det centralt i afsætningsfaget?" },
      { id: 2, titel: "Forbrugeradfærd og Kotlers model", varighed: "15 min", beskrivelse: "Gennemgang af Kotlers købsprocessmodel med cases fra MENY og Arla." },
      { id: 3, titel: "Segmentering og målgruppeanalyse", varighed: "12 min", beskrivelse: "Segmenteringsvariable og hvordan du underviser i målgruppeanalyse." },
      { id: 4, titel: "SWOT-analyse i praksis", varighed: "10 min", beskrivelse: "Praktisk gennemgang af SWOT med elevcase fra dansk detailhandel." },
      { id: 5, titel: "Digital markedsanalyse", varighed: "11 min", beskrivelse: "Brug af digitale data og sociale medier i markedsanalysen." },
      { id: 6, titel: "Afsluttende videncheck", varighed: "10 min", beskrivelse: "Saml din viden og tag den afsluttende quiz for at modtage kursusbevis." },
    ],
  },
  2: {
    id: 2,
    titel: "Salgspsykologi og kundehåndtering",
    fag: "Salg og service",
    niveau: "HF1",
    varighed: "2 timer",
    farve: "teal",
    beskrivelse: "Bliv opdateret på moderne salgsteknikker, kundetyper og reklamationshåndtering med cases fra dansk detailhandel.",
    kompetencemaal: [
      "Anvende salgsteknikker og kundepsykologi i undervisningen",
      "Håndtere reklamationer og svære kundedialog",
      "Identificere kundetyper og tilpasse kommunikation",
    ],
    moduler: [
      { id: 1, titel: "Salgsteknikker i dag", varighed: "12 min", beskrivelse: "Moderne salgsteknikker og hvad der virker i 2025." },
      { id: 2, titel: "Kundetyper og adfærd", varighed: "14 min", beskrivelse: "De vigtigste kundetyper og hvordan man arbejder med dem." },
      { id: 3, titel: "Reklamationshåndtering", varighed: "11 min", beskrivelse: "Cases fra Elgiganten og teleselskaber om svær kundedialog." },
      { id: 4, titel: "Digital kundekontakt", varighed: "12 min", beskrivelse: "Salg og service via chat, mail og sociale medier." },
      { id: 5, titel: "Afsluttende videncheck", varighed: "11 min", beskrivelse: "Quiz og kursusbevis." },
    ],
  },
  3: {
    id: 3,
    titel: "Budgettering og regnskabsforståelse",
    fag: "Erhvervsøkonomi B",
    niveau: "GF2",
    varighed: "2 timer",
    farve: "green",
    beskrivelse: "Styrk din undervisning i resultatopgørelse, budgetlægning og likviditetsstyring med aktuelle SMV-cases fra dansk erhvervsliv.",
    kompetencemaal: [
      "Opstille og analysere resultatopgørelser",
      "Udarbejde og vurdere budgetter",
      "Analysere likviditet og kapitalbehov",
    ],
    moduler: [
      { id: 1, titel: "Resultatopgørelsen forklaret", varighed: "14 min", beskrivelse: "Gennemgang af resultatopgørelsen med SMV-cases." },
      { id: 2, titel: "Budgetlægning i praksis", varighed: "13 min", beskrivelse: "Hvordan laver man et budget og hvad bruger man det til?" },
      { id: 3, titel: "Likviditetsstyring", varighed: "12 min", beskrivelse: "Likviditetsbudget og kapitalbehovsberegning." },
      { id: 4, titel: "Nøgletal og analyse", varighed: "11 min", beskrivelse: "De vigtigste nøgletal og hvad de fortæller os." },
      { id: 5, titel: "Afsluttende videncheck", varighed: "10 min", beskrivelse: "Quiz og kursusbevis." },
    ],
  },
  4: {
    id: 4,
    titel: "Digital kommunikation og branding",
    fag: "Kommunikation",
    niveau: "GF2",
    varighed: "1,5 timer",
    farve: "purple",
    beskrivelse: "Opdater din viden om målgruppeanalyse, kanalvalg og SoMe-strategi med cases fra LEGO, Novo Nordisk og DSB.",
    kompetencemaal: [
      "Analysere målgrupper og vælge relevante kommunikationskanaler",
      "Udvikle og vurdere digitale kommunikationsstrategier",
      "Anvende sociale medier i merkantil undervisning",
    ],
    moduler: [
      { id: 1, titel: "Målgruppeanalyse i dag", varighed: "12 min", beskrivelse: "Sådan analyserer du målgrupper i 2025." },
      { id: 2, titel: "Kanalvalg og SoMe-strategi", varighed: "13 min", beskrivelse: "Cases fra LEGO og Novo Nordisk om kanalvalg." },
      { id: 3, titel: "Branding og afsenderidentitet", varighed: "11 min", beskrivelse: "Hvad er et stærkt brand og hvordan underviser du i det?" },
      { id: 4, titel: "Afsluttende videncheck", varighed: "10 min", beskrivelse: "Quiz og kursusbevis." },
    ],
  },
  5: {
    id: 5,
    titel: "AI i den merkantile undervisning",
    fag: "Didaktik",
    niveau: "Alle niveauer",
    varighed: "1,5 timer",
    farve: "amber",
    beskrivelse: "Forstå hvordan AI kan bruges i din undervisning — didaktisk forsvarligt og forankret i bekendtgørelsen.",
    kompetencemaal: [
      "Anvende AI-værktøjer i planlægning og gennemførelse af undervisning",
      "Vurdere AI-genereret indhold kritisk og bekendtgørelsesforankret",
      "Håndtere GDPR og etik i forbindelse med AI i undervisningen",
    ],
    moduler: [
      { id: 1, titel: "AI i undervisningen — hvad er muligt?", varighed: "12 min", beskrivelse: "Overblik over AI-værktøjer relevante for EUD merkantil." },
      { id: 2, titel: "Prompt-kompetencer for undervisere", varighed: "13 min", beskrivelse: "Sådan bruger du Claude, ChatGPT og Copilot i din forberedelse." },
      { id: 3, titel: "GDPR og etik med AI", varighed: "11 min", beskrivelse: "Hvad må du og hvad må du ikke — regler for AI i undervisningen." },
      { id: 4, titel: "Afsluttende videncheck", varighed: "10 min", beskrivelse: "Quiz og kursusbevis." },
    ],
  },
}

const farveKlasser: Record<string, { badge: string; badgeText: string; bg: string; button: string }> = {
  blue:   { badge: "bg-blue-100",   badgeText: "text-blue-700",   bg: "bg-blue-50",   button: "bg-blue-700 hover:bg-blue-800" },
  teal:   { badge: "bg-teal-100",   badgeText: "text-teal-700",   bg: "bg-teal-50",   button: "bg-teal-700 hover:bg-teal-800" },
  green:  { badge: "bg-green-100",  badgeText: "text-green-700",  bg: "bg-green-50",  button: "bg-green-700 hover:bg-green-800" },
  purple: { badge: "bg-purple-100", badgeText: "text-purple-700", bg: "bg-purple-50", button: "bg-purple-700 hover:bg-purple-800" },
  amber:  { badge: "bg-amber-100",  badgeText: "text-amber-700",  bg: "bg-amber-50",  button: "bg-amber-700 hover:bg-amber-800" },
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

export default async function KursusPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect('/login') }

  const { id } = await params
  const kursus = kurser[parseInt(id)]
  if (!kursus) { redirect('/kurser') }

  const f = farveKlasser[kursus.farve]
  const initialer = user.email?.slice(0, 2).toUpperCase() ?? '??'

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

      <main className="flex-1 ml-56 px-8 py-8 max-w-4xl">
        <div className="mb-6">
          <Link href="/kurser" className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1">
            ← Tilbage til kurser
          </Link>
        </div>

        <div className={`${f.bg} rounded-2xl p-8 mb-8`}>
          <div className={`inline-block px-3 py-1 rounded-md text-xs font-medium ${f.badge} ${f.badgeText} mb-4`}>
            {kursus.fag}
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">{kursus.titel}</h2>
          <p className="text-gray-600 mb-6 leading-relaxed max-w-2xl">{kursus.beskrivelse}</p>
          <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
            <span>📚 {kursus.moduler.length} moduler</span>
            <span>⏱ {kursus.varighed}</span>
            <span>🎓 {kursus.niveau}</span>
          </div>
          <a href={`/kurser/${kursus.id}/modul/1`}>
            <button className={`${f.button} text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors`}>
              Start kursus →
            </button>
          </a>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Kompetencemål</h3>
          <p className="text-sm text-gray-500 mb-4">Dette kursus dækker følgende kompetencemål fra Undervisningsministeriets bekendtgørelse:</p>
          <div className="space-y-2">
            {kursus.kompetencemaal.map((maal, i) => (
              <div key={i} className="flex items-start gap-3 bg-white rounded-lg border border-gray-200 p-4">
                <span className="text-orange-500 font-bold text-sm mt-0.5">K{i + 1}</span>
                <p className="text-sm text-gray-700">{maal}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Moduler</h3>
          <div className="space-y-3">
            {kursus.moduler.map((modul, index) => (
              <div key={modul.id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-500 flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-0.5">{modul.titel}</h4>
                  <p className="text-sm text-gray-500">{modul.beskrivelse}</p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">{modul.varighed}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}