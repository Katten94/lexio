import PptxGenJS from 'pptxgenjs'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

const FARVER = {
  blaa: '1e40af',
  orange: 'F97316',
  lysblaa: 'EFF6FF',
  lysorange: 'FFF7ED',
  graa: 'F8FAFC',
  moerkgraa: '374151',
  tekst: '1F2937',
  hvid: 'FFFFFF',
  lysgraa: 'F3F4F6',
  border: 'E5E7EB',
}

const KURSUS_DEFINITIONER: Record<string, {
  titel: string
  fag: string
  niveau: string
  cases: string[]
  kompetencemaal: string[]
}> = {
  "1": {
    titel: "Markedsanalyse og forbrugeradfærd",
    fag: "Afsætning A",
    niveau: "A",
    cases: ["MENY", "Arla Foods", "Zalando"],
    kompetencemaal: [
      "Anvende afsætningsøkonomiske modeller til analyse af virksomhedens situation",
      "Analysere forbrugeradfærd og segmentere markeder",
      "Planlægge og gennemføre markedsanalyser"
    ]
  }
}

async function genererCaseIndhold(kursusId: string) {
  const kursus = KURSUS_DEFINITIONER[kursusId] || KURSUS_DEFINITIONER["1"]

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 2500,
    messages: [{
      role: 'user',
      content: `Du er fagdidaktiker i ${kursus.fag} på EUD niveau ${kursus.niveau}.
Generer caseindhold til undervisning om: ${kursus.titel}
Brug ${kursus.cases[0]} som gennemgående case og ${kursus.cases[1]} som sekundær case.
Svar KUN med et JSON objekt. Ingen forklaringer, ingen markdown, ingen kommentarer.
Start direkte med { og slut med }

{
  "case_intro": "2 sætninger der introducerer ${kursus.cases[0]}",
  "case_baggrund": "3 sætninger om ${kursus.cases[0]}s markedssituation i 2025",
  "primaer_eksempel": "1 sætning om primær dataindsamling for ${kursus.cases[0]}",
  "sekundaer_eksempel": "1 sætning om sekundær data for ${kursus.cases[0]}",
  "segmentering_eksempel": "2 sætninger om segmentering hos ${kursus.cases[0]}",
  "kotler_faser": {
    "behov": "1 sætning om behovserkendelse",
    "soegning": "1 sætning om informationssøgning",
    "vurdering": "1 sætning om vurdering af alternativer",
    "koeb": "1 sætning om købsbeslutning",
    "efterkoeb": "1 sætning om efterkøbsadfærd"
  },
  "swot_styrker": "2 styrker for ${kursus.cases[0]}",
  "swot_svagheder": "2 svagheder for ${kursus.cases[0]}",
  "swot_muligheder": "2 muligheder for ${kursus.cases[0]}",
  "swot_trusler": "2 trusler mod ${kursus.cases[0]}",
  "opgave_tekst": "Gruppeøvelse på 15 min med ${kursus.cases[1]} som case",
  "diskussion": ["spørgsmål 1", "spørgsmål 2", "spørgsmål 3"],
  "opsamling_punkter": ["punkt 1", "punkt 2", "punkt 3"]
}`
    }]
  })

  const content = message.content[0]
  if (content.type !== 'text') throw new Error('Uventet svar')

  let text = content.text
  text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('Ingen JSON fundet')
  text = text.slice(start, end + 1)

  console.log('JSON preview:', text.slice(0, 300))

  return { kursus, indhold: JSON.parse(text) }
}

function header(slide: any, pptx: any, titel: string) {
  slide.addText(titel, {
    x: 0.5, y: 0.25, w: 9, h: 0.55,
    fontSize: 22, bold: true, color: FARVER.blaa, fontFace: 'Arial'
  })
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 0.82, w: 9, h: 0.05,
    fill: { color: FARVER.orange }, line: { color: FARVER.orange }
  })
}

