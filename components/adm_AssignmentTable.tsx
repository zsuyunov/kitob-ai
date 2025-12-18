"use client";

import { Button } from "./ui/button";
import { Trash2, Pencil } from "lucide-react";
import AdmPagination from "./adm_Pagination";
import type { Assignment } from "@/Admin/assignment.action";
import type { TeacherAssignment } from "@/Admin/teacher-assignment.action";

interface AdmAssignmentTableProps {
  assignments: Assignment[] | TeacherAssignment[];
  loading: boolean;
  type?: "student" | "teacher";
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onEdit: (assignment: Assignment | TeacherAssignment) => void;
  onDelete: (id: string) => void;
}

export default function AdmAssignmentTable({
  assignments,
  loading,
  type = "student",
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onEdit,
  onDelete,
}: AdmAssignmentTableProps) {
  if (loading) {
    return (
      <div className="dark-gradient rounded-2xl p-8 border border-input text-center">
        <p className="text-light-100">Yuklanmoqda...</p>
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="dark-gradient rounded-2xl p-8 border border-input text-center">
        <p className="text-light-100">Hozircha biriktirishlar yo'q</p>
      </div>
    );
  }

  return (
    <div className="dark-gradient rounded-2xl border border-input overflow-hidden flex flex-col h-full">
      <div className="overflow-x-auto overflow-y-auto flex-1">
        <table className={`w-full ${type === "teacher" ? "min-w-[900px]" : "min-w-[800px]"}`}>
          <thead className="bg-dark-300 border-b border-input sticky top-0 z-10">
            <tr>
              <th className="text-left px-4 md:px-6 py-3 md:py-4 text-light-100 font-semibold whitespace-nowrap">
                {type === "teacher" ? "O'qituvchi" : "Talaba"}
              </th>
              <th className="text-left px-4 md:px-6 py-3 md:py-4 text-light-100 font-semibold whitespace-nowrap">Filial</th>
              <th className="text-left px-4 md:px-6 py-3 md:py-4 text-light-100 font-semibold whitespace-nowrap">Sinf</th>
              {type === "teacher" && (
                <th className="text-left px-4 md:px-6 py-3 md:py-4 text-light-100 font-semibold whitespace-nowrap">Fan</th>
              )}
              <th className="text-left px-4 md:px-6 py-3 md:py-4 text-light-100 font-semibold whitespace-nowrap">O'quv yili</th>
              <th className="text-right px-4 md:px-6 py-3 md:py-4 text-light-100 font-semibold whitespace-nowrap">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((item) => {
              const name = type === "teacher" 
                ? (item as TeacherAssignment).teacherName 
                : (item as Assignment).studentName;
              return (
                <tr key={item.id} className="border-b border-input hover:bg-dark-300/50 transition-colors">
                  <td className="px-4 md:px-6 py-3 md:py-4 text-light-100 break-words max-w-xs">
                    {name}
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-light-100 break-words max-w-xs">
                    {item.branchName}
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-light-100 break-words max-w-xs">
                    {item.className}
                  </td>
                  {type === "teacher" && (
                    <td className="px-4 md:px-6 py-3 md:py-4 text-light-100 break-words max-w-xs">
                      {(item as TeacherAssignment).subjectName}
                    </td>
                  )}
                  <td className="px-4 md:px-6 py-3 md:py-4 text-light-100 whitespace-nowrap">
                    {item.academicYear}
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-right whitespace-nowrap">
                    <div className="flex gap-2 justify-end">
                      <Button onClick={() => onEdit(item)} variant="secondary" size="sm" aria-label="Tahrirlash">
                        <Pencil className="size-4" />
                      </Button>
                      <Button onClick={() => onDelete(item.id)} variant="destructive" size="sm">
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <AdmPagination
        currentPage={currentPage}
        totalPages={Math.ceil(totalItems / itemsPerPage)}
        onPageChange={onPageChange}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
      />
    </div>
  );
}

