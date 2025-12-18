import { redirect } from "next/navigation";
import AdmDashboard from "@/components/adm_Dashboard";

export default async function AdminPage() {
  return <AdmDashboard />;
}

