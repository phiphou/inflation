import { createRootRoute, Outlet } from '@tanstack/react-router'
import { LocaleToggle } from '../components/LocaleToggle'
import ThemeToggle from '../components/ThemeToggle'
import { useI18n } from '../lib/i18n'

export const Route = createRootRoute({
  component: RootLayout,
})

function Nav() {
  const t = useI18n()
  return (
    <nav>
      <div className="max-w-6xl mt-3 mx-auto px-6 h-14 flex items-center gap-6">
        <div className="w-full">
          <h1 className="text-3xl font-bold tracking-tight">{t.nav.title}</h1>
          <p className="text-md text-muted-foreground mt-1">{t.nav.subtitle}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <LocaleToggle />
          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
}

function RootLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Nav />
      <div className="flex-1 flex flex-col">
        <Outlet />
      </div>
    </div>
  )
}
