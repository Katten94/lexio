import PptxGenJS from 'pptxgenjs'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, BorderStyle, Table, TableRow, TableCell, WidthType, ShadingType } from 'docx'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

const F = { b: '1e40af', o: 'F97316', lb: 'EFF6FF', lo: 'FFF7ED', mg: '374151', t: '1F2937', w: 'FFFFFF', lg: 'F3F4F6', br: 'E5E7EB' }

const K: Record<string, { titel: string; fag: string; niveau: string; cases: string[]; maal: string[] }> = {
  "1": {
    titel: "Markedsanalyse og forbrugeradfærd",
    fag: "Afsætning A", niveau: "A",
    cases: ["MENY", "Arla Foods", "Zalando"],
    maal: [
      "Anvende afsætningsøkonomiske modeller til analyse",
      "Analysere forbrugeradfærd og segmentere markeder",
      "Planlægge og gennemføre markedsanalyser"
    ]
  }
}

async function gen(id: string) {
  const k = K[id] || K["1"]
  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-5', max_tokens: 2500,
    messages: [{ role: 'user', content: `Du er fagdidaktiker i ${k.fag} niveau ${k.niveau}. Generer caseindhold om: ${k.titel}. Brug ${k.cases[0]} som case og ${k.cases[1]} som sekundær case. Skriv på dansk med korrekte æ ø å. KUN JSON ingen markdown start med { slut med }: {"case_intro":"2 sætninger","case_baggrund":"3 sætninger om 2025","primaer_eksempel":"1 sætning om primær dataindsamling","sekundaer_eksempel":"1 sætning om sekundær data","segmentering_eksempel":"2 sætninger om segmentering","kotler_faser":{"behov":"1 sætning","soegning":"1 sætning","vurdering":"1 sætning","koeb":"1 sætning","efterkoeb":"1 sætning"},"swot_styrker":"2 styrker","swot_svagheder":"2 svagheder","swot_muligheder":"2 muligheder","swot_trusler":"2 trusler","opgave_tekst":"15 min gruppeøvelse med ${k.cases[1]}","diskussion":["spørgsmål 1","spørgsmål 2","spørgsmål 3"],"opsamling_punkter":["punkt 1","punkt 2","punkt 3"],"forb_laering":"2 sætninger om læringsforudsætninger","forb_tips":["tip 1","tip 2","tip 3"],"forb_diff":"2 sætninger om differentiering","forb_vurdering":"2 sætninger om vurdering af læring"}` }]
  })
  const c = msg.content[0]
  if (c.type !== 'text') throw new Error('Fejl')
  let t = c.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const s = t.indexOf('{'), e = t.lastIndexOf('}')
  if (s === -1 || e === -1) throw new Error('Ingen JSON')
  return { k, d: JSON.parse(t.slice(s, e + 1)) }
}

