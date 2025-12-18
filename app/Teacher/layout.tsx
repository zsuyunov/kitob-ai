import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { isTeacherRole, isAdminRole, isStudentRole } from "@/lib/utils/roleAuth";

export default async function TeacherLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  // Debug: Log the user role to help diagnose issues
  console.log("Teacher Layout - User Role:", user.role);

  // Strict check: Only teachers can access Teacher panel
  if (!isTeacherRole(user.role)) {
    if (isAdminRole(user.role)) {
      console.log("Redirecting admin to /Admin");
      redirect("/Admin");
    }
    if (isStudentRole(user.role)) {
      console.log("Redirecting student to /Student");
      redirect("/Student");
    }
    // If not recognized, redirect to admin by default
    console.log("Redirecting unknown role to /Admin");
    redirect("/Admin");
  }

  return (
    <div className="root-layout">
      <nav>
        <Link href="/Teacher" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="Kitob AI Logo" width={38} height={32} />
          <h2 className="text-primary-100">Kitob AI - O'qituvchi</h2>
        </Link>
      </nav>

      {children}
    </div>
  );
}