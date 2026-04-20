'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

const links = [
  { href: '/dashboard', label: 'Oversigt' },
  { href: '/kurser', label: 'Kurser' },
  { href: '/kompetencer', label: 'Mine beviser' },
  { href: '/profil', label: 'Min profil' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="fixed top-0 left-0 h-full w-52 flex flex-col"
      style={{ backgroundColor: '#0F2A5E', zIndex: 50 }}>

      <div style={{ padding: '18px 20px 14px' }}>
        <Image
          src="/didanto_logo_lys.png"
          alt="DIDANTO"
          width={130}
          height={39}
          style={{ width: '130px', height: 'auto' }}
          priority
        />
      </div>

      <div style={{ padding: '8px 0', flex: 1 }}>
        <p style={{
          fontFamily: 'Arial', fontSize: '10px', fontWeight: '600',
          color: 'rgba(255,255,255,0.35)', letterSpacing: '1.5px',
          textTransform: 'uppercase', padding: '0 20px', marginBottom: '8px'
        }}>
          Menu
        </p>
        {links.map(({ href, label }) => {
          const aktiv = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link key={href} href={href}
              style={{
                display: 'block', padding: '9px 20px',
                fontFamily: 'Arial', fontSize: '13px',
                color: aktiv ? 'white' : 'rgba(255,255,255,0.55)',
                backgroundColor: aktiv ? 'rgba(255,255,255,0.1)' : 'transparent',
                textDecoration: 'none', fontWeight: aktiv ? '600' : '400',
                borderLeft: aktiv ? '3px solid #F5C842' : '3px solid transparent',
              }}>
              {label}
            </Link>
          )
        })}
      </div>

    </div>
  )
}