import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getFeedbackByInterviewId } from "@/lib/actions/general.action";
import { getInterviewById } from "@/Admin/interview.action";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface RouteParams {
  params: Promise<{ id: string; studentId: string }>;
}

export default async function StudentFeedbackPage({ params }: RouteParams) {
  const { id, studentId } = await params;
  const interview = await getInterviewById(id);

  if (!interview) redirect("/Teacher/interviews");

  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: studentId,
  });

  if (!feedback) {
    return (
        <div className="p-8 text-center">
            <h2 className="text-xl font-bold text-white mb-4">Natija topilmadi</h2>
            <Link href={`/Teacher/interviews/${id}/results`}>
                <Button>Ortga qaytish</Button>
            </Link>
        </div>
    );
  }

  // Normalize categoryScores to array
  let categoryScoresArray: any[] = [];
  if (feedback?.categoryScores) {
    if (Array.isArray(feedback.categoryScores)) {
      categoryScoresArray = feedback.categoryScores;
    } else if (typeof feedback.categoryScores === 'object') {
      categoryScoresArray = Object.entries(feedback.categoryScores).map(([name, score]) => ({
        name,
        score,
        comment: ""
      }));
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden gap-6">
      <div className="flex items-center gap-4">
        <Link href={`/Teacher/interviews/${id}/results`}>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <ChevronLeft className="size-4" />
            Barcha natijalarga qaytish
          </Button>
        </Link>
      </div>

      <div className="section-feedback overflow-y-auto flex-1">
        {/* Interview Header */}
        <div className="text-center space-y-4 card-cta">
          <div className="flex flex-col gap-4 max-w-lg mx-auto">
            {interview.bookCoverImage && (
              <div className="relative w-24 h-32 mx-auto rounded-lg overflow-hidden shadow-lg">
                <Image
                  src={interview.bookCoverImage}
                  alt={interview.bookName || "Kitob muqovasi"}
                  width={96}
                  height={128}
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {interview.bookName || "Interview"}
              </h1>
              <p className="text-light-200">
                {interview.className} • {interview.teacherName}
              </p>
            </div>
          </div>
        </div>

        {/* Score Overview */}
        <div className="dark-gradient rounded-2xl p-8 border border-input text-center">
          <h2 className="text-primary-100 mb-4">Umumiy natija</h2>
          <div className="text-6xl font-bold text-white mb-2">
            {feedback.totalScore}
          </div>
          <p className="text-light-200">100 baldan</p>
        </div>

        {/* Category Scores */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-primary-100">Kategoriyalar bo'yicha ball</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {categoryScoresArray.map((category: any, index: number) => (
              <div
                key={index}
                className="dark-gradient rounded-2xl p-6 border border-input space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-white">{category.name}</h4>
                  <span className="text-2xl font-bold text-primary-200">
                    {category.score}
                  </span>
                </div>
                {category.comment && (
                  <p className="text-sm text-light-200">{category.comment}</p>
                )}
                <div className="w-full bg-dark-200 rounded-full h-2">
                  <div
                    className="progress"
                    style={{ width: `${category.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths */}
        {feedback.strengths && feedback.strengths.length > 0 && (
          <div className="dark-gradient rounded-2xl p-6 border border-input space-y-4">
            <h3 className="text-xl font-bold text-success-100">Kuchli tomonlar</h3>
            <ul className="space-y-2">
              {feedback.strengths.map((strength: string, index: number) => (
                <li key={index} className="flex gap-3 text-light-100">
                  <span className="text-success-100 font-bold">✓</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Areas for Improvement */}
        {feedback.areasForImprovement && feedback.areasForImprovement.length > 0 && (
          <div className="dark-gradient rounded-2xl p-6 border border-input space-y-4">
            <h3 className="text-xl font-bold text-yellow-400">Rivojlantirish kerak bo'lgan tomonlar</h3>
            <ul className="space-y-2">
              {feedback.areasForImprovement.map((area: string, index: number) => (
                <li key={index} className="flex gap-3 text-light-100">
                  <span className="text-yellow-400 font-bold">→</span>
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Final Assessment */}
        {feedback.finalAssessment && (
          <div className="dark-gradient rounded-2xl p-6 border border-input space-y-3">
            <h3 className="text-xl font-bold text-primary-100">Yakuniy xulosa</h3>
            <p className="text-light-100 leading-relaxed">{feedback.finalAssessment}</p>
          </div>
        )}

        {/* Footer Info */}
        <div className="text-center text-sm text-light-200">
          <p>Interview sanasi: {dayjs(feedback.createdAt).format("DD.MM.YYYY, HH:mm")}</p>
        </div>
      </div>
    </div>
  );
};
