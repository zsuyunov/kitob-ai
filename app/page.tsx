import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getRedirectPathForRole } from "@/lib/utils/roleAuth";

export default async function HomePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Use centralized role-based redirect logic
  redirect(getRedirectPathForRole(user.role));
}

