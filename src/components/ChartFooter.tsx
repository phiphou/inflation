import { useI18n } from '../lib/i18n'

export function ChartFooter({ startYear }: { startYear: number }) {
  const t = useI18n()
  return (
    <p className="text-xs text-muted-foreground leading-relaxed">
      <strong>{t.footer.monthlyLabel}</strong> : {t.footer.monthlyDesc}
      {''}
      <br></br>
      <strong>{t.footer.projectionLabel}</strong> :{' '}
      {t.footer.projectionDesc(startYear)} <br></br>
      <strong>{t.footer.netLabel}</strong> : {t.footer.netDesc}
    </p>
  )
}
