import { createLazyFileRoute } from '@tanstack/react-router'
import { useCallback, useMemo, useState } from 'react'
import { ChartFooter } from '../components/ChartFooter'
import { Controls } from '../components/Controls'
import { KpiCards } from '../components/KpiCards'
import { SmicChart } from '../components/SalaryChart'
import {
  getNominalKey,
  MEASURE_MULTIPLIER,
  type Measure,
  type PayType,
  type ProjectionBase,
  type SalaryType,
} from '../lib/chart'
import { useI18n } from '../lib/i18n'
import {
  getAnnualMeanData,
  getAnnualMedianData,
  getAnnualSmicData,
} from '../lib/salary'

const ALL_DATA = {
  smic: getAnnualSmicData(),
  mean: getAnnualMeanData(),
  median: getAnnualMedianData(),
}

export const Route = createLazyFileRoute('/')({ component: SmicPage })

function SmicPage() {
  const [salaryType, setSalaryType] = useState<SalaryType>('smic')
  const [measure, setMeasure] = useState<Measure>('hourly')
  const [pay, setPay] = useState<PayType>('brut')
  const [brushIndices, setBrushIndices] = useState({
    startIndex: 0,
    endIndex: ALL_DATA.smic.length - 1,
  })

  const annualData = ALL_DATA[salaryType]

  // Réinitialise le brush quand le dataset change (les longueurs peuvent différer)
  const handleSalaryTypeChange = useCallback((t: SalaryType) => {
    setSalaryType(t)
    setBrushIndices({ startIndex: 0, endIndex: ALL_DATA[t].length - 1 })
  }, [])

  const t = useI18n()
  const nominalKey = getNominalKey(measure, pay)
  const multiplier = MEASURE_MULTIPLIER[measure]
  const unit = t.units[measure]

  // Clamp pour éviter un index hors-bornes pendant le changement de type
  const startIndex = Math.min(brushIndices.startIndex, annualData.length - 1)
  const endIndex = Math.min(brushIndices.endIndex, annualData.length - 1)

  const startData = annualData[startIndex]
  const endData = annualData[endIndex]

  const nominalFirst = (startData[nominalKey] as number) * multiplier
  const nominalLatest = (endData[nominalKey] as number) * multiplier

  // Inflation relative à la plage sélectionnée : on utilise le ratio des projections
  // projeté[année] = base1980 × facteurCumulé(1980→année), donc projeté[fin]/projeté[début] = facteurCumulé(début→fin)
  const projStart = startData.projectedHourlyBrut
  const projEnd = endData.projectedHourlyBrut
  const relativeFactor =
    projStart != null && projEnd != null ? projEnd / projStart : null

  const totalInflation =
    relativeFactor != null ? (relativeFactor - 1) * 100 : null
  const projectedLatest =
    relativeFactor != null ? nominalFirst * relativeFactor : null
  const gap =
    projectedLatest != null
      ? ((nominalLatest - projectedLatest) / projectedLatest) * 100
      : null

  // Référence stable : ne dépend PAS de brushIndices → le Brush ne se réinitialise pas au drag
  const chartData = useMemo(
    () =>
      annualData.map((d) => ({
        year: d.year,
        nominal: +((d[nominalKey] as number) * multiplier).toFixed(4),
        projectionRaw: d.projectedHourlyBrut,
      })),
    [annualData, nominalKey, multiplier],
  )

  const projectionBase: ProjectionBase | null =
    projStart != null
      ? {
          startYear: startData.year,
          nominalValue: nominalFirst,
          inflationRaw: projStart,
        }
      : null

  // yMin/yMax calculés sur la plage visible (brush), projection normalisée inline
  const { yMin, yMax } = useMemo(() => {
    const visible = chartData.slice(startIndex, endIndex + 1)
    const vals = visible.flatMap((d) => {
      const proj =
        projectionBase &&
        d.projectionRaw != null &&
        d.year >= projectionBase.startYear
          ? projectionBase.nominalValue *
            (d.projectionRaw / projectionBase.inflationRaw)
          : null
      return [d.nominal, proj].filter((v): v is number => v !== null)
    })
    return { yMin: Math.min(...vals), yMax: Math.max(...vals) }
  }, [chartData, startIndex, endIndex, projectionBase])

  const handleBrushChange = useCallback((si: number, ei: number) => {
    setBrushIndices({ startIndex: si, endIndex: ei })
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
      <KpiCards
        salaryType={salaryType}
        measure={measure}
        pay={pay}
        nominalFirst={nominalFirst}
        nominalLatest={nominalLatest}
        projectedLatest={projectedLatest}
        totalInflation={totalInflation}
        gap={gap}
        firstYear={startData.year}
        lastYear={endData.year}
        unit={unit}
      />
      <Controls
        salaryType={salaryType}
        measure={measure}
        pay={pay}
        onSalaryTypeChange={handleSalaryTypeChange}
        onMeasureChange={setMeasure}
        onPayChange={setPay}
      />
      <SmicChart
        data={chartData}
        salaryType={salaryType}
        measure={measure}
        pay={pay}
        yMin={yMin}
        yMax={yMax}
        unit={unit}
        projectionBase={projectionBase}
        onBrushChange={handleBrushChange}
      />
      <ChartFooter />
    </div>
  )
}
