import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

const KURSER: Record<string, {
  titel: string
  fag: string
  beskrivelse: string
  niveau: string[]
  varighed: string
  moduler: { id: number; titel: string; varighed: string }[]
}> = {
  "1": {
    titel: "Markedsanalyse og forbrugeradfærd",
    fag: "Afsætning",
    beskrivelse: "Lær at analysere markeder og forbrugeradfærd med udgangspunkt i Kotlers købsprocessmodel, segmentering og SWOT. Kurset er forankret i bekendtgørelsen for Afsætning A.",
    niveau: ["A", "B"],
    varighed: "2,5 timer",
    moduler: [
      { id: 1, titel: "Introduktion til markedsanalyse", varighed: "25 min" },
      { id: 2, titel: "Primær og sekundær data", varighed: "20 min" },
      { id: 3, titel: "Segmentering og målgruppe", varighed: "25 min" },
      { id: 4, titel: "Kotlers købsprocessmodel", varighed: "20 min" },
      { id: 5, titel: "SWOT-analyse i praksis", varighed: "20 min" },
      { id: 6, titel: "Afsluttende quiz og opsummering", varighed: "20 min" },
    ]
  },
  "2": {
    titel: "Prissætning og prisstrategi",
    fag: "Afsætning",
    beskrivelse: "Gennemgang af prisstrategier og prissætningsmodeller med aktuelle cases fra dansk erhvervsliv.",
    niveau: ["A", "B", "C"],
    varighed: "2 timer",
    moduler: [
      { id: 1, titel: "Prisstrategier — overblik", varighed: "20 min" },
      { id: 2, titel: "Omkostningsbaseret prissætning", varighed: "25 min" },
      { id: 3, titel: "Konkurrencebaseret prissætning", varighed: "20 min" },
      { id: 4, titel: "Psykologisk prissætning", varighed: "20 min" },
      { id: 5, titel: "Afsluttende quiz", varighed: "15 min" },
    ]
  },
  "3": {
    titel: "Digital markedsføring i praksis",
    fag: "Afsætning",
    beskrivelse: "Opdater din viden om SEO, content marketing og sociale medier med cases fra LEGO og Novo Nordisk.",
    niveau: ["A", "B"],
    varighed: "2 timer",
    moduler: [
      { id: 1, titel: "SEO og søgemaskineoptimering", varighed: "20 min" },
      { id: 2, titel: "Content marketing", varighed: "20 min" },
      { id: 3, titel: "Sociale medier i erhvervskontekst", varighed: "25 min" },
      { id: 4, titel: "Dataanalyse og måling", varighed: "20 min" },
      { id: 5, titel: "Afsluttende quiz", varighed: "15 min" },
    ]
  },
  "4": {
    titel: "Salgspsykologi og kundehåndtering",
    fag: "Salg og service",
    beskrivelse: "Bliv opdateret på moderne salgsteknikker, kundetyper og reklamationshåndtering med cases fra dansk detailhandel.",
    niveau: ["GF2", "HF1", "HF2"],
    varighed: "2 timer",
    moduler: [
      { id: 1, titel: "Kundetyper og adfærd", varighed: "20 min" },
      { id: 2, titel: "Salgsteknikker i praksis", varighed: "25 min" },
      { id: 3, titel: "Reklamation og svær dialog", varighed: "20 min" },
      { id: 4, titel: "Digitalt salg og kundekontakt", varighed: "20 min" },
      { id: 5, titel: "Afsluttende quiz", varighed: "15 min" },
    ]
  },
  "7": {
    titel: "Budgettering og regnskabsforståelse",
    fag: "Erhvervsøkonomi",
    beskrivelse: "Opdater din viden om budgettyper, resultatopgørelse og balance med praktiske erhvervsøkonomiske cases.",
    niveau: ["A", "B", "C"],
    varighed: "2 timer",
    moduler: [
      { id: 1, titel: "Budgettyper og formål", varighed: "20 min" },
      { id: 2, titel: "Resultatopgørelsen", varighed: "25 min" },
      { id: 3, titel: "Balancen", varighed: "20 min" },
      { id: 4, titel: "Nøgletal og analyse", varighed: "20 min" },
      { id: 5, titel: "Afsluttende quiz", varighed: "15 min" },
    ]
  },
  "10": {
    titel: "Digital kommunikation og branding",
    fag: "Kommunikation",
    beskrivelse: "Opdater din viden om digital kommunikation, branding og sociale mediers rolle i moderne virksomheder.",
    niveau: ["GF2", "HF1", "HF2"],
    varighed: "1,5 timer",
    moduler: [
      { id: 1, titel: "Branding og identitet", varighed: "20 min" },
      { id: 2, titel: "Digital kommunikation", varighed: "20 min" },
      { id: 3, titel: "Sociale medier og strategi", varighed: "20 min" },
      { id: 4, titel: "Afsluttende quiz", varighed: "15 min" },
    ]
  },
  "22": {
    titel: "AI i den merkantile undervisning",
    fag: "Didaktik / Pædagogik",
    beskrivelse: "Forstå og anvend AI-værktøjer i din undervisning — fra ChatGPT til billedgenerering og automatisering.",
    niveau: ["Alle niveauer"],
    varighed: "1,5 timer",
    moduler: [
      { id: 1, titel: "Hvad er AI — og hvad kan det i undervisningen?", varighed: "20 min" },
      { id: 2, titel: "ChatGPT som didaktisk redskab", varighed: "20 min" },
      { id: 3, titel: "Billedgenerering og multimodalitet", varighed: "15 min" },
      { id: 4, titel: "Etik, kildekritik og AI", varighed: "15 min" },
    ]
  },
}

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