async function lavDocx(k: any, d: any): Promise<Buffer> {
  const bdr = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' }
  const b = { top: bdr, bottom: bdr, left: bdr, right: bdr }
  const doc = new Document({
    styles: { default: { document: { run: { font: 'Arial', size: 22 } } } },
    sections: [{
      properties: { page: { margin: { top: 1200, right: 1200, bottom: 1200, left: 1200 } } },
      children: [
        new Paragraph({ spacing: { before: 0, after: 200 }, children: [new TextRun({ text: 'DIDANTO.  Forberedelsesark til underviseren', bold: true, size: 24, color: F.b, font: 'Arial' })] }),
        new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: F.o } }, spacing: { before: 0, after: 300 }, children: [] }),
        new Paragraph({ spacing: { before: 200, after: 100 }, children: [new TextRun({ text: k.titel, bold: true, size: 32, color: F.b, font: 'Arial' })] }),
        new Paragraph({ spacing: { before: 0, after: 300 }, children: [new TextRun({ text: `${k.fag}  ·  Niveau ${k.niveau}  ·  Varighed: 90 min`, size: 20, color: '666666', font: 'Arial' })] }),
        new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 }, children: [new TextRun({ text: 'Kompetencemål', bold: true, size: 24, color: F.b, font: 'Arial' })] }),
        ...k.maal.map((m: string) => new Paragraph({ spacing: { before: 60, after: 60 }, children: [new TextRun({ text: `✓  ${m}`, size: 20, font: 'Arial' })] })),
        new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 100 }, children: [new TextRun({ text: 'Læringsforudsætninger', bold: true, size: 24, color: F.b, font: 'Arial' })] }),
        new Paragraph({ spacing: { before: 60, after: 200 }, children: [new TextRun({ text: d.forb_laering, size: 20, font: 'Arial' })] }),
        new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 150 }, children: [new TextRun({ text: 'Tidsoversigt', bold: true, size: 24, color: F.b, font: 'Arial' })] }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: ['Fase','Tid','Indhold'].map(x => new TableCell({ borders: b, shading: { fill: F.b, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: x, bold: true, size: 20, color: F.w, font: 'Arial' })] })] })) }),
            ...([
              ['Opstart', '10 min', `Introduktion til ${k.cases[0]} og læringsmål`],
              ['Primær/sekundær data', '15 min', 'Model gennemgang og case-eksempel'],
              ['Segmentering', '15 min', 'De fire segmenteringstyper og case'],
              ['Kotlers model', '15 min', 'Købsprocessmodel og case-eksempel'],
              ['SWOT-analyse', '10 min', `SWOT med ${k.cases[0]}`],
              ['Gruppeøvelse', '15 min', `Analyse af ${k.cases[1]}`],
              ['Opsamling', '10 min', 'Fælles opsamling og diskussion'],
            ]).map(([f, ti, ind]) =>
              new TableRow({ children: [
                new TableCell({ borders: b, children: [new Paragraph({ children: [new TextRun({ text: f, size: 20, font: 'Arial' })] })] }),
                new TableCell({ borders: b, shading: { fill: 'EFF6FF', type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: ti, size: 20, bold: true, color: F.b, font: 'Arial' })] })] }),
                new TableCell({ borders: b, children: [new Paragraph({ children: [new TextRun({ text: ind, size: 20, font: 'Arial' })] })] }),
              ]})
            )
          ]
        }),
        new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 100 }, children: [new TextRun({ text: 'Didaktiske tips', bold: true, size: 24, color: F.b, font: 'Arial' })] }),
        ...d.forb_tips.map((tip: string, i: number) => new Paragraph({ spacing: { before: 80, after: 80 }, children: [new TextRun({ text: `${i+1}.  `, bold: true, size: 20, color: F.o, font: 'Arial' }), new TextRun({ text: tip, size: 20, font: 'Arial' })] })),
        new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 100 }, children: [new TextRun({ text: 'Differentiering', bold: true, size: 24, color: F.b, font: 'Arial' })] }),
        new Paragraph({ spacing: { before: 60, after: 200 }, children: [new TextRun({ text: d.forb_diff, size: 20, font: 'Arial' })] }),
        new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 }, children: [new TextRun({ text: 'Vurdering af elevernes læring', bold: true, size: 24, color: F.b, font: 'Arial' })] }),
        new Paragraph({ spacing: { before: 60, after: 300 }, children: [new TextRun({ text: d.forb_vurdering, size: 20, font: 'Arial' })] }),
        new Paragraph({ border: { top: { style: BorderStyle.SINGLE, size: 4, color: F.b } }, spacing: { before: 0, after: 0 }, children: [new TextRun({ text: `DIDANTO.  ·  Fagligt forankret i bekendtgørelsen for ${k.fag}`, size: 18, color: '888888', font: 'Arial' })] }),
      ]
    }]
  })
  return await Packer.toBuffer(doc)
}

function hdr(s: any, p: any, t: string) {
  s.addText(t, { x: 0.5, y: 0.25, w: 9, h: 0.55, fontSize: 22, bold: true, color: F.b, fontFace: 'Arial' })
  s.addShape(p.ShapeType.rect, { x: 0.5, y: 0.82, w: 9, h: 0.05, fill: { color: F.o }, line: { color: F.o } })
}

