import PptxGenJS from 'pptxgenjs'
import { Document, Packer, Paragraph, TextRun, BorderStyle, Table, TableRow, TableCell, WidthType, ShadingType } from 'docx'
import * as XLSX from 'xlsx'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

const F = {
  navy: '0F2A5E',
  navyLys: '1a4080',
  navyTitel: '1E3A6E',
  guld: 'F5C842',
  guldLys: 'FDF9EC',
  lysgraa: 'F9FAFB',
  hvid: 'FFFFFF',
  tekst: '111827',
  border: 'E5E7EB',
  groen: '166534',
  groenLys: 'F0FDF4',
  graa: '9CA3AF',
  graaTitel: '7C9CC9',
}

const K: Record<string, { titel: string; fag: string; niveau: string; cases: string[]; maal: string[] }> = {
  "1": {
    titel: "Markedsanalyse og forbrugeradfærd",
    fag: "Afsætning A", niveau: "A",
    cases: ["MENY", "Arla Foods"],
    maal: [
      "Anvende afsætningsøkonomiske modeller til analyse",
      "Analysere forbrugeradfærd og segmentere markeder",
      "Planlægge og gennemføre markedsanalyser"
    ]
  }
}

async function gen(id: string) {
  const k = K[id] || K["1"]
  const prompt = `Du er fagdidaktiker i ${k.fag} niveau ${k.niveau}. Generer undervisningsmateriale om: ${k.titel}. Brug ${k.cases[0]} som primaer case og ${k.cases[1]} som sekundaer case. Skriv vaerdier paa dansk med korrekte ae oe aa. Svar KUN med JSON - ingen markdown, ingen forklaring. Start med { og slut med }. Brug KUN disse eksakte JSON nogler:
{
"case_intro": "2 korte saetninger om ${k.cases[0]}",
"case_baggrund": "3 saetninger om ${k.cases[0]} i 2025",
"primaer_eks": "1 saetning om primaer dataindsamling hos ${k.cases[0]}",
"sekundaer_eks": "1 saetning om sekundaer data hos ${k.cases[0]}",
"seg_eks": "2 saetninger om segmentering hos ${k.cases[0]}",
"kot_behov": "1 kort saetning",
"kot_soeg": "1 kort saetning",
"kot_vurd": "1 kort saetning",
"kot_koeb": "1 kort saetning",
"kot_efter": "1 kort saetning",
"swot_s": "2 korte styrker hos ${k.cases[0]}",
"swot_w": "2 korte svagheder hos ${k.cases[0]}",
"swot_o": "2 korte muligheder for ${k.cases[0]}",
"swot_t": "2 korte trusler mod ${k.cases[0]}",
"disk1": "diskussionssp1",
"disk2": "diskussionssp2",
"disk3": "diskussionssp3",
"ops1": "opsamlingspunkt maks 15 ord",
"ops2": "opsamlingspunkt maks 15 ord",
"ops3": "opsamlingspunkt maks 15 ord",
"forb_laer": "2 saetninger om laeringsforudsaetninger",
"tip1": "didaktisk tip 1",
"tip2": "didaktisk tip 2",
"tip3": "didaktisk tip 3",
"forb_diff": "2 saetninger om differentiering",
"forb_vurd": "2 saetninger om vurdering af laering",
"excel_relevant": true,
"excel_hvornaar": "1 saetning om hvornaar excel bruges",
"excel_opgave": "2 saetninger om hvad eleverne skal goere med datasaettet",
"excel_kol1": "kolonne1navn",
"excel_kol2": "kolonne2navn",
"excel_kol3": "kolonne3navn",
"excel_kol4": "kolonne4navn",
"excel_r1": ["v1","v2","v3","v4"],
"excel_r2": ["v1","v2","v3","v4"],
"excel_r3": ["v1","v2","v3","v4"],
"excel_r4": ["v1","v2","v3","v4"],
"excel_r5": ["v1","v2","v3","v4"],
"excel_r6": ["v1","v2","v3","v4"],
"excel_r7": ["v1","v2","v3","v4"],
"excel_r8": ["v1","v2","v3","v4"]
}`

  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-5', max_tokens: 3500,
    messages: [{ role: 'user', content: prompt }]
  })
  const c = msg.content[0]
  if (c.type !== 'text') throw new Error('Fejl i API svar')
  let t = c.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const s = t.indexOf('{'), e = t.lastIndexOf('}')
  if (s === -1 || e === -1) throw new Error('Ingen JSON fundet')
  const raw = JSON.parse(t.slice(s, e + 1))

  // Map til intern struktur
  const d = {
    case_intro: raw.case_intro || '',
    case_baggrund: raw.case_baggrund || '',
    primaer_eksempel: raw.primaer_eks || '',
    sekundaer_eksempel: raw.sekundaer_eks || '',
    segmentering_eksempel: raw.seg_eks || '',
    kotler_faser: {
      behov: raw.kot_behov || '',
      soegning: raw.kot_soeg || '',
      vurdering: raw.kot_vurd || '',
      koeb: raw.kot_koeb || '',
      efterkoeb: raw.kot_efter || '',
    },
    swot_styrker: raw.swot_s || '',
    swot_svagheder: raw.swot_w || '',
    swot_muligheder: raw.swot_o || '',
    swot_trusler: raw.swot_t || '',
    diskussion: [raw.disk1 || '', raw.disk2 || '', raw.disk3 || ''],
    opsamling_punkter: [raw.ops1 || '', raw.ops2 || '', raw.ops3 || ''],
    forb_laering: raw.forb_laer || '',
    forb_tips: [raw.tip1 || '', raw.tip2 || '', raw.tip3 || ''],
    forb_diff: raw.forb_diff || '',
    forb_vurdering: raw.forb_vurd || '',
    excel_relevant: raw.excel_relevant === true,
    excel_hvornaar: raw.excel_hvornaar || '',
    excel_opgave: raw.excel_opgave || '',
    excel_kolonner: [raw.excel_kol1 || '', raw.excel_kol2 || '', raw.excel_kol3 || '', raw.excel_kol4 || ''],
    excel_raekker: [
      raw.excel_r1 || [], raw.excel_r2 || [], raw.excel_r3 || [],
      raw.excel_r4 || [], raw.excel_r5 || [], raw.excel_r6 || [],
      raw.excel_r7 || [], raw.excel_r8 || [],
    ],
  }
  return { k, d }
}

