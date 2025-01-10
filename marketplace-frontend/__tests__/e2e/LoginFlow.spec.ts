import { test, expect } from "@playwright/test";
import { generateRandomNumber, signIn } from "./utils";
const randomNumber = generateRandomNumber();
const username_password = "test" + randomNumber;

test("Login Flow Test", async ({ page }) => {
  await signIn(page, username_password, username_password).then(async () => {
    await expect(page.getByTestId("header-nav-link-logout")).toContainText(
      "Logout"
    );
  });
});