function slide_titel(pptx: any, kursus: any) {
  const slide = pptx.addSlide()
  slide.background = { color: FARVER.blaa }
  slide.addText('DIDANTO.', {
    x: 0.5, y: 0.3, w: 3, h: 0.35,
    fontSize: 13, bold: true, color: 'BFD4FF', fontFace: 'Arial'
  })
  slide.addText(kursus.titel, {
    x: 0.5, y: 1.3, w: 8.5, h: 1.4,
    fontSize: 34, bold: true, color: FARVER.hvid, fontFace: 'Arial', valign: 'middle'
  })
  slide.addText(`${kursus.fag}  ·  Niveau ${kursus.niveau}`, {
    x: 0.5, y: 2.85, w: 6, h: 0.4,
    fontSize: 14, color: 'BFD4FF', fontFace: 'Arial'
  })
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 3.4, w: 1.8, h: 0.08,
    fill: { color: FARVER.orange }, line: { color: FARVER.orange }
  })
  kursus.kompetencemaal.forEach((maal: string, i: number) => {
    slide.addText(`✓  ${maal}`, {
      x: 0.5, y: 3.7 + i * 0.45, w: 9, h: 0.4,
      fontSize: 12, color: 'BFD4FF', fontFace: 'Arial'
    })
  })
}

function slide_case_intro(pptx: any, indhold: any, virksomhed: string) {
  const slide = pptx.addSlide()
  slide.background = { color: FARVER.hvid }
  header(slide, pptx, `Dagens case: ${virksomhed}`)
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 1.0, w: 9, h: 0.75,
    fill: { color: FARVER.blaa }, line: { color: FARVER.blaa }
  })
  slide.addText(virksomhed, {
    x: 0.5, y: 1.0, w: 9, h: 0.75,
    fontSize: 26, bold: true, color: FARVER.hvid, fontFace: 'Arial',
    align: 'center', valign: 'middle'
  })
  slide.addText(indhold.case_intro, {
    x: 0.5, y: 1.95, w: 9, h: 0.7,
    fontSize: 13, color: FARVER.moerkgraa, fontFace: 'Arial', italic: true
  })
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 2.8, w: 9, h: 1.6,
    fill: { color: FARVER.lysgraa }, line: { color: FARVER.border }
  })
  slide.addText(indhold.case_baggrund, {
    x: 0.7, y: 2.9, w: 8.6, h: 1.4,
    fontSize: 13, color: FARVER.tekst, fontFace: 'Arial', valign: 'top'
  })
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 4.55, w: 9, h: 0.35,
    fill: { color: FARVER.lysorange }, line: { color: FARVER.orange }
  })
  slide.addText('Vi bruger denne case gennem hele lektionen', {
    x: 0.5, y: 4.55, w: 9, h: 0.35,
    fontSize: 11, color: FARVER.orange, fontFace: 'Arial',
    align: 'center', valign: 'middle', bold: true
  })
}

function slide_primaer_sekundaer_model(pptx: any) {
  const slide = pptx.addSlide()
  slide.background = { color: FARVER.hvid }
  header(slide, pptx, 'Primær og sekundær data')
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 1.05, w: 4.2, h: 0.55,
    fill: { color: FARVER.blaa }, line: { color: FARVER.blaa }
  })
  slide.addText('PRIMÆR DATA', {
    x: 0.5, y: 1.05, w: 4.2, h: 0.55,
    fontSize: 16, bold: true, color: FARVER.hvid, fontFace: 'Arial',
    align: 'center', valign: 'middle'
  })
  const primaerPunkter = [
    '• Indsamles selv til det konkrete formål',
    '• Spørgeskemaer, interviews, observationer',
    '• Fokusgrupper og eksperimenter',
    '• Dyrere og mere tidskrævende',
    '• Præcis og målrettet'
  ]
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 1.6, w: 4.2, h: 2.8,
    fill: { color: FARVER.lysblaa }, line: { color: FARVER.blaa, width: 1 }
  })
  primaerPunkter.forEach((p, i) => {
    slide.addText(p, {
      x: 0.65, y: 1.75 + i * 0.5, w: 3.9, h: 0.45,
      fontSize: 12, color: FARVER.tekst, fontFace: 'Arial'
    })
  })
  slide.addShape(pptx.ShapeType.rect, {
    x: 5.3, y: 1.05, w: 4.2, h: 0.55,
    fill: { color: FARVER.orange }, line: { color: FARVER.orange }
  })
  slide.addText('SEKUNDÆR DATA', {
    x: 5.3, y: 1.05, w: 4.2, h: 0.55,
    fontSize: 16, bold: true, color: FARVER.hvid, fontFace: 'Arial',
    align: 'center', valign: 'middle'
  })
  const sekundaerPunkter = [
    '• Allerede indsamlet af andre',
    '• Statistikker, rapporter, artikler',
    '• Danmarks Statistik, brancheanalyser',
    '• Billigere og hurtigere at indhente',
    '• Bruges som udgangspunkt'
  ]
  slide.addShape(pptx.ShapeType.rect, {
    x: 5.3, y: 1.6, w: 4.2, h: 2.8,
    fill: { color: FARVER.lysorange }, line: { color: FARVER.orange, width: 1 }
  })
  sekundaerPunkter.forEach((p, i) => {
    slide.addText(p, {
      x: 5.45, y: 1.75 + i * 0.5, w: 3.9, h: 0.45,
      fontSize: 12, color: FARVER.tekst, fontFace: 'Arial'
    })
  })
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 4.55, w: 9, h: 0.4,
    fill: { color: FARVER.lysblaa }, line: { color: FARVER.blaa, width: 1 }
  })
  slide.addText('Tommelfingerregel: Start altid med sekundær data — det er billigere og hurtigere', {
    x: 0.5, y: 4.55, w: 9, h: 0.4,
    fontSize: 12, bold: true, color: FARVER.blaa, fontFace: 'Arial',
    align: 'center', valign: 'middle'
  })
}

