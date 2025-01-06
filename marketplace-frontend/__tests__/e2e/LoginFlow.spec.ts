import { test, expect } from "@playwright/test";

const generateRandomNumber = () => {
  return Math.floor(1000 + Math.random() * 9000);
};
test("Flow Test", async ({ page }) => {
  const randomNumber = generateRandomNumber();
  await page.goto("http://localhost:3001/");
  await page.getByTestId("header-nav-link-logout").click();
  await expect(
    page.locator("div").filter({ hasText: "WelcomeSign in to your" }).first()
  ).toBeVisible();
  await expect(page).toHaveURL(/^http:\/\/localhost:3002\/\?redirect_url=/);
  await page.getByRole("tab", { name: "Sign Up" }).click();
  await page.getByLabel("Username").click();
  await page.getByLabel("Username").fill("test" + randomNumber);
  await page.getByLabel("Password", { exact: true }).click();
  await page
    .getByLabel("Password", { exact: true })
    .fill("test" + randomNumber);
  await page.locator("#signup-confirm-password").click();
  await page.locator("#signup-confirm-password").fill("test" + randomNumber);
  await page.getByRole("button", { name: "Sign Up" }).click();
  await expect(page.getByLabel("Sign Up").getByRole("paragraph")).toContainText(
    "Account created successfully"
  );
  await page.getByRole("tab", { name: "Sign In" }).click();
  await page.getByLabel("Username").click();
  await page.getByLabel("Username").fill("test" + randomNumber);
  await page.getByLabel("Password").click();
  await page.getByLabel("Password").fill("test");
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page.getByLabel("Sign In").getByRole("paragraph")).toContainText(
    '{"msg":"Bad username or password"} 401'
  );
  await page.getByLabel("Username").click();
  await page.getByLabel("Username").fill("test" + randomNumber);
  await page.getByLabel("Password").click();
  await page.getByLabel("Password").fill("test" + randomNumber);
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page.getByTestId("header-nav-link-logout")).toContainText(
    "Logout"
  );
});
