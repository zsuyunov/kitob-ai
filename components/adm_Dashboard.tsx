import { getDashboardStats } from "@/Admin/dashboard.action";
import AdmStatCard from "./adm_StatCard";
import {
  Building2,
  GraduationCap,
  Users,
  MessageSquare,
  BookOpen,
} from "lucide-react";

export default async function AdmDashboard() {
  const stats = await getDashboardStats();

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
    </div>
  );
}

