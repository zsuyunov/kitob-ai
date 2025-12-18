"use client";

import { useEffect, useState } from "react";
import { getAvailableInterviews } from "@/Admin/interview.action";
import { getFeedbackByInterviewId, getFeedbacksForInterview } from "@/lib/actions/general.action";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getAllBranches } from "@/Admin/branch.action";
import { getAllClasses } from "@/Admin/class.action";
import type { Interview } from "@/Admin/interview.action";
import type { Branch } from "@/Admin/branch.action";
import type { Class } from "@/Admin/class.action";
import Image from "next/image";
import InterviewTimer from "./adm_InterviewTimer";
import { Button } from "./ui/button";

export default function TeacherInterviewList() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");
  const [feedbackMap, setFeedbackMap] = useState<Record<string, boolean>>({});
  const [branches, setBranches] = useState<Branch[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<"" | "day" | "week" | "month" | "year">("");
  
  // Teacher mode states
  const [isTeacher, setIsTeacher] = useState(false);
  const [userBranchId, setUserBranchId] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const user = await getCurrentUser();
      if (user?.id) setUserId(user.id);
      
      const isTeacherRole = user?.role === "teacher";
      setIsTeacher(isTeacherRole);
      
      if (isTeacherRole && user?.branchId) {
          setUserBranchId(user.branchId);
          setSelectedBranch(user.branchId); // Auto-filter by branch
      }
      
      const [availableInterviews, branchesData, classesData] = await Promise.all([
        getAvailableInterviews(),
        getAllBranches(),
        getAllClasses(),
      ]);
      setInterviews(availableInterviews);
      setBranches(branchesData);
      setClasses(classesData);

      // Feedback status per interview
      if (user?.id) {
        const statuses = await Promise.all(
          availableInterviews.map(async (interview) => {
            if (isTeacherRole) {
                // For teacher, check if ANY feedbacks exist for this interview
                const feedbacks = await getFeedbacksForInterview(interview.id);
                return { id: interview.id, hasFeedback: feedbacks.length > 0 };
            } else {
                // For student, check if THEY have completed it
                const fb = await getFeedbackByInterviewId({
                  interviewId: interview.id,
                  userId: user.id!,
                });
                return { id: interview.id, hasFeedback: !!fb };
            }
          })
        );
        const map: Record<string, boolean> = {};
        statuses.forEach(({ id, hasFeedback }) => {
          map[id] = hasFeedback;
        });
        setFeedbackMap(map);
      }
    } catch (error) {
      console.error("Error loading interviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const branchClasses = selectedBranch
    ? classes.filter((cls) => cls.branchId === selectedBranch)
    : classes;

  const filteredInterviews = interviews.filter((interview) => {
    if (selectedBranch && interview.branchId !== selectedBranch) return false;
    if (selectedClass && interview.classId !== selectedClass) return false;

    if (selectedPeriod) {
      const now = new Date();
      const from = new Date(interview.availableFrom);
      const diffMs = now.getTime() - from.getTime();
      const oneDay = 1000 * 60 * 60 * 24;
      if (selectedPeriod === "day" && diffMs > oneDay) return false;
      if (selectedPeriod === "week" && diffMs > oneDay * 7) return false;
      if (selectedPeriod === "month" && diffMs > oneDay * 30) return false;
      // "year" -> no limit (butun o'quv yili)
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full overflow-hidden space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-primary-100 mb-2">Mening interviewlarim</h1>
          <p className="text-light-100">Mavjud interviewlar ro'yxati</p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            if (!isTeacher) setSelectedBranch("");
            setSelectedClass("");
            setSelectedPeriod("");
          }}
        >
          Filtrlarni tozalash
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        {!isTeacher && (
        <div className="min-w-[200px]">
          <label className="text-sm text-light-200 block mb-1">Filial</label>
          <select
            value={selectedBranch}
            onChange={(e) => {
              setSelectedBranch(e.target.value);
              setSelectedClass("");
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
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full bg-dark-200 text-light-100 rounded-full min-h-10 px-4 border border-input focus:outline-none focus:ring-2 focus:ring-primary-200"
            disabled={branchClasses.length === 0 && !!selectedBranch}
          >
            <option value="">Barcha sinflar</option>
            {(selectedBranch ? branchClasses : classes).map((cls) => (
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
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
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

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-light-200">Yuklanmoqda...</div>
        ) : filteredInterviews.length === 0 ? (
          <div className="p-8 text-center text-light-200">
            Hozircha mavjud interviewlar yo'q
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredInterviews.map((interview) => (
              <div key={interview.id} className="card-border w-full">
                <div className="card-interview relative overflow-hidden p-5 gap-3 min-h-0">
                  {/* Top badges */}
                  <div className="flex items-start justify-between">
                    <div className="bg-primary-200/15 text-primary-100 text-xs font-semibold px-3 py-1.5 rounded-full border border-primary-200/30">
                      {interview.questions.length} ta savol
                    </div>
                    {interview.bookCoverImage ? (
                      <Image
                        src={interview.bookCoverImage}
                        alt="Kitob muqovasi"
                        width={60}
                        height={80}
                        className="rounded-lg border border-input object-cover"
                      />
                    ) : (
                      <div className="w-[60px] h-[80px] rounded-lg border border-input bg-dark-200 flex items-center justify-center text-[10px] text-light-300">
                        Rasm yo'q
                      </div>
                    )}
                  </div>

                  {/* Book name */}
                  <h3 className="text-xl font-bold text-primary-100 text-center mt-4 line-clamp-2">
                    {interview.bookName || "Kitob nomi"}
                  </h3>

                  {/* Timer */}
                  <div className="mt-2">
                    <InterviewTimer
                      availableFrom={interview.availableFrom}
                      availableUntil={interview.availableUntil}
                    />
                  </div>

                  {/* Meta info */}
                  <div className="flex flex-wrap items-center gap-2 mt-3 text-sm text-light-200">
                    {!isTeacher && (
                    <div className="bg-dark-200 rounded-lg px-3 py-2 border border-input flex-1 min-w-[140px]">
                      <span className="text-xs text-light-300">Filial</span>
                      <p className="font-semibold text-light-100 line-clamp-1 text-sm">{interview.branchName}</p>
                    </div>
                    )}
                    <div className="bg-dark-200 rounded-lg px-3 py-2 border border-input flex-1 min-w-[120px]">
                      <span className="text-xs text-light-300">Sinf</span>
                      <p className="font-semibold text-light-100 line-clamp-1 text-sm">{interview.className}</p>
                    </div>
                  </div>
                  {!isTeacher && (
                  <div className="bg-dark-200 rounded-lg px-3 py-2 border border-input text-sm text-light-200 mt-2">
                    <span className="text-xs text-light-300">O'qituvchi</span>
                    <p className="font-semibold text-light-100 line-clamp-1 text-sm">{interview.teacherName}</p>
                  </div>
                  )}

                  {/* Action */}
                  <div className="flex justify-center mt-3">
                    {(() => {
                      const hasFeedback = feedbackMap[interview.id];
                      
                      // For Teacher: Only show "Natijalarni ko'rish" if feedback exists. NO "Start Interview".
                      if (isTeacher) {
                          if (hasFeedback) {
                              return (
                                <a
                                  href={`/Teacher/interviews/${interview.id}/results`}
                                  className="btn-primary text-center py-2.5 px-6 rounded-full text-sm"
                                >
                                  Natijalarni ko'rish
                                </a>
                              );
                          } else {
                              // If no feedback, show nothing (or maybe "Hali natijalar yo'q" text)
                              return (
                                  <span className="text-sm text-light-300 italic">
                                      Hali natijalar yo'q
                                  </span>
                              );
                          }
                      }

                      // For Student: Keep existing logic
                      const actionLabel = hasFeedback ? "Natijani ko'rish" : "Suhbatni boshlash";
                      const actionHref = hasFeedback
                        ? `/Teacher/interviews/${interview.id}/feedback`
                        : `/Teacher/interviews/${interview.id}`;

                      return (
                        <a
                          href={actionHref}
                          className="btn-primary text-center py-2.5 px-6 rounded-full text-sm"
                        >
                          {actionLabel}
                        </a>
                      );
                    })()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
