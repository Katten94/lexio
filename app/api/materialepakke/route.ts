import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const client = new Anthropic()

const BEKENDTGOERELSER: Record<string, { kompetencemaal: string[]; kernestoef: string[]; cases: string[] }> = {
  "Afsætning": {
    kompetencemaal: [
      "Anvende afsætningsøkonomiske modeller til analyse af virksomhedens situation",
      "Analysere forbrugeradfærd og segmentere markeder",
      "Planlægge og gennemføre markedsanalyser",
      "Udvikle afsætningsstrategier og marketingmix",
      "Anvende digitale medier i afsætningsarbejdet"
    ],
    kernestoef: [
      "Segmentering og målgruppeanalyse",
      "SWOT-analyse",
      "Kotlers købsprocessmodel",
      "Marketingmix og de 4 P'er",
      "Digital markedsføring"
    ],
    cases: ["MENY", "Arla Foods", "Zalando", "Joe & The Juice", "LEGO"]
  }
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Ikke logget ind' }, { status: 401 })

  const { fag, niveau } = await request.json()
  const bek = BEKENDTGOERELSER[fag] || BEKENDTGOERELSER["Afsætning"]

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 6000,
      messages: [{
        role: 'user',
        content: `Du er fagdidaktiker i ${fag} på EUD. Generer undervisningsmateriale på ${niveau}-niveau baseret på Hiim og Hippes relationsmodel.

Bekendtgørelse kompetencemål: ${bek.kompetencemaal.join(', ')}
Kernestof: ${bek.kernestoef.join(', ')}
Brug dansk erhvervscase fra: ${bek.cases.join(', ')}

Returner KUN dette JSON uden markdown:
{
  "praesentation": {
    "titel": "kort titel",
    "laeringsmaal": ["mål 1", "mål 2", "mål 3"],
    "slides": [
      {"nummer": 1, "overskrift": "titel", "indhold": "2-3 sætninger", "aktivitet": "1 sætning"},
      {"nummer": 2, "overskrift": "titel", "indhold": "2-3 sætninger", "aktivitet": "1 sætning"},
      {"nummer": 3, "overskrift": "titel", "indhold": "2-3 sætninger", "aktivitet": "1 sætning"},
      {"nummer": 4, "overskrift": "titel", "indhold": "2-3 sætninger", "aktivitet": "1 sætning"}
    ]
  },
  "opgaveark": {
    "titel": "kort titel",
    "introduktion": "1-2 sætninger",
    "opgaver": [
      {"nummer": 1, "taksonomi": "forståelse", "spoergsmaal": "spørgsmål", "vejledning": "kort", "case": "virksomhedsnavn"},
      {"nummer": 2, "taksonomi": "anvendelse", "spoergsmaal": "spørgsmål", "vejledning": "kort", "case": "virksomhedsnavn"},
      {"nummer": 3, "taksonomi": "analyse", "spoergsmaal": "spørgsmål", "vejledning": "kort", "case": "virksomhedsnavn"},
      {"nummer": 4, "taksonomi": "vurdering", "spoergsmaal": "spørgsmål", "vejledning": "kort", "case": "virksomhedsnavn"}
    ]
  },
  "lektionsplan": {
    "fag": "${fag}",
    "niveau": "${niveau}",
    "varighed": "90 min",
    "laeringsmaal": ["mål 1", "mål 2"],
    "læringsforudsaetninger": "1-2 sætninger",
    "rammefaktorer": "1-2 sætninger",
    "faser": [
      {"navn": "Opstart", "tid": "10 min", "indhold": "kort", "metode": "kort", "materialer": "kort"},
      {"navn": "Gennemgang", "tid": "25 min", "indhold": "kort", "metode": "kort", "materialer": "kort"},
      {"navn": "Øvelse", "tid": "35 min", "indhold": "kort", "metode": "kort", "materialer": "kort"},
      {"navn": "Opsamling", "tid": "20 min", "indhold": "kort", "metode": "kort", "materialer": "kort"}
    ],
    "vurdering": "1-2 sætninger",
    "bekendtgoerelse_kobling": ["kobling 1", "kobling 2"]
  },
  "erhvervscase": {
    "virksomhed": "navn",
    "aar": "2025",
    "baggrund": "2-3 sætninger",
    "udfordring": "2-3 sætninger",
    "opgave_til_elever": "2-3 sætninger",
    "diskussionspoergsmaal": ["spørgsmål 1", "spørgsmål 2", "spørgsmål 3"],
    "kompetencemaal": ["kompetencemål 1"]
  }
}`
      }]
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      return NextResponse.json({ error: 'Uventet svar' }, { status: 500 })
    }

    const text = content.text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    const pakke = JSON.parse(text)
    return NextResponse.json({ success: true, pakke })

  } catch (error) {
    console.error('Materialepakke fejl:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}