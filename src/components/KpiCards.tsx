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
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
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
      {projectedLatest !== null && (
        <StatCard
          label={`${t.kpi.projectionOnly} (${lastYear})`}
          value={fmt(projectedLatest, unit)}
          sub={t.kpi.ifNoRealGain}
        />
      )}
      <StatCard
        label={`${t.kpi.cumulativeInflation} (${firstYear}–${lastYear})`}
        value={
          totalInflation !== null ? `+${totalInflation.toFixed(1)} %` : '—'
        }
        sub={t.kpi.priceIncrease}
      />
      <StatCard
        label={t.kpi.realGainVsInflation}
        value={gap !== null ? `${gap >= 0 ? '+' : ''}${gap.toFixed(1)} %` : '—'}
        sub={`${t.kpi.vsProjection} ${lastYear}`}
        highlight={gap !== null && gap > 0}
      />
    </div>
  )
}
