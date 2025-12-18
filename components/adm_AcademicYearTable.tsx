"use client";

import { Button } from "./ui/button";
import { Trash2, Pencil } from "lucide-react";
import AdmPagination from "./adm_Pagination";
import type { AcademicYear } from "@/Admin/academic-year.action";

interface AdmAcademicYearTableProps {
  years: AcademicYear[];
  loading: boolean;
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onEdit: (year: AcademicYear) => void;
  onDelete: (id: string) => void;
}

export default function AdmAcademicYearTable({
  years,
  loading,
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onEdit,
  onDelete,
}: AdmAcademicYearTableProps) {
  if (loading) {
    return (
      <div className="dark-gradient rounded-2xl p-8 border border-input text-center">
        <p className="text-light-100">Yuklanmoqda...</p>
      </div>
    );
  }

  if (years.length === 0) {
    return (
      <div className="dark-gradient rounded-2xl p-8 border border-input text-center">
        <p className="text-light-100">Hozircha o'quv yillari yo'q</p>
      </div>
    );
  }

  return (
    <div className="dark-gradient rounded-2xl border border-input overflow-hidden flex flex-col h-full">
      <div className="overflow-x-auto overflow-y-auto flex-1">
        <table className="w-full min-w-[900px]">
          <thead className="bg-dark-300 border-b border-input sticky top-0 z-10">
            <tr>
              <th className="text-left px-4 md:px-6 py-3 md:py-4 text-light-100 font-semibold whitespace-nowrap">O'quv yili</th>
              <th className="text-left px-4 md:px-6 py-3 md:py-4 text-light-100 font-semibold whitespace-nowrap">Boshlanish</th>
              <th className="text-left px-4 md:px-6 py-3 md:py-4 text-light-100 font-semibold whitespace-nowrap">Tugash</th>
              <th className="text-left px-4 md:px-6 py-3 md:py-4 text-light-100 font-semibold whitespace-nowrap">Semestrlar</th>
              <th className="text-left px-4 md:px-6 py-3 md:py-4 text-light-100 font-semibold whitespace-nowrap">Holat</th>
              <th className="text-right px-4 md:px-6 py-3 md:py-4 text-light-100 font-semibold whitespace-nowrap">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {years.map((year) => (
              <tr key={year.id} className="border-b border-input hover:bg-dark-300/50 transition-colors">
                <td className="px-4 md:px-6 py-3 md:py-4 text-light-100 font-semibold break-words max-w-xs">
                  {year.name}
                </td>
                <td className="px-4 md:px-6 py-3 md:py-4 text-light-100 whitespace-nowrap">
                  {year.startDate}
                </td>
                <td className="px-4 md:px-6 py-3 md:py-4 text-light-100 whitespace-nowrap">
                  {year.endDate}
                </td>
                <td className="px-4 md:px-6 py-3 md:py-4 text-light-100">
                  <div className="space-y-1 text-sm max-w-md">
                    {year.semesters.map((s, idx) => (
                      <div key={s.id} className="break-words">
                        {idx + 1}. {s.name} ({s.startDate} - {s.endDate})
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      year.status === "active" ? "bg-green-500/20 text-green-200" : "bg-zinc-700 text-zinc-200"
                    }`}
                  >
                    {year.status === "active" ? "Faol" : "Nofaol"}
                  </span>
                </td>
                <td className="px-4 md:px-6 py-3 md:py-4 text-right whitespace-nowrap">
                  <div className="flex gap-2 justify-end">
                    <Button onClick={() => onEdit(year)} variant="secondary" size="sm" aria-label="Tahrirlash">
                      <Pencil className="size-4" />
                    </Button>
                    <Button onClick={() => onDelete(year.id)} variant="destructive" size="sm">
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
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

