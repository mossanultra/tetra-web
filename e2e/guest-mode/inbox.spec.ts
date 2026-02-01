import { test, expect } from "@playwright/test";

test.describe("Guest Mode - Inbox", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/inbox");
  });

  test("should show login prompt when accessing inbox", async ({ page }) => {
    // Expect "ログインが必要です"
    // Expect "ログインが必要です"
    await expect(
      page.getByRole("heading", { name: "ログインが必要です" }),
    ).toBeVisible();

    // Expect message
    await expect(
      page.getByText(
        "受信トレイを利用するには、アカウントへのログインが必要です。",
      ),
    ).toBeVisible();

    // Verify login button
    const loginButton = page.getByRole("link", { name: "ログインする" });
    await expect(loginButton).toBeVisible();
    await expect(loginButton).toHaveAttribute("href", "/login-prompt");
  });
});