function slide_primaer_sekundaer_case(pptx: any, indhold: any, virksomhed: string) {
  const slide = pptx.addSlide()
  slide.background = { color: FARVER.hvid }
  header(slide, pptx, `Primær og sekundær data — ${virksomhed}`)
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 1.05, w: 9, h: 0.4,
    fill: { color: FARVER.lysgraa }, line: { color: FARVER.border }
  })
  slide.addText(`Hvordan kan ${virksomhed} indsamle data om deres kunder?`, {
    x: 0.5, y: 1.05, w: 9, h: 0.4,
    fontSize: 13, bold: true, color: FARVER.tekst, fontFace: 'Arial',
    align: 'center', valign: 'middle'
  })
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 1.6, w: 4.2, h: 0.45,
    fill: { color: FARVER.blaa }, line: { color: FARVER.blaa }
  })
  slide.addText('PRIMÆR DATA', {
    x: 0.5, y: 1.6, w: 4.2, h: 0.45,
    fontSize: 13, bold: true, color: FARVER.hvid, fontFace: 'Arial',
    align: 'center', valign: 'middle'
  })
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 2.05, w: 4.2, h: 1.4,
    fill: { color: FARVER.lysblaa }, line: { color: FARVER.blaa, width: 1 }
  })
  slide.addText(indhold.primaer_eksempel, {
    x: 0.65, y: 2.1, w: 3.9, h: 1.3,
    fontSize: 12, color: FARVER.tekst, fontFace: 'Arial', valign: 'middle'
  })
  slide.addShape(pptx.ShapeType.rect, {
    x: 5.3, y: 1.6, w: 4.2, h: 0.45,
    fill: { color: FARVER.orange }, line: { color: FARVER.orange }
  })
  slide.addText('SEKUNDÆR DATA', {
    x: 5.3, y: 1.6, w: 4.2, h: 0.45,
    fontSize: 13, bold: true, color: FARVER.hvid, fontFace: 'Arial',
    align: 'center', valign: 'middle'
  })
  slide.addShape(pptx.ShapeType.rect, {
    x: 5.3, y: 2.05, w: 4.2, h: 1.4,
    fill: { color: FARVER.lysorange }, line: { color: FARVER.orange, width: 1 }
  })
  slide.addText(indhold.sekundaer_eksempel, {
    x: 5.45, y: 2.1, w: 3.9, h: 1.3,
    fontSize: 12, color: FARVER.tekst, fontFace: 'Arial', valign: 'middle'
  })
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 3.6, w: 9, h: 1.2,
    fill: { color: FARVER.lysgraa }, line: { color: FARVER.border }
  })
  slide.addText('💬  Diskuter i makker-par:', {
    x: 0.7, y: 3.65, w: 8.6, h: 0.35,
    fontSize: 12, bold: true, color: FARVER.blaa, fontFace: 'Arial'
  })
  slide.addText(`Hvilken datatype ville give ${virksomhed} mest værdifuld information om en ny produktlancering — og hvorfor?`, {
    x: 0.7, y: 4.0, w: 8.6, h: 0.7,
    fontSize: 12, color: FARVER.tekst, fontFace: 'Arial'
  })
}

