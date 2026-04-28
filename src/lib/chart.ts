import type { AnnualSmicPoint } from './salary'

export type Measure = 'hourly' | 'monthly' | 'annual'
export type PayType = 'brut' | 'net'
export type SalaryType = 'smic' | 'mean' | 'median'

export const SALARY_TYPE_LABELS: Record<SalaryType, string> = {
  smic: 'SMIC',
  mean: 'Moyen',
  median: 'Médian',
}

export interface ChartPoint {
  year: number
  nominal: number
  projectionRaw: number | null
}

export interface ProjectionBase {
  startYear: number
  nominalValue: number
  inflationRaw: number
}

export const MEASURE_LABELS: Record<Measure, string> = {
  hourly: 'Horaire',
  monthly: 'Mensuel',
  annual: 'Annuel',
}

export const PAY_LABELS: Record<PayType, string> = {
  brut: 'Brut',
  net: 'Net',
}

export const UNIT: Record<Measure, string> = {
  hourly: '€/h',
  monthly: '€/mois',
  annual: '€/an',
}

// Annuel = mensuel × 12 ; horaire et mensuel ont un multiplicateur de 1
export const MEASURE_MULTIPLIER: Record<Measure, number> = {
  hourly: 1,
  monthly: 1,
  annual: 12,
}

export function fmt(value: number, unit: string): string {
  return `${value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${unit}`
}

export function getNominalKey(
  measure: Measure,
  pay: PayType,
): keyof AnnualSmicPoint {
  if (measure === 'hourly') return pay === 'brut' ? 'hourlyBrut' : 'hourlyNet'
  // 'monthly' et 'annual' utilisent les mêmes clés mensuelles (annual = mensuel × 12)
  return pay === 'brut' ? 'monthlyBrut' : 'monthlyNet'
}

export function getProjectedKey(
  measure: Measure,
  pay: PayType,
): keyof AnnualSmicPoint {
  if (measure === 'hourly')
    return pay === 'brut' ? 'projectedHourlyBrut' : 'projectedHourlyNet'
  return pay === 'brut' ? 'projectedMonthlyBrut' : 'projectedMonthlyNet'
}
