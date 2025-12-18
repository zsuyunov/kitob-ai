"use client";

import { Button } from "./ui/button";
import { Trash2, Pencil } from "lucide-react";
import AdmPagination from "./adm_Pagination";
import type { EmployeeType } from "@/Admin/employee-type.action";

interface AdmEmployeeTypeTableProps {
  types: EmployeeType[];
  loading: boolean;
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onEdit: (type: EmployeeType) => void;
  onDelete: (id: string) => void;
}

export default function AdmEmployeeTypeTable({
  types,
  loading,
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onEdit,
  onDelete,
}: AdmEmployeeTypeTableProps) {
  if (loading) {
    return (
      <div className="dark-gradient rounded-2xl p-8 border border-input text-center">
        <p className="text-light-100">Yuklanmoqda...</p>
      </div>
    );
  }

  if (types.length === 0) {
    return (
      <div className="dark-gradient rounded-2xl p-8 border border-input text-center">
        <p className="text-light-100">Hozircha lavozimlar yo'q</p>
      </div>
    );
  }

  return (
    <div className="dark-gradient rounded-2xl border border-input overflow-hidden flex flex-col h-full">
      <div className="overflow-x-auto overflow-y-auto flex-1">
        <table className="w-full min-w-[500px]">
          <thead className="bg-dark-300 border-b border-input sticky top-0 z-10">
            <tr>
              <th className="text-left px-4 md:px-6 py-3 md:py-4 text-light-100 font-semibold whitespace-nowrap">Lavozim nomi</th>
              <th className="text-left px-4 md:px-6 py-3 md:py-4 text-light-100 font-semibold whitespace-nowrap">Holat</th>
              <th className="text-right px-4 md:px-6 py-3 md:py-4 text-light-100 font-semibold whitespace-nowrap">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {types.map((type) => (
              <tr key={type.id} className="border-b border-input hover:bg-dark-300/50 transition-colors">
                <td className="px-4 md:px-6 py-3 md:py-4 text-light-100 font-semibold break-words max-w-xs">
                  {type.name}
                </td>
                <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      type.status === "active" ? "bg-green-500/20 text-green-200" : "bg-zinc-700 text-zinc-200"
                    }`}
                  >
                    {type.status === "active" ? "Faol" : "Nofaol"}
                  </span>
                </td>
                <td className="px-4 md:px-6 py-3 md:py-4 text-right whitespace-nowrap">
                  <div className="flex gap-2 justify-end">
                    <Button onClick={() => onEdit(type)} variant="secondary" size="sm" aria-label="Tahrirlash">
                      <Pencil className="size-4" />
                    </Button>
                    <Button onClick={() => onDelete(type.id)} variant="destructive" size="sm">
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

