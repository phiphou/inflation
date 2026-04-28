import type { Measure, PayType, SalaryType } from '../lib/chart'
import { useI18n } from '../lib/i18n'

function ToggleGroup<T extends string>({
  options,
  value,
  onChange,
  labels,
}: {
  options: T[]
  value: T
  onChange: (v: T) => void
  labels: Record<T, string>
}) {
  return (
    <div className="flex gap-0.5 bg-muted rounded-lg p-1">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
            value === opt
              ? 'bg-background shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {labels[opt]}
        </button>
      ))}
    </div>
  )
}

export function Controls({
  salaryType,
  measure,
  pay,
  onSalaryTypeChange,
  onMeasureChange,
  onPayChange,
}: {
  salaryType: SalaryType
  measure: Measure
  pay: PayType
  onSalaryTypeChange: (v: SalaryType) => void
  onMeasureChange: (v: Measure) => void
  onPayChange: (v: PayType) => void
}) {
  const t = useI18n()
  return (
    <div className="flex flex-wrap gap-3">
      <ToggleGroup<SalaryType>
        options={['smic', 'mean', 'median']}
        value={salaryType}
        onChange={onSalaryTypeChange}
        labels={t.controls.salary}
      />
      <ToggleGroup<Measure>
        options={['hourly', 'monthly', 'annual']}
        value={measure}
        onChange={onMeasureChange}
        labels={t.controls.measure}
      />
      <ToggleGroup<PayType>
        options={['brut', 'net']}
        value={pay}
        onChange={onPayChange}
        labels={t.controls.pay}
      />
    </div>
  )
}
