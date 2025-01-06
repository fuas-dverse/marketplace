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
  await page.goto("http://localhost:3001/");
  await page.getByTestId("search-bar").click();
  await page.getByTestId("search-bar").fill("lap");
  await expect(page.getByTestId("product-container").nth(0)).toBeVisible();
  await expect(
    page.getByTestId("product-item-c1326082-ca00-4d90-9d93-738d05337dda")
  ).toBeVisible();
  await page.getByTestId("search-bar").click();
  await page.getByTestId("search-bar").fill("");

  await page.getByTestId("search-bar").click();
  await page.getByTestId("search-bar").fill("something");
  await expect(page.getByTestId("no-products-message")).toBeVisible();
});

test("Buy products while logged out", async ({ page }) => {
  await page.goto("http://localhost:3001/");
  await page
    .getByTestId("product-item-b0dec62f-b76e-4526-a1c0-24f4cad60070")
    .getByTestId("product-buy-button")
    .click();
  await expect(page.getByTestId("confirm-purchase-button")).toBeVisible();
  await page.getByTestId("confirm-purchase-button").click();
  await expect(page.getByTestId("error-message")).toBeVisible();
  await page.getByTestId("close-transaction-modal").click();
});
