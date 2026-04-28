import { useI18n } from '../lib/i18n'

export function ChartFooter() {
  const t = useI18n()
  return (
    <p className="text-xs text-muted-foreground leading-relaxed">
      <strong>{t.footer.monthlyLabel}</strong> : {t.footer.monthlyDesc}{' '}
      <strong>{t.footer.projectionLabel}</strong> : {t.footer.projectionDesc}{' '}
      <strong>{t.footer.netLabel}</strong> : {t.footer.netDesc}
    </p>
  )
}
