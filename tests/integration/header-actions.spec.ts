import { expect, test } from '@playwright/test'

test.describe('EchoFrame header actions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/echoframe')
    await expect(page.locator('.top-header')).toBeVisible()
  })

  test('grid alterna modo do feed ao clicar no icone e no botao', async ({ page }) => {
    const feedColumn = page.locator('.feed-column').first()
    const gridButton = page.locator('[data-action="grid"]').first()

    await expect(feedColumn).toHaveClass(/feed--default/)

    await gridButton.locator('svg').click()
    await expect(feedColumn).toHaveClass(/feed--compact/)

    await gridButton.click()
    await expect(feedColumn).toHaveClass(/feed--default/)
  })

  test('bookmarks abre drawer e fecha com click outside', async ({ page }) => {
    const bookmarkButton = page.locator('[data-action="bookmarks"]').first()
    const bookmarkDrawer = page.locator('.bookmark-drawer').first()
    const headerOverlay = page.locator('.header-overlay').first()

    await bookmarkButton.locator('svg').click()

    await expect(bookmarkDrawer).toHaveClass(/is-open/)
    await expect(page.locator('.saved-list, .saved-empty').first()).toBeVisible()

    await headerOverlay.click()
    await expect(bookmarkDrawer).not.toHaveClass(/is-open/)
  })

  test('notificacoes abre dropdown, zera badge e fecha ao clicar fora', async ({ page }) => {
    const notifButton = page.locator('[data-action="notifications"]').first()
    const notifDropdown = page.locator('.notif-dropdown').first()

    await expect(notifButton.locator('.notif-badge')).toHaveCount(1)

    await notifButton.locator('svg').click()

    await expect(notifDropdown).toHaveClass(/is-open/)
    await expect(notifButton.locator('.notif-badge')).toHaveCount(0)

    await page.mouse.click(28, 320)
    await expect(notifDropdown).not.toHaveClass(/is-open/)
  })

  test('configuracoes abre modal e fecha com Escape', async ({ page }) => {
    const settingsButton = page.locator('[data-action="settings"]').first()
    const settingsOverlay = page.locator('.settings-overlay').first()

    await settingsButton.click()
    await expect(settingsOverlay).toHaveClass(/is-open/)
    await expect(settingsOverlay.locator('.settings-grid li').first()).toHaveText('Conta')

    await page.keyboard.press('Escape')
    await expect(settingsOverlay).not.toHaveClass(/is-open/)
  })

  test('perfil abre menu e "Ver perfil" exibe a view de perfil', async ({ page }) => {
    const profileButton = page.locator('[data-action="profile"]').first()
    const profileMenu = page.locator('.profile-menu-dropdown').first()

    await profileButton.locator('img').click()
    await expect(profileMenu).toHaveClass(/is-open/)

    await page.locator('[data-action="profile-view"]').click()
    await expect(profileMenu).not.toHaveClass(/is-open/)
    await expect(page.locator('.profile-view-card')).toBeVisible()
  })

  test('logout abre confirmacao e confirma sessao encerrada com retorno ao feed', async ({ page }) => {
    const logoutButton = page.locator('[data-action="logout"]').first()
    const logoutOverlay = page.locator('.logout-overlay').first()

    await logoutButton.locator('svg').click()
    await expect(logoutOverlay).toHaveClass(/is-open/)

    await page.locator('.logout-confirm').click()
    await expect(page.locator('.signed-out-card')).toBeVisible()

    await page.locator('.signed-out-card .publish-btn').click()
    await expect(page.locator('.signed-out-card')).toHaveCount(0)
    await expect(page.locator('.tabs-row')).toBeVisible()
  })
})
