import { useState } from 'react'
import { type Locale, useLocaleStore } from '../store/localeStore'

function FrFlag({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 90 60"
      className={className}
      role="img"
      aria-labelledby="flag-fr-title"
    >
      <title id="flag-fr-title">Drapeau français</title>
      <rect width="30" height="60" fill="#002395" className="flag" />
      <rect x="30" width="30" height="60" fill="#EDEDED" className="flag" />
      <rect x="60" width="30" height="60" fill="#ED2939" className="flag" />
    </svg>
  )
}

function GbFlag({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 60 30"
      className={className}
      role="img"
      aria-labelledby="flag-gb-title"
    >
      <title id="flag-gb-title">British flag</title>
      <rect width="60" height="30" fill="#012169" />
      {/* St Andrew's cross – white diagonal */}
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
      {/* St Patrick's cross – red diagonal (simplified, no counterchange) */}
      <path d="M0,0 L20,10 M40,20 L60,30" stroke="#C8102E" strokeWidth="4" />
      <path d="M60,0 L40,10 M20,20 L0,30" stroke="#C8102E" strokeWidth="4" />
      {/* St George's cross – white then red */}
      <path d="M0,15 H60 M30,0 V30" stroke="#fff" strokeWidth="10" />
      <path d="M0,15 H60 M30,0 V30" stroke="#C8102E" strokeWidth="6" />
    </svg>
  )
}

const OPTIONS: { locale: Locale; Flag: typeof FrFlag; label: string }[] = [
  { locale: 'fr', Flag: FrFlag, label: 'Français' },
  { locale: 'en', Flag: GbFlag, label: 'English' },
]

export function LocaleToggle() {
  const { locale, setLocale } = useLocaleStore()
  const [open, setOpen] = useState(false)
  const current = OPTIONS.find((o) => o.locale === locale) ?? OPTIONS[0]

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium bg-muted hover:bg-muted/80 transition-colors"
      >
        <current.Flag className="w-5 h-auto rounded-[2px]" />
        <span className="text-muted-foreground">{current.label}</span>
        <svg
          className={`w-3 h-3 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
          aria-label="chevron"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            role="none"
            onClick={() => setOpen(false)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setOpen(false)
            }}
          />
          <div className="absolute right-0 mt-1 z-20 bg-popover border border-border rounded-lg shadow-md overflow-hidden min-w-35">
            {OPTIONS.map(({ locale: l, Flag, label }) => (
              <button
                key={l}
                type="button"
                onClick={() => {
                  setLocale(l)
                  setOpen(false)
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted transition-colors ${
                  l === locale
                    ? 'font-semibold text-foreground'
                    : 'text-muted-foreground'
                }`}
              >
                <Flag className="w-5 h-auto rounded-[2px]" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
