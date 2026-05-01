import type { Measure, PayType, SalaryType } from '../lib/chart'
import { useI18n } from '../lib/i18n'
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group'

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
      <ToggleGroup
        type="single"
        variant="outline"
        className="gap-0 *:rounded-none [&>*:first-child]:rounded-l-md [&>*:last-child]:rounded-r-md [&>*:not(:first-child)]:-ml-px [&>*[data-state=off]]:text-muted-foreground dark:[&>*[data-state=on]]:bg-neutral-700/80"
        value={salaryType}
        onValueChange={(v) => {
          if (v) onSalaryTypeChange(v as SalaryType)
        }}
      >
        {(['smic', 'mean', 'median'] as SalaryType[]).map((opt) => (
          <ToggleGroupItem
            key={opt}
            value={opt}
            aria-label={t.controls.salary[opt]}
          >
            {t.controls.salary[opt]}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <ToggleGroup
        type="single"
        variant="outline"
        className="gap-0 *:rounded-none [&>*:first-child]:rounded-l-md [&>*:last-child]:rounded-r-md [&>*:not(:first-child)]:-ml-px [&>*[data-state=off]]:text-muted-foreground dark:[&>*[data-state=on]]:bg-neutral-700/80"
        value={measure}
        onValueChange={(v) => {
          if (v) onMeasureChange(v as Measure)
        }}
      >
        {(['hourly', 'monthly', 'annual'] as Measure[]).map((opt) => (
          <ToggleGroupItem
            key={opt}
            value={opt}
            aria-label={t.controls.measure[opt]}
          >
            {t.controls.measure[opt]}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <ToggleGroup
        type="single"
        variant="outline"
        className="gap-0 *:rounded-none [&>*:first-child]:rounded-l-md [&>*:last-child]:rounded-r-md [&>*:not(:first-child)]:-ml-px [&>*[data-state=off]]:text-muted-foreground dark:[&>*[data-state=on]]:bg-neutral-700/80"
        value={pay}
        onValueChange={(v) => {
          if (v) onPayChange(v as PayType)
        }}
      >
        {(['brut', 'net'] as PayType[]).map((opt) => (
          <ToggleGroupItem
            key={opt}
            value={opt}
            aria-label={t.controls.pay[opt]}
          >
            {t.controls.pay[opt]}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}