function logoTitel(s: any, p: any) {
  const x = 0.5
  const y = 0.25
  s.addShape(p.ShapeType.roundRect, { x, y, w: 0.42, h: 0.42, rectRadius: 0.07, fill: { color: F.navyTitel }, line: { color: F.navyTitel } })
  s.addShape(p.ShapeType.ellipse, { x: x + 0.115, y: y + 0.048, w: 0.185, h: 0.185, fill: { color: F.hvid }, line: { color: F.hvid } })
  s.addShape(p.ShapeType.ellipse, { x: x + 0.158, y: y + 0.080, w: 0.095, h: 0.095, fill: { color: F.guld }, line: { color: F.guld } })
  s.addShape(p.ShapeType.ellipse, { x: x + 0.055, y: y + 0.295, w: 0.31, h: 0.13, fill: { color: F.hvid }, line: { color: F.hvid } })
  s.addText('DIDANTO', { x: x + 0.5, y: y + 0.01, w: 2.5, h: 0.2, fontSize: 14, bold: true, color: F.hvid, fontFace: 'Arial Black', charSpacing: -0.5 })
  s.addText('Kompetenceløft', { x: x + 0.5, y: y + 0.205, w: 2.5, h: 0.1, fontSize: 7, color: F.graaTitel, fontFace: 'Arial', charSpacing: 1 })
  s.addText('til undervisere', { x: x + 0.5, y: y + 0.295, w: 2.5, h: 0.1, fontSize: 7, color: F.graaTitel, fontFace: 'Arial', charSpacing: 1 })
}

function logo(s: any, p: any) {
  const y = 7.12
  s.addShape(p.ShapeType.rect, { x: 0.4, y: y - 0.06, w: 9.2, h: 0.008, fill: { color: F.border }, line: { color: F.border } })
  s.addShape(p.ShapeType.roundRect, { x: 0.4, y, w: 0.32, h: 0.32, rectRadius: 0.055, fill: { color: F.navy }, line: { color: F.navy } })
  s.addShape(p.ShapeType.ellipse, { x: 0.508, y: y + 0.035, w: 0.13, h: 0.13, fill: { color: F.hvid }, line: { color: F.hvid } })
  s.addShape(p.ShapeType.ellipse, { x: 0.541, y: y + 0.057, w: 0.062, h: 0.062, fill: { color: F.guld }, line: { color: F.guld } })
  s.addShape(p.ShapeType.ellipse, { x: 0.462, y: y + 0.218, w: 0.196, h: 0.095, fill: { color: F.hvid }, line: { color: F.hvid } })
  s.addText('DIDANTO', { x: 0.75, y, w: 1.3, h: 0.14, fontSize: 9, bold: true, color: F.navy, fontFace: 'Arial Black', charSpacing: -0.3 })
  s.addText('Kompetenceløft', { x: 0.75, y: y + 0.135, w: 1.5, h: 0.08, fontSize: 5, color: F.graa, fontFace: 'Arial', charSpacing: 1 })
  s.addText('til undervisere', { x: 0.75, y: y + 0.21, w: 1.5, h: 0.08, fontSize: 5, color: F.graa, fontFace: 'Arial', charSpacing: 1 })
}

function hdr(s: any, p: any, t: string) {
  s.addText(t, { x: 0.5, y: 0.22, w: 9, h: 0.48, fontSize: 20, bold: true, color: F.navy, fontFace: 'Arial' })
  s.addShape(p.ShapeType.rect, { x: 0.5, y: 0.73, w: 9, h: 0.045, fill: { color: F.guld }, line: { color: F.guld } })
}

function sTitel(p: any, k: any) {
  const s = p.addSlide()
  s.background = { color: F.navy }
  logoTitel(s, p)
  s.addText(k.titel, { x: 0.5, y: 1.6, w: 8.5, h: 1.4, fontSize: 32, bold: true, color: F.hvid, fontFace: 'Arial', valign: 'middle' })
  s.addShape(p.ShapeType.rect, { x: 0.5, y: 2.95, w: 1.5, h: 0.05, fill: { color: F.guld }, line: { color: F.guld } })
  s.addText(`${k.fag}  ·  Niveau ${k.niveau}`, { x: 0.5, y: 3.1, w: 6, h: 0.36, fontSize: 13, color: 'BFD4FF', fontFace: 'Arial' })
  k.maal.forEach((m: string, i: number) => {
    s.addText(`✓  ${m}`, { x: 0.5, y: 3.6 + i * 0.38, w: 9, h: 0.34, fontSize: 11, color: 'BFD4FF', fontFace: 'Arial' })
  })
}

function sCase(p: any, d: any, v: string) {
  const s = p.addSlide()
  s.background = { color: F.hvid }
  hdr(s, p, `Dagens case: ${v}`)
  s.addShape(p.ShapeType.rect, { x: 0.5, y: 0.9, w: 9, h: 0.62, fill: { color: F.navy }, line: { color: F.navy } })
  s.addText(v, { x: 0.5, y: 0.9, w: 9, h: 0.62, fontSize: 22, bold: true, color: F.hvid, fontFace: 'Arial', align: 'center', valign: 'middle' })
  s.addText(d.case_intro, { x: 0.5, y: 1.65, w: 9, h: 0.58, fontSize: 13, color: '4B5563', fontFace: 'Arial', italic: true })
  s.addShape(p.ShapeType.rect, { x: 0.5, y: 2.32, w: 9, h: 2.2, fill: { color: F.lysgraa }, line: { color: F.border } })
  s.addShape(p.ShapeType.rect, { x: 0.5, y: 2.32, w: 0.055, h: 2.2, fill: { color: F.guld }, line: { color: F.guld } })
  s.addText(d.case_baggrund, { x: 0.65, y: 2.42, w: 8.7, h: 2.0, fontSize: 13, color: F.tekst, fontFace: 'Arial', valign: 'top' })
  s.addShape(p.ShapeType.rect, { x: 0.5, y: 4.65, w: 9, h: 0.38, fill: { color: F.guldLys }, line: { color: F.guld } })
  s.addText('Denne virksomhed følger os gennem hele lektionen', { x: 0.5, y: 4.65, w: 9, h: 0.38, fontSize: 11, color: '92400E', fontFace: 'Arial', align: 'center', valign: 'middle', bold: true })
  logo(s, p)
}

