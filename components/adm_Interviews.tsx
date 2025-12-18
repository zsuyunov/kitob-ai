"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import AdmInterviewForm from "./adm_InterviewForm";
import { createInterview, getInterviews, deleteInterview, updateInterview, type Interview } from "@/Admin/interview.action";
import { getAllBranches } from "@/Admin/branch.action";
import { getAllClasses } from "@/Admin/class.action";
import { getAcademicYears, getActiveAcademicYear } from "@/Admin/academic-year.action";
import { getTeacherBranchAndAssignments } from "@/Admin/teacher.action";
import { getCurrentUser } from "@/lib/actions/auth.action";
import type { Branch } from "@/Admin/branch.action";
import type { Class } from "@/Admin/class.action";

const ITEMS_PER_PAGE = 20;

export default function AdmInterviews({
  teacherMode = false,
}: {
  teacherMode?: boolean;
}) {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [academicYears, setAcademicYears] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [createMode, setCreateMode] = useState(false);
  const [editTarget, setEditTarget] = useState<Interview | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [userId, setUserId] = useState<string>("");
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<
    "" | "day" | "week" | "month" | "year"
  >("");
  
  // For teacher mode: store teacher's assigned branch ID and teacher ID
  const [userBranchId, setUserBranchId] = useState<string>("");
  const [teacherId, setTeacherId] = useState<string>("");
  const [activeAcademicYear, setActiveAcademicYear] = useState<string>("");

  const loadData = async () => {
    setLoading(true);
    try {
      const user = await getCurrentUser();
      if (user?.id) setUserId(user.id);
      
      // For teacher mode, fetch teacher profile and branch info
      if (teacherMode && user?.id) {
        const teacherInfo = await getTeacherBranchAndAssignments(user.id);
        console.log("Teacher info loaded:", teacherInfo);
        if (teacherInfo) {
          setTeacherId(teacherInfo.teacher.id);
          if (teacherInfo.branchId) {
            setUserBranchId(teacherInfo.branchId);
            setSelectedBranch(teacherInfo.branchId); // Auto-filter by branch
          }
        }
      }
      
      const [branchesData, classesData, interviewsData, yearsData, activeYearData] = await Promise.all([
        getAllBranches(),
        getAllClasses(),
        getInterviews(),
        getAcademicYears(),
        getActiveAcademicYear(),
      ]);
      setBranches(branchesData);
      setClasses(classesData);
      setInterviews(interviewsData);
      setAcademicYears(yearsData.map((y) => y.name));
      
      if (activeYearData) {
        console.log("Active academic year:", activeYearData.name);
        setActiveAcademicYear(activeYearData.name);
      }

    } catch (error) {
      toast.error("Ma'lumotlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);
  
  const handleCreate = async (payload: {
    branchId: string;
    classId: string;
    teacherId: string;
    academicYear: string;
    bookName?: string;
    bookCoverImage?: string;
    questions: Array<{ question: string; answer: string }>;
    availableFrom: string;
    availableUntil: string;
  }) => {
    if (!userId) {
      toast.error("Foydalanuvchi topilmadi");
      return;
    }

    const result = await createInterview({
      ...payload,
      createdBy: userId,
    });

    if (result.success) {
      toast.success("Interview yaratildi");
      setCreateMode(false);
      setCurrentPage(1);
      loadData();
    } else {
      toast.error(result.error || "Xatolik yuz berdi");
    }
  };

  const handleEdit = async (payload: {
    branchId: string;
    classId: string;
    teacherId: string;
    academicYear: string;
    bookName?: string;
    bookCoverImage?: string;
    questions: Array<{ question: string; answer: string }>;
    availableFrom: string;
    availableUntil: string;
  }) => {
    if (!editTarget) return;

    const result = await updateInterview(editTarget.id, payload);

    if (result.success) {
      toast.success("Interview yangilandi");
      setEditTarget(null);
      loadData();
    } else {
      toast.error(result.error || "Xatolik yuz berdi");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Interviewni o'chirishni tasdiqlaysizmi?")) return;
    const result = await deleteInterview(id);
    if (result.success) {
      toast.success("Interview o'chirildi");
      const totalPages = Math.ceil((interviews.length - 1) / ITEMS_PER_PAGE);
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      }
      loadData();
    } else {
      toast.error(result.error || "Xatolik yuz berdi");
    }
  };

  const filteredInterviews = interviews.filter((interview) => {
    if (teacherMode && interview.createdBy !== userId) return false;
    
    if (selectedBranch && interview.branchId !== selectedBranch) return false;
    if (selectedClass && interview.classId !== selectedClass) return false;

    if (selectedPeriod) {
      const now = new Date();
      const fromDate = new Date(interview.availableFrom);

      const diffMs = now.getTime() - fromDate.getTime();
      const oneDay = 1000 * 60 * 60 * 24;

      if (selectedPeriod === "day" && diffMs > oneDay) return false;
      if (selectedPeriod === "week" && diffMs > oneDay * 7) return false;
      if (selectedPeriod === "month" && diffMs > oneDay * 30) return false;
    }

    return true;
  });

  const paginatedInterviews = filteredInterviews.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const branchClasses = selectedBranch
    ? classes.filter((cls) => cls.branchId === selectedBranch)
    : classes;

  return (
    <div className="flex flex-col h-full overflow-hidden space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-primary-100 mb-2">Interviewlar</h1>
          <p className="text-light-100">Yaratilgan interviewlarni boshqarish</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => {
              if (!teacherMode) setSelectedBranch("");
              setSelectedClass("");
              setSelectedPeriod("");
              setCurrentPage(1);
            }}
          >
            Filtrlarni tozalash
          </Button>
          <Button
            onClick={() => {
              if (createMode || editTarget) {
                setCreateMode(false);
                setEditTarget(null);
              } else {
                setCreateMode(true);
              }
            }}
            className="btn-primary"
          >
            <Plus className="size-4" />
            {createMode || editTarget ? "Bekor qilish" : "Yangi interview"}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        {/* Branch Filter - Hide in Teacher Mode */}
        {!teacherMode && (
        <div className="min-w-[200px]">
          <label className="text-sm text-light-200 block mb-1">Filial</label>
          <select
            value={selectedBranch}
            onChange={(e) => {
              setSelectedBranch(e.target.value);
              setSelectedClass("");
              setCurrentPage(1);
            }}
            className="w-full bg-dark-200 text-light-100 rounded-full min-h-10 px-4 border border-input focus:outline-none focus:ring-2 focus:ring-primary-200"
          >
            <option value="">Barcha filiallar</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>
        )}

        <div className="min-w-[200px]">
          <label className="text-sm text-light-200 block mb-1">Sinf</label>
          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-dark-200 text-light-100 rounded-full min-h-10 px-4 border border-input focus:outline-none focus:ring-2 focus:ring-primary-200"
            disabled={branchClasses.length === 0}
          >
            <option value="">Barcha sinflar</option>
            {branchClasses.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[220px]">
          <label className="text-sm text-light-200 block mb-1">Vaqt oralig'i</label>
          <select
            value={selectedPeriod}
            onChange={(e) => {
              setSelectedPeriod(e.target.value as any);
              setCurrentPage(1);
            }}
            className="w-full bg-dark-200 text-light-100 rounded-full min-h-10 px-4 border border-input focus:outline-none focus:ring-2 focus:ring-primary-200"
          >
            <option value="">Barcha davrlar</option>
            <option value="day">Oxirgi 1 kun</option>
            <option value="week">Oxirgi hafta</option>
            <option value="month">Oxirgi oy</option>
            <option value="year">Butun o'quv yili</option>
          </select>
        </div>
      </div>

      {(createMode || editTarget) && (
        <div className="dark-gradient rounded-2xl p-6 border border-input overflow-y-auto max-h-[calc(100vh-200px)]">
          <h4 className="text-lg font-semibold text-primary-100 mb-4">
            {editTarget ? "Interviewni tahrirlash" : "Yangi interview yaratish"}
          </h4>
          
          {/* Show loading message in teacher mode if data isn't ready */}
          {teacherMode && (!userBranchId || !activeAcademicYear || !teacherId) ? (
            <div className="text-center py-8">
              <p className="text-light-200">Ma'lumotlar yuklanmoqda...</p>
              <p className="text-sm text-light-100 mt-2">
                Branch: {userBranchId || "yuklanmoqda"}, Year: {activeAcademicYear || "yuklanmoqda"}, Teacher: {teacherId || "yuklanmoqda"}
              </p>
            </div>
          ) : (
            <AdmInterviewForm
              key={teacherMode ? `form-${teacherId}-${userBranchId}-${activeAcademicYear}` : `form-${Date.now()}`}
              branches={branches}
              classes={classes}
              academicYears={academicYears}
              defaultValues={
                editTarget 
                  ? {
                      branchId: editTarget.branchId,
                      classId: editTarget.classId,
                      teacherId: editTarget.teacherId,
                      academicYear: editTarget.academicYear,
                      bookName: editTarget.bookName,
                      bookCoverImage: editTarget.bookCoverImage,
                      questions: editTarget.questions,
                      availableFrom: editTarget.availableFrom,
                      availableUntil: editTarget.availableUntil,
                    } 
                  : teacherMode 
                    ? {
                        branchId: userBranchId || "",
                        teacherId: teacherId || "", 
                        academicYear: activeAcademicYear || "",
                        classId: "",
                        questions: [],
                        availableFrom: "",
                        availableUntil: "",
                        bookName: "",
                        bookCoverImage: ""
                      }
                    : undefined
              }
              onSubmit={editTarget ? handleEdit : handleCreate}
              onCancel={() => {
                setCreateMode(false);
                setEditTarget(null);
              }}
              teacherMode={teacherMode}
            />
          )}
        </div>
      )}

      <div className="dark-gradient rounded-2xl border border-input overflow-hidden flex-1 min-h-0 flex flex-col">
        <div className="h-full overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-light-200">Yuklanmoqda...</div>
          ) : paginatedInterviews.length === 0 ? (
            <div className="p-8 text-center text-light-200">Interviewlar mavjud emas</div>
          ) : (
            <table className="w-full">
              <thead className="sticky top-0 bg-dark-200 border-b border-input">
                <tr>
                  {!teacherMode && <th className="text-left p-4 text-light-100">Filial</th>}
                  <th className="text-left p-4 text-light-100">Sinf</th>
                  {!teacherMode && <th className="text-left p-4 text-light-100">O'qituvchi</th>}
                  <th className="text-left p-4 text-light-100">Savollar soni</th>
                  <th className="text-left p-4 text-light-100">Boshlanish</th>
                  <th className="text-left p-4 text-light-100">Tugash</th>
                  <th className="text-left p-4 text-light-100">Harakatlar</th>
                </tr>
              </thead>
              <tbody>
                {paginatedInterviews.map((interview) => (
                  <tr key={interview.id} className="border-b border-input hover:bg-dark-200/50">
                    {!teacherMode && <td className="p-4 text-light-200">{interview.branchName}</td>}
                    <td className="p-4 text-light-200">{interview.className}</td>
                    {!teacherMode && <td className="p-4 text-light-200">{interview.teacherName}</td>}
                    <td className="p-4 text-light-200">{interview.questions.length}</td>
                    <td className="p-4 text-light-200">
                      {new Date(interview.availableFrom).toLocaleString("uz-UZ")}
                    </td>
                    <td className="p-4 text-light-200">
                      {new Date(interview.availableUntil).toLocaleString("uz-UZ")}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setEditTarget(interview)}
                          aria-label="Tahrirlash"
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(interview.id)}
                          aria-label="O'chirish"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {filteredInterviews.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-between p-4 border-t border-input">
            <div className="text-sm text-light-200">
              {((currentPage - 1) * ITEMS_PER_PAGE + 1)}-
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredInterviews.length)}{" "}
              dan {filteredInterviews.length}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Oldingi
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) =>
                    Math.min(Math.ceil(filteredInterviews.length / ITEMS_PER_PAGE), p + 1)
                  )
                }
                disabled={currentPage >= Math.ceil(filteredInterviews.length / ITEMS_PER_PAGE)}
              >
                Keyingi
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}