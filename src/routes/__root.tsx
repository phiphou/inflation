import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
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
      <div className="max-w-6xl mt-3 mx-auto px-6 flex items-start gap-4 py-2">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-3xl mt-1.5 sm:mt-0 font-bold tracking-tight leading-tight">
            {t.nav.title}
          </h1>
          <p className="hidden sm:block text-sm text-muted-foreground mt-1">
            {t.nav.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 pt-0.5">
          <LocaleToggle />
          <ThemeToggle />
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 flex gap-1 mt-4 mb-4">
        <Link
          to="/"
          className="px-4 py-2 text-sm font-medium rounded-t-md transition-colors text-muted-foreground hover:text-foreground"
          activeProps={{
            className:
              'px-4 py-2 text-sm font-medium rounded-t-md border-b-2 border-primary text-foreground',
          }}
        >
          {t.nav.tabs.chart}
        </Link>
        <Link
          to="/calculator"
          className="px-4 py-2 text-sm font-medium rounded-t-md transition-colors text-muted-foreground hover:text-foreground"
          activeProps={{
            className:
              'px-4 py-2 text-sm font-medium rounded-t-md border-b-2 border-primary text-foreground',
          }}
        >
          {t.nav.tabs.calculator}
        </Link>
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
