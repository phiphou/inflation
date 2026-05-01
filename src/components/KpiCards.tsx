import { fmt, type Measure, type PayType, type SalaryType } from '../lib/chart'
import { useI18n } from '../lib/i18n'
import { StatCard } from './StatCard'

export function KpiCards({
  salaryType,
  measure,
  pay,
  nominalFirst,
  nominalLatest,
  projectedLatest,
  totalInflation,
  gap,
  firstYear,
  lastYear,
  unit,
}: {
  salaryType: SalaryType
  measure: Measure
  pay: PayType
  nominalFirst: number
  nominalLatest: number
  projectedLatest: number | null
  totalInflation: number | null
  gap: number | null
  firstYear: number
  lastYear: number
  unit: string
}) {
  const t = useI18n()
  const salaryLabel = t.controls.salary[salaryType]
  const measureLabel = t.controls.measure[measure].toLowerCase()
  const payLabel = t.controls.pay[pay].toLowerCase()

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      <StatCard
        label={`${salaryLabel} ${measureLabel} ${payLabel} (${firstYear})`}
        value={fmt(nominalFirst, unit)}
        sub={t.kpi.startingPoint}
      />
      <StatCard
        label={`${salaryLabel} ${measureLabel} ${payLabel} (${lastYear})`}
        value={fmt(nominalLatest, unit)}
        sub={t.kpi.currentValue}
      />
      {/* Mobile */}
      {projectedLatest !== null && (
        <div className="sm:hidden rounded-xl border border-border bg-card p-2.5 sm:p-4">
          <div>
            <p className="text-xs text-muted-foreground leading-snug mb-2">{`${t.kpi.projectionOnly} (${lastYear})`}</p>
            <p className="text-xl font-bold font-mono">
              {fmt(projectedLatest, unit)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t.kpi.ifNoRealGain}
            </p>
          </div>
        </div>
      )}

      {/* Desktop */}
      {projectedLatest !== null && (
        <div className="hidden sm:block">
          <StatCard
            label={`${t.kpi.projectionOnly} (${lastYear})`}
            value={fmt(projectedLatest, unit)}
            sub={t.kpi.ifNoRealGain}
          />
        </div>
      )}
      <div className={projectedLatest !== null ? 'hidden sm:block' : ''}>
        <StatCard
          label={`${t.kpi.cumulativeInflation} (${firstYear}–${lastYear})`}
          value={
            totalInflation !== null ? `+${totalInflation.toFixed(1)} %` : '—'
          }
          sub={t.kpi.priceIncrease}
        />
      </div>
      <StatCard
        label={t.kpi.realGainVsInflation}
        value={gap !== null ? `${gap >= 0 ? '+' : ''}${gap.toFixed(1)} %` : '—'}
        sub={`${t.kpi.vsProjection} ${lastYear}`}
        highlight={gap !== null && gap > 0}
      />
    </div>
  )
}
