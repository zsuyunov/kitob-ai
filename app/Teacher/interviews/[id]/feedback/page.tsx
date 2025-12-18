import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getFeedbackByInterviewId } from "@/lib/actions/general.action";
import { getInterviewById } from "@/Admin/interview.action";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { Button } from "@/components/ui/button";

const TeacherInterviewFeedback = async ({ params }: RouteParams) => {
  const { id } = await params;
  const user = await getCurrentUser();
  const interview = await getInterviewById(id);

  if (!interview) redirect("/Teacher/interviews");

  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: user?.id!,
  });

  if (!feedback) redirect(`/Teacher/interviews/${id}`);

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
    <div className="flex flex-col h-full overflow-hidden">
      <section className="section-feedback overflow-y-auto flex-1">
      <div className="flex flex-row justify-center">
        <h1 className="text-4xl font-semibold text-center">
          Suhbat natijalari
          {interview.bookName && (
            <>
              {" - "}
              <span className="capitalize">{interview.bookName}</span>
            </>
          )}
        </h1>
      </div>

      <div className="flex flex-row justify-center ">
        <div className="flex flex-row gap-5">
          <div className="flex flex-row gap-2 items-center">
            <Image src="/star.svg" width={22} height={22} alt="star" />
            <p>
              Umumiy baxo:{" "}
              <span className="text-primary-200 font-bold">
                {feedback?.totalScore}
              </span>
              /100
            </p>
          </div>

          <div className="flex flex-row gap-2">
            <Image src="/calendar.svg" width={22} height={22} alt="calendar" />
            <p>
              {feedback?.createdAt
                ? dayjs(feedback.createdAt).format("DD.MM.YYYY HH:mm")
                : "N/A"}
            </p>
          </div>
        </div>
      </div>

      <hr />

      <p>{feedback?.finalAssessment}</p>

      <div className="flex flex-col gap-4">
        <h2>Batafsil tahlil:</h2>
        {categoryScoresArray.map((category, index) => (
          <div key={index}>
            <p className="font-bold">
              {index + 1}. {category.name} ({category.score}/100)
            </p>
            <p>{category.comment}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <h3>Kuchli tomonlar</h3>
        <ul>
          {feedback?.strengths?.map((strength, index) => (
            <li key={index}>{strength}</li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <h3>Rivojlantirish kerak</h3>
        <ul>
          {feedback?.areasForImprovement?.map((area, index) => (
            <li key={index}>{area}</li>
          ))}
        </ul>
      </div>

      <div className="buttons">
        <Button className="btn-primary flex-1 max-w-xs mx-auto">
          <Link href="/Teacher/interviews" className="flex w-full justify-center">
            <p className="text-sm font-semibold text-black text-center">
              Interviewlar ro'yxatiga qaytish
            </p>
          </Link>
        </Button>
      </div>
      </section>
    </div>
  );
};

export default TeacherInterviewFeedback;

