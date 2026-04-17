'use client'

import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/dashboard',     label: 'Oversigt'      },
  { href: '/kurser',        label: 'Kurser'         },
  { href: '/kompetencer',   label: 'Mine beviser'   },
  { href: '/profil',        label: 'Min profil'     },
]

const Logo = () => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
    <svg width="38" height="38" viewBox="0 0 80 80" fill="none" style={{ flexShrink: 0, marginTop: '-1px' }}>
      <rect width="80" height="80" rx="18" fill="rgba(255,255,255,0.1)"/>
      <circle cx="40" cy="26" r="11" fill="white"/>
      <circle cx="40" cy="26" r="5.5" fill="#F5C842"/>
      <path d="M18 68 Q18 50 40 50 Q62 50 62 68" fill="white"/>
    </svg>
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '38px' }}>
      <div style={{ fontFamily: "'Arial Black', Arial", fontSize: '14px', fontWeight: 900, color: 'white', letterSpacing: '-0.5px', lineHeight: '1' }}>
        DIDANTO
      </div>
      <div style={{ fontFamily: 'Arial', fontSize: '6.5px', color: 'rgba(255,255,255,0.3)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
        Kompetenceløft til undervisere
      </div>
    </div>
  </div>
)

export default function Sidebar({ navn, email }: { navn?: string; email?: string }) {
  const pathname = usePathname()

  const initialer = navn
    ? navn.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : email?.slice(0, 2).toUpperCase() ?? '??'

  return (
    <aside className="w-52 flex flex-col min-h-screen fixed top-0 left-0"
      style={{ backgroundColor: '#0F2A5E', borderRight: '1px solid rgba(255,255,255,0.07)' }}>

      <div className="px-5 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <Logo />
      </div>

      <nav className="flex-1 px-3 py-4">
        <div className="px-3 pb-2" style={{ fontFamily: 'Arial', fontSize: '8px', color: 'rgba(255,255,255,0.22)', letterSpacing: '2px', textTransform: 'uppercase' }}>
          Menu
        </div>
        {navItems.map(item => {
          const aktiv = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <a key={item.href} href={item.href}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg mb-0.5"
              style={{
                backgroundColor: aktiv ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: aktiv ? 'white' : 'rgba(255,255,255,0.45)',
                fontFamily: 'Arial',
                fontSize: '12.5px',
                fontWeight: aktiv ? '500' : '400',
                textDecoration: 'none',
              }}>
              <span className="w-1 h-1 rounded-full flex-shrink-0"
                style={{ backgroundColor: aktiv ? '#F5C842' : 'rgba(255,255,255,0.15)' }} />
              {item.label}
            </a>
          )
        })}
      </nav>

      <div className="px-4 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ backgroundColor: '#F5C842', color: '#0F2A5E', fontFamily: 'Arial' }}>
            {initialer}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate" style={{ color: 'white', fontFamily: 'Arial' }}>
              {navn || email}
            </p>
            <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Arial' }}>
              {email}
            </p>
          </div>
        </div>
      </div>

    </aside>
  )
}