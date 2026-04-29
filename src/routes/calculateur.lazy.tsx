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

export const Route = createLazyFileRoute('/calculateur')({
  component: CalculateurPage,
})

function CalculateurPage() {
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
    from: number | null
    to: number | null
    diff: number | null
    pct: number | null
  }> => {
    const factor = inflationFactor(yearFrom, yearTo)
    const effectiveFrom =
      priceFromEur ??
      (priceToEur != null && factor != null ? priceToEur / factor : null)
    const effectiveTo =
      priceToEur ??
      (priceFromEur != null && factor != null ? priceFromEur * factor : null)

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
      return { key, from, to, diff, pct }
    })
  }, [priceFromEur, priceToEur, yearFrom, yearTo])

  const swapAll = () => {
    setRawFrom(rawTo)
    setCurrencyFrom(currencyTo)
    setYearFrom(yearTo)
    setRawTo(rawFrom)
    setCurrencyTo(currencyFrom)
    setYearTo(yearFrom)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:flex-wrap gap-3">
        {/* From */}
        <div className="flex gap-3 items-end">
          <PriceInput
            id="price-from"
            label={t.calculateur.priceFrom}
            raw={rawFrom}
            currency={currencyFrom}
            placeholder={placeholderFrom}
            onRawChange={setRawFrom}
            onCurrencyChange={setCurrencyFrom}
          />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="year-from" className="text-sm font-medium mb-1">
              {t.calculateur.yearFrom}
            </label>
            <select
              id="year-from"
              value={yearFrom}
              onChange={(e) => setYearFrom(Number(e.target.value))}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              {AVAILABLE_YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap */}
        <button
          type="button"
          onClick={swapAll}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') swapAll()
          }}
          className="self-end sm:self-auto pb-2 text-lg text-muted-foreground hover:text-foreground transition-colors select-none"
          title="Inverser"
        >
          ⇄
        </button>

        {/* To */}
        <div className="flex gap-3 items-end">
          <PriceInput
            id="price-to"
            label={t.calculateur.priceTo}
            raw={rawTo}
            currency={currencyTo}
            placeholder={placeholderTo}
            onRawChange={setRawTo}
            onCurrencyChange={setCurrencyTo}
          />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="year-to" className="text-sm font-medium mb-1">
              {t.calculateur.yearTo}
            </label>
            <select
              id="year-to"
              value={yearTo}
              onChange={(e) => setYearTo(Number(e.target.value))}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
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
        <div className="rounded-lg border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted text-muted-foreground">
                <th className="px-4 py-2.5 text-left font-medium">
                  {t.calculateur.salaryType}
                </th>
                <th className="px-4 py-2.5 text-center font-medium">
                  {yearFrom}
                </th>
                <th className="px-4 py-2.5 text-center font-medium">
                  {yearTo}
                </th>
                <th className="px-4 py-2.5 text-center font-medium">
                  {t.calculateur.diff}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ key, from, to, diff, pct }, i) => (
                <tr key={key} className={i % 2 !== 0 ? 'bg-muted/30' : ''}>
                  <td className="px-4 py-3 font-medium">
                    {t.controls.salary[key]}
                  </td>
                  <td className="px-4 py-3 text-center font-mono tabular-nums">
                    {from != null ? formatDuration(from) : t.calculateur.noData}
                  </td>
                  <td className="px-4 py-3 text-center font-mono tabular-nums">
                    {to != null ? formatDuration(to) : t.calculateur.noData}
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
                        <span className="text-s">
                          ({pct > 0 ? '+' : ''}
                          {pct.toFixed(1)}%)
                        </span>
                      </span>
                    ) : (
                      t.calculateur.noData
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