function sTitel(p: any, k: any) {
  const s = p.addSlide()
  s.background = { color: F.b }
  s.addText('DIDANTO.', { x: 0.5, y: 0.3, w: 3, h: 0.35, fontSize: 13, bold: true, color: 'BFD4FF', fontFace: 'Arial' })
  s.addText(k.titel, { x: 0.5, y: 1.3, w: 8.5, h: 1.4, fontSize: 34, bold: true, color: F.w, fontFace: 'Arial', valign: 'middle' })
  s.addText(`${k.fag}  ·  Niveau ${k.niveau}`, { x: 0.5, y: 2.85, w: 6, h: 0.4, fontSize: 14, color: 'BFD4FF', fontFace: 'Arial' })
  s.addShape(p.ShapeType.rect, { x: 0.5, y: 3.4, w: 1.8, h: 0.08, fill: { color: F.o }, line: { color: F.o } })
  k.maal.forEach((m: string, i: number) => s.addText(`✓  ${m}`, { x: 0.5, y: 3.7 + i * 0.45, w: 9, h: 0.4, fontSize: 12, color: 'BFD4FF', fontFace: 'Arial' }))
}

function sCase(p: any, d: any, v: string) {
  const s = p.addSlide()
  s.background = { color: F.w }
  hdr(s, p, `Dagens case: ${v}`)
  s.addShape(p.ShapeType.rect, { x: 0.5, y: 1.0, w: 9, h: 0.75, fill: { color: F.b }, line: { color: F.b } })
  s.addText(v, { x: 0.5, y: 1.0, w: 9, h: 0.75, fontSize: 26, bold: true, color: F.w, fontFace: 'Arial', align: 'center', valign: 'middle' })
  s.addText(d.case_intro, { x: 0.5, y: 1.95, w: 9, h: 0.7, fontSize: 13, color: F.mg, fontFace: 'Arial', italic: true })
  s.addShape(p.ShapeType.rect, { x: 0.5, y: 2.8, w: 9, h: 1.6, fill: { color: F.lg }, line: { color: F.br } })
  s.addText(d.case_baggrund, { x: 0.7, y: 2.9, w: 8.6, h: 1.4, fontSize: 13, color: F.t, fontFace: 'Arial', valign: 'top' })
  s.addShape(p.ShapeType.rect, { x: 0.5, y: 4.55, w: 9, h: 0.35, fill: { color: F.lo }, line: { color: F.o } })
  s.addText('Vi bruger denne case gennem hele lektionen', { x: 0.5, y: 4.55, w: 9, h: 0.35, fontSize: 11, color: F.o, fontFace: 'Arial', align: 'center', valign: 'middle', bold: true })
}

function sPriModel(p: any) {
  const s = p.addSlide()
  s.background = { color: F.w }
  hdr(s, p, 'Primær og sekundær data')
  s.addShape(p.ShapeType.rect, { x: 0.5, y: 1.05, w: 4.2, h: 0.55, fill: { color: F.b }, line: { color: F.b } })
  s.addText('PRIMÆR DATA', { x: 0.5, y: 1.05, w: 4.2, h: 0.55, fontSize: 16, bold: true, color: F.w, fontFace: 'Arial', align: 'center', valign: 'middle' })
  s.addShape(p.ShapeType.rect, { x: 0.5, y: 1.6, w: 4.2, h: 2.8, fill: { color: F.lb }, line: { color: F.b, width: 1 } })
  ;['Indsamles selv til formålet', 'Spørgeskemaer og interviews', 'Fokusgrupper og observationer', 'Dyrere og tidskrævende', 'Præcis og målrettet'].forEach((x, i) => s.addText(`  ${x}`, { x: 0.65, y: 1.75 + i * 0.5, w: 3.9, h: 0.45, fontSize: 12, color: F.t, fontFace: 'Arial' }))
  s.addShape(p.ShapeType.rect, { x: 5.3, y: 1.05, w: 4.2, h: 0.55, fill: { color: F.o }, line: { color: F.o } })
  s.addText('SEKUNDÆR DATA', { x: 5.3, y: 1.05, w: 4.2, h: 0.55, fontSize: 16, bold: true, color: F.w, fontFace: 'Arial', align: 'center', valign: 'middle' })
  s.addShape(p.ShapeType.rect, { x: 5.3, y: 1.6, w: 4.2, h: 2.8, fill: { color: F.lo }, line: { color: F.o, width: 1 } })
  ;['Allerede indsamlet af andre', 'Statistikker og rapporter', 'Danmarks Statistik', 'Billigere og hurtigere', 'Godt udgangspunkt'].forEach((x, i) => s.addText(`  ${x}`, { x: 5.45, y: 1.75 + i * 0.5, w: 3.9, h: 0.45, fontSize: 12, color: F.t, fontFace: 'Arial' }))
  s.addShape(p.ShapeType.rect, { x: 0.5, y: 4.55, w: 9, h: 0.4, fill: { color: F.lb }, line: { color: F.b, width: 1 } })
  s.addText('Tommelfingerregel: Start altid med sekundær data', { x: 0.5, y: 4.55, w: 9, h: 0.4, fontSize: 12, bold: true, color: F.b, fontFace: 'Arial', align: 'center', valign: 'middle' })
}