function sPriModel(p: any) {
  const s = p.addSlide()
  s.background = { color: F.hvid }
  hdr(s, p, 'Primær og sekundær data')
  s.addShape(p.ShapeType.rect, { x: 0.5, y: 0.95, w: 4.2, h: 0.45, fill: { color: F.navy }, line: { color: F.navy } })
  s.addText('PRIMÆR DATA', { x: 0.5, y: 0.95, w: 4.2, h: 0.45, fontSize: 14, bold: true, color: F.hvid, fontFace: 'Arial', align: 'center', valign: 'middle' })
  s.addShape(p.ShapeType.rect, { x: 0.5, y: 1.4, w: 4.2, h: 3.0, fill: { color: 'EFF6FF' }, line: { color: 'BFDBFE', width: 1 } })
  ;['Indsamles selv til formålet', 'Spørgeskemaer og interviews', 'Fokusgrupper og observationer', 'Dyrere og tidskrævende', 'Præcis og målrettet'].forEach((x, i) => {
    s.addText(`·  ${x}`, { x: 0.7, y: 1.53 + i * 0.52, w: 3.9, h: 0.46, fontSize: 12, color: F.tekst, fontFace: 'Arial' })
  })
  s.addShape(p.ShapeType.rect, { x: 5.3, y: 0.95, w: 4.2, h: 0.45, fill: { color: F.navyLys }, line: { color: F.navyLys } })
  s.addText('SEKUNDÆR DATA', { x: 5.3, y: 0.95, w: 4.2, h: 0.45, fontSize: 14, bold: true, color: F.hvid, fontFace: 'Arial', align: 'center', valign: 'middle' })
  s.addShape(p.ShapeType.rect, { x: 5.3, y: 1.4, w: 4.2, h: 3.0, fill: { color: F.guldLys }, line: { color: 'F0E68C', width: 1 } })
  ;['Allerede indsamlet af andre', 'Statistikker og rapporter', 'Danmarks Statistik', 'Billigere og hurtigere', 'Godt udgangspunkt'].forEach((x, i) => {
    s.addText(`·  ${x}`, { x: 5.5, y: 1.53 + i * 0.52, w: 3.9, h: 0.46, fontSize: 12, color: F.tekst, fontFace: 'Arial' })
  })
  s.addShape(p.ShapeType.rect, { x: 0.5, y: 4.55, w: 9, h: 0.38, fill: { color: 'EFF6FF' }, line: { color: 'BFDBFE', width: 1 } })
  s.addText('Tommelfingerregel: Start altid med sekundær data', { x: 0.5, y: 4.55, w: 9, h: 0.38, fontSize: 12, bold: true, color: F.navy, fontFace: 'Arial', align: 'center', valign: 'middle' })
  logo(s, p)
}

function sPriCase(p: any, d: any, v: string) {
  const s = p.addSlide()
  s.background = { color: F.hvid }
  hdr(s, p, `Primær og sekundær data  —  ${v}`)
  s.addShape(p.ShapeType.rect, { x: 0.5, y: 0.95, w: 9, h: 0.38, fill: { color: F.lysgraa }, line: { color: F.border } })
  s.addText(`Hvordan kan ${v} indsamle data?`, { x: 0.5, y: 0.95, w: 9, h: 0.38, fontSize: 13, bold: true, color: F.tekst, fontFace: 'Arial', align: 'center', valign: 'middle' })
  s.addShape(p.ShapeType.rect, { x: 0.5, y: 1.45, w: 4.2, h: 0.42, fill: { color: F.navy }, line: { color: F.navy } })
  s.addText('PRIMÆR', { x: 0.5, y: 1.45, w: 4.2, h: 0.42, fontSize: 13, bold: true, color: F.hvid, fontFace: 'Arial', align: 'center', valign: 'middle' })
  s.addShape(p.ShapeType.rect, { x: 0.5, y: 1.87, w: 4.2, h: 2.2, fill: { color: 'EFF6FF' }, line: { color: 'BFDBFE', width: 1 } })
  s.addText(d.primaer_eksempel, { x: 0.65, y: 1.97, w: 3.9, h: 2.0, fontSize: 12, color: F.tekst, fontFace: 'Arial', valign: 'top' })
  s.addShape(p.ShapeType.rect, { x: 5.3, y: 1.45, w: 4.2, h: 0.42, fill: { color: F.navyLys }, line: { color: F.navyLys } })
  s.addText('SEKUNDÆR', { x: 5.3, y: 1.45, w: 4.2, h: 0.42, fontSize: 13, bold: true, color: F.hvid, fontFace: 'Arial', align: 'center', valign: 'middle' })
  s.addShape(p.ShapeType.rect, { x: 5.3, y: 1.87, w: 4.2, h: 2.2, fill: { color: F.guldLys }, line: { color: 'F0E68C', width: 1 } })
  s.addText(d.sekundaer_eksempel, { x: 5.45, y: 1.97, w: 3.9, h: 2.0, fontSize: 12, color: F.tekst, fontFace: 'Arial', valign: 'top' })
  s.addShape(p.ShapeType.rect, { x: 0.5, y: 4.22, w: 9, h: 0.58, fill: { color: F.lysgraa }, line: { color: F.border } })
  s.addText(`💬 Diskuter i makker-par (3 min): Hvilken datatype giver mest værdi for ${v}?`, { x: 0.7, y: 4.32, w: 8.6, h: 0.38, fontSize: 12, color: F.tekst, fontFace: 'Arial' })
  logo(s, p)
}