function slide_segmentering_model(pptx: any) {
  const slide = pptx.addSlide()
  slide.background = { color: FARVER.hvid }
  header(slide, pptx, 'Segmentering — de fire typer')
  const typer = [
    { label: 'DEMOGRAFISK', farve: FARVER.blaa, lysFarve: FARVER.lysblaa, eksempler: 'Alder · Køn · Indkomst\nUddannelse · Familiestørrelse', x: 0.5, y: 1.05 },
    { label: 'GEOGRAFISK', farve: '16A34A', lysFarve: 'F0FDF4', eksempler: 'Land · Region · By\nKlima · Befolkningstæthed', x: 5.3, y: 1.05 },
    { label: 'PSYKOGRAFISK', farve: '7C3AED', lysFarve: 'F5F3FF', eksempler: 'Livsstil · Værdier\nPersonlighed · Interesser', x: 0.5, y: 3.05 },
    { label: 'ADFÆRDSMÆSSIG', farve: FARVER.orange, lysFarve: FARVER.lysorange, eksempler: 'Købsadfærd · Loyalitet\nBrugsfrekvens · Fordele', x: 5.3, y: 3.05 },
  ]
  typer.forEach(type => {
    slide.addShape(pptx.ShapeType.rect, {
      x: type.x, y: type.y, w: 4.2, h: 0.5,
      fill: { color: type.farve }, line: { color: type.farve }
    })
    slide.addText(type.label, {
      x: type.x, y: type.y, w: 4.2, h: 0.5,
      fontSize: 14, bold: true, color: FARVER.hvid, fontFace: 'Arial',
      align: 'center', valign: 'middle'
    })
    slide.addShape(pptx.ShapeType.rect, {
      x: type.x, y: type.y + 0.5, w: 4.2, h: 1.4,
      fill: { color: type.lysFarve }, line: { color: type.farve, width: 1 }
    })
    slide.addText(type.eksempler, {
      x: type.x + 0.15, y: type.y + 0.6, w: 3.9, h: 1.2,
      fontSize: 13, color: FARVER.tekst, fontFace: 'Arial',
      align: 'center', valign: 'middle'
    })
  })
}

function slide_segmentering_case(pptx: any, indhold: any, virksomhed: string) {
  const slide = pptx.addSlide()
  slide.background = { color: FARVER.hvid }
  header(slide, pptx, `Segmentering i praksis — ${virksomhed}`)
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 1.05, w: 9, h: 0.65,
    fill: { color: FARVER.blaa }, line: { color: FARVER.blaa }
  })
  slide.addText(`Hvordan segmenterer ${virksomhed} deres marked?`, {
    x: 0.5, y: 1.05, w: 9, h: 0.65,
    fontSize: 16, bold: true, color: FARVER.hvid, fontFace: 'Arial',
    align: 'center', valign: 'middle'
  })
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 1.85, w: 9, h: 1.8,
    fill: { color: FARVER.lysgraa }, line: { color: FARVER.border }
  })
  slide.addText(indhold.segmentering_eksempel, {
    x: 0.7, y: 1.95, w: 8.6, h: 1.6,
    fontSize: 14, color: FARVER.tekst, fontFace: 'Arial', valign: 'middle'
  })
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 3.8, w: 9, h: 0.4,
    fill: { color: FARVER.lysorange }, line: { color: FARVER.orange, width: 1 }
  })
  slide.addText('Hvem er deres primære målgruppe — og hvilken segmenteringstype bruges primært?', {
    x: 0.7, y: 3.8, w: 8.6, h: 0.4,
    fontSize: 11, color: FARVER.orange, fontFace: 'Arial', valign: 'middle', bold: true
  })
}

