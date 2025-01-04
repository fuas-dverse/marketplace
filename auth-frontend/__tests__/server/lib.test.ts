/**
 * @jest-environment node
 */
import { createUser, authenticateUser, users } from "@/app/lib/auth";

describe("User Authentication", () => {
  beforeEach(() => {
    // Clear the in-memory users object before each test
    for (const key in users) {
      delete users[key];
    }
  });

  describe("createUser", () => {
    it("should create a new user successfully", async () => {
      const result = await createUser("testuser", "password123");
      expect(result).toBe(true);
    });

    it("should not allow creating a user with an existing username", async () => {
      await createUser("testuser", "password123");
      const result = await createUser("testuser", "newpassword");
      expect(result).toBe(false);
    });
  });

  describe("authenticateUser", () => {
    it("should authenticate a user with correct credentials", async () => {
      await createUser("testuser", "password123");
      const result = await authenticateUser("testuser", "password123");
      expect(result).toBe(true);
    });

    it("should not authenticate a user with incorrect credentials", async () => {
      await createUser("testuser", "password123");
      const result = await authenticateUser("testuser", "wrongpassword");
      expect(result).toBe(false);
    });

    it("should not authenticate a non-existent user", async () => {
      const result = await authenticateUser("nonexistent", "password123");
      expect(result).toBe(false);
    });
  });
});