function sPriCase(p: any, d: any, v: string) {
  const s = p.addSlide()
  s.background = { color: F.w }
  hdr(s, p, `Primær og sekundær data  —  ${v}`)
  s.addShape(p.ShapeType.rect, { x: 0.5, y: 1.05, w: 9, h: 0.4, fill: { color: F.lg }, line: { color: F.br } })
  s.addText(`Hvordan kan ${v} indsamle data?`, { x: 0.5, y: 1.05, w: 9, h: 0.4, fontSize: 13, bold: true, color: F.t, fontFace: 'Arial', align: 'center', valign: 'middle' })
  s.addShape(p.ShapeType.rect, { x: 0.5, y: 1.6, w: 4.2, h: 0.45, fill: { color: F.b }, line: { color: F.b } })
  s.addText('PRIMÆR', { x: 0.5, y: 1.6, w: 4.2, h: 0.45, fontSize: 13, bold: true, color: F.w, fontFace: 'Arial', align: 'center', valign: 'middle' })
  s.addShape(p.ShapeType.rect, { x: 0.5, y: 2.05, w: 4.2, h: 1.4, fill: { color: F.lb }, line: { color: F.b, width: 1 } })
  s.addText(d.primaer_eksempel, { x: 0.65, y: 2.1, w: 3.9, h: 1.3, fontSize: 12, color: F.t, fontFace: 'Arial', valign: 'middle' })
  s.addShape(p.ShapeType.rect, { x: 5.3, y: 1.6, w: 4.2, h: 0.45, fill: { color: F.o }, line: { color: F.o } })
  s.addText('SEKUNDÆR', { x: 5.3, y: 1.6, w: 4.2, h: 0.45, fontSize: 13, bold: true, color: F.w, fontFace: 'Arial', align: 'center', valign: 'middle' })
  s.addShape(p.ShapeType.rect, { x: 5.3, y: 2.05, w: 4.2, h: 1.4, fill: { color: F.lo }, line: { color: F.o, width: 1 } })
  s.addText(d.sekundaer_eksempel, { x: 5.45, y: 2.1, w: 3.9, h: 1.3, fontSize: 12, color: F.t, fontFace: 'Arial', valign: 'middle' })
  s.addShape(p.ShapeType.rect, { x: 0.5, y: 3.6, w: 9, h: 1.2, fill: { color: F.lg }, line: { color: F.br } })
  s.addText('Diskuter i makker-par: Hvilken datatype giver mest værdi?', { x: 0.7, y: 3.75, w: 8.6, h: 0.9, fontSize: 13, color: F.t, fontFace: 'Arial' })
}

