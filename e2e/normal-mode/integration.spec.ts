import { test, expect } from "@playwright/test";

test.describe("Normal Mode - Integration", () => {
  test.use({ storageState: "playwright/.auth/user.json" });

  test("should show map-created event in calendar", async ({ page }) => {
    test.setTimeout(120000); // Increased timeout for scroll search
    // 1. Create Event in Map
    await page.goto("/map");
    await page.waitForTimeout(3000); // Wait for map init

    // Click map to open dialog
    await page
      .locator(".gm-style")
      .first()
      .click({ position: { x: 300, y: 300 } });

    // 2. Verify PinCreationDialog is visible
    const dialog = page
      .getByRole("dialog")
      .filter({ has: page.getByRole("heading", { name: "新しいピン" }) });
    await expect(dialog).toBeVisible();

    // Select Event
    await page.locator("select").selectOption("event");

    // Fill details
    const timestamp = Date.now();
    const eventName = `Integration Event ${timestamp}`;
    await page.getByPlaceholder("スレッド名を入力").fill(eventName);

    // Set Date to Today (Noon)
    // We use Today because Calendar Search queries by createdAt (post time),
    // so future-dated events created today will only appear in Today's search results.
    const now = new Date();
    const start = new Date(now);
    start.setHours(12, 0, 0, 0);
    const end = new Date(now);
    end.setHours(13, 0, 0, 0);

    const format = (d: Date) => {
      const pad = (n: number) => n.toString().padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    const dateInputs = page.locator("input[type='datetime-local']");
    await dateInputs.nth(0).fill(format(start));
    await dateInputs.nth(1).fill(format(end));

    await page
      .getByPlaceholder("イベントの詳細を入力")
      .fill("Integration test event details");

    // Submit
    await page.getByRole("button", { name: "ピンを立てる" }).click();
    await expect(dialog).not.toBeVisible();

    // 2. Verify in Calendar
    await page.goto("/calender");

    // Scroll and Search Logic
    const findEvent = async () => {
      // Ensure we are selecting Today
      const nowTile = page.locator(".react-calendar__tile--now");
      if (!(await nowTile.isVisible())) {
        await page.getByRole("button", { name: "›" }).click();
      }

      // Retry clicking today until selection prompt disappears
      const selectMessage =
        page.getByText("カレンダーから期間を選択してください");
      for (let i = 0; i < 3; i++) {
        if (await selectMessage.isVisible()) {
          await nowTile.first().click({ force: true });
          await page.waitForTimeout(500);
        } else {
          break;
        }
      }
      await expect(selectMessage).not.toBeVisible();

      // Scroll loop to find the event
      const targetLocator = page.getByText(eventName);
      for (let i = 0; i < 20; i++) {
        // Retry up to 20 times (deep scroll)
        if (await targetLocator.isVisible()) {
          return true;
        }
        // Scroll down
        await page.mouse.wheel(0, 3000);
        await page.waitForTimeout(1000); // Wait for infinite scroll load
      }
      return false;
    };

    const found = await findEvent();
    expect(
      found,
      `Event "${eventName}" not found in calendar list after scrolling`,
    ).toBe(true);
  });
});