function slide_kotler_model(pptx: any) {
  const slide = pptx.addSlide()
  slide.background = { color: FARVER.hvid }
  header(slide, pptx, 'Kotlers Købsprocessmodel')
  const faser = [
    { label: 'Behovs-\nerkendelse', farve: FARVER.blaa },
    { label: 'Informations-\nsøgning', farve: '1d4ed8' },
    { label: 'Vurdering af\nalternativer', farve: '2563eb' },
    { label: 'Købs-\nbeslutning', farve: '3b82f6' },
    { label: 'Efterkøbs-\nadfærd', farve: FARVER.orange },
  ]
  const boksW = 1.55
  const boksH = 1.1
  const y = 1.3
  faser.forEach((fase, i) => {
    const x = 0.45 + i * 1.85
    slide.addShape(pptx.ShapeType.rect, {
      x, y, w: boksW, h: boksH,
      fill: { color: fase.farve }, line: { color: fase.farve }
    })
    slide.addText(fase.label, {
      x, y, w: boksW, h: boksH,
      fontSize: 11, bold: true, color: FARVER.hvid, fontFace: 'Arial',
      align: 'center', valign: 'middle'
    })
    if (i < faser.length - 1) {
      slide.addText('▶', {
        x: x + boksW + 0.05, y: y + 0.35, w: 0.25, h: 0.4,
        fontSize: 14, color: FARVER.moerkgraa, fontFace: 'Arial', align: 'center'
      })
    }
  })
  const forklaringer = [
    'Forbrugeren\nopdager et behov',
    'Søger info om\nmulige løsninger',
    'Sammenligner\nalternativer',
    'Træffer den\nendelige beslutning',
    'Vurderer om\nkøbet var rigtigt'
  ]
  forklaringer.forEach((tekst, i) => {
    const x = 0.45 + i * 1.85
    slide.addShape(pptx.ShapeType.rect, {
      x, y: 2.55, w: boksW, h: 1.0,
      fill: { color: FARVER.lysblaa }, line: { color: FARVER.border, width: 1 }
    })
    slide.addText(tekst, {
      x: x + 0.05, y: 2.6, w: boksW - 0.1, h: 0.9,
      fontSize: 10, color: FARVER.tekst, fontFace: 'Arial',
      align: 'center', valign: 'middle'
    })
  })
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 3.7, w: 9, h: 0.45,
    fill: { color: FARVER.lysorange }, line: { color: FARVER.orange, width: 1 }
  })
  slide.addText('Kognitiv dissonans: Tvivl og utilfredshed der kan opstå EFTER købet', {
    x: 0.7, y: 3.7, w: 8.6, h: 0.45,
    fontSize: 11, color: FARVER.orange, fontFace: 'Arial', valign: 'middle', bold: true
  })
}

function slide_kotler_case(pptx: any, indhold: any, virksomhed: string) {
  const slide = pptx.addSlide()
  slide.background = { color: FARVER.hvid }
  header(slide, pptx, `Kotlers model i praksis — ${virksomhed}`)
  const faser = [
    { label: 'Behovs-\nerkendelse', key: 'behov', farve: FARVER.blaa },
    { label: 'Informations-\nsøgning', key: 'soegning', farve: '1d4ed8' },
    { label: 'Vurdering af\nalternativer', key: 'vurdering', farve: '2563eb' },
    { label: 'Købs-\nbeslutning', key: 'koeb', farve: '3b82f6' },
    { label: 'Efterkøbs-\nadfærd', key: 'efterkoeb', farve: FARVER.orange },
  ]
  const boksW = 1.55
  const y = 1.05
  faser.forEach((fase, i) => {
    const x = 0.45 + i * 1.85
    slide.addShape(pptx.ShapeType.rect, {
      x, y, w: boksW, h: 0.6,
      fill: { color: fase.farve }, line: { color: fase.farve }
    })
    slide.addText(fase.label, {
      x, y, w: boksW, h: 0.6,
      fontSize: 9, bold: true, color: FARVER.hvid, fontFace: 'Arial',
      align: 'center', valign: 'middle'
    })
    if (i < faser.length - 1) {
      slide.addText('▶', {
        x: x + boksW + 0.05, y: y + 0.1, w: 0.2, h: 0.4,
        fontSize: 12, color: FARVER.moerkgraa, fontFace: 'Arial', align: 'center'
      })
    }
    slide.addShape(pptx.ShapeType.rect, {
      x, y: 1.75, w: boksW, h: 2.6,
      fill: { color: FARVER.lysblaa }, line: { color: FARVER.border, width: 1 }
    })
    slide.addText(indhold.kotler_faser[fase.key] || '', {
      x: x + 0.08, y: 1.85, w: boksW - 0.16, h: 2.4,
      fontSize: 10, color: FARVER.tekst, fontFace: 'Arial', valign: 'top', align: 'left'
    })
  })
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 4.5, w: 9, h: 0.4,
    fill: { color: FARVER.lysgraa }, line: { color: FARVER.border }
  })
  slide.addText(`Kan I genkende faserne fra jeres eget indkøb hos ${virksomhed}?`, {
    x: 0.7, y: 4.5, w: 8.6, h: 0.4,
    fontSize: 11, color: FARVER.moerkgraa, fontFace: 'Arial', valign: 'middle', italic: true
  })
}

