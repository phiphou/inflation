import { create } from 'zustand'

export type Locale = 'fr' | 'en'

interface LocaleState {
  locale: Locale
  setLocale: (locale: Locale) => void
}

const initial: Locale = ((typeof window !== 'undefined'
  ? localStorage.getItem('locale')
  : null) ?? 'fr') as Locale

export const useLocaleStore = create<LocaleState>()((set) => ({
  locale: initial,
  setLocale: (locale) => {
    if (typeof window !== 'undefined') localStorage.setItem('locale', locale)
    set({ locale })
  },
}))
