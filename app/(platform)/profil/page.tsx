import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import ProfilClient from './ProfilClient'

export default async function ProfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const navn: string = user.user_metadata?.navn || ''
  const fagprofil: Record<string, string[]> = user.user_metadata?.fagprofil || {}
  const forloeb: string[] = user.user_metadata?.forloeb || []

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#F9FAFB' }}>
      <Sidebar navn={navn} email={user.email} />

      <main className="flex-1 ml-52 px-10 py-8 max-w-3xl">

        <div className="mb-7">
          <h1 className="font-bold" style={{ fontSize: '22px', color: '#111827', fontFamily: 'Arial' }}>
            Min profil
          </h1>
          <p className="mt-1" style={{ fontSize: '12px', color: '#6B7280', fontFamily: 'Arial' }}>
            Dine oplysninger og fagprofil
          </p>
        </div>

        <ProfilClient
          navn={navn}
          email={user.email || ''}
          fagprofil={fagprofil}
          forloeb={forloeb}
        />

      </main>
    </div>
  )
}