function sSegModel(p: any) {
  const s = p.addSlide()
  s.background = { color: F.w }
  hdr(s, p, 'Segmentering  —  de fire typer')
  const t = [
    { l: 'DEMOGRAFISK', f: F.b, lf: F.lb, e: 'Alder  ·  Køn\nIndkomst  ·  Uddannelse', x: 0.5, y: 1.05 },
    { l: 'GEOGRAFISK', f: '16A34A', lf: 'F0FDF4', e: 'Land  ·  Region\nBy  ·  Klima', x: 5.3, y: 1.05 },
    { l: 'PSYKOGRAFISK', f: '7C3AED', lf: 'F5F3FF', e: 'Livsstil  ·  Værdier\nPersonlighed', x: 0.5, y: 3.05 },
    { l: 'ADFÆRDSMÆSSIG', f: F.o, lf: F.lo, e: 'Købsadfærd  ·  Loyalitet\nFordele', x: 5.3, y: 3.05 },
  ]
  t.forEach(i => {
    s.addShape(p.ShapeType.rect, { x: i.x, y: i.y, w: 4.2, h: 0.5, fill: { color: i.f }, line: { color: i.f } })
    s.addText(i.l, { x: i.x, y: i.y, w: 4.2, h: 0.5, fontSize: 14, bold: true, color: F.w, fontFace: 'Arial', align: 'center', valign: 'middle' })
    s.addShape(p.ShapeType.rect, { x: i.x, y: i.y + 0.5, w: 4.2, h: 1.4, fill: { color: i.lf }, line: { color: i.f, width: 1 } })
    s.addText(i.e, { x: i.x + 0.15, y: i.y + 0.6, w: 3.9, h: 1.2, fontSize: 13, color: F.t, fontFace: 'Arial', align: 'center', valign: 'middle' })
  })
}

function sSegCase(p: any, d: any, v: string) {
  const s = p.addSlide()
  s.background = { color: F.w }
  hdr(s, p, `Segmentering i praksis  —  ${v}`)
  s.addShape(p.ShapeType.rect, { x: 0.5, y: 1.05, w: 9, h: 0.65, fill: { color: F.b }, line: { color: F.b } })
  s.addText(`Hvordan segmenterer ${v} deres marked?`, { x: 0.5, y: 1.05, w: 9, h: 0.65, fontSize: 16, bold: true, color: F.w, fontFace: 'Arial', align: 'center', valign: 'middle' })
  s.addShape(p.ShapeType.rect, { x: 0.5, y: 1.85, w: 9, h: 1.8, fill: { color: F.lg }, line: { color: F.br } })
  s.addText(d.segmentering_eksempel, { x: 0.7, y: 1.95, w: 8.6, h: 1.6, fontSize: 14, color: F.t, fontFace: 'Arial', valign: 'middle' })
  s.addShape(p.ShapeType.rect, { x: 0.5, y: 3.8, w: 9, h: 0.4, fill: { color: F.lo }, line: { color: F.o, width: 1 } })
  s.addText('Hvem er deres primære målgruppe — og hvilken segmenteringstype bruges primært?', { x: 0.7, y: 3.8, w: 8.6, h: 0.4, fontSize: 11, color: F.o, fontFace: 'Arial', valign: 'middle', bold: true })
}

function sKotModel(p: any) {
  const s = p.addSlide()
  s.background = { color: F.w }
  hdr(s, p, 'Kotlers Købsprocessmodel')
  const fa = [
    { l: 'Behovs-\nerkendelse', f: F.b },
    { l: 'Informations-\nsøgning', f: '1d4ed8' },
    { l: 'Vurdering af\nalternativer', f: '2563eb' },
    { l: 'Købs-\nbeslutning', f: '3b82f6' },
    { l: 'Efterkøbs-\nadfærd', f: F.o }
  ]
  fa.forEach((fase, i) => {
    const x = 0.45 + i * 1.85
    s.addShape(p.ShapeType.rect, { x, y: 1.3, w: 1.55, h: 1.1, fill: { color: fase.f }, line: { color: fase.f } })
    s.addText(fase.l, { x, y: 1.3, w: 1.55, h: 1.1, fontSize: 11, bold: true, color: F.w, fontFace: 'Arial', align: 'center', valign: 'middle' })
    if (i < 4) s.addText('▶', { x: x + 1.6, y: 1.65, w: 0.25, h: 0.4, fontSize: 14, color: F.mg, fontFace: 'Arial', align: 'center' })
  })
  ;['Opdager\net behov', 'Søger\ninformation', 'Sammenligner\nalternativer', 'Træffer\nbeslutning', 'Vurderer\nkøbet'].forEach((t, i) => {
    const x = 0.45 + i * 1.85
    s.addShape(p.ShapeType.rect, { x, y: 2.55, w: 1.55, h: 1.0, fill: { color: F.lb }, line: { color: F.br, width: 1 } })
    s.addText(t, { x: x + 0.05, y: 2.6, w: 1.45, h: 0.9, fontSize: 10, color: F.t, fontFace: 'Arial', align: 'center', valign: 'middle' })
  })
  s.addShape(p.ShapeType.rect, { x: 0.5, y: 3.7, w: 9, h: 0.45, fill: { color: F.lo }, line: { color: F.o, width: 1 } })
  s.addText('Kognitiv dissonans: Tvivl og utilfredshed der kan opstå EFTER købet', { x: 0.7, y: 3.7, w: 8.6, h: 0.45, fontSize: 11, color: F.o, fontFace: 'Arial', valign: 'middle', bold: true })
}

