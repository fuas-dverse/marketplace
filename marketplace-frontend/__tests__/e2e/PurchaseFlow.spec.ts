import { test, expect } from "@playwright/test";
import { generateRandomNumber, signIn } from "./utils";
const randomNumber = generateRandomNumber();
const username_password = "test" + randomNumber;
test("Buy a product", async ({ page }) => {
  await signIn(page, username_password, username_password).then(async () => {
    await expect(page.getByTestId("product-container").nth(0)).toBeVisible();

    const products = page.locator('[data-testid^="product-item-"]');

    for (let i = 0; i < (await products.count()); i++) {
      const product = products.nth(i);
      const hasButton = await product
        .locator('[data-testid="product-buy-button"]')
        .count();

      if (hasButton) {
        await product.locator('[data-testid="product-buy-button"]').click();
        break; // Stop after clicking the desired button
      }
    }
    await expect(page.getByTestId("confirm-purchase-button")).toBeVisible();
    await page.getByTestId("confirm-purchase-button").click();
    await expect(
      page.getByTestId("transaction-status-container")
    ).toBeVisible();
    await expect(page.getByTestId("transaction-status-title")).toBeVisible();
    await expect(page).toHaveURL(/.*transactions/);
    await expect(
      page.getByRole("heading", { name: "Transaction History" })
    ).toBeVisible();
  });
});
