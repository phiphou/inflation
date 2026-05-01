import { createLazyFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { PriceInput } from '../components/PriceInput'
import { useI18n } from '../lib/i18n'
import type { AnnualSmicPoint } from '../lib/salary'
import {
  cumulativeInflationFactor,
  getAnnualMeanData,
  getAnnualMedianData,
  getAnnualSmicData,
} from '../lib/salary'
import { FRF_TO_EUR, formatDuration, parsePrice } from '../lib/utils'

const ALL_DATA = {
  smic: getAnnualSmicData(),
  mean: getAnnualMeanData(),
  median: getAnnualMedianData(),
}

function buildYearMap(data: AnnualSmicPoint[]): Map<number, AnnualSmicPoint> {
  return new Map(data.map((d) => [d.year, d]))
}

const YEAR_MAPS = {
  smic: buildYearMap(ALL_DATA.smic),
  mean: buildYearMap(ALL_DATA.mean),
  median: buildYearMap(ALL_DATA.median),
}

const AVAILABLE_YEARS = [
  ...new Set([
    ...ALL_DATA.smic.map((d) => d.year),
    ...ALL_DATA.mean.map((d) => d.year),
    ...ALL_DATA.median.map((d) => d.year),
  ]),
].sort((a, b) => a - b)

function inflationFactor(yearFrom: number, yearTo: number): number {
  return cumulativeInflationFactor(yearTo, yearFrom)
}

const SALARY_TYPES = ['smic', 'mean', 'median'] as const
type SalaryKey = (typeof SALARY_TYPES)[number]

const CHART_COLORS: Record<SalaryKey, string> = {
  smic: '#3b82f6',
  median: '#f97316',
  mean: '#22c55e',
}

function CalcTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: number
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-background/85 border border-border dark:bg-neutral-950/80 dark:border-white/15 rounded-lg px-4 py-3 shadow-lg text-sm">
      <p className="font-semibold mb-2">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="mb-1">
          {p.name} :{' '}
          <span className="font-mono">
            {typeof p.value === 'number' ? formatDuration(p.value) : '—'}
          </span>
        </p>
      ))}
    </div>
  )
}

export const Route = createLazyFileRoute('/calculator')({
  component: CalculatorPage,
})