function sKotCase(p: any, d: any, v: string) {
  const s = p.addSlide()
  s.background = { color: F.w }
  hdr(s, p, `Kotlers model i praksis  —  ${v}`)
  const fa = [
    { l: 'Behovs-\nerkendelse', k: 'behov', f: F.b },
    { l: 'Informations-\nsøgning', k: 'soegning', f: '1d4ed8' },
    { l: 'Vurdering af\nalternativer', k: 'vurdering', f: '2563eb' },
    { l: 'Købs-\nbeslutning', k: 'koeb', f: '3b82f6' },
    { l: 'Efterkøbs-\nadfærd', k: 'efterkoeb', f: F.o }
  ]
  fa.forEach((fase, i) => {
    const x = 0.45 + i * 1.85
    s.addShape(p.ShapeType.rect, { x, y: 1.05, w: 1.55, h: 0.6, fill: { color: fase.f }, line: { color: fase.f } })
    s.addText(fase.l, { x, y: 1.05, w: 1.55, h: 0.6, fontSize: 9, bold: true, color: F.w, fontFace: 'Arial', align: 'center', valign: 'middle' })
    if (i < 4) s.addText('▶', { x: x + 1.6, y: 1.2, w: 0.2, h: 0.3, fontSize: 12, color: F.mg, fontFace: 'Arial', align: 'center' })
    s.addShape(p.ShapeType.rect, { x, y: 1.75, w: 1.55, h: 2.6, fill: { color: F.lb }, line: { color: F.br, width: 1 } })
    s.addText(d.kotler_faser[fase.k] || '', { x: x + 0.08, y: 1.85, w: 1.39, h: 2.4, fontSize: 10, color: F.t, fontFace: 'Arial', valign: 'top' })
  })
  s.addShape(p.ShapeType.rect, { x: 0.5, y: 4.5, w: 9, h: 0.4, fill: { color: F.lg }, line: { color: F.br } })
  s.addText(`Genkender I faserne fra jeres eget indkøb hos ${v}?`, { x: 0.7, y: 4.5, w: 8.6, h: 0.4, fontSize: 11, color: F.mg, fontFace: 'Arial', valign: 'middle', italic: true })
}

