"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ListChecks,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    title: "Interview yaratish",
    href: "/Teacher/interviews/create",
    icon: ClipboardList,
  },
  {
    title: "Interviewlar",
    href: "/Teacher/interviews",
    icon: ListChecks,
  },
];

export default function TeacherSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-dark-200 border-r border-input h-screen flex flex-col overflow-hidden">
      <div className="p-6 pb-4 flex-shrink-0">
        <h1 className="text-2xl font-bold text-primary-100">O'qituvchi Paneli</h1>
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

