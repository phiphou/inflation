import type React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import ThemeToggle from '../ThemeToggle'
vi.mock('@/components/ui/button', () => ({
  Button: (props: React.ComponentPropsWithoutRef<'button'>) => (
    <button {...props} />
  ),
}))

const THEME_TOGGLE_TEST_ID = 'theme-toggle'
const MOON_ICON_TEST_ID = 'theme-toggle-moon-icon'
const SUN_ICON_TEST_ID = 'theme-toggle-sun-icon'

const mockSetMode = vi.fn()
let mockMode: 'light' | 'dark' = 'light'

vi.mock('../../store/themeStore', () => ({
  useThemeStore: () => ({
    mode: mockMode,
    setMode: mockSetMode,
  }),
}))

describe('ThemeToggle', () => {
  beforeEach(() => {
    mockMode = 'light'
    mockSetMode.mockClear()
  })

  test('renders toggle button', () => {
    render(<ThemeToggle />)

    expect(screen.getByTestId(THEME_TOGGLE_TEST_ID)).toBeInTheDocument()
  })

  test('has correct aria-label for accessibility', () => {
    render(<ThemeToggle />)

    expect(screen.getByTestId(THEME_TOGGLE_TEST_ID)).toHaveAttribute(
      'aria-label',
      'Toggle theme',
    )
  })

  test('toggles from light to dark when clicked', () => {
    mockMode = 'light'
    render(<ThemeToggle />)

    fireEvent.click(screen.getByTestId(THEME_TOGGLE_TEST_ID))

    expect(mockSetMode).toHaveBeenCalledWith('dark')
  })

  test('toggles from dark to light when clicked', () => {
    mockMode = 'dark'
    render(<ThemeToggle />)

    fireEvent.click(screen.getByTestId(THEME_TOGGLE_TEST_ID))

    expect(mockSetMode).toHaveBeenCalledWith('light')
  })

  test('renders both Moon and Sun icons', () => {
    render(<ThemeToggle />)

    // Both icons are present in the DOM; visibility is controlled by CSS
    expect(screen.getByTestId(SUN_ICON_TEST_ID)).toBeInTheDocument()
    expect(screen.getByTestId(MOON_ICON_TEST_ID)).toBeInTheDocument()
  })

  test('button has type button', () => {
    render(<ThemeToggle />)

    expect(screen.getByTestId(THEME_TOGGLE_TEST_ID)).toHaveAttribute(
      'type',
      'button',
    )
  })
})
