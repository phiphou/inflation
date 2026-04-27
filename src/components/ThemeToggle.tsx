import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useThemeStore } from '../store/themeStore'

export default function ThemeToggle() {
  const { mode, setMode } = useThemeStore()
  const toggle = () => setMode(mode === 'light' ? 'dark' : 'light')
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggle}
      className="fixed top-4 right-4"
      aria-label="Toggle theme"
      data-testid="theme-toggle"
    >
      <span
        data-testid="theme-toggle-sun-icon"
        style={{ display: mode === 'dark' ? 'inline-flex' : 'none' }}
      >
        <Sun className="h-5 w-5" />
      </span>
      <span
        data-testid="theme-toggle-moon-icon"
        style={{ display: mode === 'dark' ? 'none' : 'inline-flex' }}
      >
        <Moon className="h-5 w-5" />
      </span>
    </Button>
  )
}
