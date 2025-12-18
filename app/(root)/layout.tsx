import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/actions/auth.action";
import { isStudentRole, isTeacherRole, isAdminRole } from "@/lib/utils/roleAuth";

const Layout = async ({ children }: { children: ReactNode }) => {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  // Debug: Log the user role to help diagnose issues
  console.log("Student Layout - User Role:", user.role);

  // Strict check: Only students can access Student area and interviews
  if (!isStudentRole(user.role)) {
    if (isTeacherRole(user.role)) {
      console.log("Redirecting teacher to /Teacher");
      redirect("/Teacher");
    }
    if (isAdminRole(user.role)) {
      console.log("Redirecting admin to /Admin");
      redirect("/Admin");
    }
    // If not recognized, redirect to admin by default
    console.log("Redirecting unknown role to /Admin");
    redirect("/Admin");
  }

  return (
    <div className="root-layout">
      <nav>
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="Kitob AI Logo" width={38} height={32} />
          <h2 className="text-primary-100">Kitob AI</h2>
        </Link>
      </nav>

      {children}
    </div>
  );
};

export default Layout;