function sSegModel(p: any) {
  const s = p.addSlide()
  s.background = { color: F.hvid }
  hdr(s, p, 'Segmentering  —  de fire typer')
  const t = [
    { l: 'DEMOGRAFISK', f: F.navy, lf: 'EFF6FF', bf: 'BFDBFE', e: 'Alder  ·  Køn\nIndkomst  ·  Uddannelse', x: 0.5, y: 0.95 },
    { l: 'GEOGRAFISK', f: '166534', lf: 'F0FDF4', bf: 'BBF7D0', e: 'Land  ·  Region\nBy  ·  Klima', x: 5.3, y: 0.95 },
    { l: 'PSYKOGRAFISK', f: '5B21B6', lf: 'F5F3FF', bf: 'DDD6FE', e: 'Livsstil  ·  Værdier\nPersonlighed', x: 0.5, y: 2.88 },
    { l: 'ADFÆRDSMÆSSIG', f: '92400E', lf: F.guldLys, bf: 'F0E68C', e: 'Købsadfærd  ·  Loyalitet\nFordele', x: 5.3, y: 2.88 },
  ]
  t.forEach(i => {
    s.addShape(p.ShapeType.rect, { x: i.x, y: i.y, w: 4.2, h: 0.44, fill: { color: i.f }, line: { color: i.f } })
    s.addText(i.l, { x: i.x, y: i.y, w: 4.2, h: 0.44, fontSize: 13, bold: true, color: F.hvid, fontFace: 'Arial', align: 'center', valign: 'middle' })
    s.addShape(p.ShapeType.rect, { x: i.x, y: i.y + 0.44, w: 4.2, h: 1.78, fill: { color: i.lf }, line: { color: i.bf, width: 1 } })
    s.addText(i.e, { x: i.x + 0.15, y: i.y + 0.54, w: 3.9, h: 1.58, fontSize: 12, color: F.tekst, fontFace: 'Arial', align: 'center', valign: 'middle' })
  })
  logo(s, p)
}

function sSegCase(p: any, d: any, v: string) {
  const s = p.addSlide()
  s.background = { color: F.hvid }
  hdr(s, p, `Segmentering i praksis  —  ${v}`)
  s.addShape(p.ShapeType.rect, { x: 0.5, y: 0.95, w: 9, h: 0.55, fill: { color: F.navy }, line: { color: F.navy } })
  s.addText(`Hvordan segmenterer ${v} deres marked?`, { x: 0.5, y: 0.95, w: 9, h: 0.55, fontSize: 15, bold: true, color: F.hvid, fontFace: 'Arial', align: 'center', valign: 'middle' })
  s.addShape(p.ShapeType.rect, { x: 0.5, y: 1.6, w: 9, h: 2.5, fill: { color: F.lysgraa }, line: { color: F.border } })
  s.addShape(p.ShapeType.rect, { x: 0.5, y: 1.6, w: 0.055, h: 2.5, fill: { color: F.guld }, line: { color: F.guld } })
  s.addText(d.segmentering_eksempel, { x: 0.65, y: 1.7, w: 8.7, h: 2.3, fontSize: 13, color: F.tekst, fontFace: 'Arial', valign: 'top' })
  s.addShape(p.ShapeType.rect, { x: 0.5, y: 4.28, w: 9, h: 0.4, fill: { color: F.guldLys }, line: { color: F.guld, width: 1 } })
  s.addText('Hvem er den primære målgruppe — og hvilken segmenteringstype bruges primært?', { x: 0.7, y: 4.28, w: 8.6, h: 0.4, fontSize: 11, color: '92400E', fontFace: 'Arial', valign: 'middle', bold: true })
  logo(s, p)
}

function sKotModel(p: any) {
  const s = p.addSlide()
  s.background = { color: F.hvid }
  hdr(s, p, 'Kotlers Købsprocessmodel')
  const fa = [
    { l: 'Behovs-\nerkendelse', f: F.navy },
    { l: 'Informations-\nsøgning', f: '1a4080' },
    { l: 'Vurdering af\nalternativer', f: '1e4d8c' },
    { l: 'Købs-\nbeslutning', f: '2558a3' },
    { l: 'Efterkøbs-\nadfærd', f: '2d65b8' },
  ]
  fa.forEach((fase, i) => {
    const x = 0.45 + i * 1.84
    s.addShape(p.ShapeType.rect, { x, y: 1.1, w: 1.55, h: 1.1, fill: { color: fase.f }, line: { color: fase.f } })
    s.addText(fase.l, { x, y: 1.1, w: 1.55, h: 1.1, fontSize: 11, bold: true, color: F.hvid, fontFace: 'Arial', align: 'center', valign: 'middle' })
    if (i < 4) s.addText('▶', { x: x + 1.59, y: 1.38, w: 0.22, h: 0.5, fontSize: 12, color: '9CA3AF', fontFace: 'Arial', align: 'center' })
  })
  ;['Opdager\net behov', 'Søger\ninformation', 'Sammenligner\nalternativer', 'Træffer\nbeslutning', 'Vurderer\nkøbet'].forEach((t, i) => {
    const x = 0.45 + i * 1.84
    s.addShape(p.ShapeType.rect, { x, y: 2.35, w: 1.55, h: 1.1, fill: { color: 'EFF6FF' }, line: { color: 'BFDBFE', width: 1 } })
    s.addText(t, { x: x + 0.05, y: 2.4, w: 1.45, h: 1.0, fontSize: 10, color: F.tekst, fontFace: 'Arial', align: 'center', valign: 'middle' })
  })
  s.addShape(p.ShapeType.rect, { x: 0.5, y: 3.62, w: 9, h: 0.42, fill: { color: F.guldLys }, line: { color: F.guld, width: 1 } })
  s.addText('Kognitiv dissonans: Tvivl og utilfredshed der kan opstå EFTER købet', { x: 0.7, y: 3.62, w: 8.6, h: 0.42, fontSize: 11, color: '92400E', fontFace: 'Arial', valign: 'middle', bold: true })
  logo(s, p)
}

