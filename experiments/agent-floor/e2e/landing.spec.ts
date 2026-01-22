import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("should display the landing page with team templates", async ({
    page,
  }) => {
    await page.goto("/");

    // Wait for page to load
    await expect(page).toHaveTitle(/Agent Floor/i);

    // Check for team template options
    await expect(page.getByText("Development Team")).toBeVisible();
    await expect(page.getByText("Trading Floor")).toBeVisible();
    await expect(page.getByText("Creative Studio")).toBeVisible();
  });

  test("should navigate to floor page when clicking team template", async ({
    page,
  }) => {
    await page.goto("/");

    // Click on Development Team
    await page.getByText("Development Team").click();

    // Should navigate to floor page
    await expect(page).toHaveURL(/\/floor\/dev-team/);
  });
});