function slide_swot_model(pptx: any) {
  const slide = pptx.addSlide()
  slide.background = { color: FARVER.hvid }
  header(slide, pptx, 'SWOT-analyse')
  slide.addText('INTERN', {
    x: 0.5, y: 0.92, w: 4.2, h: 0.3,
    fontSize: 10, color: '9CA3AF', fontFace: 'Arial', align: 'center', italic: true, bold: true
  })
  slide.addText('EKSTERN', {
    x: 5.3, y: 0.92, w: 4.2, h: 0.3,
    fontSize: 10, color: '9CA3AF', fontFace: 'Arial', align: 'center', italic: true, bold: true
  })
  const felter = [
    { label: 'S — Styrker', farve: '16A34A', lysFarve: 'F0FDF4', tekst: 'Interne positive faktorer\nHvad er virksomheden god til?\nKonkurrencefordele', x: 0.5, y: 1.2 },
    { label: 'W — Svagheder', farve: 'DC2626', lysFarve: 'FEF2F2', tekst: 'Interne negative faktorer\nHvad kan forbedres?\nBegrænsninger og mangler', x: 5.3, y: 1.2 },
    { label: 'O — Muligheder', farve: FARVER.blaa, lysFarve: FARVER.lysblaa, tekst: 'Eksterne positive faktorer\nTrends og tendenser\nUudnyttede markedsmuligheder', x: 0.5, y: 3.1 },
    { label: 'T — Trusler', farve: 'D97706', lysFarve: FARVER.lysorange, tekst: 'Eksterne negative faktorer\nKonkurrenter og substitutter\nMarkedsændringer', x: 5.3, y: 3.1 },
  ]
  felter.forEach(felt => {
    slide.addShape(pptx.ShapeType.rect, {
      x: felt.x, y: felt.y, w: 4.2, h: 0.5,
      fill: { color: felt.farve }, line: { color: felt.farve }
    })
    slide.addText(felt.label, {
      x: felt.x, y: felt.y, w: 4.2, h: 0.5,
      fontSize: 14, bold: true, color: FARVER.hvid, fontFace: 'Arial',
      align: 'center', valign: 'middle'
    })
    slide.addShape(pptx.ShapeType.rect, {
      x: felt.x, y: felt.y + 0.5, w: 4.2, h: 1.4,
      fill: { color: felt.lysFarve }, line: { color: felt.farve, width: 1 }
    })
    slide.addText(felt.tekst, {
      x: felt.x + 0.15, y: felt.y + 0.6, w: 3.9, h: 1.2,
      fontSize: 11, color: FARVER.tekst, fontFace: 'Arial', valign: 'top'
    })
  })
}

