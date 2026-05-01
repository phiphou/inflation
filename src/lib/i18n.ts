import { useLocaleStore } from '../store/localeStore'
import type { Measure, PayType, SalaryType } from './chart'
import { BASE_YEAR } from './salary'

const fr = {
  nav: {
    title: 'Revenus en France',
    subtitle: `Revenu nominal vs. projection si le pouvoir d'achat avait simplement suivi l'inflation.`,
    tabs: {
      chart: 'Évolution des salaires',
      calculator: 'Temps de travail',
      fuel: 'Prix des carburants',
    },
  },
  controls: {
    measure: {
      hourly: 'Horaire',
      monthly: 'Mensuel',
      annual: 'Annuel',
    } satisfies Record<Measure, string>,
    pay: { brut: 'Brut', net: 'Net' } satisfies Record<PayType, string>,
    salary: {
      smic: 'SMIC',
      mean: 'Salaire moyen',
      median: 'Salaire médian',
    } satisfies Record<SalaryType, string>,
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
    projectionLegend: `Projection inflation (base ${BASE_YEAR})`,
    reference35h: '35h généralisées',
    reference39h: '39h généralisées',
  },
  tooltip: {
    gap: 'écart',
  },
  footer: {
    monthlyLabel: 'Mensuel',
    monthlyDesc:
      "heures légales de l'époque — 173,3 h/mois (40h/sem.) jusqu'en 1981, 169 h/mois (39h/sem.) de 1982 à 1999, transition lissée 2000–2002, 151,67 h/mois (35h/sem.) à partir de 2002.",
    projectionLabel: 'Projection inflation',
    projectionDesc: (year: number) =>
      `valeur ${year} augmentée chaque année du taux d'inflation français, avec les mêmes heures légales que le nominal.`,
    netLabel: 'Net',
    netDesc: 'les cotisations salariales sont prises en compte.',
  },
  calculator: {
    priceFrom: 'Prix de départ',
    priceTo: "Prix d'arrivée",
    yearFrom: 'Année de départ',
    yearTo: "Année d'arrivée",
    salaryType: 'Salaire',
    salaryFull: {
      smic: 'SMIC',
      mean: 'Salaire moyen',
      median: 'Salaire médian',
    },
    hourlyNet: '€/h net',
    workingTime: 'Temps de travail',
    diffSalary: 'Écart salaire',
    diffTime: 'Écart temps',
    noData: '—',
    viewTable: 'Tableau',
    viewChart: 'Graphique',
  },
  fuel: {
    gasLabel: 'Essence',
    gasoilLabel: 'Gasoil',
    projectionLabel: 'Projection inflation',
    sp95: 'SP95',
    sp98: 'SP98',
    currentPrice: 'Prix courant',
    inflationOnly: 'Si inflation seule',
    workingTime1L: (year: number) =>
      `Temps de travail (pour 1L) / écart à ${year}`,
  },
}

const en = {
  nav: {
    title: 'French Salaries',
    subtitle: `Nominal salary vs. projection if purchasing power had simply followed inflation.`,
    tabs: {
      chart: 'Salary evolution',
      calculator: 'Working time',
      fuel: 'Fuel prices',
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
    projectionLegend: `Inflation projection (base ${BASE_YEAR})`,
    reference35h: '35h generalized',
    reference39h: '39h generalized',
  },
  tooltip: {
    gap: 'gap',
  },
  footer: {
    monthlyLabel: 'Monthly',
    monthlyDesc:
      'legal working hours of the period — 173.3 h/month (40h/week) until 1981, 169 h/month (39h/week) from 1982 to 1999, smooth transition 2000–2002, 151.67 h/month (35h/week) from 2002.',
    projectionLabel: 'Inflation projection',
    projectionDesc: (year: number) =>
      `${year} value increased each year by the French inflation rate, with the same legal hours as the nominal.`,
    netLabel: 'Net',
    netDesc: 'employee social contributions are taken into account.',
  },
  calculator: {
    priceFrom: 'Starting price',
    priceTo: 'Ending price',
    yearFrom: 'Starting year',
    yearTo: 'Ending year',
    salaryType: 'Salary',
    salaryFull: { smic: 'SMIC', mean: 'Mean salary', median: 'Median salary' },
    hourlyNet: '€/h net',
    workingTime: 'Working time',
    diffSalary: 'Salary gap',
    diffTime: 'Time gap',
    noData: '—',
    viewTable: 'Table',
    viewChart: 'Chart',
  },
  fuel: {
    gasLabel: 'Petrol',
    gasoilLabel: 'Diesel',
    projectionLabel: 'Inflation projection',
    sp95: 'SP95',
    sp98: 'SP98',
    currentPrice: 'Current price',
    inflationOnly: 'Inflation only',
    workingTime1L: (year: number) => `Working time (for 1L) / gap vs ${year}`,
  },
}

export type Translations = typeof fr

export const translations = { fr, en }

export function useI18n(): Translations {
  const { locale } = useLocaleStore()
  return translations[locale]
}
