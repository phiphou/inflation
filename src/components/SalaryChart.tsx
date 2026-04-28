import { useCallback } from 'react'
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
import type {
  ChartPoint,
  Measure,
  PayType,
  ProjectionBase,
  SalaryType,
} from '../lib/chart'
import { useI18n } from '../lib/i18n'
import { CustomTooltip } from './CustomTooltip'

export function SmicChart({
  data,
  salaryType,
  measure,
  pay,
  yMin,
  yMax,
  unit,
  projectionBase,
  onBrushChange,
}: {
  data: ChartPoint[]
  salaryType: SalaryType
  measure: Measure
  pay: PayType
  yMin: number
  yMax: number
  unit: string
  projectionBase: ProjectionBase | null
  onBrushChange: (startIndex: number, endIndex: number) => void
}) {
  const t = useI18n()

  const projectionDataKey = useCallback(
    (d: ChartPoint) => {
      if (
        !projectionBase ||
        d.projectionRaw == null ||
        d.year < projectionBase.startYear
      )
        return null
      return +(
        projectionBase.nominalValue *
        (d.projectionRaw / projectionBase.inflationRaw)
      ).toFixed(4)
    },
    [projectionBase],
  )

  return (
    <div className="border border-border rounded-xl bg-card p-6 pl-3">
      <ResponsiveContainer width="100%" height={538}>
        <LineChart
          data={data}
          margin={{ top: 12, right: 0, left: 0, bottom: 10 }}
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
            tickFormatter={(v) => `${v.toFixed(measure === 'hourly' ? 2 : 0)}`}
            tick={{ fontSize: 13 }}
            tickLine={false}
            axisLine={false}
            unit={` ${unit}`}
            width={measure === 'hourly' ? 68 : measure === 'monthly' ? 80 : 72}
            domain={[yMin, yMax]}
          />
          <Tooltip content={<CustomTooltip unit={unit} />} />
          <Legend
            formatter={(value) =>
              value === 'nominal'
                ? `${t.controls.salary[salaryType]} ${t.controls.measure[measure].toLowerCase()} ${t.controls.pay[pay].toLowerCase()}`
                : t.chart.projectionLegend
            }
            wrapperStyle={{ fontSize: 13, paddingTop: '-30px' }}
          />
          <ReferenceLine
            x={2002}
            stroke="currentColor"
            strokeDasharray="4 4"
            opacity={0.35}
            label={{
              value: t.chart.reference35h,
              fontSize: 11,
              fill: 'currentColor',
              opacity: 0.5,
              position: 'insideTop',
            }}
          />
          <Line
            type="monotone"
            dataKey="nominal"
            name="nominal"
            stroke="#3b82f6"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey={projectionDataKey}
            name="projection"
            stroke="#f97316"
            strokeWidth={2}
            strokeDasharray="5 3"
            dot={false}
            activeDot={{ r: 4 }}
            connectNulls={false}
          />
          <Brush
            dataKey="year"
            height={18}
            stroke="#f97316"
            onChange={(b) =>
              onBrushChange(b.startIndex ?? 0, b.endIndex ?? data.length - 1)
            }
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
