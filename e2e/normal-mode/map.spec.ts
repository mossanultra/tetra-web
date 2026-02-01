import { test, expect } from "@playwright/test";

test.describe("Normal Mode - Map", () => {
  // Assume storage state exists for authenticated user
  test.use({ storageState: "playwright/.auth/user.json" });

  test.beforeEach(async ({ page }) => {
    await page.goto("/map");
  });

  test("should allow pin creation", async ({ page }) => {
    // 1. Click on map to open dialog
    // Use .gm-style which is the container for Google Maps
    await page.waitForTimeout(3000); // Wait for initialization
    await page
      .locator(".gm-style")
      .first()
      .click({ position: { x: 100, y: 100 } });

    // 2. Verify PinCreationDialog is visible
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "新しいピン" }),
    ).toBeVisible();

    // 3. Switch to "Event" category
    await page.locator("select").selectOption("event");

    // 4. Fill form
    const threadName = `E2E Event Test ${Date.now()}`;
    await page.getByPlaceholder("スレッド名を入力").fill(threadName);

    // Date inputs (datetime-local)
    // We need to provide a future date.
    // Format: YYYY-MM-DDTHH:mm
    const now = new Date();
    const start = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour later
    const end = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours later

    const format = (d: Date) => {
      const pad = (n: number) => n.toString().padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    // Label association might be missing for implicit labels, using close proximity or placeholder if available?
    // The code behaves: label + div > input.
    // We can use getByLabel if labels are associated, but checked code:
    // <label>開始日時 ...</label><div><input ...></div> - no 'for' or nesting.
    // So we use CSS selector or getByRole if possible? No.
    // We'll use the input[type='datetime-local'] order.
    const dateInputs = page.locator("input[type='datetime-local']");
    await dateInputs.nth(0).fill(format(start));
    await dateInputs.nth(1).fill(format(end));

    await page
      .getByPlaceholder("https://example.com")
      .fill("https://example.com/e2e-test");
    await page
      .getByPlaceholder("イベントの詳細を入力")
      .fill("This is an E2E test event.");

    // 5. Submit
    await page.getByRole("button", { name: "ピンを立てる" }).click();

    // 6. Verify dialog close
    await expect(dialog).not.toBeVisible();
  });
});
