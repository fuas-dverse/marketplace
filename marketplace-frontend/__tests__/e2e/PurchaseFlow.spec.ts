import { test, expect } from "@playwright/test";
import { signIn } from "./utils";

test("Buy a product", async ({ page }) => {
  await signIn(page, `test3`, `test3`);
  await page
    .getByTestId("product-item-b0dec62f-b76e-4526-a1c0-24f4cad60070")
    .getByTestId("product-buy-button")
    .click();
  await expect(page.getByTestId("confirm-purchase-button")).toBeVisible();
  await page.getByTestId("confirm-purchase-button").click();
  await expect(page.getByTestId("transaction-status-container")).toBeVisible();
  await expect(page.getByTestId("transaction-status-title")).toBeVisible();
  await expect(page).toHaveURL(/.*transactions/);
  await expect(
    page.getByRole("heading", { name: "Transaction History" })
  ).toBeVisible();
});