function sKotCase(p: any, d: any, v: string) {
  const s = p.addSlide()
  s.background = { color: F.hvid }
  hdr(s, p, `Kotlers model i praksis  —  ${v}`)
  const fa = [
    { l: 'Behovs-\nerkendelse', k: 'behov', f: F.navy },
    { l: 'Informations-\nsøgning', k: 'soegning', f: '1a4080' },
    { l: 'Vurdering af\nalternativer', k: 'vurdering', f: '1e4d8c' },
    { l: 'Købs-\nbeslutning', k: 'koeb', f: '2558a3' },
    { l: 'Efterkøbs-\nadfærd', k: 'efterkoeb', f: '2d65b8' },
  ]
  fa.forEach((fase, i) => {
    const x = 0.45 + i * 1.84
    s.addShape(p.ShapeType.rect, { x, y: 0.95, w: 1.55, h: 0.5, fill: { color: fase.f }, line: { color: fase.f } })
    s.addText(fase.l, { x, y: 0.95, w: 1.55, h: 0.5, fontSize: 9, bold: true, color: F.hvid, fontFace: 'Arial', align: 'center', valign: 'middle' })
    if (i < 4) s.addText('▶', { x: x + 1.59, y: 1.08, w: 0.2, h: 0.28, fontSize: 10, color: '9CA3AF', fontFace: 'Arial', align: 'center' })
    s.addShape(p.ShapeType.rect, { x, y: 1.55, w: 1.55, h: 3.8, fill: { color: 'EFF6FF' }, line: { color: 'BFDBFE', width: 1 } })
    s.addText(d.kotler_faser[fase.k] || '', { x: x + 0.08, y: 1.65, w: 1.39, h: 3.6, fontSize: 10, color: F.tekst, fontFace: 'Arial', valign: 'top' })
  })
  logo(s, p)
}

function sSwotModel(p: any) {
  const s = p.addSlide()
  s.background = { color: F.hvid }
  hdr(s, p, 'SWOT-analyse')
  s.addText('INTERN', { x: 0.5, y: 0.82, w: 4.2, h: 0.25, fontSize: 10, color: '9CA3AF', fontFace: 'Arial', align: 'center', italic: true, bold: true })
  s.addText('EKSTERN', { x: 5.3, y: 0.82, w: 4.2, h: 0.25, fontSize: 10, color: '9CA3AF', fontFace: 'Arial', align: 'center', italic: true, bold: true })
  const fe = [
    { l: 'S  —  Styrker', f: '166534', lf: 'F0FDF4', bf: 'BBF7D0', t: 'Interne positive faktorer\nKonkurrencefordele', x: 0.5, y: 1.07 },
    { l: 'W  —  Svagheder', f: '991B1B', lf: 'FEF2F2', bf: 'FECACA', t: 'Interne negative faktorer\nBegrænsninger', x: 5.3, y: 1.07 },
    { l: 'O  —  Muligheder', f: F.navy, lf: 'EFF6FF', bf: 'BFDBFE', t: 'Eksterne positive faktorer\nUudnyttede muligheder', x: 0.5, y: 2.98 },
    { l: 'T  —  Trusler', f: '92400E', lf: F.guldLys, bf: 'F0E68C', t: 'Eksterne negative faktorer\nKonkurrenter', x: 5.3, y: 2.98 },
  ]
  fe.forEach(f => {
    s.addShape(p.ShapeType.rect, { x: f.x, y: f.y, w: 4.2, h: 0.44, fill: { color: f.f }, line: { color: f.f } })
    s.addText(f.l, { x: f.x, y: f.y, w: 4.2, h: 0.44, fontSize: 13, bold: true, color: F.hvid, fontFace: 'Arial', align: 'center', valign: 'middle' })
    s.addShape(p.ShapeType.rect, { x: f.x, y: f.y + 0.44, w: 4.2, h: 1.74, fill: { color: f.lf }, line: { color: f.bf, width: 1 } })
    s.addText(f.t, { x: f.x + 0.15, y: f.y + 0.54, w: 3.9, h: 1.54, fontSize: 11, color: F.tekst, fontFace: 'Arial', valign: 'top' })
  })
  logo(s, p)
}

function sSwotCase(p: any, d: any, v: string) {
  const s = p.addSlide()
  s.background = { color: F.hvid }
  hdr(s, p, `SWOT-analyse  —  ${v}`)
  const fe = [
    { l: 'S  —  Styrker', f: '166534', lf: 'F0FDF4', bf: 'BBF7D0', t: d.swot_styrker, x: 0.5, y: 0.95 },
    { l: 'W  —  Svagheder', f: '991B1B', lf: 'FEF2F2', bf: 'FECACA', t: d.swot_svagheder, x: 5.3, y: 0.95 },
    { l: 'O  —  Muligheder', f: F.navy, lf: 'EFF6FF', bf: 'BFDBFE', t: d.swot_muligheder, x: 0.5, y: 2.9 },
    { l: 'T  —  Trusler', f: '92400E', lf: F.guldLys, bf: 'F0E68C', t: d.swot_trusler, x: 5.3, y: 2.9 },
  ]
  fe.forEach(f => {
    s.addShape(p.ShapeType.rect, { x: f.x, y: f.y, w: 4.2, h: 0.44, fill: { color: f.f }, line: { color: f.f } })
    s.addText(f.l, { x: f.x, y: f.y, w: 4.2, h: 0.44, fontSize: 13, bold: true, color: F.hvid, fontFace: 'Arial', align: 'center', valign: 'middle' })
    s.addShape(p.ShapeType.rect, { x: f.x, y: f.y + 0.44, w: 4.2, h: 1.78, fill: { color: f.lf }, line: { color: f.bf, width: 1 } })
    s.addText(f.t, { x: f.x + 0.15, y: f.y + 0.54, w: 3.9, h: 1.58, fontSize: 12, color: F.tekst, fontFace: 'Arial', valign: 'top' })
  })
  logo(s, p)
}

