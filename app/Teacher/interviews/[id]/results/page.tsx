import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getInterviewById } from "@/Admin/interview.action";
import { getFeedbacksForInterview } from "@/lib/actions/general.action";
import { redirect } from "next/navigation";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export default async function InterviewResultsPage({ params }: RouteParams) {
  const { id } = await params;
  const interview = await getInterviewById(id);
  
  if (!interview) redirect("/Teacher/interviews");

  const feedbacks = await getFeedbacksForInterview(id);

  return (
    <div className="flex flex-col h-full overflow-hidden gap-6">
      <div className="flex items-center gap-4">
        <Link href="/Teacher/interviews">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <ChevronLeft className="size-4" />
            Interviewlarga qaytish
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-primary-100">{interview.bookName} - Natijalar</h1>
        <p className="text-light-200">
             {interview.branchName} • {interview.className} • {interview.questions.length} ta savol
        </p>
      </div>

      <div className="dark-gradient rounded-2xl border border-input overflow-hidden flex-1 min-h-0 flex flex-col">
        <div className="h-full overflow-y-auto">
             {feedbacks.length === 0 ? (
                 <div className="p-8 text-center text-light-200">Hozircha natijalar mavjud emas</div>
             ) : (
                <table className="w-full text-left">
                  <thead className="sticky top-0 bg-dark-200 border-b border-input text-light-100 font-semibold">
                    <tr>
                      <th className="p-4">O'quvchi</th>
                      <th className="p-4">Baho</th>
                      <th className="p-4">Vaqt</th>
                      <th className="p-4 text-right">Amallar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedbacks.map((fb) => (
                      <tr key={fb.id} className="border-b border-input hover:bg-dark-200/50 transition-colors">
                        <td className="p-4 text-light-100 font-medium">{fb.studentName || "Noma'lum"}</td>
                        <td className="p-4">
                           <span className={`px-2 py-1 rounded text-xs font-bold ${
                               fb.totalScore >= 80 ? "bg-green-500/20 text-green-400" :
                               fb.totalScore >= 60 ? "bg-yellow-500/20 text-yellow-400" :
                               "bg-red-500/20 text-red-400"
                           }`}>
                               {fb.totalScore}/100
                           </span>
                        </td>
                        <td className="p-4 text-light-200 text-sm">
                            {new Date(fb.createdAt).toLocaleString("uz-UZ")}
                        </td>
                        <td className="p-4 text-right">
                          <Link href={`/Teacher/interviews/${id}/results/${fb.userId}`}>
                            <Button size="sm" variant="outline">
                              Batafsil ko'rish
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             )}
        </div>
      </div>
    </div>
  );
}
