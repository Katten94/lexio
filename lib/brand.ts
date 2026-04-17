export const B = {
  // Farver
  skifer: '#2D3748',
  mellemgraa: '#4A5568',
  terrakotta: '#C17A5E',
  varmhvid: '#F7F3EE',
  lysgraa: '#EDF2F7',
  lysterra: '#F9EDE8',

  // Tekst
  tekst: '#2D3748',
  subtekst: '#718096',
  lystekst: '#A0AEC0',

  // Succes / fejl
  groen: '#16a34a',
  lysgroen: '#F0FDF4',
  roed: '#DC2626',
  lysroed: '#FEF2F2',

  // Fag-farver
  fag: {
    'Afsætning':          { badge: 'bg-blue-100',   text: 'text-blue-800'   },
    'Salg og service':    { badge: 'bg-teal-100',    text: 'text-teal-800'   },
    'Erhvervsøkonomi':    { badge: 'bg-green-100',   text: 'text-green-800'  },
    'Kommunikation':      { badge: 'bg-purple-100',  text: 'text-purple-800' },
    'Matematik':          { badge: 'bg-amber-100',   text: 'text-amber-800'  },
    'Dansk':              { badge: 'bg-orange-100',  text: 'text-orange-800' },
    'Engelsk':            { badge: 'bg-indigo-100',  text: 'text-indigo-800' },
    'Informatik':         { badge: 'bg-sky-100',     text: 'text-sky-800'    },
    'Didaktik / Pædagogik': { badge: 'bg-rose-100', text: 'text-rose-800'   },
  } as Record<string, { badge: string; text: string }>
}

export const fagFarve = (fag: string) =>
  B.fag[fag] || { badge: 'bg-gray-100', text: 'text-gray-800' }