import { create } from 'zustand'

type ThemeMode = 'light' | 'dark'

interface ThemeState {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
}

const initialMode = ((typeof window !== 'undefined'
  ? localStorage.getItem('theme')
  : null) ?? 'light') as ThemeMode
if (typeof document !== 'undefined') {
  if (initialMode === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

export const useThemeStore = create<ThemeState>()((set) => ({
  mode: initialMode,
  setMode: (mode: ThemeMode) => {
    if (typeof document !== 'undefined') {
      if (mode === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      localStorage.setItem('theme', mode)
    }
    set({ mode })
  },
}))
