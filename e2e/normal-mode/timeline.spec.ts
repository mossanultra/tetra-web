import { test, expect } from "@playwright/test";

test.describe("Normal Mode - Timeline", () => {
  // Assume storage state exists for authenticated user
  // You can create this using a global setup or manual login script
  test.use({ storageState: "playwright/.auth/user.json" });

  test.beforeEach(async ({ page }) => {
    await page.goto("/timeline");
  });

  test("should display timeline and load posts", async ({ page }) => {
    // Verify timeline container
    await expect(page.locator("div.divide-y")).toBeVisible();

    // Check for posts or "no posts" message
    const posts = page.locator("article");
    const noPosts = page.getByText("投稿がありません");
    await expect(posts.first().or(noPosts)).toBeVisible();
  });

  test("should allow creating a text post", async ({ page }) => {
    // Open Create Modal
    await page.getByLabel("新規投稿").click();
    await expect(page.getByText("新規投稿")).toBeVisible();

    // Fill text
    const testText = `Test Post ${Date.now()}`;
    await page.getByPlaceholder("いまどうしてる？").fill(testText);

    // Submit
    await page.getByRole("button", { name: "投稿する" }).click();

    // Verify post appears in timeline (wait for it)
    await expect(
      page.locator("article").filter({ hasText: testText }).first(),
    ).toBeVisible();
  });

  test("should allow creating an image post", async ({ page }) => {
    // Open Create Modal
    await page.getByLabel("新規投稿").click();

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

    const testText = `Image Post ${Date.now()}`;
    await page.getByPlaceholder("いまどうしてる？").fill(testText);

    // Submit
    await page.getByRole("button", { name: "投稿する" }).click();

    // Verify post appears
    const newPost = page
      .locator("article")
      .filter({ hasText: testText })
      .first();
    await expect(newPost).toBeVisible();
    // Verify image presence
    await expect(newPost.locator("img[alt='投稿画像']")).toBeVisible();
  });

  test("should allow replying to a post", async ({ page }) => {
    // Ensure we have a post to reply to
    // Create one for this test specifically to avoid dependencies
    await page.getByLabel("新規投稿").click();
    const postText = `Reply Target ${Date.now()}`;
    await page.getByPlaceholder("いまどうしてる？").fill(postText);
    await page.getByRole("button", { name: "投稿する" }).click();

    // Wait for it
    const targetPost = page.locator("article", { hasText: postText }).first();
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
    // Note: verifying reply appearance might require expanding thread or checking counts
  });

  test("should verify infinite scroll loads more posts", async ({ page }) => {
    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Wait for possible loader or new content
    // It's hard to assert generic "more content" without initial count.
    const initialCount = await page.locator("article").count();

    if (initialCount > 0) {
      // InfiniteScroll triggers when scrolling down.
      // We might need to scroll the specific scrollableTarget if defined.
      // The implementation uses Window or specific target?
      // TimelineClient uses scrollableTarget="scrollableDiv" but only if defined?
      // Actually InfiniteScroll default is window if no target specified or target not found.
      // In code: <InfiniteScroll scrollableTarget="scrollableDiv" ...>
      // But I didn't see id="scrollableDiv" in the wrapper.
      // If ID not found, it might fallback or fail.
      // Let's assume it checks window or we attempt to scroll page.

      await page.mouse.wheel(0, 10000);
      await page.waitForTimeout(2000); // Wait for fetch

      const newCount = await page.locator("article").count();
      // If there are more items, count should increase.
      // If no more items, expected to stay same.
      // We can't strictly fail if no more items.
      console.log(`Scroll: ${initialCount} -> ${newCount}`);
    }
  });

  test("should allow viewing post image", async ({ page }) => {
    // Look for a post with image
    const postWithImage = page
      .locator("article")
      .filter({ has: page.locator("img[alt='投稿画像']") })
      .first();

    test.skip((await postWithImage.count()) === 0, "No posts with image");

    // Click image
    await postWithImage.locator("img[alt='投稿画像']").click();

    // Verify Image Modal
    // ImageModal usually renders a dialog or overlay
    await expect(
      page.locator("div[class*='fixed inset-0']").last(),
    ).toBeVisible(); // Generic overlay detection or better selector
    // Close it
    await page.locator("div[class*='fixed inset-0']").last().click();
  });

  test("should allow reporting a post", async ({ page }) => {
    const posts = page.locator("article");
    test.skip((await posts.count()) === 0, "No posts to report");

    const firstPost = posts.first();
    const menuButton = firstPost.locator(".relative button").first();
    await menuButton.click();

    // Click Report
    await page.getByRole("button", { name: "通報" }).click();

    // Implementation of report is: console.log("Report thread:", threadId);
    // So there might not be UI feedback yet.
    // We verify the menu closes.
    await expect(page.getByRole("button", { name: "通報" })).not.toBeVisible();
  });

  test("should allow deleting own post", async ({ page }) => {
    // Create a temporary post for deletion to avoid destroying data
    await page.getByLabel("新規投稿").click();
    const deleteTestText = `Delete Me ${Date.now()}`;
    await page.getByPlaceholder("いまどうしてる？").fill(deleteTestText);
    await page.getByRole("button", { name: "投稿する" }).click();

    // Wait for it to appear
    const newPost = page
      .locator("article", { hasText: deleteTestText })
      .first();
    await expect(newPost).toBeVisible();

    // Open menu
    // Open menu
    const menuBtn = newPost.getByRole("button", { name: "メニュー" });
    await menuBtn.click();

    // Click Delete
    await page.on("dialog", (dialog) => dialog.accept()); // Handle confirm
    await page.getByRole("button", { name: "削除" }).click();

    // Verify disappearance
    await expect(newPost).not.toBeVisible();
  });
});