function sSwotModel(p: any) {
  const s = p.addSlide()
  s.background = { color: F.w }
  hdr(s, p, 'SWOT-analyse')
  s.addText('INTERN', { x: 0.5, y: 0.92, w: 4.2, h: 0.3, fontSize: 10, color: '9CA3AF', fontFace: 'Arial', align: 'center', italic: true, bold: true })
  s.addText('EKSTERN', { x: 5.3, y: 0.92, w: 4.2, h: 0.3, fontSize: 10, color: '9CA3AF', fontFace: 'Arial', align: 'center', italic: true, bold: true })
  const fe = [
    { l: 'S  —  Styrker', f: '16A34A', lf: 'F0FDF4', t: 'Interne positive faktorer\nHvad er virksomheden god til?\nKonkurrencefordele', x: 0.5, y: 1.2 },
    { l: 'W  —  Svagheder', f: 'DC2626', lf: 'FEF2F2', t: 'Interne negative faktorer\nHvad kan forbedres?\nBegrænsninger', x: 5.3, y: 1.2 },
    { l: 'O  —  Muligheder', f: F.b, lf: F.lb, t: 'Eksterne positive faktorer\nTrends og tendenser\nUudnyttede muligheder', x: 0.5, y: 3.1 },
    { l: 'T  —  Trusler', f: 'D97706', lf: F.lo, t: 'Eksterne negative faktorer\nKonkurrenter og substitutter\nMarkedsændringer', x: 5.3, y: 3.1 },
  ]
  fe.forEach(f => {
    s.addShape(p.ShapeType.rect, { x: f.x, y: f.y, w: 4.2, h: 0.5, fill: { color: f.f }, line: { color: f.f } })
    s.addText(f.l, { x: f.x, y: f.y, w: 4.2, h: 0.5, fontSize: 14, bold: true, color: F.w, fontFace: 'Arial', align: 'center', valign: 'middle' })
    s.addShape(p.ShapeType.rect, { x: f.x, y: f.y + 0.5, w: 4.2, h: 1.4, fill: { color: f.lf }, line: { color: f.f, width: 1 } })
    s.addText(f.t, { x: f.x + 0.15, y: f.y + 0.6, w: 3.9, h: 1.2, fontSize: 11, color: F.t, fontFace: 'Arial', valign: 'top' })
  })
}

function sSwotCase(p: any, d: any, v: string) {
  const s = p.addSlide()
  s.background = { color: F.w }
  hdr(s, p, `SWOT-analyse  —  ${v}`)
  const fe = [
    { l: 'S  —  Styrker', f: '16A34A', lf: 'F0FDF4', t: d.swot_styrker, x: 0.5, y: 1.05 },
    { l: 'W  —  Svagheder', f: 'DC2626', lf: 'FEF2F2', t: d.swot_svagheder, x: 5.3, y: 1.05 },
    { l: 'O  —  Muligheder', f: F.b, lf: F.lb, t: d.swot_muligheder, x: 0.5, y: 3.05 },
    { l: 'T  —  Trusler', f: 'D97706', lf: F.lo, t: d.swot_trusler, x: 5.3, y: 3.05 },
  ]
  fe.forEach(f => {
    s.addShape(p.ShapeType.rect, { x: f.x, y: f.y, w: 4.2, h: 0.5, fill: { color: f.f }, line: { color: f.f } })
    s.addText(f.l, { x: f.x, y: f.y, w: 4.2, h: 0.5, fontSize: 13, bold: true, color: F.w, fontFace: 'Arial', align: 'center', valign: 'middle' })
    s.addShape(p.ShapeType.rect, { x: f.x, y: f.y + 0.5, w: 4.2, h: 1.45, fill: { color: f.lf }, line: { color: f.f, width: 1 } })
    s.addText(f.t, { x: f.x + 0.15, y: f.y + 0.6, w: 3.9, h: 1.25, fontSize: 12, color: F.t, fontFace: 'Arial', valign: 'top' })
  })
}

function sOev(p: any, d: any, v2: string) {
  const s = p.addSlide()
  s.background = { color: F.w }
  hdr(s, p, 'Gruppeøvelse')
  s.addShape(p.ShapeType.rect, { x: 7.8, y: 0.2, w: 1.7, h: 0.5, fill: { color: F.lo }, line: { color: F.o, width: 1 } })
  s.addText('15 min', { x: 7.8, y: 0.2, w: 1.7, h: 0.5, fontSize: 12, bold: true, color: F.o, fontFace: 'Arial', align: 'center', valign: 'middle' })
  s.addShape(p.ShapeType.rect, { x: 0.5, y: 1.05, w: 9, h: 0.5, fill: { color: F.b }, line: { color: F.b } })
  s.addText(`Case: ${v2}`, { x: 0.5, y: 1.05, w: 9, h: 0.5, fontSize: 16, bold: true, color: F.w, fontFace: 'Arial', align: 'center', valign: 'middle' })
  s.addShape(p.ShapeType.rect, { x: 0.5, y: 1.65, w: 9, h: 2.8, fill: { color: F.lg }, line: { color: F.br } })
  s.addText(d.opgave_tekst, { x: 0.7, y: 1.75, w: 8.6, h: 2.6, fontSize: 13, color: F.t, fontFace: 'Arial', valign: 'top' })
}

