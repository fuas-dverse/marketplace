import { test, expect } from "@playwright/test";
import { generateRandomNumber, signIn } from "./utils";

test("Add a product and receive notification", async ({ page }) => {
  const randomNumber = generateRandomNumber();
  const productname = "test" + randomNumber;
  await signIn(page, `test`, `test`);
  await page.getByTestId("header-nav-link-account").click();
  await expect(page).toHaveURL(/.*account/);

  await page.getByTestId("add-product-modal-button").click();
  await page.getByTestId("input-title").click();
  await page.getByTestId("input-title").fill(productname);
  await page.getByTestId("input-description").click();
  await page.getByTestId("input-description").fill(productname);
  await page.getByTestId("input-price").click();
  await page.getByTestId("input-price").fill("123");
  await page.getByTestId("submit-button").click();
  await page.getByTestId("header-nav-link-home").click();
  await expect(page.getByText(`Product created: ${productname}`)).toBeVisible();
  await page.getByLabel("close").click();
  await page.getByTestId("header-nav-link-account").click();
  await page.getByRole("heading", { name: "Notifications" }).click();
  await expect(page.getByText("Event: created")).toBeVisible();
});
