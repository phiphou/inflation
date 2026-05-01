import { createLazyFileRoute } from '@tanstack/react-router'
import { useCallback, useMemo, useState } from 'react'
import {
  Brush,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { fuelData } from '../data/fuel'
import { useI18n } from '../lib/i18n'
import type { AnnualSmicPoint } from '../lib/salary'
import {
  cumulativeInflationFactor,
  getAnnualMeanData,
  getAnnualMedianData,
  getAnnualSmicData,
} from '../lib/salary'
import { formatDuration } from '../lib/utils'

function buildYearMap(data: AnnualSmicPoint[]): Map<number, AnnualSmicPoint> {
  return new Map(data.map((d) => [d.year, d]))
}

const SALARY_MAPS = {
  smic: buildYearMap(getAnnualSmicData()),
  mean: buildYearMap(getAnnualMeanData()),
  median: buildYearMap(getAnnualMedianData()),
}

const sortedFuel = [...fuelData].sort((a, b) => a.date.localeCompare(b.date))
interface FuelBase {
  year: number
  gas: number
  gasoil: number | null
  smicTime: number | null
  meanTime: number | null
  medianTime: number | null
}

const ALL_FUEL_BASE: FuelBase[] = sortedFuel.map((entry) => {
  const year = parseInt(entry.date.slice(0, 4), 10)
  const smicRate = SALARY_MAPS.smic.get(year)?.hourlyNet ?? null
  const meanRate = SALARY_MAPS.mean.get(year)?.hourlyNet ?? null
  const medianRate = SALARY_MAPS.median.get(year)?.hourlyNet ?? null
  return {
    year,
    gas: entry.gas,
    gasoil: entry.gasoil,
    smicTime: smicRate != null ? entry.gas / smicRate : null,
    meanTime: meanRate != null ? entry.gas / meanRate : null,
    medianTime: medianRate != null ? entry.gas / medianRate : null,
  }
})

function FuelTooltip({
  active,
  payload,
  label,
  projectionBase,
}: {
  active?: boolean
  payload?: Array<{ payload: FuelBase }>
  label?: number
  projectionBase: {
    baseYear: number
    baseGas: number
    smicTime: number | null
    meanTime: number | null
    medianTime: number | null
  } | null
}) {
  const t = useI18n()
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  const projected =
    projectionBase && d.year >= projectionBase.baseYear
      ? projectionBase.baseGas *
        cumulativeInflationFactor(d.year, projectionBase.baseYear)
      : null

  return (
    <div className="bg-background/85 border border-border dark:bg-neutral-950/80 dark:border-white/15 rounded-lg px-4 py-3 shadow-lg text-sm min-w-52">
      <p className="font-semibold mb-2">{label}</p>
      <div className="mb-2 space-y-0.5">
        <p style={{ color: '#228b22' }}>
          {t.fuel.gasLabel} :{' '}
          <span className="font-mono">{d.gas.toFixed(3)} €/L</span>
        </p>
        {d.gasoil != null && (
          <p style={{ color: '#3b82f6' }}>
            {t.fuel.gasoilLabel} :{' '}
            <span className="font-mono">{d.gasoil.toFixed(3)} €/L</span>
          </p>
        )}
        {projected != null && (
          <p className="text-muted-foreground text-xs">
            {t.fuel.inflationOnly} :{' '}
            <span className="font-mono">{projected.toFixed(3)} €/L</span>
          </p>
        )}
      </div>
      <div className="border-t border-border pt-2 space-y-1">
        <p className="text-xs text-muted-foreground mb-1">
          {t.fuel.workingTime1L(projectionBase?.baseYear ?? d.year)}
        </p>
        {(
          [
            {
              label: 'SMIC',
              cur: d.smicTime,
              ref: projectionBase?.smicTime ?? null,
            },
            {
              label: t.controls.salary.mean,
              cur: d.meanTime,
              ref: projectionBase?.meanTime ?? null,
            },
            {
              label: t.controls.salary.median,
              cur: d.medianTime,
              ref: projectionBase?.medianTime ?? null,
            },
          ] as const
        ).map(({ label, cur, ref }) => {
          if (cur == null) return null
          const diff = ref != null ? cur - ref : null
          const pct =
            diff != null && ref != null && ref !== 0 ? (diff / ref) * 100 : null
          return (
            <div key={label} className="text-xs">
              <span>{label} : </span>
              <span className="font-mono">{formatDuration(cur)}</span>
              {diff != null && pct != null && (
                <span
                  className={`font-mono ml-1 ${diff > 0 ? 'text-low' : diff < 0 ? 'text-high' : 'text-muted-foreground'}`}
                >
                  ({diff > 0 ? '+' : ''}
                  {formatDuration(diff)} / {pct > 0 ? '+' : ''}
                  {pct.toFixed(1)}%)
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export const Route = createLazyFileRoute('/fuel')({ component: FuelPage })

function FuelPage() {
  const t = useI18n()
  const [brushIndices, setBrushIndices] = useState({
    startIndex: 0,
    endIndex: ALL_FUEL_BASE.length - 1,
  })

  const handleBrushChange = (b: { startIndex?: number; endIndex?: number }) => {
    setBrushIndices({
      startIndex: b.startIndex ?? 0,
      endIndex: b.endIndex ?? ALL_FUEL_BASE.length - 1,
    })
  }

  // Référence stable pour la projection — ne modifie pas ALL_FUEL_BASE
  const projectionBase = useMemo(() => {
    const entry = ALL_FUEL_BASE[brushIndices.startIndex]
    return entry
      ? {
          baseYear: entry.year,
          baseGas: entry.gas,
          smicTime: entry.smicTime,
          meanTime: entry.meanTime,
          medianTime: entry.medianTime,
        }
      : null
  }, [brushIndices.startIndex])

  const projectionDataKey = useCallback(
    (d: FuelBase) => {
      if (!projectionBase || d.year < projectionBase.baseYear) return null
      return +(
        projectionBase.baseGas *
        cumulativeInflationFactor(d.year, projectionBase.baseYear)
      ).toFixed(4)
    },
    [projectionBase],
  )

  const { yMin, yMax } = useMemo(() => {
    const visible = ALL_FUEL_BASE.slice(
      brushIndices.startIndex,
      brushIndices.endIndex + 1,
    )
    const vals = visible.flatMap((d) => {
      const proj =
        projectionBase && d.year >= projectionBase.baseYear
          ? projectionBase.baseGas *
            cumulativeInflationFactor(d.year, projectionBase.baseYear)
          : null
      return [d.gas, d.gasoil, proj].filter((v): v is number => v != null)
    })
    return { yMin: Math.min(...vals), yMax: Math.max(...vals) }
  }, [brushIndices, projectionBase])

  return (
    <div className="max-w-7xl mx-auto w-full px-4 pb-6 pt-3 space-y-4">
      <div className="border border-border rounded-xl bg-card p-6 pl-3">
        <ResponsiveContainer width="100%" height={680}>
          <LineChart
            data={ALL_FUEL_BASE}
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
              tickFormatter={(v) => `${v.toFixed(2)}`}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              unit=" €/L"
              width={72}
              domain={[yMin, yMax]}
            />
            <Tooltip
              content={<FuelTooltip projectionBase={projectionBase} />}
            />
            <Legend wrapperStyle={{ fontSize: 13 }} />
            <ReferenceLine
              x={1992}
              stroke="currentColor"
              strokeDasharray="3 3"
              opacity={0.4}
              label={{
                value: t.fuel.sp95,
                fontSize: 11,
                fill: 'currentColor',
                opacity: 0.6,
                position: 'insideTop',
              }}
            />
            <ReferenceLine
              x={2013}
              stroke="currentColor"
              strokeDasharray="3 3"
              opacity={0.4}
              label={{
                value: t.fuel.sp98,
                fontSize: 11,
                fill: 'currentColor',
                opacity: 0.6,
                position: 'insideTop',
              }}
            />
            <Line
              type="monotone"
              dataKey="gas"
              name={t.fuel.gasLabel}
              stroke="#228b22"
              strokeWidth={2.3}
              dot={false}
              activeDot={{ r: 4 }}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="gasoil"
              name={t.fuel.gasoilLabel}
              stroke="#3b82f6"
              strokeWidth={2.3}
              dot={false}
              activeDot={{ r: 4 }}
              connectNulls={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey={projectionDataKey}
              name={t.fuel.projectionLabel}
              stroke="#f97316"
              strokeWidth={1}
              strokeDasharray="4 3"
              dot={false}
              activeDot={{ r: 3 }}
              isAnimationActive={false}
            />
            <Brush
              dataKey="year"
              height={18}
              stroke="#f97316"
              onChange={handleBrushChange}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
