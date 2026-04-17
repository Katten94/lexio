import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

export default async function KompetencerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const navn: string = user.user_metadata?.navn || ''

  const { data: fremgang } = await supabase
    .from('kursus_fremgang')
    .select('kursus_id, gennemfoert')
    .eq('bruger_id', user.id)
    .eq('gennemfoert', true)

  const gennemfoerteKurser = [...new Set((fremgang || []).map(f => f.kursus_id))]

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#F9FAFB' }}>
      <Sidebar navn={navn} email={user.email} />

      <main className="flex-1 ml-52 px-10 py-8 max-w-3xl">

        <div className="mb-7">
          <h1 className="font-bold" style={{ fontSize: '22px', color: '#111827', fontFamily: 'Arial' }}>
            Mine beviser
          </h1>
          <p className="mt-1" style={{ fontSize: '12px', color: '#6B7280', fontFamily: 'Arial' }}>
            Dine gennemførte kurser og kompetencebeviser
          </p>
        </div>

        {gennemfoerteKurser.length === 0 ? (
          <div>
            {/* Tom tilstand */}
            <div className="rounded-lg p-10 text-center mb-6"
              style={{ backgroundColor: 'white', border: '1px dashed #E5E7EB' }}>
              <div className="text-4xl mb-4">📜</div>
              <p className="font-medium mb-1"
                style={{ fontSize: '14px', color: '#111827', fontFamily: 'Arial' }}>
                Du har ingen beviser endnu
              </p>
              <p className="text-xs mb-6"
                style={{ color: '#9CA3AF', fontFamily: 'Arial' }}>
                Gennemfør et kursus for at modtage dit første kompetencebevis
              </p>
              <a href="/kurser"
                className="inline-block px-5 py-2 rounded-lg text-sm font-medium"
                style={{ backgroundColor: '#0F2A5E', color: 'white', fontFamily: 'Arial', textDecoration: 'none' }}>
                Gå til kurser →
              </a>
            </div>

            {/* Eksempel på bevis */}
            <p className="text-xs mb-3" style={{ color: '#9CA3AF', fontFamily: 'Arial', fontStyle: 'italic' }}>
              Sådan ser et bevis ud når du gennemfører:
            </p>
            <div className="rounded-lg px-5 py-4 flex items-center gap-4 opacity-40"
              style={{ backgroundColor: 'white', border: '1px solid #E5E7EB' }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#FDF9EC', border: '1px solid #F0E68C' }}>
                <span style={{ fontSize: '20px' }}>📜</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold mb-0.5"
                  style={{ fontSize: '13px', color: '#111827', fontFamily: 'Arial' }}>
                  Markedsanalyse og forbrugeradfærd
                </p>
                <p className="text-xs" style={{ color: '#9CA3AF', fontFamily: 'Arial' }}>
                  Afsætning A · 6 moduler gennemført
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-semibold mb-0.5"
                  style={{ color: '#0F2A5E', fontFamily: 'Arial' }}>
                  Bestået
                </p>
                <p className="text-xs" style={{ color: '#9CA3AF', fontFamily: 'Arial' }}>
                  14. april 2026
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {gennemfoerteKurser.map(kursusId => (
              <div key={kursusId}
                className="rounded-lg px-5 py-4 flex items-center gap-4"
                style={{ backgroundColor: 'white', border: '1px solid #E5E7EB' }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#FDF9EC', border: '1px solid #F0E68C' }}>
                  <span style={{ fontSize: '20px' }}>📜</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold mb-0.5"
                    style={{ fontSize: '13px', color: '#111827', fontFamily: 'Arial' }}>
                    Kursus {kursusId}
                  </p>
                  <p className="text-xs" style={{ color: '#9CA3AF', fontFamily: 'Arial' }}>
                    Alle moduler gennemført
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-semibold mb-0.5"
                    style={{ color: '#0F2A5E', fontFamily: 'Arial' }}>
                    Bestået
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  )
}