function slide_swot_case(pptx: any, indhold: any, virksomhed: string) {
  const slide = pptx.addSlide()
  slide.background = { color: FARVER.hvid }
  header(slide, pptx, `SWOT-analyse — ${virksomhed}`)
  const felter = [
    { label: 'S — Styrker', farve: '16A34A', lysFarve: 'F0FDF4', tekst: indhold.swot_styrker, x: 0.5, y: 1.05 },
    { label: 'W — Svagheder', farve: 'DC2626', lysFarve: 'FEF2F2', tekst: indhold.swot_svagheder, x: 5.3, y: 1.05 },
    { label: 'O — Muligheder', farve: FARVER.blaa, lysFarve: FARVER.lysblaa, tekst: indhold.swot_muligheder, x: 0.5, y: 3.05 },
    { label: 'T — Trusler', farve: 'D97706', lysFarve: FARVER.lysorange, tekst: indhold.swot_trusler, x: 5.3, y: 3.05 },
  ]
  felter.forEach(felt => {
    slide.addShape(pptx.ShapeType.rect, {
      x: felt.x, y: felt.y, w: 4.2, h: 0.5,
      fill: { color: felt.farve }, line: { color: felt.farve }
    })
    slide.addText(felt.label, {
      x: felt.x, y: felt.y, w: 4.2, h: 0.5,
      fontSize: 13, bold: true, color: FARVER.hvid, fontFace: 'Arial',
      align: 'center', valign: 'middle'
    })
    slide.addShape(pptx.ShapeType.rect, {
      x: felt.x, y: felt.y + 0.5, w: 4.2, h: 1.45,
      fill: { color: felt.lysFarve }, line: { color: felt.farve, width: 1 }
    })
    slide.addText(felt.tekst, {
      x: felt.x + 0.15, y: felt.y + 0.6, w: 3.9, h: 1.25,
      fontSize: 12, color: FARVER.tekst, fontFace: 'Arial', valign: 'top'
    })
  })
}

function slide_gruppeøvelse(pptx: any, indhold: any, sekundaerVirksomhed: string) {
  const slide = pptx.addSlide()
  slide.background = { color: FARVER.hvid }
  header(slide, pptx, 'Gruppeøvelse')
  slide.addShape(pptx.ShapeType.rect, {
    x: 7.8, y: 0.2, w: 1.7, h: 0.5,
    fill: { color: FARVER.lysorange }, line: { color: FARVER.orange, width: 1 }
  })
  slide.addText('15 min', {
    x: 7.8, y: 0.2, w: 1.7, h: 0.5,
    fontSize: 12, bold: true, color: FARVER.orange, fontFace: 'Arial',
    align: 'center', valign: 'middle'
  })
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 1.05, w: 9, h: 0.5,
    fill: { color: FARVER.blaa }, line: { color: FARVER.blaa }
  })
  slide.addText(`Case: ${sekundaerVirksomhed}`, {
    x: 0.5, y: 1.05, w: 9, h: 0.5,
    fontSize: 16, bold: true, color: FARVER.hvid, fontFace: 'Arial',
    align: 'center', valign: 'middle'
  })
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 1.65, w: 9, h: 2.2,
    fill: { color: FARVER.lysgraa }, line: { color: FARVER.border }
  })
  slide.addText(indhold.opgave_tekst, {
    x: 0.7, y: 1.75, w: 8.6, h: 2.0,
    fontSize: 13, color: FARVER.tekst, fontFace: 'Arial', valign: 'top'
  })
  const trin = ['Læs opgaven og fordel roller', 'Analyser med de lærte modeller', 'Forbered 3 min præsentation']
  trin.forEach((t, i) => {
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.5 + i * 3.05, y: 4.0, w: 2.8, h: 0.55,
      fill: { color: i === 2 ? FARVER.orange : FARVER.blaa },
      line: { color: i === 2 ? FARVER.orange : FARVER.blaa }
    })
    slide.addText(`${i + 1}.  ${t}`, {
      x: 0.5 + i * 3.05, y: 4.0, w: 2.8, h: 0.55,
      fontSize: 11, bold: true, color: FARVER.hvid, fontFace: 'Arial',
      align: 'center', valign: 'middle'
    })
  })
}

