export function PriceInput({
  id,
  label,
  raw,
  currency,
  placeholder = '0.00',
  onRawChange,
  onCurrencyChange,
}: {
  id: string
  label: string
  raw: string
  currency: 'eur' | 'frf'
  placeholder?: string
  onRawChange: (v: string) => void
  onCurrencyChange: (v: 'eur' | 'frf') => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium  mb-1">
        {label}
      </label>
      <div className="flex">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={raw}
          onChange={(e) => onRawChange(e.target.value)}
          placeholder={placeholder}
          className="w-32 rounded-l-md border border-border bg-background px-3 py-1.5 text-sm font-mono outline-none focus:ring-2 focus:ring-ring"
        />
        <div className="flex border border-l-0 border-border rounded-r-md overflow-hidden text-sm font-medium">
          {(['eur', 'frf'] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onCurrencyChange(c)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onCurrencyChange(c)
              }}
              className={`px-3 py-1.5 transition-colors ${
                c === currency
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-muted-foreground hover:bg-muted/60'
              }`}
            >
              {c === 'eur' ? '€' : 'F'}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
