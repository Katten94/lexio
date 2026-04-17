import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import QuizClient from './QuizClient'

const MODULER: Record<string, Record<number, {
  titel: string
  beskrivelse: string
  spoergsmaal: {
    id: number
    spoergsmaal: string
    svar: string[]
    korrekt: number
    forklaring: string
  }[]
}>> = {
  "1": {
    1: {
      titel: "Introduktion til markedsanalyse",
      beskrivelse: "I dette modul introduceres du til markedsanalysens formål og centrale begreber.",
      spoergsmaal: [
        { id: 1, spoergsmaal: "Hvad er det primære formål med en markedsanalyse?", svar: ["At øge virksomhedens omsætning direkte", "At skabe grundlag for informerede beslutninger om marked og kunder", "At analysere konkurrenternes regnskaber", "At rekruttere nye medarbejdere"], korrekt: 1, forklaring: "Markedsanalyse giver virksomheden viden om markedet og kunderne, som danner grundlag for strategiske beslutninger." },
        { id: 2, spoergsmaal: "Hvilken af følgende er en intern kilde til markedsinformation?", svar: ["Brancherapporter", "Salgsstatistikker fra eget CRM-system", "Danmarks Statistik", "Konkurrenternes hjemmesider"], korrekt: 1, forklaring: "Interne kilder er data virksomheden selv har indsamlet, fx salgsdata og kunderegistre." },
        { id: 3, spoergsmaal: "Hvad kendetegner en kvantitativ markedsanalyse?", svar: ["Den baseres på dybdegående interviews med få respondenter", "Den måler holdninger og følelser", "Den indsamler målbare data fra mange respondenter", "Den er altid dyrere end kvalitativ analyse"], korrekt: 2, forklaring: "Kvantitativ analyse handler om at indsamle målbare data fra et større antal respondenter." },
        { id: 4, spoergsmaal: "Hvornår er kvalitativ markedsanalyse mest hensigtsmæssig?", svar: ["Når man vil kortlægge markedsstørrelsen præcist", "Når man vil forstå baggrunden for kunders adfærd og holdninger", "Når man skal beregne markedsandele", "Når man har et meget stort budget"], korrekt: 1, forklaring: "Kvalitativ analyse bruges til at forstå motiver, holdninger og adfærd." },
        { id: 5, spoergsmaal: "Hvad er en målgruppe i markedsføringskontekst?", svar: ["Alle potentielle kunder i hele verden", "Den specifikke gruppe af forbrugere virksomheden retter sine aktiviteter mod", "Virksomhedens eksisterende kunder udelukkende", "De kunder der genererer mest omsætning"], korrekt: 1, forklaring: "En målgruppe er den afgrænsede gruppe af forbrugere som virksomheden primært kommunikerer til." },
      ]
    },
    2: {
      titel: "Primær og sekundær data",
      beskrivelse: "Vi gennemgår forskellen på primær og sekundær data og hvornår du bør bruge hvilken type.",
      spoergsmaal: [
        { id: 1, spoergsmaal: "Hvad karakteriserer primær data?", svar: ["Data der er indsamlet af andre til et andet formål", "Data du selv indsamler til dit specifikke formål", "Data fra offentlige statistikker", "Data fra brancheorganisationer"], korrekt: 1, forklaring: "Primær data indsamles specifikt til det aktuelle formål — fx via interviews eller spørgeskemaer." },
        { id: 2, spoergsmaal: "Hvilken af følgende er et eksempel på sekundær data?", svar: ["Et fokusgruppeinterview du selv afholder", "Et spørgeskema du sender til kunder", "En brancheanalyse fra Dansk Erhverv", "En observation du foretager i en butik"], korrekt: 2, forklaring: "Sekundær data er allerede indsamlet data — fx rapporter og statistikker produceret af andre." },
        { id: 3, spoergsmaal: "Hvad er den primære fordel ved sekundær data?", svar: ["Den er altid mere præcis end primær data", "Den er billigere og hurtigere at indhente", "Den er skræddersyet til dit specifikke behov", "Den er mere aktuel end primær data"], korrekt: 1, forklaring: "Sekundær data er typisk hurtigere og billigere at indhente da den allerede eksisterer." },
        { id: 4, spoergsmaal: "Hvornår bør man foretrække primær data frem for sekundær?", svar: ["Når man har et lille budget", "Når man har brug for hurtige svar", "Når der ikke findes relevant eksisterende data om det specifikke problem", "Når man vil analysere historiske tendenser"], korrekt: 2, forklaring: "Primær data er nødvendig når der ikke eksisterer tilstrækkelig relevant data om det konkrete problem." },
        { id: 5, spoergsmaal: "Hvad er Danmarks Statistik et eksempel på?", svar: ["En primær datakilde", "En intern datakilde", "En sekundær ekstern datakilde", "En kvalitativ datakilde"], korrekt: 2, forklaring: "Danmarks Statistik er en sekundær ekstern datakilde — data indsamlet og publiceret af en ekstern organisation." },
      ]
    },
    3: {
      titel: "Segmentering og målgruppe",
      beskrivelse: "Lær de fire segmenteringstyper og hvordan du anvender dem på konkrete virksomheder.",
      spoergsmaal: [
        { id: 1, spoergsmaal: "Hvad er formålet med markedssegmentering?", svar: ["At sælge til alle mulige kunder", "At opdele markedet i grupper med fælles karakteristika", "At reducere produktionsomkostningerne", "At eliminere konkurrenter"], korrekt: 1, forklaring: "Segmentering handler om at opdele et heterogent marked i mere homogene grupper." },
        { id: 2, spoergsmaal: "Hvilken segmenteringstype baseres på forbrugernes livsstil og værdier?", svar: ["Demografisk segmentering", "Geografisk segmentering", "Psykografisk segmentering", "Adfærdsmæssig segmentering"], korrekt: 2, forklaring: "Psykografisk segmentering opdeler markedet efter personlighed, livsstil, værdier og interesser." },
        { id: 3, spoergsmaal: "En virksomhed der tilbyder lavere priser til studerende bruger primært hvilken segmenteringstype?", svar: ["Geografisk segmentering", "Adfærdsmæssig segmentering", "Psykografisk segmentering", "Demografisk segmentering"], korrekt: 3, forklaring: "At segmentere efter uddannelsesstatus er demografisk segmentering." },
        { id: 4, spoergsmaal: "Hvad er en niche-strategi i segmenteringssammenhæng?", svar: ["At henvende sig til hele markedet med ét produkt", "At fokusere på et meget specifikt og afgrænset markedssegment", "At tilbyde mange varianter til mange segmenter", "At konkurrere på pris i masssemarkedet"], korrekt: 1, forklaring: "En niche-strategi indebærer fokus på et smalt, specifikt segment med særlige behov." },
        { id: 5, spoergsmaal: "Hvad kendetegner et attraktivt markedssegment?", svar: ["Det er så bredt som muligt", "Det er svært at måle og vurdere", "Det er målbart, tilgængeligt, rentabelt og handlingsorienteret", "Det indeholder flest mulige konkurrenter"], korrekt: 2, forklaring: "Et godt segment skal kunne måles, nås, være lønsomhed og give mulighed for at agere." },
      ]
    },
    4: {
      titel: "Kotlers købsprocessmodel",
      beskrivelse: "Gennemgang af Kotlers 5-fase model for forbrugernes købsproces med cases fra dansk detailhandel.",
      spoergsmaal: [
        { id: 1, spoergsmaal: "Hvad er den første fase i Kotlers købsprocessmodel?", svar: ["Informationssøgning", "Behovserkendelse", "Vurdering af alternativer", "Købsbeslutning"], korrekt: 1, forklaring: "Behovserkendelse er udgangspunktet — forbrugeren opdager et behov der skal løses." },
        { id: 2, spoergsmaal: "Hvad er kognitiv dissonans i Kotlers model?", svar: ["Tvivl og utilfredshed der opstår efter købet", "Processen med at søge information om produkter", "Sammenligningen af forskellige alternativer", "Den første fase i købsprocessen"], korrekt: 0, forklaring: "Kognitiv dissonans er den tvivl og utilfredshed der kan opstå efter et køb." },
        { id: 3, spoergsmaal: "I hvilken fase sammenligner forbrugeren forskellige produkter og mærker?", svar: ["Behovserkendelse", "Informationssøgning", "Vurdering af alternativer", "Efterkøbsadfærd"], korrekt: 2, forklaring: "I vurderingsfasen sammenligner forbrugeren de muligheder der er fundet under informationssøgningen." },
        { id: 4, spoergsmaal: "Hvorfor er efterkøbsadfærd vigtig for virksomheder?", svar: ["Den har ingen betydning for virksomheden", "Tilfredse kunder kan blive loyale kunder og ambassadører", "Det er den billigste fase at påvirke", "Efterkøbsadfærd sker kun ved dyre køb"], korrekt: 1, forklaring: "Efterkøbstilfredse kunder kan føre til gentagne køb og positive anbefalinger." },
        { id: 5, spoergsmaal: "Hvilken faktor kan forstyrre overgangen fra intention til faktisk køb?", svar: ["For mange farver på produktet", "Andres holdninger og uventede situationsfaktorer", "Produktets vægt", "Virksomhedens CVR-nummer"], korrekt: 1, forklaring: "Andres holdninger og uventede faktorer kan forhindre at en positiv holdning fører til et køb." },
      ]
    },
    5: {
      titel: "SWOT-analyse i praksis",
      beskrivelse: "Lær at udføre og anvende SWOT-analysen på konkrete virksomheder med fokus på didaktisk formidling.",
      spoergsmaal: [
        { id: 1, spoergsmaal: "Hvad repræsenterer S i SWOT-analysen?", svar: ["Strategier", "Styrker", "Segmenter", "Salg"], korrekt: 1, forklaring: "S står for Strengths — virksomhedens interne styrker og konkurrencefordele." },
        { id: 2, spoergsmaal: "Hvilke elementer i SWOT er interne faktorer?", svar: ["Muligheder og trusler", "Styrker og svagheder", "Svagheder og muligheder", "Styrker og trusler"], korrekt: 1, forklaring: "Styrker og svagheder er interne faktorer som virksomheden selv kan påvirke." },
        { id: 3, spoergsmaal: "Hvad er en trussel i SWOT-sammenhæng?", svar: ["En intern svaghed der skal forbedres", "En ekstern faktor der kan skade virksomhedens position", "Et produkt virksomheden overvejer at lancere", "En ny medarbejder der ansættes"], korrekt: 1, forklaring: "Trusler er eksterne faktorer der kan påvirke virksomheden negativt." },
        { id: 4, spoergsmaal: "Hvad er formålet med en TOWS-matrix?", svar: ["At erstatte SWOT-analysen", "At omsætte SWOT-analysens elementer til konkrete strategier", "At analysere konkurrenternes styrker", "At beregne virksomhedens markedsandel"], korrekt: 1, forklaring: "TOWS-matricen kombinerer SWOT-elementerne parvis for at generere konkrete strategiske handlemuligheder." },
        { id: 5, spoergsmaal: "Hvornår er en SWOT-analyse mest værdifuld?", svar: ["Kun ved virksomhedens opstart", "Som grundlag for strategisk planlægning og beslutningstagning", "Udelukkende til markedsføringskampagner", "Kun ved fusioner og opkøb"], korrekt: 1, forklaring: "SWOT er et fleksibelt analyseværktøj der er værdifuldt i alle strategiske beslutningssituationer." },
      ]
    },
    6: {
      titel: "Afsluttende quiz og opsummering",
      beskrivelse: "Saml op på kursets kernebegreber og test din forståelse med den afsluttende quiz.",
      spoergsmaal: [
        { id: 1, spoergsmaal: "Hvilken model beskriver forbrugerens beslutningsproces i 5 faser?", svar: ["SWOT-modellen", "Kotlers købsprocessmodel", "Ansoffs vækstmatrix", "BCG-matricen"], korrekt: 1, forklaring: "Kotlers model beskriver de fem faser: behovserkendelse, informationssøgning, vurdering, køb og efterkøbsadfærd." },
        { id: 2, spoergsmaal: "Hvad er forskellen på demografisk og psykografisk segmentering?", svar: ["Der er ingen forskel", "Demografisk er baseret på målbare data som alder og køn, psykografisk på livsstil og værdier", "Psykografisk er mere præcis end demografisk", "Demografisk bruges kun i B2B-markeder"], korrekt: 1, forklaring: "Demografisk segmentering bruger objektive målbare data, mens psykografisk handler om livsstil." },
        { id: 3, spoergsmaal: "Hvad er den vigtigste forskel på primær og sekundær data?", svar: ["Pris er den eneste forskel", "Primær data er indsamlet til det specifikke formål, sekundær data er allerede eksisterende", "Sekundær data er altid mere pålidelig", "Primær data kan kun indsamles via spørgeskemaer"], korrekt: 1, forklaring: "Den grundlæggende forskel er om data er indsamlet specifikt til formålet eller genanvendt." },
        { id: 4, spoergsmaal: "Hvilke to faktorer udgør de interne elementer i en SWOT-analyse?", svar: ["Muligheder og trusler", "Styrker og muligheder", "Styrker og svagheder", "Svagheder og trusler"], korrekt: 2, forklaring: "Styrker og svagheder er interne — de vedrører virksomhedens egne ressourcer og kompetencer." },
        { id: 5, spoergsmaal: "Hvad er det overordnede formål med markedsanalyse?", svar: ["At øge virksomhedens aktiekurs", "At skabe viden om marked og kunder som grundlag for bedre beslutninger", "At eliminere al usikkerhed i forretningsbeslutninger", "At kopiere konkurrenternes strategier"], korrekt: 1, forklaring: "Markedsanalyse reducerer usikkerhed og skaber et bedre vidensgrundlag for beslutninger." },
      ]
    }
  }
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

const KURSUS_FAG: Record<string, string> = {
  "1": "Afsætning", "2": "Afsætning", "3": "Afsætning",
  "4": "Salg og service", "5": "Salg og service", "6": "Salg og service",
  "7": "Erhvervsøkonomi", "8": "Erhvervsøkonomi", "9": "Erhvervsøkonomi",
  "10": "Kommunikation", "11": "Kommunikation", "12": "Kommunikation",
  "22": "Didaktik / Pædagogik", "23": "Didaktik / Pædagogik", "24": "Didaktik / Pædagogik",
}

export default async function ModulPage({ params }: { params: Promise<{ id: string; modulId: string }> }) {
  const { id, modulId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const navn: string = user.user_metadata?.navn || ''
  const kursusModuler = MODULER[id]
  const modul = kursusModuler?.[parseInt(modulId)]
  if (!modul) redirect(`/kurser/${id}`)

  const fag = KURSUS_FAG[id] || 'Afsætning'
  const stil = FAG_STIL[fag] || { bg: '#F9FAFB', tekst: '#374151' }
  const totalModuler = Object.keys(kursusModuler).length
  const erSidste = parseInt(modulId) === totalModuler

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#F9FAFB' }}>
      <Sidebar navn={navn} email={user.email} />

      <main className="flex-1 ml-52 px-10 py-8 max-w-3xl">

        <div className="mb-6">
          <a href={`/kurser/${id}`}
            style={{ fontSize: '12px', color: '#6B7280', fontFamily: 'Arial', textDecoration: 'none' }}>
            ← Tilbage til kursus
          </a>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded"
              style={{ backgroundColor: stil.bg, color: stil.tekst, fontFamily: 'Arial' }}>
              {fag}
            </span>
            <span className="text-xs" style={{ color: '#9CA3AF', fontFamily: 'Arial' }}>
              Modul {modulId} af {totalModuler}
            </span>
          </div>
          <h1 className="font-bold mb-2"
            style={{ fontSize: '20px', color: '#111827', fontFamily: 'Arial' }}>
            {modul.titel}
          </h1>
          <p style={{ fontSize: '13px', color: '#6B7280', fontFamily: 'Arial', lineHeight: '1.6' }}>
            {modul.beskrivelse}
          </p>
        </div>

        <div className="rounded-lg mb-6 flex items-center justify-center"
          style={{ backgroundColor: '#0F2A5E', height: '200px' }}>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.4)' }}>
              <div style={{ width: 0, height: 0, borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderLeft: '14px solid white', marginLeft: '3px' }}></div>
            </div>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Arial' }}>
              Video tilgængelig snart
            </p>
          </div>
        </div>

        <QuizClient
          kursusId={id}
          modulId={parseInt(modulId)}
          spoergsmaal={modul.spoergsmaal}
          erSidste={erSidste}
          userId={user.id}
        />

      </main>
    </div>
  )
}