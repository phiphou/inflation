import { useLocaleStore } from '../store/localeStore'
import type { Measure, PayType, SalaryType } from './chart'

const fr = {
  nav: {
    title: 'Revenus en France',
    subtitle:
      "Revenu nominal vs. projection si le pouvoir d'achat de 1980 avait simplement suivi l'inflation.",
    tabs: {
      chart: 'Évolution des salaires',
      calculateur: 'Temps de travail',
    },
  },
  controls: {
    measure: {
      hourly: 'Horaire',
      monthly: 'Mensuel',
      annual: 'Annuel',
    } satisfies Record<Measure, string>,
    pay: { brut: 'Brut', net: 'Net' } satisfies Record<PayType, string>,
    salary: { smic: 'SMIC', mean: 'Moyen', median: 'Médian' } satisfies Record<
      SalaryType,
      string
    >,
  },
  units: { hourly: '€/h', monthly: '€/mois', annual: '€/an' } satisfies Record<
    Measure,
    string
  >,
  kpi: {
    startingPoint: 'point de départ',
    currentValue: 'valeur actuelle',
    projectionOnly: 'Projection inflation seule',
    ifNoRealGain: 'si pas de gain réel',
    cumulativeInflation: 'Inflation cumulée',
    priceIncrease: 'hausse des prix sur la période',
    realGainVsInflation: 'Gain réel vs inflation',
    vsProjection: 'vs projection',
  },
  chart: {
    projectionLegend: 'Projection inflation (base 1980)',
    reference35h: '35h généralisées',
  },
  tooltip: {
    gap: 'écart',
  },
  footer: {
    monthlyLabel: 'Mensuel',
    monthlyDesc:
      "heures légales de l'époque — 169 h/mois (39h/sem.) avant 2000, transition lissée 2000–2002, 151,67 h/mois (35h/sem.) à partir de 2002.",
    projectionLabel: 'Projection inflation',
    projectionDesc:
      "valeur 1980 augmentée chaque année du taux d'inflation français, avec les mêmes heures légales que le nominal.",
    netLabel: 'Net',
    netDesc: 'les cotisations salariales sont prises en compte.',
  },
  calculateur: {
    priceFrom: 'Prix de départ',
    priceTo: "Prix d'arrivée",
    yearFrom: 'Année de départ',
    yearTo: "Année d'arrivée",
    salaryType: 'Salaire',
    diff: 'Écart',
    noData: '—',
  },
}

const en = {
  nav: {
    title: 'French Salaries',
    subtitle:
      'Nominal salary vs. projection if purchasing power had simply followed inflation since 1980.',
    tabs: {
      chart: 'Salary evolution',
      calculateur: 'Working time',
    },
  },
  controls: {
    measure: {
      hourly: 'Hourly',
      monthly: 'Monthly',
      annual: 'Annual',
    } satisfies Record<Measure, string>,
    pay: { brut: 'Gross', net: 'Net' } satisfies Record<PayType, string>,
    salary: { smic: 'SMIC', mean: 'Mean', median: 'Median' } satisfies Record<
      SalaryType,
      string
    >,
  },
  units: { hourly: '€/h', monthly: '€/mo', annual: '€/yr' } satisfies Record<
    Measure,
    string
  >,
  kpi: {
    startingPoint: 'starting point',
    currentValue: 'current value',
    projectionOnly: 'Inflation projection only',
    ifNoRealGain: 'if no real gain',
    cumulativeInflation: 'Cumulative inflation',
    priceIncrease: 'price increase over the period',
    realGainVsInflation: 'Real gain vs inflation',
    vsProjection: 'vs projection',
  },
  chart: {
    projectionLegend: 'Inflation projection (base 1980)',
    reference35h: '35h generalized',
  },
  tooltip: {
    gap: 'gap',
  },
  footer: {
    monthlyLabel: 'Monthly',
    monthlyDesc:
      'legal working hours of the period — 169 h/month (39h/week) before 2000, smooth transition 2000–2002, 151.67 h/month (35h/week) from 2002.',
    projectionLabel: 'Inflation projection',
    projectionDesc:
      '1980 value increased each year by the French inflation rate, with the same legal hours as the nominal.',
    netLabel: 'Net',
    netDesc: 'employee social contributions are taken into account.',
  },
  calculateur: {
    priceFrom: 'Starting price',
    priceTo: 'Ending price',
    yearFrom: 'Starting year',
    yearTo: 'Ending year',
    salaryType: 'Salary',
    diff: 'Difference',
    noData: '—',
  },
}

export type Translations = typeof fr

export const translations = { fr, en }

export function useI18n(): Translations {
  const { locale } = useLocaleStore()
  return translations[locale]
}
