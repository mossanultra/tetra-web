import { test as setup } from "@playwright/test";

const authFile = "playwright/.auth/user.json";

setup("authenticate", async ({ page }) => {
  setup.setTimeout(300000); // 5 minutes for manual interaction
  // Perform authentication steps.
  // Since we use Cognito Hosted UI, we navigate to login and wait for the user to complete login manually
  // or use configured environment variables if we were to automate it fully.
  // For this "recreate" task, it works best as a directed manual step or partially automated.

  await page.goto("/login-prompt");

  // Click the main login button
  await page.getByRole("button", { name: "マップを見る・参加する" }).click();

  console.log("Waiting for login to complete... (Redirect to /map)");

  // Wait for the user to be redirected to the map page.
  // We give a generous timeout (5 minutes) to allow manual entry of credentials if running in headed mode.
  await page.waitForURL("**/map", { timeout: 300000 });

  // Save the state
  await page.context().storageState({ path: authFile });
  console.log("Authentication state saved to " + authFile);
});