function sExcel(p: any, d: any, v: string) {
  const s = p.addSlide()
  s.background = { color: F.groenLys }
  s.addShape(p.ShapeType.rect, { x: 0, y: 0, w: 10, h: 1.1, fill: { color: F.groen }, line: { color: F.groen } })
  s.addText('📈 Tid til at arbejde med datasættet', { x: 0.5, y: 0.1, w: 9, h: 0.55, fontSize: 22, bold: true, color: F.hvid, fontFace: 'Arial' })
  s.addText('Åbn Excel-filen fra din undervisningsmaterialepakke', { x: 0.5, y: 0.65, w: 9, h: 0.34, fontSize: 12, color: 'BBF7D0', fontFace: 'Arial' })
  s.addShape(p.ShapeType.rect, { x: 0.5, y: 1.25, w: 9, h: 2.8, fill: { color: F.hvid }, line: { color: 'BBF7D0', width: 2 } })
  s.addShape(p.ShapeType.rect, { x: 0.5, y: 1.25, w: 0.055, h: 2.8, fill: { color: F.groen }, line: { color: F.groen } })
  s.addText('Jeres opgave:', { x: 0.65, y: 1.35, w: 8.7, h: 0.3, fontSize: 13, bold: true, color: F.groen, fontFace: 'Arial' })
  s.addText(d.excel_opgave || `Analyser datasættet fra ${v} i grupper.`, { x: 0.65, y: 1.72, w: 8.7, h: 2.2, fontSize: 13, color: F.tekst, fontFace: 'Arial', valign: 'top' })
  s.addShape(p.ShapeType.rect, { x: 0.5, y: 4.2, w: 4.2, h: 0.58, fill: { color: F.hvid }, line: { color: 'BBF7D0', width: 1 } })
  s.addText('⏱ Tid: 20 minutter', { x: 0.5, y: 4.2, w: 4.2, h: 0.58, fontSize: 14, bold: true, color: F.groen, fontFace: 'Arial', align: 'center', valign: 'middle' })
  s.addShape(p.ShapeType.rect, { x: 5.3, y: 4.2, w: 4.2, h: 0.58, fill: { color: F.hvid }, line: { color: 'BBF7D0', width: 1 } })
  s.addText('👥 Grupper præsenterer på næste slide', { x: 5.3, y: 4.2, w: 4.2, h: 0.58, fontSize: 11, bold: true, color: F.groen, fontFace: 'Arial', align: 'center', valign: 'middle' })
  s.addShape(p.ShapeType.rect, { x: 0.5, y: 4.92, w: 9, h: 0.38, fill: { color: 'D1FAE5' }, line: { color: 'BBF7D0' } })
  s.addText('Husk modellerne: Segmentering (slide 5–6)  ·  SWOT-analyse (slide 9–10)', { x: 0.7, y: 4.92, w: 8.6, h: 0.38, fontSize: 11, color: F.groen, fontFace: 'Arial', align: 'center', valign: 'middle', bold: true })
  logo(s, p)
}

function sDisk(p: any, d: any) {
  const s = p.addSlide()
  s.background = { color: F.navy }
  s.addText('Diskussion og fremlæggelse', { x: 0.5, y: 0.22, w: 9, h: 0.48, fontSize: 20, bold: true, color: F.hvid, fontFace: 'Arial' })
  s.addShape(p.ShapeType.rect, { x: 0.5, y: 0.73, w: 9, h: 0.045, fill: { color: F.guld }, line: { color: F.guld } })
  d.diskussion.forEach((sp: string, i: number) => {
    s.addShape(p.ShapeType.rect, { x: 0.5, y: 0.95 + i * 1.1, w: 9, h: 0.88, fill: { color: F.navyLys }, line: { color: '2d65b8', width: 1 } })
    s.addShape(p.ShapeType.rect, { x: 0.5, y: 0.95 + i * 1.1, w: 0.055, h: 0.88, fill: { color: F.guld }, line: { color: F.guld } })
    s.addText(`${i + 1}.  ${sp}`, { x: 0.65, y: 1.0 + i * 1.1, w: 8.7, h: 0.78, fontSize: 13, color: F.hvid, fontFace: 'Arial', valign: 'middle' })
  })
  s.addShape(p.ShapeType.rect, { x: 0.5, y: 4.3, w: 9, h: 0.6, fill: { color: F.guld }, line: { color: F.guld } })
  s.addText('Hvad tager I med fra denne lektion?', { x: 0.5, y: 4.3, w: 9, h: 0.6, fontSize: 14, bold: true, color: F.navy, fontFace: 'Arial', align: 'center', valign: 'middle' })
}

function sOps(p: any, d: any) {
  const s = p.addSlide()
  s.background = { color: F.hvid }
  hdr(s, p, 'Opsamling  —  hvad har vi lært i dag?')
  d.opsamling_punkter.forEach((x: string, i: number) => {
    const y = 0.98 + i * 1.62
    s.addShape(p.ShapeType.rect, { x: 0.5, y, w: 0.52, h: 1.35, fill: { color: i % 2 === 0 ? F.navy : F.navyLys }, line: { color: i % 2 === 0 ? F.navy : F.navyLys } })
    s.addText(`${i + 1}`, { x: 0.5, y, w: 0.52, h: 1.35, fontSize: 20, bold: true, color: F.hvid, fontFace: 'Arial', align: 'center', valign: 'middle' })
    s.addShape(p.ShapeType.rect, { x: 1.12, y, w: 8.35, h: 1.35, fill: { color: F.lysgraa }, line: { color: F.border } })
    s.addText(x, { x: 1.3, y, w: 8.0, h: 1.35, fontSize: 13, color: F.tekst, fontFace: 'Arial', valign: 'middle', autoFit: true })
  })
  s.addShape(p.ShapeType.rect, { x: 0.5, y: 5.88, w: 9, h: 0.42, fill: { color: 'EFF6FF' }, line: { color: 'BFDBFE', width: 1 } })
  s.addText('Brug modellerne aktivt  —  de giver eleverne et fælles fagligt sprog', { x: 0.7, y: 5.88, w: 8.6, h: 0.42, fontSize: 12, color: F.navy, fontFace: 'Arial', valign: 'middle' })
  logo(s, p)
}

