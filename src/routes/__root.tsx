import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import ThemeToggle from '../components/ThemeToggle'

export const Route = createRootRoute({
  component: RootLayout,
})

function Nav() {
  return (
    <nav className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center gap-6">
        <Link
          to="/"
          activeProps={{
            className: 'font-semibold text-blue-600 dark:text-blue-400',
          }}
          inactiveProps={{
            className:
              'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors',
          }}
        >
          Home
        </Link>
        <Link
          to="/about"
          activeProps={{
            className: 'font-semibold text-blue-600 dark:text-blue-400',
          }}
          inactiveProps={{
            className:
              'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors',
          }}
        >
          About
        </Link>
        <div className="ml-auto flex items-center gap-2">
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
