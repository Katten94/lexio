import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

const ALLE_KURSER = [
  { id: 1, titel: "Markedsanalyse og forbrugeradfærd", fag: "Afsætning", niveau: ["A", "B"], forloeb: ["gf2", "hf1", "hf2"], varighed: "2,5 timer", moduler: 6, udgivet: "2026-04-14" },
  { id: 2, titel: "Prissætning og prisstrategi", fag: "Afsætning", niveau: ["A", "B", "C"], forloeb: ["gf2", "hf1", "hf2"], varighed: "2 timer", moduler: 5, udgivet: "2026-04-07" },
  { id: 3, titel: "Digital markedsføring i praksis", fag: "Afsætning", niveau: ["A", "B"], forloeb: ["hf1", "hf2"], varighed: "2 timer", moduler: 5, udgivet: "2026-03-31" },
  { id: 4, titel: "Salgspsykologi og kundehåndtering", fag: "Salg og service", niveau: ["GF2", "HF1", "HF2"], forloeb: ["gf2", "hf1", "hf2"], varighed: "2 timer", moduler: 5, udgivet: "2026-04-14" },
  { id: 5, titel: "Reklamation og svær kundedialog", fag: "Salg og service", niveau: ["HF1", "HF2"], forloeb: ["hf1", "hf2"], varighed: "1,5 timer", moduler: 4, udgivet: "2026-04-07" },
  { id: 6, titel: "Digitalt salg og e-handel", fag: "Salg og service", niveau: ["GF2", "HF1"], forloeb: ["gf2", "hf1"], varighed: "1,5 timer", moduler: 4, udgivet: "2026-03-31" },
  { id: 7, titel: "Budgettering og regnskabsforståelse", fag: "Erhvervsøkonomi", niveau: ["A", "B", "C"], forloeb: ["gf2", "hf1"], varighed: "2 timer", moduler: 5, udgivet: "2026-04-14" },
  { id: 8, titel: "Investeringsteori og finansiering", fag: "Erhvervsøkonomi", niveau: ["A", "B"], forloeb: ["hf1", "hf2"], varighed: "2 timer", moduler: 5, udgivet: "2026-04-07" },
  { id: 9, titel: "Nøgletal og virksomhedsanalyse", fag: "Erhvervsøkonomi", niveau: ["A", "B", "C"], forloeb: ["gf2", "hf1", "hf2"], varighed: "1,5 timer", moduler: 4, udgivet: "2026-03-31" },
  { id: 10, titel: "Digital kommunikation og branding", fag: "Kommunikation", niveau: ["GF2", "HF1", "HF2"], forloeb: ["gf2", "hf1", "hf2"], varighed: "1,5 timer", moduler: 4, udgivet: "2026-04-14" },
  { id: 11, titel: "Målgruppe og kanalvalg", fag: "Kommunikation", niveau: ["GF2", "HF1"], forloeb: ["gf2", "hf1"], varighed: "1,5 timer", moduler: 4, udgivet: "2026-04-07" },
  { id: 12, titel: "Krisekommunikation og mediehåndtering", fag: "Kommunikation", niveau: ["HF1", "HF2"], forloeb: ["hf1", "hf2"], varighed: "2 timer", moduler: 5, udgivet: "2026-03-31" },
  { id: 13, titel: "Funktioner og grafer i erhvervskontekst", fag: "Matematik", niveau: ["C", "B"], forloeb: ["gf2", "hf1"], varighed: "2 timer", moduler: 5, udgivet: "2026-03-24" },
  { id: 14, titel: "Statistik og sandsynlighedsregning", fag: "Matematik", niveau: ["C", "B"], forloeb: ["hf1", "hf2"], varighed: "2 timer", moduler: 5, udgivet: "2026-03-17" },
  { id: 15, titel: "Procentregning og finansiel matematik", fag: "Matematik", niveau: ["D", "E", "F"], forloeb: ["gf1", "gf2"], varighed: "1,5 timer", moduler: 4, udgivet: "2026-03-10" },
  { id: 16, titel: "Mundtlig kommunikation og præsentation", fag: "Dansk", niveau: ["C", "D"], forloeb: ["gf2", "hf1"], varighed: "1,5 timer", moduler: 4, udgivet: "2026-03-24" },
  { id: 17, titel: "Skriftlig fremstilling til erhvervslivet", fag: "Dansk", niveau: ["C", "D", "E"], forloeb: ["gf1", "gf2"], varighed: "2 timer", moduler: 5, udgivet: "2026-03-17" },
  { id: 18, titel: "Business English — præsentation og forhandling", fag: "Engelsk", niveau: ["C", "B"], forloeb: ["hf1", "hf2"], varighed: "2 timer", moduler: 5, udgivet: "2026-03-10" },
  { id: 19, titel: "Engelsk til daglig erhvervskommunikation", fag: "Engelsk", niveau: ["D", "E"], forloeb: ["gf2", "hf1"], varighed: "1,5 timer", moduler: 4, udgivet: "2026-03-03" },
  { id: 20, titel: "Databaser og datamodellering", fag: "Informatik", niveau: ["A", "B"], forloeb: ["hf1", "hf2"], varighed: "2 timer", moduler: 5, udgivet: "2026-03-03" },
  { id: 21, titel: "Programmering og algoritmer i undervisningen", fag: "Informatik", niveau: ["A", "B", "C"], forloeb: ["gf2", "hf1", "hf2"], varighed: "2 timer", moduler: 5, udgivet: "2026-02-24" },
  { id: 22, titel: "AI i den merkantile undervisning", fag: "Didaktik / Pædagogik", niveau: ["Alle niveauer"], forloeb: ["gf1", "gf2", "hf1", "hf2", "hf3", "hf4"], varighed: "1,5 timer", moduler: 4, udgivet: "2026-04-14" },
  { id: 23, titel: "Differentieret undervisning på EUD", fag: "Didaktik / Pædagogik", niveau: ["Alle niveauer"], forloeb: ["gf1", "gf2", "hf1", "hf2", "hf3", "hf4"], varighed: "1,5 timer", moduler: 4, udgivet: "2026-04-07" },
  { id: 24, titel: "Feedback og evaluering i erhvervsuddannelsen", fag: "Didaktik / Pædagogik", niveau: ["Alle niveauer"], forloeb: ["gf1", "gf2", "hf1", "hf2", "hf3", "hf4"], varighed: "1,5 timer", moduler: 4, udgivet: "2026-03-31" },
]

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

