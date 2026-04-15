import { expect, test } from '@playwright/test'

test.describe('Chrono accent theme', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chrono/index.html')
    await expect(page.locator('.top-header')).toBeVisible()
  })

  test('previewa no hover, confirma no clique e persiste na recarga', async ({ page }) => {
    await page.locator('#settingsButton').click()
    await expect(page.locator('#view-settings')).toBeVisible()

    await page.locator('[data-settings-section="aparencia"]').click()

    const accentButtons = page.locator('[data-accent-value]')
    await expect(accentButtons).toHaveCount(6)
    await expect(page.locator('[data-accent-value="purple"]')).toHaveClass(/is-active/)

    const blueButton = page.locator('[data-accent-value="blue"]')

    await blueButton.hover()
    await expect.poll(async () => {
      return page.evaluate(() => document.documentElement.style.getPropertyValue('--glow-left').trim())
    }).toBe('rgba(30,80,220,0.108)')

    await blueButton.click()

    await expect(page.locator('[data-accent-value="blue"]')).toHaveClass(/is-active/)
    await expect.poll(async () => {
      return page.evaluate(() => document.documentElement.style.getPropertyValue('--color-primary').trim())
    }).toBe('#3b82f6')
    await expect.poll(async () => {
      return page.evaluate(() => sessionStorage.getItem('chrono:accentColor'))
    }).toBe('blue')

    await page.reload()
    await expect(page.locator('.top-header')).toBeVisible()
    await expect.poll(async () => {
      return page.evaluate(() => document.documentElement.style.getPropertyValue('--color-primary').trim())
    }).toBe('#3b82f6')

    await page.locator('#settingsButton').click()
    await page.locator('[data-settings-section="aparencia"]').click()
    await expect(page.locator('[data-accent-value="blue"]')).toHaveClass(/is-active/)
  })
})