function sDisk(p: any, d: any) {
  const s = p.addSlide()
  s.background = { color: F.b }
  s.addText('Diskussion', { x: 0.5, y: 0.25, w: 9, h: 0.55, fontSize: 22, bold: true, color: F.w, fontFace: 'Arial' })
  s.addShape(p.ShapeType.rect, { x: 0.5, y: 0.82, w: 9, h: 0.05, fill: { color: F.o }, line: { color: F.o } })
  d.diskussion.forEach((sp: string, i: number) => {
    s.addShape(p.ShapeType.rect, { x: 0.5, y: 1.05 + i * 1.0, w: 9, h: 0.8, fill: { color: '1e3a8a' }, line: { color: '3B5AC6', width: 1 } })
    s.addText(`${i + 1}.  ${sp}`, { x: 0.7, y: 1.1 + i * 1.0, w: 8.6, h: 0.7, fontSize: 13, color: F.w, fontFace: 'Arial', valign: 'middle' })
  })
  s.addShape(p.ShapeType.rect, { x: 0.5, y: 4.15, w: 9, h: 0.75, fill: { color: F.o }, line: { color: F.o } })
  s.addText('Hvad tager I med fra denne lektion?', { x: 0.5, y: 4.15, w: 9, h: 0.75, fontSize: 16, bold: true, color: F.w, fontFace: 'Arial', align: 'center', valign: 'middle' })
}

function sOps(p: any, d: any) {
  const s = p.addSlide()
  s.background = { color: F.w }
  hdr(s, p, 'Opsamling  —  hvad har vi lært?')
  d.opsamling_punkter.forEach((x: string, i: number) => {
    s.addShape(p.ShapeType.rect, { x: 0.5, y: 1.05 + i * 1.05, w: 0.55, h: 0.55, fill: { color: i % 2 === 0 ? F.b : F.o }, line: { color: i % 2 === 0 ? F.b : F.o } })
    s.addText(`${i + 1}`, { x: 0.5, y: 1.05 + i * 1.05, w: 0.55, h: 0.55, fontSize: 14, bold: true, color: F.w, fontFace: 'Arial', align: 'center', valign: 'middle' })
    s.addShape(p.ShapeType.rect, { x: 1.2, y: 1.05 + i * 1.05, w: 8.2, h: 0.55, fill: { color: F.lg }, line: { color: F.br } })
    s.addText(x, { x: 1.4, y: 1.05 + i * 1.05, w: 8.0, h: 0.55, fontSize: 13, color: F.t, fontFace: 'Arial', valign: 'middle' })
  })
  s.addShape(p.ShapeType.rect, { x: 0.5, y: 4.3, w: 9, h: 0.6, fill: { color: F.lb }, line: { color: F.b, width: 1 } })
  s.addText('Brug modellerne aktivt  —  de giver eleverne et fælles sprog', { x: 0.7, y: 4.3, w: 8.6, h: 0.6, fontSize: 12, color: F.b, fontFace: 'Arial', valign: 'middle' })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Ikke logget ind' }, { status: 401 })
  const { kursus_id } = await request.json()
  try {
    const { k, d } = await gen(String(kursus_id))
    const pptx = new PptxGenJS()
    pptx.layout = 'LAYOUT_WIDE'
    pptx.author = 'DIDANTO.'
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
    sOev(pptx, d, k.cases[1])
    sDisk(pptx, d)
    sOps(pptx, d)
    const pBuf = await pptx.write({ outputType: 'nodebuffer' }) as Buffer
    const dBuf = await lavDocx(k, d)
    return NextResponse.json({
      success: true,
      pptx: { filnavn: `${k.fag}_praesentation.pptx`, base64: pBuf.toString('base64') },
      docx: { filnavn: `${k.fag}_forberedelsesark.docx`, base64: dBuf.toString('base64') }
    })
  } catch (error) {
    console.error('Fejl:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}