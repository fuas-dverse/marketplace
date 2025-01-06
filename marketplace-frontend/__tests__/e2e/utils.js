// utils/authHelpers.js

/**
 * Perform Sign-In and Validation
 * @param {Page} page - The Playwright Page object
 * @param {string} username - The username to use for login
 * @param {string} password - The password to use for login
 */
export async function signIn(page, username, password) {
  await page.goto("http://localhost:3001/");
  await page.getByTestId("header-nav-link-logout").click();
  // Click on the "Sign In" tab
  await page.getByRole("tab", { name: "Sign In" }).click();

  // Fill in username and password
  await page.getByLabel("Username").click();
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").click();
  await page.getByLabel("Password").fill(password);

  // Click the "Sign In" button
  await page.getByRole("button", { name: "Sign In" }).click();
}