function CalculatorPage() {
  const t = useI18n()
  const [view, setView] = useState<'table' | 'chart'>('chart')
  const [rawFrom, setRawFrom] = useState('')
  const [currencyFrom, setCurrencyFrom] = useState<'eur' | 'frf'>('eur')
  const [yearFrom, setYearFrom] = useState(1980)
  const [rawTo, setRawTo] = useState('')
  const [currencyTo, setCurrencyTo] = useState<'eur' | 'frf'>('eur')
  const [yearTo, setYearTo] = useState(2025)

  const priceFromEur = useMemo(
    () => parsePrice(rawFrom, currencyFrom),
    [rawFrom, currencyFrom],
  )
  const priceToEur = useMemo(
    () => parsePrice(rawTo, currencyTo),
    [rawTo, currencyTo],
  )

  const showTable = priceFromEur !== null || priceToEur !== null
  const bothFilled = priceFromEur !== null && priceToEur !== null
  const effectiveView = bothFilled ? 'table' : view

  const factor = inflationFactor(yearFrom, yearTo)
  const toDisplay = (eur: number, currency: 'eur' | 'frf') =>
    (currency === 'frf' ? eur / FRF_TO_EUR : eur).toFixed(2)

  const placeholderTo =
    priceFromEur != null
      ? toDisplay(priceFromEur * factor, currencyTo)
      : undefined
  const placeholderFrom =
    priceToEur != null
      ? toDisplay(priceToEur / factor, currencyFrom)
      : undefined

  const rows = useMemo((): Array<{
    key: SalaryKey
    fromRate: number | null
    toRate: number | null
    rateDiff: number | null
    ratePct: number | null
    from: number | null
    to: number | null
    diff: number | null
    pct: number | null
  }> => {
    const factor = inflationFactor(yearFrom, yearTo)
    const effectiveFrom =
      priceFromEur ?? (priceToEur != null ? priceToEur / factor : null)
    const effectiveTo =
      priceToEur ?? (priceFromEur != null ? priceFromEur * factor : null)

    return SALARY_TYPES.map((key) => {
      const fromRate = YEAR_MAPS[key].get(yearFrom)?.hourlyNet ?? null
      const toRate = YEAR_MAPS[key].get(yearTo)?.hourlyNet ?? null
      const from =
        effectiveFrom != null && fromRate != null
          ? effectiveFrom / fromRate
          : null
      const to =
        effectiveTo != null && toRate != null ? effectiveTo / toRate : null
      const diff = from != null && to != null ? to - from : null
      const pct =
        from != null && from !== 0 && diff != null ? (diff / from) * 100 : null
      const rateDiff =
        fromRate != null && toRate != null ? toRate - fromRate : null
      const ratePct =
        fromRate != null && fromRate !== 0 && rateDiff != null
          ? (rateDiff / fromRate) * 100
          : null
      return { key, fromRate, toRate, rateDiff, ratePct, from, to, diff, pct }
    })
  }, [priceFromEur, priceToEur, yearFrom, yearTo])

  const fmtRate = (eur: number, currency: 'eur' | 'frf') => {
    const value = currency === 'frf' ? eur / FRF_TO_EUR : eur
    const unit = currency === 'frf' ? 'F/h' : '€/h'
    return `${value.toFixed(2)}${unit}`
  }

  const { chartData, yMin, yMax } = useMemo(() => {
    const basePrice =
      priceFromEur ?? (priceToEur != null ? priceToEur / factor : null)
    if (!basePrice) return { chartData: [], yMin: 0, yMax: 0 }
    const chartData = AVAILABLE_YEARS.filter(
      (y) => y >= yearFrom && y <= yearTo,
    ).map((y) => {
      const yearFactor = cumulativeInflationFactor(y, yearFrom)
      const price = basePrice * yearFactor
      const point: Record<string, number | null | string> = { year: y }
      for (const key of SALARY_TYPES) {
        const rate = YEAR_MAPS[key].get(y)?.hourlyNet ?? null
        point[key] = rate != null ? price / rate : null
      }
      return point
    })
    const allValues = chartData.flatMap((p) =>
      SALARY_TYPES.map((k) => p[k]).filter(
        (v): v is number => typeof v === 'number',
      ),
    )
    const yMin = allValues.length ? Math.min(...allValues) : 0
    const yMax = allValues.length ? Math.max(...allValues) : 0
    return { chartData, yMin, yMax }
  }, [priceFromEur, priceToEur, yearFrom, yearTo, factor])

  const swapAll = () => {
    setRawFrom(rawTo)
    setCurrencyFrom(currencyTo)
    setYearFrom(yearTo)
    setRawTo(rawFrom)
    setCurrencyTo(currencyFrom)
    setYearTo(yearFrom)
  }

  return (
    <div className="max-w-7xl mx-auto  w-full px-4 pb-6 pt-3 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end sm:flex-wrap gap-6 w-full">
        {/* From */}
        <div className="flex gap-6 items-end">
          <PriceInput
            id="price-from"
            label={t.calculator.priceFrom}
            raw={rawFrom}
            currency={currencyFrom}
            placeholder={placeholderFrom}
            onRawChange={setRawFrom}
            onCurrencyChange={setCurrencyFrom}
          />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="year-from" className="text-sm font-medium mb-1">
              {t.calculator.yearFrom}
            </label>
            <select
              id="year-from"
              value={yearFrom}
              onChange={(e) => setYearFrom(Number(e.target.value))}
              className="w-24 rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              {AVAILABLE_YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={swapAll}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') swapAll()
            }}
            className="pb-1 ml-3 sm:ml-0 text-lg text-muted-foreground hover:text-foreground transition-colors select-none"
            title="Inverser"
          >
            ⇄
          </button>
        </div>

        {/* To */}
        <div className="flex gap-6 items-end">
          <PriceInput
            id="price-to"
            label={t.calculator.priceTo}
            raw={rawTo}
            currency={currencyTo}
            placeholder={placeholderTo}
            onRawChange={setRawTo}
            onCurrencyChange={setCurrencyTo}
          />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="year-to" className="text-sm font-medium mb-1">
              {t.calculator.yearTo}
            </label>
            <select
              id="year-to"
              value={yearTo}
              onChange={(e) => setYearTo(Number(e.target.value))}
              className="w-24 rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              {AVAILABLE_YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {showTable && (
        <>
          {/* Vue toggle */}
          {!bothFilled && (
            <div className="flex gap-0.5 bg-muted rounded-lg p-1 w-fit">
              {(['chart', 'table'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${effectiveView === v ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {v === 'table'
                    ? t.calculator.viewTable
                    : t.calculator.viewChart}
                </button>
              ))}
            </div>
          )}

          {/* Graphique */}
          {effectiveView === 'chart' && (
            <div className="sm:-mx-4 border border-border rounded-xl bg-card p-6 pl-3 ml-0!">
              <ResponsiveContainer width="100%" height={580}>
                <LineChart
                  data={chartData}
                  margin={{ top: 12, right: 16, left: 0, bottom: 10 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="currentColor"
                    opacity={0.1}
                  />
                  <XAxis
                    dataKey="year"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tickFormatter={(v) => formatDuration(v)}
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={80}
                    domain={[yMin, yMax]}
                  />
                  <Tooltip content={<CalcTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 13 }} />
                  <Line
                    type="monotone"
                    dataKey="smic"
                    name="SMIC"
                    stroke={CHART_COLORS.smic}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                    connectNulls
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="median"
                    name={t.controls.salary.median}
                    stroke={CHART_COLORS.median}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                    connectNulls
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="mean"
                    name={t.controls.salary.mean}
                    stroke={CHART_COLORS.mean}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                    connectNulls
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Mobile cards */}
          <div
            className={`sm:hidden space-y-3 ${effectiveView !== 'table' ? 'hidden' : ''}`}
          >
            {rows.map(
              ({
                key,
                fromRate,
                toRate,
                rateDiff,
                ratePct,
                from,
                to,
                diff,
                pct,
              }) => (
                <div
                  key={key}
                  className="rounded-lg border border-border overflow-hidden"
                >
                  <div className="bg-muted px-4 py-2 font-semibold text-sm">
                    {t.calculator.salaryFull[key]}
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-border text-sm">
                    <div className="p-3 space-y-0.5">
                      <p className="text-xs text-muted-foreground">
                        {t.calculator.hourlyNet} {yearFrom}
                      </p>
                      <p className="font-mono tabular-nums">
                        {fromRate != null
                          ? fmtRate(fromRate, currencyFrom)
                          : t.calculator.noData}
                      </p>
                    </div>
                    <div className="p-3 space-y-0.5">
                      <p className="text-xs text-muted-foreground">
                        {t.calculator.hourlyNet} {yearTo}
                      </p>
                      <p className="font-mono tabular-nums">
                        {toRate != null
                          ? fmtRate(toRate, currencyTo)
                          : t.calculator.noData}
                      </p>
                    </div>
                    <div className="p-3 space-y-0.5 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        {t.calculator.workingTime} {yearFrom}
                      </p>
                      <p className="font-mono tabular-nums">
                        {from != null
                          ? formatDuration(from)
                          : t.calculator.noData}
                      </p>
                    </div>
                    <div className="p-3 space-y-0.5 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        {t.calculator.workingTime} {yearTo}
                      </p>
                      <p className="font-mono tabular-nums">
                        {to != null ? formatDuration(to) : t.calculator.noData}
                      </p>
                    </div>
                    <div className="p-3 space-y-0.5 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        {t.calculator.diffSalary}
                      </p>
                      {rateDiff != null && ratePct != null ? (
                        <p
                          className={`font-mono tabular-nums ${rateDiff > 0 ? 'text-green-500' : rateDiff < 0 ? 'text-red-500' : ''}`}
                        >
                          {rateDiff > 0 ? '+' : ''}
                          {fmtRate(rateDiff, 'eur')}{' '}
                          <span className="text-xs">
                            ({ratePct > 0 ? '+' : ''}
                            {ratePct.toFixed(1)}%)
                          </span>
                        </p>
                      ) : (
                        <p>{t.calculator.noData}</p>
                      )}
                    </div>
                    <div className="p-3 space-y-0.5 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        {t.calculator.diffTime}
                      </p>
                      {diff != null && pct != null ? (
                        <p
                          className={`font-mono tabular-nums ${diff > 0 ? 'text-red-500' : diff < 0 ? 'text-green-500' : ''}`}
                        >
                          {diff > 0 ? '+' : ''}
                          {formatDuration(diff)}{' '}
                          <span className="text-xs">
                            ({pct > 0 ? '+' : ''}
                            {pct.toFixed(1)}%)
                          </span>
                        </p>
                      ) : (
                        <p>{t.calculator.noData}</p>
                      )}
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>

          {/* Desktop table */}
          <div
            className={`rounded-lg border border-border overflow-x-auto mt-8 ${effectiveView !== 'table' ? 'hidden' : 'hidden sm:block'}`}
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted text-muted-foreground">
                  <th className="px-4 py-2.5 text-left font-medium">
                    {t.calculator.salaryType}
                  </th>
                  <th className="px-4 py-2.5 text-center font-medium">
                    {t.calculator.hourlyNet} {yearFrom}
                  </th>
                  <th className="px-4 py-2.5 text-center font-medium">
                    {t.calculator.workingTime} {yearFrom}
                  </th>
                  <th className="px-4 py-2.5 text-center font-medium">
                    {t.calculator.hourlyNet} {yearTo}
                  </th>
                  <th className="px-4 py-2.5 text-center font-medium">
                    {t.calculator.workingTime} {yearTo}
                  </th>
                  <th className="px-4 py-2.5 text-center font-medium">
                    {t.calculator.diffSalary}
                  </th>
                  <th className="px-4 py-2.5 text-center font-medium">
                    {t.calculator.diffTime}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map(
                  (
                    {
                      key,
                      fromRate,
                      toRate,
                      rateDiff,
                      ratePct,
                      from,
                      to,
                      diff,
                      pct,
                    },
                    i,
                  ) => (
                    <tr key={key} className={i % 2 !== 0 ? 'bg-muted/30' : ''}>
                      <td className="px-4 py-3 font-medium">
                        {t.controls.salary[key]}
                      </td>
                      <td className="px-4 py-3 text-center font-mono tabular-nums text-muted-foreground">
                        {fromRate != null
                          ? fmtRate(fromRate, currencyFrom)
                          : t.calculator.noData}
                      </td>
                      <td className="px-4 py-3 text-center font-mono tabular-nums">
                        {from != null
                          ? formatDuration(from)
                          : t.calculator.noData}
                      </td>
                      <td className="px-4 py-3 text-center font-mono tabular-nums text-muted-foreground">
                        {toRate != null
                          ? fmtRate(toRate, currencyTo)
                          : t.calculator.noData}
                      </td>
                      <td className="px-4 py-3 text-center font-mono tabular-nums">
                        {to != null ? formatDuration(to) : t.calculator.noData}
                      </td>
                      <td className="px-4 py-3 text-center font-mono tabular-nums">
                        {rateDiff != null && ratePct != null ? (
                          <span
                            className={
                              rateDiff > 0
                                ? 'text-green-500'
                                : rateDiff < 0
                                  ? 'text-red-500'
                                  : ''
                            }
                          >
                            {rateDiff > 0 ? '+' : ''}
                            {fmtRate(rateDiff, 'eur')}{' '}
                            <span className="text-xs">
                              ({ratePct > 0 ? '+' : ''}
                              {ratePct.toFixed(1)}%)
                            </span>
                          </span>
                        ) : (
                          t.calculator.noData
                        )}
                      </td>
                      <td className="px-4 py-3 text-center font-mono tabular-nums">
                        {diff != null && pct != null ? (
                          <span
                            className={
                              diff > 0
                                ? 'text-red-500'
                                : diff < 0
                                  ? 'text-green-500'
                                  : ''
                            }
                          >
                            {diff > 0 ? '+' : ''}
                            {formatDuration(diff)}{' '}
                            <span className="text-xs">
                              ({pct > 0 ? '+' : ''}
                              {pct.toFixed(1)}%)
                            </span>
                          </span>
                        ) : (
                          t.calculator.noData
                        )}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
