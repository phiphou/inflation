import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const FRF_TO_EUR = 1 / 6.55957

export function formatDuration(hours: number): string {
  const neg = hours < 0
  const totalSec = Math.abs(hours) * 3600
  let result: string

  if (totalSec < 60) {
    result = `${totalSec.toFixed(2)}s`
  } else if (totalSec < 3600) {
    const rounded = Math.round(totalSec)
    const m = Math.floor(rounded / 60)
    const s = rounded % 60
    result = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  } else if (totalSec < 86400) {
    const rounded = Math.round(totalSec)
    const h = Math.floor(rounded / 3600)
    const m = Math.floor((rounded % 3600) / 60)
    const s = rounded % 60
    result = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  } else {
    const rounded = Math.round(totalSec)
    const d = Math.floor(rounded / 86400)
    const h = Math.floor((rounded % 86400) / 3600)
    const m = Math.floor((rounded % 3600) / 60)
    const s = rounded % 60
    result = `${d}j${String(h).padStart(2, '0')}h${String(m).padStart(2, '0')}min${String(s).padStart(2, '0')}s`
  }

  return neg ? `−${result}` : result
}

export function parsePrice(
  raw: string,
  currency: 'eur' | 'frf',
): number | null {
  const v = parseFloat(raw.replace(',', '.'))
  if (!Number.isFinite(v) || v <= 0) return null
  return currency === 'frf' ? v * FRF_TO_EUR : v
}
