import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import InterviewCard from "@/components/InterviewCard";
import TeacherInterviewCard from "@/components/TeacherInterviewCard";

import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getInterviewsByUserId,
  getLatestInterviews,
  getUserFeedbacks,
} from "@/lib/actions/general.action";
import { getAvailableInterviewsForStudent } from "@/Admin/interview.action";

async function StudentHome() {
  const user = await getCurrentUser();

  const [userInterviews, allInterview, teacherInterviews, userFeedbacks] = await Promise.all([
    getInterviewsByUserId(user?.id),
    getLatestInterviews({ userId: user?.id }),
    getAvailableInterviewsForStudent(user?.id || ""),
    user?.id ? getUserFeedbacks(user.id) : [],
  ]);

  const hasPastInterviews = userInterviews?.length! > 0;
  const hasUpcomingInterviews = allInterview?.length! > 0;
  const hasTeacherInterviews = teacherInterviews?.length > 0;
  
  // Set of interview IDs that user has completed (has feedback)
  const completedInterviewIds = new Set(userFeedbacks.map(f => f.interviewId));

  return (
    <>
      <section className="card-cta relative overflow-hidden">
        <div className="flex flex-col gap-6 max-w-lg z-10">
          <h2>Kitoblar bo'yicha sun'iy intellekt bilan suhbatlashing</h2>
          <p className="text-lg">
            O'qigan kitoblaringizni mustahkamlang va yangi bilimlarni sinab ko'ring
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
              alt="robo-dude"
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

        {/* Decorative gradient orbs */}
        <div className="absolute top-1/2 left-10 w-32 h-32 bg-primary-200/5 rounded-full blur-2xl animate-pulse max-sm:hidden"></div>
        <div className="absolute top-1/2 right-10 w-32 h-32 bg-success-100/5 rounded-full blur-2xl animate-pulse max-sm:hidden" style={{ animationDelay: '1s' }}></div>
      </section>

      {/* Teacher-assigned Interviews */}
      {hasTeacherInterviews && (
        <section className="flex flex-col gap-6 mt-8">
          <div>
            <h2 className="text-primary-100">O'qituvchi tomonidan tayinlangan interviewlar</h2>
            <p className="text-light-200 mt-2">
              Sizning sinfingiz uchun tayinlangan kitob bo'yicha interviewlar
            </p>
          </div>

          <div className="interviews-section">
            {teacherInterviews?.map((interview) => (
              <TeacherInterviewCard
                key={interview.id}
                interview={interview}
                userId={user?.id}
                isCompleted={completedInterviewIds.has(interview.id)}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

export default StudentHome;