export default async function KursusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const navn: string = user.user_metadata?.navn || ''
  const kursus = KURSER[id]
  if (!kursus) redirect('/kurser')

  const stil = FAG_STIL[kursus.fag] || { bg: '#F9FAFB', tekst: '#374151' }

  const { data: fremgang } = await supabase
    .from('kursus_fremgang')
    .select('modul_id, gennemfoert')
    .eq('bruger_id', user.id)
    .eq('kursus_id', parseInt(id))

  const gennemfoerteModuler = new Set(
    (fremgang || []).filter(f => f.gennemfoert).map(f => f.modul_id)
  )

  const antalGennemfoert = gennemfoerteModuler.size
  const procentFaerdig = Math.round((antalGennemfoert / kursus.moduler.length) * 100)
  const naesteMod = kursus.moduler.find(m => !gennemfoerteModuler.has(m.id))

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#F9FAFB' }}>
      <Sidebar navn={navn} email={user.email} />

      <main className="flex-1 ml-52 px-10 py-8 max-w-3xl">

        {/* Breadcrumb */}
        <div className="mb-6">
          <a href="/kurser"
            style={{ fontSize: '12px', color: '#6B7280', fontFamily: 'Arial', textDecoration: 'none' }}>
            ← Tilbage til kurser
          </a>
        </div>

        {/* Header */}
        <div className="mb-7">
          <div className="mb-2.5">
            <span className="text-xs font-semibold px-2 py-0.5 rounded"
              style={{ backgroundColor: stil.bg, color: stil.tekst, fontFamily: 'Arial' }}>
              {kursus.fag}
            </span>
          </div>
          <h1 className="font-bold mb-2"
            style={{ fontSize: '22px', color: '#111827', fontFamily: 'Arial' }}>
            {kursus.titel}
          </h1>
          <p className="mb-3"
            style={{ fontSize: '13px', color: '#6B7280', fontFamily: 'Arial', lineHeight: '1.6' }}>
            {kursus.beskrivelse}
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs" style={{ color: '#9CA3AF', fontFamily: 'Arial' }}>
              {kursus.moduler.length} moduler
            </span>
            <span className="text-xs" style={{ color: '#9CA3AF', fontFamily: 'Arial' }}>
              {kursus.varighed}
            </span>
            <span className="text-xs" style={{ color: '#9CA3AF', fontFamily: 'Arial' }}>
              Niveau {kursus.niveau.join(' · ')}
            </span>
          </div>
        </div>

        {/* Fremgangsbar */}
        {antalGennemfoert > 0 && (
          <div className="rounded-lg p-4 mb-6"
            style={{ backgroundColor: 'white', border: '1px solid #E5E7EB' }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium" style={{ color: '#374151', fontFamily: 'Arial' }}>
                Din fremgang
              </p>
              <p className="text-xs" style={{ color: '#6B7280', fontFamily: 'Arial' }}>
                {antalGennemfoert} af {kursus.moduler.length} moduler · {procentFaerdig}%
              </p>
            </div>
            <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: '#E5E7EB' }}>
              <div className="h-1.5 rounded-full"
                style={{ width: `${procentFaerdig}%`, backgroundColor: '#0F2A5E' }}>
              </div>
            </div>
          </div>
        )}

        {/* Moduler */}
        <p className="font-semibold mb-3"
          style={{ fontSize: '13px', color: '#111827', fontFamily: 'Arial' }}>
          Moduler
        </p>
        <div className="flex flex-col gap-2">
          {kursus.moduler.map((modul) => {
            const erGennemfoert = gennemfoerteModuler.has(modul.id)
            const erNaeste = naesteMod?.id === modul.id
            const erLaast = !erGennemfoert && !erNaeste

            return (
              <a key={modul.id}
                href={erGennemfoert || erNaeste ? `/kurser/${id}/modul/${modul.id}` : '#'}
                style={{ textDecoration: 'none', opacity: erLaast ? 0.4 : 1 }}>
                <div className="rounded-lg px-5 py-3.5 flex items-center gap-3"
                  style={{
                    backgroundColor: 'white',
                    border: `1px solid ${erNaeste ? '#0F2A5E' : '#E5E7EB'}`,
                  }}>

                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                      backgroundColor: erGennemfoert ? '#EFF6FF' : erNaeste ? '#0F2A5E' : '#F3F4F6',
                      color: erGennemfoert ? '#1D4ED8' : erNaeste ? 'white' : '#6B7280',
                      border: erGennemfoert ? '1px solid #BFDBFE' : 'none',
                      fontFamily: 'Arial',
                    }}>
                    {erGennemfoert ? '✓' : modul.id}
                  </div>

                  <div className="flex-1">
                    <p className="font-medium"
                      style={{ fontSize: '13px', color: '#111827', fontFamily: 'Arial' }}>
                      {modul.titel}
                    </p>
                    <p className="text-xs"
                      style={{ color: '#9CA3AF', fontFamily: 'Arial' }}>
                      Video + quiz · {modul.varighed}
                    </p>
                  </div>

                  <div className="flex-shrink-0">
                    {erGennemfoert && (
                      <span className="text-xs font-medium"
                        style={{ color: '#1D4ED8', fontFamily: 'Arial' }}>
                        Gennemført
                      </span>
                    )}
                    {erNaeste && (
                      <span className="text-xs font-semibold"
                        style={{ color: '#F5C842', fontFamily: 'Arial' }}>
                        Fortsæt →
                      </span>
                    )}
                    {erLaast && (
                      <span className="text-xs"
                        style={{ color: '#9CA3AF', fontFamily: 'Arial' }}>
                        Låst
                      </span>
                    )}
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