const maanedNavne = ['januar','februar','marts','april','maj','juni','juli','august','september','oktober','november','december']
const dagNavne = ['søndag','mandag','tirsdag','onsdag','torsdag','fredag','lørdag']

function getSenesteMandag(): Date {
  const idag = new Date()
  const dag = idag.getDay()
  const diff = dag === 0 ? 6 : dag - 1
  const mandag = new Date(idag)
  mandag.setDate(idag.getDate() - diff)
  mandag.setHours(0, 0, 0, 0)
  return mandag
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const fagprofil: Record<string, string[]> = user.user_metadata?.fagprofil || {}
  const forloeb: string[] = user.user_metadata?.forloeb || []
  const navn: string = user.user_metadata?.navn || ''
  const harProfil = Object.keys(fagprofil).length > 0 && forloeb.length > 0

  const relevantekurser = ALLE_KURSER.filter(k => {
    if (!harProfil) return true
    const niv = fagprofil[k.fag] || []
    const fagMatch = niv.some(n => k.niveau.includes(n) || k.niveau.includes("Alle niveauer"))
    const forloebMatch = forloeb.some(f => k.forloeb.includes(f))
    return fagMatch && forloebMatch
  })

  const senesteMandag = getSenesteMandag()
  const ugensCurser = relevantekurser
    .filter(k => new Date(k.udgivet) >= senesteMandag)
    .sort((a, b) => new Date(b.udgivet).getTime() - new Date(a.udgivet).getTime())
    .slice(0, 4)

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#F9FAFB' }}>
      <Sidebar navn={navn} email={user.email} />

      <main className="flex-1 ml-52 px-10 py-8 max-w-4xl">

        {/* Header */}
        <div className="mb-7">
          <h1 className="font-bold" style={{ fontSize: '22px', color: '#111827', fontFamily: 'Arial' }}>
            God dag{navn ? `, ${navn.split(' ')[0]}` : ''} 👋
          </h1>
        </div>

        {/* Profil-banner */}
        {!harProfil && (
          <div className="rounded-lg p-4 mb-6 flex items-center justify-between"
            style={{ backgroundColor: '#FDF9EC', border: '1px solid #F0E68C' }}>
            <div>
              <p className="text-sm font-medium" style={{ color: '#111827', fontFamily: 'Arial' }}>
                Din fagprofil er ikke komplet
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#6B7280', fontFamily: 'Arial' }}>
                Opdater din profil så vi kan vise dig de rigtige kurser
              </p>
            </div>
            <a href="/profil" className="text-xs font-medium px-3 py-1.5 rounded-md"
              style={{ backgroundColor: '#0F2A5E', color: 'white', fontFamily: 'Arial', textDecoration: 'none' }}>
              Opdater profil →
            </a>
          </div>
        )}

        {/* Statistik */}
        <div className="grid grid-cols-3 gap-3 mb-7">
          {[
            { label: 'Igangværende', value: '0', sub: 'Start dit første kursus' },
            { label: 'Gennemført', value: '0', sub: 'Ingen endnu' },
            { label: 'Tilgængelige', value: String(relevantekurser.length), sub: 'Matcher din fagprofil' },
          ].map((s, i) => (
            <div key={i} className="rounded-lg p-4"
              style={{ backgroundColor: 'white', border: '1px solid #E5E7EB' }}>
              <p className="text-xs mb-1.5" style={{ fontFamily: 'Arial', color: '#9CA3AF' }}>{s.label}</p>
              <p className="font-bold" style={{ fontSize: '24px', color: '#111827', fontFamily: 'Arial' }}>{s.value}</p>
              <p className="text-xs mt-1" style={{ fontFamily: 'Arial', color: '#9CA3AF' }}>{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Fortsæt */}
        <p className="font-semibold mb-2" style={{ fontSize: '13px', color: '#111827', fontFamily: 'Arial' }}>
          Fortsæt hvor du slap
        </p>
        <div className="rounded-lg p-5 mb-7 text-center"
          style={{ backgroundColor: 'white', border: '1px solid #E5E7EB' }}>
          <p className="text-sm mb-3" style={{ fontFamily: 'Arial', color: '#9CA3AF' }}>
            Du har ikke startet noget endnu
          </p>
          <a href="/kurser" className="inline-block text-xs font-medium px-4 py-2 rounded-md"
            style={{ backgroundColor: '#0F2A5E', color: 'white', fontFamily: 'Arial', textDecoration: 'none' }}>
            Gå til kurser →
          </a>
        </div>

        {/* Netop tilføjet */}
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold" style={{ fontSize: '13px', color: '#111827', fontFamily: 'Arial' }}>
            Netop tilføjet
          </p>
          <a href="/kurser" className="text-xs"
            style={{ color: '#6B7280', fontFamily: 'Arial', textDecoration: 'none' }}>
            Se alle →
          </a>
        </div>

        {ugensCurser.length === 0 ? (
          <div className="rounded-lg p-6 text-center"
            style={{ backgroundColor: 'white', border: '1px solid #E5E7EB' }}>
            <p className="text-sm" style={{ fontFamily: 'Arial', color: '#9CA3AF' }}>
              Intet nyt denne uge — tjek igen mandag
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {ugensCurser.map(k => {
              const stil = FAG_STIL[k.fag] || { bg: '#F9FAFB', tekst: '#374151' }
              return (
                <a key={k.id} href={`/kurser/${k.id}`} style={{ textDecoration: 'none' }}>
                  <div className="rounded-lg px-5 py-4 flex items-center justify-between"
                    style={{ backgroundColor: 'white', border: '1px solid #E5E7EB' }}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded"
                          style={{ backgroundColor: stil.bg, color: stil.tekst, fontFamily: 'Arial' }}>
                          {k.fag}
                        </span>
                        <span className="text-xs font-medium px-2 py-0.5 rounded"
                          style={{ backgroundColor: '#FDF9EC', color: '#92400E', border: '1px solid #F0E68C', fontFamily: 'Arial' }}>
                          Ny
                        </span>
                      </div>
                      <p className="font-semibold mb-0.5"
                        style={{ fontSize: '13px', color: '#111827', fontFamily: 'Arial' }}>
                        {k.titel}
                      </p>
                      <p className="text-xs" style={{ color: '#9CA3AF', fontFamily: 'Arial' }}>
                        {k.niveau.join(' · ')} · {k.moduler} moduler
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-4 flex-shrink-0">
                      <span className="text-xs" style={{ color: '#9CA3AF', fontFamily: 'Arial' }}>{k.varighed}</span>
                      <div className="w-20 h-1 rounded-full" style={{ backgroundColor: '#E5E7EB' }}>
                        <div className="h-1 rounded-full w-0" style={{ backgroundColor: '#0F2A5E' }}></div>
                      </div>
                    </div>
                  </div>
                </a>
              )
            })}
          </div>
        )}

      </main>
    </div>
  )
}