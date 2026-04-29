import { inflationRates } from '../data/inflation'
import { meanData } from '../data/mean'
import { medianData } from '../data/median'
import { smicData } from '../data/smic'

const HOURS_35H = 151.6663893510815
const HOURS_39H = 169
const BASE_YEAR = 1980
const MAX_YEAR = 2023

// Heures légales mensuelles à une année donnée
// Transition progressive : 35h généralisées à partir de 2002
function legalHoursPerMonth(year: number): number {
  if (year < 2000) return HOURS_39H
  if (year >= 2002) return HOURS_35H
  return HOURS_39H + (HOURS_35H - HOURS_39H) * ((year - 2000) / 4)
}

// Facteur d'inflation cumulé depuis BASE_YEAR jusqu'à `toYear`
// cumulativeInflationFactor(BASE_YEAR) = 1 → les deux courbes partent du même point
export function cumulativeInflationFactor(toYear: number): number {
  let factor = 1
  for (let y = BASE_YEAR; y < toYear; y++) {
    const rate = inflationRates[y]
    if (rate !== undefined) factor *= 1 + rate / 100
  }
  return factor
}

export interface AnnualSmicPoint {
  year: number
  hourlyBrut: number
  hourlyNet: number
  // Mensuel : heures légales de l'époque (transition lissée 2000-2002)
  monthlyBrut: number
  monthlyNet: number
  // Projection inflation : base 1980, même calcul que le nominal
  projectedHourlyBrut: number | null
  projectedHourlyNet: number | null
  projectedMonthlyBrut: number | null
  projectedMonthlyNet: number | null
}

export function getAnnualSmicData(): AnnualSmicPoint[] {
  const sorted = [...smicData].sort((a, b) => a.date.localeCompare(b.date))
  const result: AnnualSmicPoint[] = []

  let baseHourlyBrut: number | null = null
  let baseHourlyNet: number | null = null

  for (let year = BASE_YEAR; year <= MAX_YEAR; year++) {
    const applicable = sorted.filter((e) => e.date <= `${year}-12-31`)
    const entry =
      applicable.length > 0 ? applicable[applicable.length - 1] : null

    if (!entry) continue

    const hb = entry.hourlyBrut
    const hn = entry.hourlyNet
    const legalHours = legalHoursPerMonth(year)
    const mb = hb * legalHours
    const mn = hn * legalHours

    if (baseHourlyBrut === null) baseHourlyBrut = hb
    if (baseHourlyNet === null) baseHourlyNet = hn

    const factor = cumulativeInflationFactor(year)
    const baseLegalHours = legalHoursPerMonth(BASE_YEAR) // 169h en 1980
    const hasInflationData = year <= MAX_YEAR

    result.push({
      year,
      hourlyBrut: hb,
      hourlyNet: hn,
      monthlyBrut: mb,
      monthlyNet: mn,
      projectedHourlyBrut: hasInflationData ? baseHourlyBrut * factor : null,
      projectedHourlyNet: hasInflationData ? baseHourlyNet * factor : null,
      // La projection mensuelle suit les mêmes heures légales que le nominal
      projectedMonthlyBrut: hasInflationData
        ? baseHourlyBrut * legalHours * factor
        : null,
      projectedMonthlyNet: hasInflationData
        ? baseHourlyNet * legalHours * factor
        : null,
    })

    void baseLegalHours
  }

  return result
}

// Pour les données annuelles (moyen, médian) : une entrée par an, lookup exact
function buildAnnualFromYearly(
  entries: Array<{ date: string; hourlyBrut: number; hourlyNet: number }>,
): AnnualSmicPoint[] {
  const byYear = new Map(
    entries.map((e) => [parseInt(e.date.slice(0, 4), 10), e]),
  )
  const result: AnnualSmicPoint[] = []

  let baseHourlyBrut: number | null = null
  let baseHourlyNet: number | null = null

  for (let year = BASE_YEAR; year <= MAX_YEAR; year++) {
    const entry = byYear.get(year)
    if (!entry) continue

    const hb = entry.hourlyBrut
    const hn = entry.hourlyNet
    const legalHours = legalHoursPerMonth(year)

    if (baseHourlyBrut === null) baseHourlyBrut = hb
    if (baseHourlyNet === null) baseHourlyNet = hn

    const factor = cumulativeInflationFactor(year)

    result.push({
      year,
      hourlyBrut: hb,
      hourlyNet: hn,
      monthlyBrut: hb * legalHours,
      monthlyNet: hn * legalHours,
      projectedHourlyBrut: baseHourlyBrut * factor,
      projectedHourlyNet: baseHourlyNet * factor,
      projectedMonthlyBrut: baseHourlyBrut * legalHours * factor,
      projectedMonthlyNet: baseHourlyNet * legalHours * factor,
    })
  }

  return result
}

export function getAnnualMeanData(): AnnualSmicPoint[] {
  return buildAnnualFromYearly(meanData)
}

export function getAnnualMedianData(): AnnualSmicPoint[] {
  return buildAnnualFromYearly(medianData)
}
