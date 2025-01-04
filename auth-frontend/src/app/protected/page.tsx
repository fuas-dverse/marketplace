import { validateToken } from "@/app/actions/auth";
import ProtectedPage from "@/components/ProtectedPage";

export default async function ProtectedPageWrapper() {
  const { valid: isAuthenticated, user } = await validateToken();

  return <ProtectedPage isAuthenticated={isAuthenticated} user={user.user} />;
}
