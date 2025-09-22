import { test, expect } from '@playwright/test';

test('create and delete availability slot via UI', async ({ page }) => {
  // go to availability page
  await page.goto('/dashboard/availability');

  // If redirected to login, skip
  if (page.url().includes('/login')) {
    test.skip();
    return;
  }

  // wait for the Add button
  const addBtn = page.getByRole('button', { name: /agregar horario/i });
  await expect(addBtn).toBeVisible({ timeout: 5000 });
  await addBtn.click();

  // fill form: set start date today and times
  const today = new Date().toISOString().split('T')[0];
  await page.fill('input[type="date"]', today);
  await page.fill('input[type="time"]', '09:00');
  // second date input
  const dateInputs = page.locator('input[type="date"]');
  await dateInputs.nth(1).fill(today);
  const timeInputs = page.locator('input[type="time"]');
  await timeInputs.nth(1).fill('10:00');

  // submit
  const createBtn = page.getByRole('button', { name: /crear disponibilidad/i });
  await createBtn.click();

  // assert slot appears
  const slotItem = page.getByText(/09:00/).first();
  await expect(slotItem).toBeVisible({ timeout: 5000 });

  // delete it
  const deleteBtn = page.getByRole('button', { name: /eliminar/i }).first();
  await deleteBtn.click();

  // confirm deletion (confirm dialog) - handle native dialog
  page.on('dialog', async dialog => { await dialog.accept(); });

  // ensure it's gone
  await expect(slotItem).not.toBeVisible({ timeout: 5000 });
});
