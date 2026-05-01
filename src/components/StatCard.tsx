export function StatCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string
  value: string
  sub: string
  highlight?: boolean
}) {
  return (
    <div
      className={`rounded-xl border p-2.5 sm:p-4 ${
        highlight ? 'border-blue-500/30 bg-blue-500/5' : 'border-border bg-card'
      }`}
    >
      <p className="text-xs text-muted-foreground leading-snug mb-2">{label}</p>
      <p
        className={`text-xl sm:text-2xl font-bold font-mono ${highlight ? 'text-green-500' : ''}`}
      >
        {value}
      </p>
      <p className="text-xs text-muted-foreground mt-1">{sub}</p>
    </div>
  )
}
