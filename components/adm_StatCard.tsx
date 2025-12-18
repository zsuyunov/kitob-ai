import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdmStatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  subtitle?: string;
}

export default function AdmStatCard({
  title,
  value,
  icon: Icon,
  subtitle,
}: AdmStatCardProps) {
  return (
    <div className="dark-gradient rounded-2xl p-6 border border-input">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-light-100 text-sm font-medium">{title}</h3>
        <div className="bg-primary-200/20 p-2 rounded-lg">
          <Icon className="size-5 text-primary-200" />
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-3xl font-bold text-primary-100">{value}</p>
        {subtitle && (
          <p className="text-xs text-light-400">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

