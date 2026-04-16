'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'

const QUIZ_DATA: Record<string, Record<number, {
  spoergsmaal: string
  svar: string[]
  korrekt: number
  forklaring: string
}[]>> = {
  "1": {
    1: [
      {
        spoergsmaal: "Hvad er det primære formål med en markedsanalyse?",
        svar: ["At fastsætte prisen på et produkt", "At indsamle og analysere information om markedet og forbrugerne", "At reklamere for virksomhedens produkter", "At ansætte nye medarbejdere"],
        korrekt: 1,
        forklaring: "En markedsanalyse bruges til at indsamle og analysere information om markedet, konkurrenter og forbrugere, så virksomheden kan træffe bedre beslutninger."
      },
      {
        spoergsmaal: "Hvad er forskellen på primær og sekundær dataindsamling?",
        svar: ["Primær data er dyrere end sekundær data", "Primær data indsamles selv til formålet, sekundær data er allerede indsamlet af andre", "Sekundær data er mere pålidelig end primær data", "Der er ingen forskel"],
        korrekt: 1,
        forklaring: "Primær data indsamles specifikt til det aktuelle formål — fx via spørgeskemaer. Sekundær data er allerede eksisterende data — fx statistikker fra Danmarks Statistik."
      },
      {
        spoergsmaal: "Hvilken model bruges til at kortlægge styrker, svagheder, muligheder og trusler?",
        svar: ["Kotlers model", "SWOT-analysen", "Ansoff-matricen", "BCG-matricen"],
        korrekt: 1,
        forklaring: "SWOT-analysen kortlægger interne styrker og svagheder samt eksterne muligheder og trusler for en virksomhed."
      },
      {
        spoergsmaal: "En virksomhed vil undersøge kundernes tilfredshed med et nyt produkt. Hvilken metode er mest velegnet til at få nuancerede svar fra få respondenter?",
        svar: ["Et spørgeskema med 500 deltagere", "Et kvantitativt telefoninterview", "Et kvalitativt dybdeinterview med 8-10 kunder", "En observation i butikken"],
        korrekt: 2,
        forklaring: "Kvalitative dybdeinterviews giver nuancerede og detaljerede svar fra få respondenter — ideelt når man vil forstå hvorfor kunder handler som de gør."
      },
      {
        spoergsmaal: "Arla Foods ønsker at undersøge markedet for plantebaserede mælkeprodukter i Sverige. Hvilken type data bør de indsamle FØRST?",
        svar: ["Primær data via fokusgrupper i Sverige", "Sekundær data om det svenske marked fra tilgængelige rapporter og statistikker", "Primær data via spørgeskemaer til svenske forbrugere", "Sekundær data fra det danske marked"],
        korrekt: 1,
        forklaring: "Man bør altid starte med sekundær data da den er billigere og hurtigere at indhente. Sekundær data om det svenske marked giver et overblik som kan guide den efterfølgende primære dataindsamling."
      },
    ],
    2: [
      {
        spoergsmaal: "Hvilke faser indgår i Kotlers købsprocessmodel?",
        svar: ["Behov, søgning, vurdering, køb, efterkøb", "Reklame, interesse, køb, tilfredshed", "Produkt, pris, distribution, kommunikation", "Segmentering, målgruppe, positionering"],
        korrekt: 0,
        forklaring: "Kotlers købsprocessmodel beskriver fem faser: behovserkendelse, informationssøgning, vurdering af alternativer, købsbeslutning og efterkøbsadfærd."
      },
      {
        spoergsmaal: "Hvad forstås ved begrebet 'kognitiv dissonans'?",
        svar: ["Forbrugerens glæde ved købet", "Tvivl eller utilfredshed efter et køb", "Processen med at søge information", "Valget mellem to produkter"],
        korrekt: 1,
        forklaring: "Kognitiv dissonans opstår i efterkøbsfasen når forbrugeren begynder at tvivle på om det var det rigtige valg."
      },
      {
        spoergsmaal: "Hvad er geografisk segmentering?",
        svar: ["Segmentering baseret på alder og køn", "Segmentering baseret på interesser og livsstil", "Segmentering baseret på geografisk placering", "Segmentering baseret på indkomst"],
        korrekt: 2,
        forklaring: "Geografisk segmentering opdeler markedet efter geografisk placering — fx land, region eller by."
      },
      {
        spoergsmaal: "En ung forbruger ser en reklame for en ny smartphone og begynder at overveje om han har brug for en ny. Hvilken fase i Kotlers model er han i?",
        svar: ["Informationssøgning", "Behovserkendelse", "Vurdering af alternativer", "Efterkøbsadfærd"],
        korrekt: 1,
        forklaring: "Behovserkendelse er den første fase i Kotlers model — forbrugeren erkender at han har et behov eller ønske."
      },
      {
        spoergsmaal: "Zalando bruger tidligere køb og browsing-historik til at vise personaliserede produktanbefalinger. Hvilken segmenteringstype anvender de primært?",
        svar: ["Demografisk segmentering", "Geografisk segmentering", "Adfærdsmæssig segmentering", "Psykografisk segmentering"],
        korrekt: 2,
        forklaring: "Adfærdsmæssig segmentering baserer sig på forbrugerens faktiske adfærd — køb, søgninger og browsing."
      },
    ],
    3: [
      {
        spoergsmaal: "Hvad måler en SWOT-analyse?",
        svar: ["Virksomhedens omsætning og profit", "Interne styrker og svagheder samt eksterne muligheder og trusler", "Konkurrenternes markedsandele", "Kundetilfredshed og loyalitet"],
        korrekt: 1,
        forklaring: "SWOT-analysen kortlægger interne faktorer (styrker og svagheder) og eksterne faktorer (muligheder og trusler) for en virksomhed."
      },
      {
        spoergsmaal: "Hvad er forskellen på en styrke og en mulighed i en SWOT-analyse?",
        svar: ["Der er ingen forskel", "En styrke er intern, en mulighed er ekstern", "En styrke handler om fremtiden, en mulighed om nutiden", "En styrke er kvantitativ, en mulighed er kvalitativ"],
        korrekt: 1,
        forklaring: "Styrker er interne faktorer virksomheden selv kontrollerer. Muligheder er eksterne faktorer i omgivelserne som virksomheden kan udnytte."
      },
      {
        spoergsmaal: "Aldi Danmark har lave priser og effektiv logistik som konkurrencefordele. Hvor hører disse faktorer hjemme i en SWOT?",
        svar: ["Muligheder", "Trusler", "Styrker", "Svagheder"],
        korrekt: 2,
        forklaring: "Lave priser og effektiv logistik er interne faktorer som Aldi selv kontrollerer og som giver dem en fordel — det er styrker i SWOT-analysen."
      },
      {
        spoergsmaal: "Hvad er Porters Five Forces primært brugt til?",
        svar: ["At analysere interne ressourcer", "At forstå konkurrencesituationen og attraktiviteten i en branche", "At segmentere kunderne", "At planlægge markedsføringskampagner"],
        korrekt: 1,
        forklaring: "Porters Five Forces analyserer fem konkurrencekræfter i en branche: eksisterende konkurrenter, nye aktører, substituerende produkter, leverandørers og kunders forhandlingsstyrke."
      },
      {
        spoergsmaal: "En virksomhed identificerer at der er mange nye konkurrenter på vej ind på markedet. Hvor placeres dette i SWOT-analysen?",
        svar: ["Styrke", "Svaghed", "Mulighed", "Trussel"],
        korrekt: 3,
        forklaring: "Nye konkurrenter er en ekstern faktor der kan true virksomhedens markedsandele — det er en trussel i SWOT-analysen."
      },
    ],
    4: [
      {
        spoergsmaal: "Hvad indgår i marketingmixets 4 P'er?",
        svar: ["Produkt, Pris, Place (distribution), Promotion (kommunikation)", "People, Process, Physical evidence, Performance", "Profit, Promotion, People, Place", "Produkt, Profit, Pris, Planlægning"],
        korrekt: 0,
        forklaring: "De klassiske 4 P'er er: Produkt, Pris, Place/distribution og Promotion/kommunikation."
      },
      {
        spoergsmaal: "Joe & The Juice sælger juice til høje priser med stærk brandidentitet. Hvilken prisstrategi anvender de primært?",
        svar: ["Penetrationsprissætning", "Skimming-prissætning", "Premium-prissætning", "Konkurrencebaseret prissætning"],
        korrekt: 2,
        forklaring: "Premium-prissætning bruges når en virksomhed positionerer sig som eksklusiv og opkræver højere priser end konkurrenterne."
      },
      {
        spoergsmaal: "Hvad er forskellen på pull- og push-strategi i distribution?",
        svar: ["Pull trækker produktet mod forbrugeren via markedsføring, push skubber det via salgskanaler", "Push er digital markedsføring, pull er traditionel reklame", "Pull bruges til B2B, push til B2C", "Der er ingen forskel i praksis"],
        korrekt: 0,
        forklaring: "Push-strategi skubber produktet via distributionskanalerne. Pull-strategi skaber efterspørgsel hos forbrugerne direkte via markedsføring."
      },
      {
        spoergsmaal: "En virksomhed lancerer et nyt produkt og sætter prisen lavt for hurtigt at erobre markedsandele. Hvad hedder denne strategi?",
        svar: ["Skimming-prissætning", "Premium-prissætning", "Penetrationsprissætning", "Konkurrencebaseret prissætning"],
        korrekt: 2,
        forklaring: "Penetrationsprissætning bruges ved lancering hvor virksomheden sætter en lav pris for hurtigt at tiltrække kunder og erobre markedsandele."
      },
      {
        spoergsmaal: "Hvilken distributionsform bruger Zalando når de sælger direkte til forbrugeren via deres eget website?",
        svar: ["Intensiv distribution", "Selektiv distribution", "Eksklusiv distribution", "Direkte distribution"],
        korrekt: 3,
        forklaring: "Direkte distribution betyder at producenten sælger direkte til slutforbrugeren uden mellemhandlere."
      },
    ],
    5: [
      {
        spoergsmaal: "Hvad er SEO og hvad bruges det til?",
        svar: ["Social Engagement Optimization — til at øge følgere", "Search Engine Optimization — til at forbedre synlighed i søgeresultater", "Sales Enablement Operations — til at effektivisere salg", "Structured Email Outreach — til email-markedsføring"],
        korrekt: 1,
        forklaring: "SEO handler om at optimere en hjemmeside så den rangerer højere i søgemaskiner som Google og øger den organiske trafik."
      },
      {
        spoergsmaal: "Hvad er content marketing?",
        svar: ["Betalt annoncering på sociale medier", "Skabelse og deling af værdifuldt indhold for at tiltrække og fastholde en målgruppe", "E-mail nyhedsbreve til eksisterende kunder", "Influencer-samarbejder"],
        korrekt: 1,
        forklaring: "Content marketing handler om at skabe og dele relevant og værdifuldt indhold der tiltrækker en målgruppe frem for direkte reklame."
      },
      {
        spoergsmaal: "DSB bruger Instagram til at dele billeder af togrejser og natur. Hvilket formål tjener dette primært?",
        svar: ["Direkte salg af togbilletter", "Branding og at skabe positive associationer til virksomheden", "Kundeservice og klagehåndtering", "Rekruttering af nye medarbejdere"],
        korrekt: 1,
        forklaring: "Instagram bruges primært til branding — at opbygge en positiv fortælling og skabe emotionelle associationer. DSB positionerer togrejsen som en oplevelse."
      },
      {
        spoergsmaal: "Hvad er forskellen på organisk og betalt reach på sociale medier?",
        svar: ["Organisk reach er gratis og opnås via engagement, betalt reach købes via annoncering", "Organisk reach er mere effektivt end betalt reach", "Betalt reach er kun tilgængeligt for store virksomheder", "Der er ingen forskel på effekten"],
        korrekt: 0,
        forklaring: "Organisk reach er den gratis eksponering via likes og delinger. Betalt reach er annoncering man betaler for at nå en bredere eller mere præcis målgruppe."
      },
      {
        spoergsmaal: "Novo Nordisk publicerer regelmæssigt videnskabelige artikler og rapporter om diabetes. Hvilken strategi er dette et eksempel på?",
        svar: ["Viral marketing", "Influencer marketing", "Thought leadership og content marketing", "Search Engine Marketing (SEM)"],
        korrekt: 2,
        forklaring: "Thought leadership er en content marketing-strategi hvor virksomheden positionerer sig som ekspert ved at dele viden og indsigt. Det opbygger troværdighed og tillid."
      },
    ],
    6: [
      {
        spoergsmaal: "Hvad er en vækststrategi ifølge Ansoff-matricen?",
        svar: ["En strategi til at reducere omkostninger", "En strategi der beskriver hvordan en virksomhed kan vokse via produkt og marked", "En strategi til at håndtere konkurrenter", "En strategi til at optimere produktionen"],
        korrekt: 1,
        forklaring: "Ansoff-matricen beskriver fire vækststrategier: markedspenetration, markedsudvikling, produktudvikling og diversifikation."
      },
      {
        spoergsmaal: "Arla Foods lancerer en ny type plantebaseret mælk til det danske marked hvor de allerede er stærkt repræsenterede. Hvilken Ansoff-strategi er dette?",
        svar: ["Markedspenetration", "Markedsudvikling", "Produktudvikling", "Diversifikation"],
        korrekt: 2,
        forklaring: "Produktudvikling er strategien hvor virksomheden lancerer nye produkter på et eksisterende marked."
      },
      {
        spoergsmaal: "Hvad forstås ved branding?",
        svar: ["Virksomhedens logo og farver", "Den samlede opfattelse og identitet forbrugerne har af en virksomhed eller produkt", "Reklamebudgettet til markedsføring", "Virksomhedens produktsortiment"],
        korrekt: 1,
        forklaring: "Branding handler om den samlede opfattelse en virksomhed skaber hos forbrugerne — ikke kun logo og farver, men værdier, tone og oplevelser."
      },
      {
        spoergsmaal: "Joe & The Juice vil ekspandere til det japanske marked. De er ikke til stede i Japan i dag. Hvilken Ansoff-strategi anvender de?",
        svar: ["Markedspenetration", "Markedsudvikling", "Produktudvikling", "Diversifikation"],
        korrekt: 1,
        forklaring: "Markedsudvikling er strategien hvor virksomheden tager et eksisterende produkt ind på et nyt marked."
      },
      {
        spoergsmaal: "Hvad er den primære forskel på differentiering og niche-strategi?",
        svar: ["Differentiering henvender sig til alle, niche til et smalt segment", "Niche-strategi er dyrere end differentiering", "Differentiering bruges kun i B2B, niche i B2C", "Der er ingen forskel"],
        korrekt: 0,
        forklaring: "Differentiering handler om at tilbyde noget unikt på hele markedet. Niche-strategi fokuserer på et smalt og veldefineret segment med specifikke behov."
      },
    ],
  },
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

export default function ModulPage({
  params
}: {
  params: Promise<{ id: string; modulId: string }>
}) {
  const { id: kursusId, modulId: modulIdStr } = use(params)
  const modulId = parseInt(modulIdStr)
  const router = useRouter()

  const quiz = QUIZ_DATA[kursusId]?.[modulId] || []

  const [fase, setFase] = useState<'video' | 'quiz' | 'resultat'>('video')
  const [aktivtSpoergsmaal, setAktivtSpoergsmaal] = useState(0)
  const [valgteSvar, setValgteSvar] = useState<number[]>([])
  const [vistForklaring, setVistForklaring] = useState(false)
  const [korrekte, setKorrekte] = useState(0)

  const aktivtQ = quiz[aktivtSpoergsmaal]
  const erSidste = aktivtSpoergsmaal === quiz.length - 1
  const harValgt = valgteSvar[aktivtSpoergsmaal] !== undefined
  const valgtSvar = valgteSvar[aktivtSpoergsmaal]
  const erKorrekt = valgtSvar === aktivtQ?.korrekt

  const vaelgSvar = (index: number) => {
    if (harValgt) return
    const nyeSvar = [...valgteSvar]
    nyeSvar[aktivtSpoergsmaal] = index
    setValgteSvar(nyeSvar)
    if (index === aktivtQ.korrekt) setKorrekte(prev => prev + 1)
    setVistForklaring(true)
  }

  const naesteSpoergsmaal = () => {
    if (erSidste) {
      const erBestaaet = (korrekte + (valgtSvar === aktivtQ?.korrekt ? 1 : 0)) >= Math.ceil(quiz.length * 0.6)
      if (erBestaaet) {
        fetch('/api/fremgang', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            kursus_id: parseInt(kursusId),
            modul_id: modulId,
            quiz_bestaaet: true,
            video_set: true
          })
        })
      }
      setFase('resultat')
    } else {
      setAktivtSpoergsmaal(prev => prev + 1)
      setVistForklaring(false)
    }
  }

  const bestaaet = quiz.length > 0 && korrekte >= Math.ceil(quiz.length * 0.6)

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
        <div className="mb-6">
          <a href={`/kurser/${kursusId}`} className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1">
            ← Tilbage til kurset
          </a>
        </div>

        {fase === 'video' && (
          <div>
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">
              <div className="bg-gray-900 aspect-video flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4 mx-auto cursor-pointer hover:bg-white/30 transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                  <p className="text-white text-sm font-medium">Modul {modulId}</p>
                  <p className="text-white/60 text-xs mt-1">Video produceres i Synthesia</p>
                </div>
              </div>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Modul {modulId}</h2>
                <p className="text-gray-500 text-sm">Se videoen og tag derefter videnchecket. Du skal besvare mindst 60% korrekt for at bestå.</p>
              </div>
            </div>
            <button onClick={() => setFase('quiz')}
              className="w-full bg-blue-900 text-white py-3 rounded-xl font-medium hover:bg-blue-800 transition-colors">
              Start videncheck →
            </button>
          </div>
        )}

        {fase === 'quiz' && aktivtQ && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Videncheck</h2>
              <span className="text-sm text-gray-400">{aktivtSpoergsmaal + 1} / {quiz.length}</span>
            </div>
            <div className="bg-gray-100 rounded-full h-2 mb-8">
              <div className="bg-orange-400 h-2 rounded-full transition-all"
                style={{ width: `${((aktivtSpoergsmaal + 1) / quiz.length) * 100}%` }}></div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6">
              <p className="text-lg font-medium text-gray-900 mb-6 leading-relaxed">{aktivtQ.spoergsmaal}</p>
              <div className="space-y-3">
                {aktivtQ.svar.map((svar, i) => {
                  let klasse = "w-full text-left px-5 py-4 rounded-xl border-2 transition-all text-sm "
                  if (!harValgt) klasse += "border-gray-200 hover:border-blue-300 bg-white text-gray-700 cursor-pointer"
                  else if (i === aktivtQ.korrekt) klasse += "border-green-400 bg-green-50 text-green-800"
                  else if (i === valgtSvar && i !== aktivtQ.korrekt) klasse += "border-red-300 bg-red-50 text-red-700"
                  else klasse += "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
                  return (
                    <button key={i} onClick={() => vaelgSvar(i)} className={klasse}>
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          !harValgt ? 'border-gray-300 text-gray-500' :
                          i === aktivtQ.korrekt ? 'border-green-400 bg-green-400 text-white' :
                          i === valgtSvar ? 'border-red-400 bg-red-400 text-white' :
                          'border-gray-200 text-gray-400'
                        }`}>
                          {!harValgt ? String.fromCharCode(65 + i) :
                           i === aktivtQ.korrekt ? '✓' :
                           i === valgtSvar ? '✗' :
                           String.fromCharCode(65 + i)}
                        </span>
                        {svar}
                      </div>
                    </button>
                  )
                })}
              </div>
              {vistForklaring && (
                <div className={`mt-6 p-4 rounded-xl ${erKorrekt ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'}`}>
                  <p className={`text-sm font-medium mb-1 ${erKorrekt ? 'text-green-700' : 'text-orange-700'}`}>
                    {erKorrekt ? '✓ Korrekt!' : '✗ Ikke helt rigtigt'}
                  </p>
                  <p className={`text-sm ${erKorrekt ? 'text-green-600' : 'text-orange-600'}`}>
                    {aktivtQ.forklaring}
                  </p>
                </div>
              )}
            </div>
            {harValgt && (
              <button onClick={naesteSpoergsmaal}
                className="w-full bg-blue-900 text-white py-3 rounded-xl font-medium hover:bg-blue-800 transition-colors">
                {erSidste ? 'Se resultat →' : 'Næste spørgsmål →'}
              </button>
            )}
          </div>
        )}

        {fase === 'resultat' && (
          <div className="text-center">
            <div className={`rounded-2xl p-10 mb-6 ${bestaaet ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'}`}>
              <div className="text-5xl mb-4">{bestaaet ? '🎉' : '📚'}</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {bestaaet ? 'Modul bestået!' : 'Prøv igen'}
              </h2>
              <p className="text-gray-600 mb-4">
                Du svarede korrekt på {korrekte} ud af {quiz.length} spørgsmål
              </p>
              <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 border">
                <span className="text-lg font-bold text-gray-900">
                  {Math.round((korrekte / quiz.length) * 100)}%
                </span>
                <span className="text-sm text-gray-500">
                  {bestaaet ? '— Bestået ✓' : '— Kræver 60%'}
                </span>
              </div>
            </div>
            {bestaaet ? (
              <div className="space-y-3">
                <button onClick={() => router.push(`/kurser/${kursusId}/modul/${modulId + 1}`)}
                  className="w-full bg-blue-900 text-white py-3 rounded-xl font-medium hover:bg-blue-800">
                  Næste modul →
                </button>
                <button onClick={() => router.push(`/kurser/${kursusId}`)}
                  className="w-full border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50">
                  Tilbage til kursoversigt
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <button onClick={() => {
                  setFase('quiz')
                  setAktivtSpoergsmaal(0)
                  setValgteSvar([])
                  setVistForklaring(false)
                  setKorrekte(0)
                }}
                  className="w-full bg-orange-500 text-white py-3 rounded-xl font-medium hover:bg-orange-600">
                  Prøv quizzen igen
                </button>
                <button onClick={() => setFase('video')}
                  className="w-full border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50">
                  Se videoen igen
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}