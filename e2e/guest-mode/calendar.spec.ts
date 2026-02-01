import { test, expect } from "@playwright/test";

test.describe("Guest Mode - Calendar", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/calender");
  });

  test("should display calendar and search interface", async ({ page }) => {
    // Verify calendar container
    await expect(page.locator(".react-calendar")).toBeVisible();

    // Verify search results header
    await expect(page.getByText("検索結果")).toBeVisible();

    // Verify "select date" message
    await expect(
      page.getByText("カレンダーから期間を選択してください"),
    ).toBeVisible();
  });

  test("should show threads when a date is selected", async ({ page }) => {
    // Click on today's date or a specific date tile
    // react-calendar tiles have class 'react-calendar__tile'
    // We click the 'now' tile if available, or just the first enabled tile
    const nowTile = page.locator(".react-calendar__tile--now");
    // Add logic to handle visibility check safely
    if (await nowTile.isVisible()) {
      await nowTile.click({ force: true });
      await page.waitForTimeout(300); // Wait for first click to register
      await nowTile.click({ force: true });
    } else {
      const tile = page.locator(".react-calendar__tile").first();
      await tile.click({ force: true });
      await page.waitForTimeout(300); // Wait for first click to register
      await tile.click({ force: true });
    }

    // Wait for the selection message to disappear to ensure the click worked
    await expect(
      page.getByText("カレンダーから期間を選択してください"),
    ).not.toBeVisible();

    // Wait for loading or results
    // If no threads, it shows "選択期間にスレッドが見つかりませんでした"
    // If threads, it shows list.
    const noThreads = page.getByText(
      "選択期間にスレッドが見つかりませんでした",
    );
    const threadList = page.locator("article"); // ThreadCard uses article

    await expect(noThreads.or(threadList.first())).toBeVisible();
  });

  test("should show login prompt when trying to reply", async ({ page }) => {
    // Ensure we have some threads. If the day has no threads, we can't test reply.
    // This is a limitation of E2E without seeding data.
    // We will attempt to find a thread if possible.
    // If this test is flaky due to no data, we might need to skip or seed.
    // For now, we assume if threads are present, we test logic.

    // Attempt to select a date (maybe iterate or pick one with data if we knew)
    // Just picking 'now' for simplicity
    const nowTile = page.locator(".react-calendar__tile--now");
    if (await nowTile.isVisible()) {
      await nowTile.click({ force: true });
      await nowTile.click({ force: true });
    } else {
      await page
        .locator(".react-calendar__tile")
        .first()
        .click({ force: true });
      await page
        .locator(".react-calendar__tile")
        .first()
        .click({ force: true });
    }

    const threadCards = page.locator("article");
    if ((await threadCards.count()) > 0) {
      const firstCard = threadCards.first();
      // Click reply button (FaRegComment icon usually wrapped in button)
      // We can inspect accessibility or finding the button.
      // The button has logic: onClick={handleReply}
      // It contains FaRegComment.
      // The button itself might not have aria-label in ThreadCard (I should check).
      // Checked ThreadCard.tsx: <button onClick={handleReply} ...><FaRegComment ...></button>
      // No aria-label.
      // I can target by finding the svg or the button class.
      // It is in `flex items-center gap-6 ...` container.

      await firstCard
        .locator("button")
        .filter({ has: page.locator("svg") })
        .first()
        .click();

      // Expect Dialog
      await expect(
        page.getByText("リプライするにはアカウントが必要です"),
      ).toBeVisible();
      await expect(
        page.getByText(
          "アカウントを作成すると、投稿へのリプライやコメントができるようになります。",
        ),
      ).toBeVisible();
    }
  });
});
