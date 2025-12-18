import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdmInterviews from "@/components/adm_Interviews";

export default function TeacherInterviewCreatePage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/Teacher">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <ChevronLeft className="size-4" />
            Boshqaruv paneliga qaytish
          </Button>
        </Link>
      </div>
      <AdmInterviews teacherMode={true} />
    </div>
  );
}
