import type { Page } from "@playwright/test";

/**
 * MUI DataGrid virtualizes rows (only those in view exist in the DOM) and pages
 * them. Tables here are big (9k keys, 5k families) and new rows are appended
 * last, so: jump to the LAST page, scroll it top to bottom, then step to the
 * previous page, until a row containing `text` is rendered. Returns the row.
 */
export async function revealRow(page: Page, text: string) {
  const scroller = page.locator(".MuiDataGrid-virtualScroller").first();
  const row = page.locator(".MuiDataGrid-row").filter({ hasText: text });
  const last = page.getByRole("button", { name: /^(Go to last page|Перейти на последнюю страницу)$/ });
  const prev = page.getByRole("button", { name: /^(Go to previous page|Перейти на предыдущую страницу)$/ });
  await scroller.waitFor({ state: "visible", timeout: 10000 });
  // Right after a save the grid is still refetching: give the current page a moment first.
  if (await row.first().waitFor({ state: "attached", timeout: 3000 }).then(() => true, () => false)) return row;
  if (await last.isEnabled().catch(() => false)) {
    await last.click();
    await page.waitForTimeout(300);
  }

  for (let pageNo = 0; pageNo < 20; pageNo++) {
    await scroller.evaluate((el) => { el.scrollTop = 0; });
    for (let i = 0; i < 50; i++) {
      if (await row.count()) {
        // The grid may re-render the row meanwhile; the locator re-resolves on use.
        await row.first().scrollIntoViewIfNeeded().catch(() => {});
        return row;
      }
      const atBottom = await scroller.evaluate((el) => {
        const before = el.scrollTop;
        el.scrollTop += el.clientHeight * 0.8;
        return el.scrollTop === before;
      });
      await page.waitForTimeout(80);
      if (atBottom) break;
    }
    if (!(await prev.isEnabled().catch(() => false))) break;
    await prev.click();
    await page.waitForTimeout(300);
  }
  return row;
}
