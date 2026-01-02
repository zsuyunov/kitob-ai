import Link from "next/link";
import { getDashboardStats } from "@/Admin/dashboard.action";
import AdmStatCard from "./adm_StatCard";
import { Button } from "./ui/button";
import {
  Building2,
  GraduationCap,
  Users,
  MessageSquare,
  BookOpen,
  UserSquare2,
  BadgeCheck,
} from "lucide-react";

export default async function AdmDashboard() {
  const stats = await getDashboardStats();
  const createActions = [
    {
      title: "Talabalar",
      description: "Yangi talaba profillarini tezda qo'shing.",
      href: "/Admin/students?create=1",
      cta: "Yangi talaba",
      icon: Users,
    },
    {
      title: "O'qituvchilar",
      description: "Yangi o'qituvchilarni ro'yxatdan o'tkazing.",
      href: "/Admin/teachers?create=1",
      cta: "Yangi o'qituvchi",
      icon: UserSquare2,
    },
    {
      title: "Xodimlar",
      description: "Xodim va admin hisoblarini yarating.",
      href: "/Admin/employees/users?create=1",
      cta: "Yangi xodim",
      icon: BadgeCheck,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary-100 mb-2">
          Boshqaruv paneli
        </h1>
        <p className="text-light-100">Umumiy statistika va ma'lumotlar</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdmStatCard
          title="Jami filiallar"
          value={stats.totalBranches}
          icon={Building2}
          subtitle={`${stats.activeBranches} faol, ${stats.inactiveBranches} nofaol`}
        />
        <AdmStatCard
          title="Jami sinflar"
          value={stats.totalClasses}
          icon={GraduationCap}
          subtitle={`${stats.activeClasses} faol, ${stats.inactiveClasses} nofaol`}
        />
        <AdmStatCard
          title="Jami fanlar"
          value={stats.totalSubjects}
          icon={BookOpen}
        />
        <AdmStatCard
          title="Jami suhbatlar"
          value={stats.totalInterviews}
          icon={MessageSquare}
        />
        <AdmStatCard
          title="Jami foydalanuvchilar"
          value={stats.totalUsers}
          icon={Users}
        />
      </div>

      <div className="dark-gradient rounded-2xl p-6 border border-input">
        <div>
          <h2 className="text-2xl font-semibold text-primary-100">
            Foydalanuvchi yaratish
          </h2>
          <p className="text-light-100">
            Talaba, o'qituvchi yoki xodim qo'shish uchun tezkor bo'lim.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {createActions.map((action) => {
            const Icon = action.icon;
            return (
              <div
                key={action.title}
                className="dark-gradient rounded-2xl p-5 border border-input flex flex-col gap-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-light-100 text-sm">{action.title}</p>
                    <h3 className="text-lg font-semibold text-primary-100">
                      {action.cta}
                    </h3>
                  </div>
                  <div className="bg-primary-200/20 p-2 rounded-lg">
                    <Icon className="size-5 text-primary-200" />
                  </div>
                </div>
                <p className="text-sm text-light-400">{action.description}</p>
                <Button asChild className="btn-primary">
                  <Link href={action.href}>{action.cta}</Link>
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

