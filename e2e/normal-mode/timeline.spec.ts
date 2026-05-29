import { test, expect } from "@playwright/test";

test.describe("Normal Mode - Timeline", () => {
  // Assume storage state exists for authenticated user
  // You can create this using a global setup or manual login script
  test.use({ storageState: "playwright/.auth/user.json" });

  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    await page.goto("/timeline");
  });

  test("should allow creating a text post", async ({ page }) => {
    // Open Create Modal
    await page.getByLabel("新規投稿").click();
    await expect(page.getByRole("heading", { name: "掲示板を投稿する" })).toBeVisible();

    // Fill Title and detail
    const testTitle = `Test Title ${Date.now()}`;
    const testText = `Test Detail ${Date.now()}`;
    await page.getByPlaceholder("タイトルを入力").fill(testTitle);
    await page.getByPlaceholder("詳細を入力してください…").fill(testText);

    // Submit
    await page.getByRole("button", { name: "この内容で投稿する" }).click();

    // Verify post appears in timeline (wait for it)
    await expect(
      page.locator("article").filter({ hasText: testTitle }).first(),
    ).toBeVisible();
  });

  test("should allow creating an image post", async ({ page }) => {
    // Open Create Modal
    await page.getByLabel("新規投稿").click();
    await expect(page.getByRole("heading", { name: "掲示板を投稿する" })).toBeVisible();

    // Upload image
    // Using a base64 png buffer
    await page.setInputFiles("input[type='file']", {
      name: "test-image.png",
      mimeType: "image/png",
      buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
        "base64",
      ),
    });

    const testTitle = `Image Post Title ${Date.now()}`;
    const testText = `Image Post ${Date.now()}`;
    await page.getByPlaceholder("タイトルを入力").fill(testTitle);
    await page.getByPlaceholder("詳細を入力してください…").fill(testText);

    // Submit
    await page.getByRole("button", { name: "この内容で投稿する" }).click();

    // Verify post appears
    const newPost = page
      .locator("article")
      .filter({ hasText: testTitle })
      .first();
    await expect(newPost).toBeVisible();
    // Verify image presence
    await expect(newPost.locator("img[alt='投稿画像']")).toBeVisible();
  });

  test("should allow replying to a post", async ({ page }) => {
    // Ensure we have a post to reply to
    // Create one for this test specifically to avoid dependencies
    await page.getByLabel("新規投稿").click();
    const postTitle = `Reply Target ${Date.now()}`;
    await page.getByPlaceholder("タイトルを入力").fill(postTitle);
    await page.getByPlaceholder("詳細を入力してください…").fill("Details");
    await page.getByRole("button", { name: "この内容で投稿する" }).click();

    // Wait for it
    const targetPost = page.locator("article", { hasText: postTitle }).first();
    await expect(targetPost).toBeVisible();

    // Click reply button
    await targetPost.getByRole("button", { name: "返信" }).click();

    // Verify Modal
    await expect(page.getByRole("heading", { name: "返信" })).toBeVisible();

    // Fill text
    const replyText = `Test Reply ${Date.now()}`;
    await page.getByPlaceholder("返信を入力").fill(replyText);

    // Submit
    // Scope to dialog to avoid matching buttons on the background interactions
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: "返信" }).click();

    // Verify success (modal closes)
    await expect(page.getByRole("heading", { name: "返信" })).not.toBeVisible();
  });

  test("should allow deleting own post", async ({ page }) => {
    // Create a temporary post for deletion to avoid destroying data
    await page.getByLabel("新規投稿").click();
    const deleteTestTitle = `Delete Me ${Date.now()}`;
    await page.getByPlaceholder("タイトルを入力").fill(deleteTestTitle);
    await page.getByPlaceholder("詳細を入力してください…").fill("Details");
    await page.getByRole("button", { name: "この内容で投稿する" }).click();

    // Wait for it to appear
    const newPost = page
      .locator("article", { hasText: deleteTestTitle })
      .first();
    await expect(newPost).toBeVisible();

    // Open menu
    await page.waitForTimeout(500); // Wait for interactivity
    const menuBtn = newPost.getByRole("button", { name: "メニュー" });
    await menuBtn.click();

    // Click Delete
    await page.on("dialog", (dialog) => dialog.accept()); // Handle confirm
    await page.getByRole("button", { name: "削除" }).click();

    // Verify disappearance
    await expect(newPost).not.toBeVisible();
  });
});