function lavExcel(k: any, d: any): Buffer {
  const wb = XLSX.utils.book_new()
  const kolonner = d.excel_kolonner || []
  const rækker = d.excel_raekker || []
  const wsData: any[][] = [
    ['DIDANTO — Undervisningsdatasæt'],
    [k.titel],
    [`${k.fag} · Niveau ${k.niveau}`],
    [''],
    ['HVORNÅR BRUGES DETTE DATASÆT?'],
    [d.excel_hvornaar || 'Bruges efter slide 10.'],
    [''],
    ['ELEVOPGAVE'],
    [d.excel_opgave || 'Analyser datasættet og præsenter jeres fund.'],
    [''],
    kolonner,
    ...rækker,
  ]
  const ws = XLSX.utils.aoa_to_sheet(wsData)
  ws['!cols'] = kolonner.map(() => ({ wch: 24 }))
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } },
    { s: { r: 4, c: 0 }, e: { r: 4, c: 3 } },
    { s: { r: 5, c: 0 }, e: { r: 5, c: 3 } },
    { s: { r: 7, c: 0 }, e: { r: 7, c: 3 } },
    { s: { r: 8, c: 0 }, e: { r: 8, c: 3 } },
  ]
  XLSX.utils.book_append_sheet(wb, ws, 'Datasæt')
  const instruktion: any[][] = [
    ['DIDANTO — Instruktion til underviseren'],
    [''],
    ['Kursus:', k.titel],
    ['Fag:', k.fag],
    ['Niveau:', k.niveau],
    [''],
    ['MATERIALEFLOW'],
    ['Fil', 'Hvornår', 'Formål'],
    ['📊 PowerPoint slide 1–2', '0–10 min', 'Case intro og læringsmål'],
    ['📊 PowerPoint slide 3–10', '10–50 min', 'Teorigennemgang med case'],
    ['📊 PowerPoint slide 11', '50 min', 'Introduktion til datasættet'],
    ['📈 Dette Excel-ark', '50–70 min', 'Elevernes dataanalyse i grupper'],
    ['📊 PowerPoint slide 12–13', '70–80 min', 'Diskussion og opsamling'],
    [''],
    ['DIDAKTISKE TIPS'],
    ...(d.forb_tips || []).map((tip: string, i: number) => [`${i + 1}. ${tip}`]),
    [''],
    ['Genereret af DIDANTO — Kompetenceløft til undervisere'],
  ]
  const wsI = XLSX.utils.aoa_to_sheet(instruktion)
  wsI['!cols'] = [{ wch: 35 }, { wch: 15 }, { wch: 45 }]
  XLSX.utils.book_append_sheet(wb, wsI, 'Instruktion til underviser')
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
}

