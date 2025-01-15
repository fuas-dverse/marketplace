import { test, expect } from "@playwright/test";

test("Initial content visibility", async ({ page }) => {
  await page.goto("http://localhost:3001/");
  await expect(page.getByRole("link", { name: "Marketplace" })).toBeVisible();
  await expect(page.getByTestId("product-list-container")).toBeVisible();
  await expect(page.getByTestId("header-nav-link-home")).toBeVisible();
  await expect(page.getByTestId("header-nav-link-logout")).toBeVisible();
  await expect(page.getByTestId("search-bar")).toBeVisible();
  await expect(page.getByTestId("footer-link-privacy")).toBeVisible();
  await expect(page.getByTestId("footer-link-terms")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
});

test("Search for product", async ({ page }) => {
  // Navigate to the page
  await page.goto("http://localhost:3001/");

  // Search for "tes"
  await page.getByTestId("search-bar").click();
  await page.getByTestId("search-bar").fill("tes");

  // Ensure the first product in the container is visible
  await expect(page.getByTestId("product-container").nth(0)).toBeVisible();

  // Check if all products have a visible "Buy" button
  const results = page.locator('[data-testid^="product-item-"]');
  const count = await results.count();
  for (let i = 0; i < count; i++) {
    const product = results.nth(i);
    await expect(
      product.locator('[data-testid="product-buy-button"]')
    ).toBeVisible();
  }

  // Clear the search bar
  await page.getByTestId("search-bar").click();
  await page.getByTestId("search-bar").fill("");

  // Search for "something"
  await page.getByTestId("search-bar").click();
  await page.getByTestId("search-bar").fill("something");

  // Ensure the "no products" message is visible
  await expect(page.getByTestId("no-products-message")).toBeVisible();
});

test("Buy products while logged out", async ({ page }) => {
  // Navigate to the home page
  await page.goto("http://localhost:3001/");

  // Click the "Buy" button of the first product
  const firstProductBuyButton = page
    .locator('[data-testid^="product-item-"]')
    .nth(0) // Select the first product
    .locator('[data-testid="product-buy-button"]');
  await firstProductBuyButton.click();

  // Verify the confirm purchase button is visible
  await expect(page.getByTestId("confirm-purchase-button")).toBeVisible();

  // Attempt to confirm the purchase
  await page.getByTestId("confirm-purchase-button").click();

  // Verify the error message is displayed
  await expect(page.getByTestId("error-message")).toBeVisible();

  // Close the transaction modal
  await page.getByTestId("close-transaction-modal").click();
});