function slide_diskussion(pptx: any, indhold: any) {
  const slide = pptx.addSlide()
  slide.background = { color: FARVER.blaa }
  slide.addText('Diskussion', {
    x: 0.5, y: 0.25, w: 9, h: 0.55,
    fontSize: 22, bold: true, color: FARVER.hvid, fontFace: 'Arial'
  })
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 0.82, w: 9, h: 0.05,
    fill: { color: FARVER.orange }, line: { color: FARVER.orange }
  })
  indhold.diskussion.forEach((sp: string, i: number) => {
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.5, y: 1.05 + i * 1.0, w: 9, h: 0.8,
      fill: { color: '1e3a8a' }, line: { color: '3B5AC6', width: 1 }
    })
    slide.addText(`${i + 1}.  ${sp}`, {
      x: 0.7, y: 1.1 + i * 1.0, w: 8.6, h: 0.7,
      fontSize: 13, color: FARVER.hvid, fontFace: 'Arial', valign: 'middle'
    })
  })
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 4.15, w: 9, h: 0.75,
    fill: { color: FARVER.orange }, line: { color: FARVER.orange }
  })
  slide.addText('Hvad tager I med fra denne lektion?', {
    x: 0.5, y: 4.15, w: 9, h: 0.75,
    fontSize: 16, bold: true, color: FARVER.hvid, fontFace: 'Arial',
    align: 'center', valign: 'middle'
  })
}

function slide_opsamling(pptx: any, indhold: any, kursus: any) {
  const slide = pptx.addSlide()
  slide.background = { color: FARVER.hvid }
  header(slide, pptx, 'Opsamling — hvad har vi lært?')
  indhold.opsamling_punkter.forEach((punkt: string, i: number) => {
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.5, y: 1.05 + i * 1.05, w: 0.55, h: 0.55,
      fill: { color: i % 2 === 0 ? FARVER.blaa : FARVER.orange },
      line: { color: i % 2 === 0 ? FARVER.blaa : FARVER.orange }
    })
    slide.addText(`${i + 1}`, {
      x: 0.5, y: 1.05 + i * 1.05, w: 0.55, h: 0.55,
      fontSize: 14, bold: true, color: FARVER.hvid, fontFace: 'Arial',
      align: 'center', valign: 'middle'
    })
    slide.addShape(pptx.ShapeType.rect, {
      x: 1.2, y: 1.05 + i * 1.05, w: 8.2, h: 0.55,
      fill: { color: FARVER.lysgraa }, line: { color: FARVER.border }
    })
    slide.addText(punkt, {
      x: 1.4, y: 1.05 + i * 1.05, w: 8.0, h: 0.55,
      fontSize: 13, color: FARVER.tekst, fontFace: 'Arial', valign: 'middle'
    })
  })
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 4.3, w: 9, h: 0.6,
    fill: { color: FARVER.lysblaa }, line: { color: FARVER.blaa, width: 1 }
  })
  slide.addText(`Husk: Brug modellerne aktivt i din undervisning — de giver eleverne et fælles sprog`, {
    x: 0.7, y: 4.3, w: 8.6, h: 0.6,
    fontSize: 12, color: FARVER.blaa, fontFace: 'Arial', valign: 'middle'
  })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Ikke logget ind' }, { status: 401 })

  const { kursus_id } = await request.json()

  try {
    const { kursus, indhold } = await genererCaseIndhold(String(kursus_id))

    const pptx = new PptxGenJS()
    pptx.layout = 'LAYOUT_WIDE'
    pptx.author = 'DIDANTO.'
    pptx.title = kursus.titel

    slide_titel(pptx, kursus)
    slide_case_intro(pptx, indhold, kursus.cases[0])
    slide_primaer_sekundaer_model(pptx)
    slide_primaer_sekundaer_case(pptx, indhold, kursus.cases[0])
    slide_segmentering_model(pptx)
    slide_segmentering_case(pptx, indhold, kursus.cases[0])
    slide_kotler_model(pptx)
    slide_kotler_case(pptx, indhold, kursus.cases[0])
    slide_swot_model(pptx)
    slide_swot_case(pptx, indhold, kursus.cases[0])
    slide_gruppeøvelse(pptx, indhold, kursus.cases[1])
    slide_diskussion(pptx, indhold)
    slide_opsamling(pptx, indhold, kursus)

    const buffer = await pptx.write({ outputType: 'nodebuffer' }) as Buffer
    const base64 = buffer.toString('base64')

    return NextResponse.json({
      success: true,
      filnavn: `${kursus.fag}_${kursus.titel.replace(/\s+/g, '_')}.pptx`,
      base64
    })

  } catch (error) {
    console.error('PPTX fejl:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}