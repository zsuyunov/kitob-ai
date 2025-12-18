"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  GraduationCap,
  BookOpen,
  Users,
  ListChecks,
  UserSquare2,
  ClipboardList,
  CalendarClock,
  Briefcase,
  BadgeCheck,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    title: "Boshqaruv paneli",
    href: "/Admin",
    icon: LayoutDashboard,
  },
  {
    title: "Filiallar",
    href: "/Admin/branches",
    icon: Building2,
  },
  {
    title: "Sinflar",
    href: "/Admin/classes",
    icon: GraduationCap,
  },
  {
    title: "Fanlar",
    href: "/Admin/subjects",
    icon: BookOpen,
  },
  {
    title: "Talabalar",
    href: "/Admin/students",
    icon: Users,
  },
  {
    title: "Talaba biriktirishlari",
    href: "/Admin/student-assignments",
    icon: ListChecks,
  },
  {
    title: "O'qituvchilar",
    href: "/Admin/teachers",
    icon: UserSquare2,
  },
  {
    title: "O'qituvchi biriktirishlari",
    href: "/Admin/teacher-assignments",
    icon: ClipboardList,
  },
  {
    title: "O'quv yillari",
    href: "/Admin/academic-years",
    icon: CalendarClock,
  },
  {
    title: "Xodim turlari",
    href: "/Admin/employees/types",
    icon: Briefcase,
  },
  {
    title: "Xodimlar",
    href: "/Admin/employees/users",
    icon: BadgeCheck,
  },
  {
    title: "Ruxsatlar",
    href: "/Admin/permissions",
    icon: ShieldCheck,
  },
];

export default function AdmSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-dark-200 border-r border-input h-screen flex flex-col overflow-hidden">
      <div className="p-6 pb-4 flex-shrink-0">
        <h1 className="text-2xl font-bold text-primary-100">Admin Panel</h1>
      </div>

      <nav className="flex flex-col gap-2 px-6 pb-6 overflow-y-auto flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-primary-200 text-dark-100 font-semibold"
                  : "text-light-100 hover:bg-dark-300"
              )}
            >
              <Icon className="size-5" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

