import { expect, test } from '@playwright/test'

test('theme toggle switches between light and dark', async ({ page }) => {
  await page.goto('/')

  const html = page.locator('html')
  const toggleBtn = page.getByTestId('theme-toggle')

  await expect(toggleBtn).toBeVisible()

  // Initial state: light (no 'dark' class)
  await expect(html).not.toHaveClass(/dark/)

  // Click toggle → dark mode
  await toggleBtn.click()
  await expect(html).toHaveClass(/dark/)

  // Click again → light mode
  await toggleBtn.click()
  await expect(html).not.toHaveClass(/dark/)
})
