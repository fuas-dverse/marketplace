// In-memory user storage (replace with a database in production)
export const users: { [username: string]: { passwordHash: string } } = {};

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function createUser(
  username: string,
  password: string
): Promise<boolean> {
  if (users[username]) {
    return false; // User already exists
  }
  const passwordHash = await hashPassword(password);
  users[username] = { passwordHash };
  return true;
}

export async function authenticateUser(
  username: string,
  password: string
): Promise<boolean> {
  const user = users[username];
  if (!user) {
    return false;
  }
  const passwordHash = await hashPassword(password);
  return passwordHash === user.passwordHash;
}