async function lavDocx(k: any, d: any, harExcel: boolean): Promise<Buffer> {
  const bdr = { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' }
  const b = { top: bdr, bottom: bdr, left: bdr, right: bdr }
  const tidsrækker = harExcel ? [
    ['0–10 min', 'Opstart', '📊 Slide 1–2', `Case intro — ${k.cases[0]} og læringsmål`],
    ['10–30 min', 'Teori 1 og 2', '📊 Slide 3–6', 'Primær/sekundær data + Segmentering'],
    ['30–50 min', 'Teori 3 og 4', '📊 Slide 7–10', 'Kotlers model + SWOT-analyse'],
    ['50–70 min', 'Gruppeøvelse', '📊 Slide 11 + 📈 Excel', `Dataanalyse af ${k.cases[0]}-datasættet`],
    ['70–80 min', 'Opsamling', '📊 Slide 12–13', 'Diskussion og evaluering'],
  ] : [
    ['0–10 min', 'Opstart', '📊 Slide 1–2', `Case intro — ${k.cases[0]} og læringsmål`],
    ['10–30 min', 'Teori 1 og 2', '📊 Slide 3–6', 'Primær/sekundær data + Segmentering'],
    ['30–50 min', 'Teori 3 og 4', '📊 Slide 7–10', 'Kotlers model + SWOT-analyse'],
    ['50–65 min', 'Gruppeøvelse', '📊 Slide 11', `Caseanalyse af ${k.cases[1]}`],
    ['65–80 min', 'Opsamling', '📊 Slide 12–13', 'Diskussion og evaluering'],
  ]
  const doc = new Document({
    styles: { default: { document: { run: { font: 'Arial', size: 22 } } } },
    sections: [{
      properties: { page: { margin: { top: 1200, right: 1200, bottom: 1200, left: 1200 } } },
      children: [
        new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: F.navy, space: 1 } },
          spacing: { before: 0, after: 240 },
          children: [
            new TextRun({ text: 'DIDANTO', font: 'Arial Black', size: 22, bold: true, color: F.navy }),
            new TextRun({ text: '  ·  Forberedelsesark til underviseren', font: 'Arial', size: 22, color: '9CA3AF' }),
          ]
        }),
        new Paragraph({
          spacing: { before: 200, after: 80 },
          children: [new TextRun({ text: k.titel, font: 'Arial', size: 36, bold: true, color: F.navy })]
        }),
        new Paragraph({
          spacing: { before: 0, after: 300 },
          children: [new TextRun({ text: `${k.fag}  ·  Niveau ${k.niveau}  ·  Varighed: 80 min`, font: 'Arial', size: 20, color: '9CA3AF' })]
        }),
        new Paragraph({
          spacing: { before: 0, after: 100 },
          children: [new TextRun({ text: 'MATERIALER I DENNE PAKKE', font: 'Arial', size: 18, bold: true, color: F.guld, characterSpacing: 40 })]
        }),
        new Paragraph({
          spacing: { before: 60, after: 40 },
          children: [
            new TextRun({ text: '📊 PowerPoint  ', font: 'Arial', size: 20, bold: true, color: F.navy }),
            new TextRun({ text: '13 slides til undervisningen', font: 'Arial', size: 20, color: F.tekst }),
          ]
        }),
        new Paragraph({
          spacing: { before: 40, after: 40 },
          children: [
            new TextRun({ text: '📋 Dette ark  ', font: 'Arial', size: 20, bold: true, color: F.navy }),
            new TextRun({ text: 'Forberedelse, tidsoversigt og didaktiske tips', font: 'Arial', size: 20, color: F.tekst }),
          ]
        }),
        ...(harExcel ? [new Paragraph({
          spacing: { before: 40, after: 200 },
          children: [
            new TextRun({ text: '📈 Excel-datasæt  ', font: 'Arial', size: 20, bold: true, color: F.groen }),
            new TextRun({ text: 'Bruges til gruppeøvelsen — slide 11 (50–70 min)', font: 'Arial', size: 20, color: F.tekst }),
          ]
        })] : [new Paragraph({ spacing: { before: 40, after: 200 }, children: [new TextRun({ text: '', size: 20 })] })]),
        new Paragraph({
          spacing: { before: 0, after: 100 },
          children: [new TextRun({ text: 'KOMPETENCEMÅL', font: 'Arial', size: 18, bold: true, color: F.guld, characterSpacing: 40 })]
        }),
        ...k.maal.map((m: string) => new Paragraph({
          spacing: { before: 60, after: 60 },
          children: [
            new TextRun({ text: '✓  ', font: 'Arial', size: 20, bold: true, color: F.navy }),
            new TextRun({ text: m, font: 'Arial', size: 20, color: F.tekst })
          ]
        })),
        new Paragraph({
          spacing: { before: 280, after: 100 },
          children: [new TextRun({ text: 'LÆRINGSFORUDSÆTNINGER', font: 'Arial', size: 18, bold: true, color: F.guld, characterSpacing: 40 })]
        }),
        new Paragraph({
          spacing: { before: 0, after: 240 },
          children: [new TextRun({ text: d.forb_laering, font: 'Arial', size: 20, color: F.tekst })]
        }),
        new Paragraph({
          spacing: { before: 0, after: 140 },
          children: [new TextRun({ text: 'TIDSOVERSIGT OG FILGUIDE', font: 'Arial', size: 18, bold: true, color: F.guld, characterSpacing: 40 })]
        }),
        new Table({
          width: { size: 9026, type: WidthType.DXA },
          columnWidths: [1100, 1400, 1900, 4626],
          rows: [
            new TableRow({
              children: ['Tid', 'Fase', 'Fil', 'Indhold'].map((t, i) =>
                new TableCell({
                  borders: b,
                  shading: { fill: F.navy, type: ShadingType.CLEAR },
                  width: { size: [1100, 1400, 1900, 4626][i], type: WidthType.DXA },
                  margins: { top: 80, bottom: 80, left: 120, right: 120 },
                  children: [new Paragraph({ children: [new TextRun({ text: t, font: 'Arial', size: 18, bold: true, color: F.hvid })] })]
                })
              )
            }),
            ...tidsrækker.map(([tid, fase, fil, ind], ri) =>
              new TableRow({
                children: [tid, fase, fil, ind].map((t, i) =>
                  new TableCell({
                    borders: b,
                    shading: { fill: fase === 'Gruppeøvelse' ? 'F0FDF4' : ri % 2 === 0 ? F.lysgraa : F.hvid, type: ShadingType.CLEAR },
                    width: { size: [1100, 1400, 1900, 4626][i], type: WidthType.DXA },
                    margins: { top: 80, bottom: 80, left: 120, right: 120 },
                    children: [new Paragraph({
                      children: [new TextRun({
                        text: t, font: 'Arial', size: 18,
                        color: fase === 'Gruppeøvelse' ? F.groen : i === 0 ? F.navy : F.tekst,
                        bold: fase === 'Gruppeøvelse' || i === 0
                      })]
                    })]
                  })
                )
              })
            )
          ]
        }),
        new Paragraph({
          spacing: { before: 280, after: 100 },
          children: [new TextRun({ text: 'DIDAKTISKE TIPS', font: 'Arial', size: 18, bold: true, color: F.guld, characterSpacing: 40 })]
        }),
        ...d.forb_tips.map((tip: string, i: number) => new Paragraph({
          spacing: { before: 80, after: 80 },
          children: [
            new TextRun({ text: `${i + 1}.  `, font: 'Arial', size: 20, bold: true, color: F.navy }),
            new TextRun({ text: tip, font: 'Arial', size: 20, color: F.tekst })
          ]
        })),
        new Paragraph({
          spacing: { before: 280, after: 100 },
          children: [new TextRun({ text: 'DIFFERENTIERING', font: 'Arial', size: 18, bold: true, color: F.guld, characterSpacing: 40 })]
        }),
        new Paragraph({
          spacing: { before: 0, after: 200 },
          children: [new TextRun({ text: d.forb_diff, font: 'Arial', size: 20, color: F.tekst })]
        }),
        new Paragraph({
          spacing: { before: 80, after: 100 },
          children: [new TextRun({ text: 'VURDERING AF ELEVERNES LÆRING', font: 'Arial', size: 18, bold: true, color: F.guld, characterSpacing: 40 })]
        }),
        new Paragraph({
          spacing: { before: 0, after: 300 },
          children: [new TextRun({ text: d.forb_vurdering, font: 'Arial', size: 20, color: F.tekst })]
        }),
        new Paragraph({
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: F.navy, space: 1 } },
          spacing: { before: 0, after: 0 },
          children: [
            new TextRun({ text: 'DIDANTO', font: 'Arial Black', size: 18, bold: true, color: F.navy }),
            new TextRun({ text: '  ·  ', font: 'Arial', size: 18, color: '9CA3AF' }),
            new TextRun({ text: `Fagligt forankret i bekendtgørelsen for ${k.fag}`, font: 'Arial', size: 18, color: '9CA3AF' })
          ]
        }),
      ]
    }]
  })
  return await Packer.toBuffer(doc)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Ikke logget ind' }, { status: 401 })
  const { kursus_id } = await request.json()
  try {
    const { k, d } = await gen(String(kursus_id))
    const harExcel = d.excel_relevant === true
    const pptx = new PptxGenJS()
    pptx.layout = 'LAYOUT_WIDE'
    pptx.author = 'DIDANTO'
    pptx.title = k.titel
    sTitel(pptx, k)
    sCase(pptx, d, k.cases[0])
    sPriModel(pptx)
    sPriCase(pptx, d, k.cases[0])
    sSegModel(pptx)
    sSegCase(pptx, d, k.cases[0])
    sKotModel(pptx)
    sKotCase(pptx, d, k.cases[0])
    sSwotModel(pptx)
    sSwotCase(pptx, d, k.cases[0])
    if (harExcel) sExcel(pptx, d, k.cases[0])
    sDisk(pptx, d)
    sOps(pptx, d)
    const pBuf = await pptx.write({ outputType: 'nodebuffer' }) as Buffer
    const dBuf = await lavDocx(k, d, harExcel)
    const result: any = {
      success: true,
      pptx: { filnavn: `Didanto_${k.fag}_praesentation.pptx`, base64: pBuf.toString('base64') },
      docx: { filnavn: `Didanto_${k.fag}_forberedelsesark.docx`, base64: dBuf.toString('base64') },
    }
    if (harExcel) {
      const eBuf = lavExcel(k, d)
      result.xlsx = { filnavn: `Didanto_${k.fag}_datasaet.xlsx`, base64: eBuf.toString('base64') }
    }
    return NextResponse.json(result)
  } catch (error) {
    console.error('Fejl:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}