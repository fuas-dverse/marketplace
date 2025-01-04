import { Suspense } from "react";
import LogoutPageContent from "@/components/LogoutPageContent";

export default function LogoutPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <LogoutPageContent />
    </Suspense>
  );
}
