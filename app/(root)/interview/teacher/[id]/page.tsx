import Image from "next/image";
import { redirect } from "next/navigation";
import AgentWrapper from "@/components/AgentWrapper";
import { getInterviewById } from "@/Admin/interview.action";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getFeedbackByInterviewId } from "@/lib/actions/general.action";
import { getStudentByUserId } from "@/Admin/student.action";

const StudentTeacherInterviewRoom = async ({ params }: RouteParams) => {
  const { id } = await params;

  const user = await getCurrentUser();
  const interview = await getInterviewById(id);
  
  if (!interview) redirect("/Student");

  // Get student info including gender
  const student = user?.id ? await getStudentByUserId(user.id) : null;

  // Check if feedback already exists
  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: user?.id!,
  });
  
  if (feedback) redirect(`/interview/teacher/${id}/feedback`);

  // Check if interview is available (within date range)
  const now = new Date();
  const availableFrom = new Date(interview.availableFrom);
  const availableUntil = new Date(interview.availableUntil);
  
  if (now < availableFrom || now > availableUntil) {
    redirect("/Student");
  }

  const questions = interview.questions.map((q) => q.question);
  const answers = interview.questions.map((q) => q.answer);

  return (
    <div className="flex flex-col gap-6">
      {/* Interview Header */}
      <div className="text-center space-y-3 card-cta">
        <div className="flex flex-col gap-4 max-w-2xl mx-auto">
          {interview.bookCoverImage && (
            <div className="relative w-24 h-32 mx-auto rounded-lg overflow-hidden shadow-lg">
              <Image
                src={interview.bookCoverImage}
                alt={interview.bookName || "Kitob muqovasi"}
                fill
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
            <p className="text-sm text-light-100 mt-2">
              {interview.questions.length} ta savol
            </p>
          </div>
        </div>
      </div>

      {/* Interview Agent */}
      <AgentWrapper
        userName={user?.name || "Talaba"}
        userId={user?.id}
        gender={student?.gender}
        interviewId={id}
        type="admin-interview"
        questions={questions}
        answers={answers}
        bookName={interview.bookName || "Kitob"}
      />
    </div>
  );
};

export default StudentTeacherInterviewRoom;

