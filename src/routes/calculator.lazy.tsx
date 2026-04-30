import { createLazyFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
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
  return cumulativeInflationFactor(yearTo) / cumulativeInflationFactor(yearFrom)
}

const SALARY_TYPES = ['smic', 'mean', 'median'] as const
type SalaryKey = (typeof SALARY_TYPES)[number]

export const Route = createLazyFileRoute('/calculator')({
  component: CalculatorPage,
})

function CalculatorPage() {
  const t = useI18n()
  const [rawFrom, setRawFrom] = useState('')
  const [currencyFrom, setCurrencyFrom] = useState<'eur' | 'frf'>('eur')
  const [yearFrom, setYearFrom] = useState(1990)
  const [rawTo, setRawTo] = useState('')
  const [currencyTo, setCurrencyTo] = useState<'eur' | 'frf'>('eur')
  const [yearTo, setYearTo] = useState(2023)

  const priceFromEur = useMemo(
    () => parsePrice(rawFrom, currencyFrom),
    [rawFrom, currencyFrom],
  )
  const priceToEur = useMemo(
    () => parsePrice(rawTo, currencyTo),
    [rawTo, currencyTo],
  )

  const showTable = priceFromEur !== null || priceToEur !== null

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

  const swapAll = () => {
    setRawFrom(rawTo)
    setCurrencyFrom(currencyTo)
    setYearFrom(yearTo)
    setRawTo(rawFrom)
    setCurrencyTo(currencyFrom)
    setYearTo(yearFrom)
  }

  return (
    <div className="max-w-7xl mx-3 sm:mx-auto px-1 sm:px-4 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:flex-wrap gap-6 w-full max-w-7xl">
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
          {/* Mobile cards */}
          <div className="sm:hidden space-y-3">
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
          <div className="hidden sm:block rounded-lg border border-border overflow-x-auto">
            <table className="w-full max-w-6xl text-sm">
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
