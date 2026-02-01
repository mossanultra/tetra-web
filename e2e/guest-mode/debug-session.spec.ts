import { test, expect } from "@playwright/test";

test("debug session api", async ({ request }) => {
  const response = await request.get("/api/auth/session");
  const body = await response.json();
  console.log("Session API Response:", body);
  require("fs").writeFileSync(
    "debug-session.json",
    JSON.stringify(body, null, 2),
  );
  // Should be empty object or null for no session
  if (body !== null) {
    expect(Object.keys(body).length).toBe(0);
  }
});
