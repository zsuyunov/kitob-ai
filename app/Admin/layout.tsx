import { ReactNode } from "react";
import { redirect } from "next/navigation";
import AdmSidebar from "@/components/adm_Sidebar";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { isAdminRole, isTeacherRole, isStudentRole } from "@/lib/utils/roleAuth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  // Debug: Log the user role to help diagnose issues
  console.log("Admin Layout - User Role:", user.role);

  // Strict check: Only admin-level roles can access Admin panel
  if (isTeacherRole(user.role)) {
    console.log("Redirecting teacher to /Teacher");
    redirect("/Teacher");
  }
  
  if (isStudentRole(user.role)) {
    console.log("Redirecting student to /Student");
    redirect("/Student");
  }

  // If not teacher or student, allow access (this includes admin roles and any other roles)
  // This prevents redirect loops for admin users

  return (
    <div className="flex h-screen bg-dark-100 overflow-hidden">
      <AdmSidebar />
      <main className="flex-1 flex flex-col overflow-hidden p-4 md:p-8">{children}</main>
    </div>
  );
}