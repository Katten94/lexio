import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import afsaetningA from '@/data/bekendtgoerelser/afsaetning-a.json'

const client = new Anthropic()

export async function GET() {
  const bekendtgoerelse = afsaetningA

  const message = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1024,
    system: `Du er en faglig ekspert i erhvervsuddannelser og underviser på EUD merkantil linje i Danmark. 
Du genererer fagligt præcist og pædagogisk stærkt kursusindhold til lærerkompetenceløft.
Alt indhold skal være direkte forankret i følgende bekendtgørelse:

${JSON.stringify(bekendtgoerelse, null, 2)}

Brug altid nutidige, genkendelige danske erhvervseksempler fra bekendtgørelsens anbefalede cases.
Skriv i et professionelt men tilgængeligt sprog målrettet EUD-undervisere.`,
    messages: [
      {
        role: 'user',
        content: `Generer en kort introduktion (200 ord) til et kursusmodul om "${bekendtgoerelse.kernestoef[1].emne}" for lærere på ${bekendtgoerelse.fag} GF2-niveau. 
Inkluder:
1. Hvorfor dette emne er centralt ifølge bekendtgørelsen
2. Et konkret eksempel fra dansk erhvervsliv
3. Hvad læreren vil lære i dette modul

Afslut med de specifikke kompetencemål fra bekendtgørelsen som modulet dækker.`
      }
    ]
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    return NextResponse.json({ error: 'Unexpected response type' }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    fag: bekendtgoerelse.fag,
    modul: bekendtgoerelse.kernestoef[1].emne,
    genereret_indhold: content.text,
    bekendtgoerelse_version: bekendtgoerelse.bekendtgoerelse
  })
}
