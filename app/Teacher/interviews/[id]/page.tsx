import { redirect } from "next/navigation";
import AgentWrapper from "@/components/AgentWrapper";
import { getInterviewById } from "@/Admin/interview.action";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getFeedbackByInterviewId } from "@/lib/actions/general.action";

const TeacherInterviewRoom = async ({ params }: RouteParams) => {
  const { id } = await params;

  const user = await getCurrentUser();
  const interview = await getInterviewById(id);
  if (!interview) redirect("/Teacher/interviews");

  // If feedback already exists, send user to feedback page
  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: user?.id!,
  });
  if (feedback) redirect(`/Teacher/interviews/${id}/feedback`);

  const questions = interview.questions.map((q) => q.question);
  const answers = interview.questions.map((q) => q.answer);

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center space-y-1">
        <h1 className="text-3xl font-bold text-primary-100">{interview.bookName || "Interview"}</h1>
        <p className="text-light-200">{interview.className} • {interview.branchName} • {interview.teacherName}</p>
      </div>

      <AgentWrapper
        userName={user?.name || "Foydalanuvchi"}
        userId={user?.id}
        interviewId={id}
        type="admin-interview"
        questions={questions}
        answers={answers}
        bookName={interview.bookName || "Kitob"}
      />
    </div>
  );
};

export default TeacherInterviewRoom;

