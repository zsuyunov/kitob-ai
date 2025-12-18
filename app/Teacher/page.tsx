import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getTeacherBranchAndAssignments } from "@/Admin/teacher.action";
import { Plus, FileText } from "lucide-react";

async function TeacherHome() {
  const user = await getCurrentUser();
  let teacherInfo = null;
  
  if (user?.id) {
    teacherInfo = await getTeacherBranchAndAssignments(user.id);
  }

  const teacherName = teacherInfo?.teacher ? 
    `${teacherInfo.teacher.firstName} ${teacherInfo.teacher.lastName}` : 
    user?.name || "O'qituvchi";

  return (
    <>
      <section className="card-cta">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2>O'qituvchilar uchun interview boshqaruv paneli</h2>
          <p className="text-lg">
            O'quvchilar uchun yangi interviewlar yarating va mavjud interviewlarni boshqaring
          </p>
        </div>

        <div className="relative flex items-end justify-center max-sm:hidden">
          {/* Left Book - O'tkan kunlar */}
          <div className="relative group -mr-16 z-20 pb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-200/20 to-transparent blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative w-20 h-28 rounded-lg overflow-hidden shadow-2xl transform hover:scale-110 hover:-rotate-3 transition-all duration-300 border-2 border-primary-200/30">
              <Image
                src="/O'tkan_kunlar.png"
                alt="O'tkan kunlar"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Center Robot */}
          <div className="relative z-10 transform hover:scale-105 transition-transform duration-300">
            <Image
              src="/robot.png"
              alt="robo-teacher"
              width={700}
              height={700}
              className="drop-shadow-2xl"
            />
          </div>

          {/* Right Book - Jinoyat va jazo */}
          <div className="relative group -ml-16 z-20 pb-4">
            <div className="absolute inset-0 bg-gradient-to-l from-success-100/20 to-transparent blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative w-20 h-28 rounded-lg overflow-hidden shadow-2xl transform hover:scale-110 hover:rotate-3 transition-all duration-300 border-2 border-success-100/30">
              <Image
                src="/jinoyat_va_jazo.jpg"
                alt="Jinoyat va jazo"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Xush kelibsiz, {teacherName}!</h2>
        
        <div className="interviews-section">
          {/* Create Interview Card */}
          <Link href="/Teacher/interviews/create" className="block">
            <div className="card-interview hover:scale-105 transition-transform duration-200 cursor-pointer border border-primary-200/20 hover:border-primary-200/40">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-center bg-primary-200/10 rounded-full p-4">
                  <Plus className="size-8 text-primary-200" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-primary-100 mb-2">Interview yaratish</h3>
                  <p className="text-light-200">O'quvchilar uchun yangi interview yarating</p>
                </div>
              </div>
              <div className="text-sm text-light-100 opacity-80">
                Kitob va savollar qo'shib, sinf uchun interview tuzishingiz mumkin
              </div>
            </div>
          </Link>

          {/* View Interviews Card */}
          <Link href="/Teacher/interviews" className="block">
            <div className="card-interview hover:scale-105 transition-transform duration-200 cursor-pointer border border-primary-200/20 hover:border-primary-200/40">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-center bg-success-100/10 rounded-full p-4">
                  <FileText className="size-8 text-success-100" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-primary-100 mb-2">Interviewlarni ko'rish</h3>
                  <p className="text-light-200">Yaratilgan interviewlarni boshqaring</p>
                </div>
              </div>
              <div className="text-sm text-light-100 opacity-80">
                Mavjud interviewlarni tahrirlash, o'chirish va natijalarni ko'rish
              </div>
            </div>
          </Link>
        </div>
      </section>
    </>
  );
}

export default TeacherHome;
