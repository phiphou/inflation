import { fmt } from '../lib/chart'
import { useI18n } from '../lib/i18n'

export function CustomTooltip({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: number
  unit: string
}) {
  const t = useI18n()

  if (!active || !payload?.length) return null

  const nominal = payload.find((p) => p.name === 'nominal')?.value
  const projection = payload.find((p) => p.name === 'projection')?.value
  const gapAbs =
    nominal != null && projection != null ? nominal - projection : null
  const gapPct =
    gapAbs != null && projection != null ? (gapAbs / projection) * 100 : null

  return (
    <div className="bg-background/85 border border-border dark:bg-neutral-950/80  dark:border-white/15  rounded-lg px-4 py-3 shadow-lg text-sm">
      <p className="font-semibold mb-2">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="mb-1">
          {p.name} : <span className="font-mono">{fmt(p.value, unit)}</span>
        </p>
      ))}
      {gapAbs != null && gapPct != null && (
        <p className="mt-2 pt-2 border-t border-border text-muted-foreground">
          {t.tooltip.gap} :{' '}
          <span
            className={`font-mono font-semibold ${gapAbs >= 0 ? 'text-high' : 'text-low'}`}
          >
            {gapAbs >= 0 ? '+' : ''}
            {fmt(gapAbs, unit)}
          </span>
          <span
            className={`font-mono text-xs ml-1 ${gapAbs >= 0 ? 'text-high' : 'text-low'}`}
          >
            ({gapPct >= 0 ? '+' : ''}
            {gapPct.toFixed(1)} %)
          </span>
        </p>
      )}
    </div>
  )
}
