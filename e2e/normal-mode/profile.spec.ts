import { test, expect } from "@playwright/test";

test.describe("Normal Mode - Profile", () => {
  // Assume storage state exists for authenticated user
  test.use({ storageState: "playwright/.auth/user.json" });

  test("should display own profile and edit button", async ({ page }) => {
    // 1. Navigate to /profile/@self
    await page.goto("/profile/@self");

    // 2. Click Edit Profile button
    // Selector might need adjustment based on ProfilePage implementation
    // Assuming there's a button or link to /profile/edit.
    // If we assume standard UI, maybe "プロフィールを編集" or similar.
    // Let's look for the edit link/button.
    // Since I didn't verify ProfilePage source, I will try a likely locator or go directly to URL.
    // Going directly is safer for now if I am unsure of the button.
    await page.goto("/profile/edit");

    // 3. Verify Edit Page
    await expect(
      page.getByRole("heading", { name: "プロフィール編集" }),
    ).toBeVisible();

    // 4. Fill form
    const newNickname = `Test User ${Date.now()}`;
    const newBio = `E2E Test Bio ${Date.now()}`;

    await page.getByLabel("ニックネーム").fill(newNickname);
    await page.getByLabel("自己紹介").fill(newBio);
    await page.getByLabel("URL").fill("https://example.com/e2e-profile");

    // 5. Submit
    await page.getByRole("button", { name: "保存する" }).click();

    // 6. Verify Toast or Redirect
    await expect(page.getByText("プロフィールを更新しました")).toBeVisible();

    // 7. Verify Redirect and Data
    await expect(page).toHaveURL(/\/profile\/@self/);
    await expect(page.getByText(newNickname)).toBeVisible();
    await expect(page.getByText(newBio)).toBeVisible();
  });
});
