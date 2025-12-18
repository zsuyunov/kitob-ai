"use client";

import { Button } from "./ui/button";
import { Trash2, Pencil } from "lucide-react";
import AdmPagination from "./adm_Pagination";
import type { Class } from "@/Admin/class.action";

interface AdmClassTableProps {
  classes: Class[];
  loading: boolean;
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onStatusChange: (id: string, status: "active" | "inactive") => void;
  onEdit: (classItem: Class) => void;
  onDelete: (id: string) => void;
}

export default function AdmClassTable({
  classes,
  loading,
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onStatusChange,
  onEdit,
  onDelete,
}: AdmClassTableProps) {
  if (loading) {
    return (
      <div className="dark-gradient rounded-2xl p-8 border border-input text-center">
        <p className="text-light-100">Yuklanmoqda...</p>
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="dark-gradient rounded-2xl p-8 border border-input text-center">
        <p className="text-light-100">Hozircha sinflar mavjud emas</p>
      </div>
    );
  }

  return (
    <div className="dark-gradient rounded-2xl border border-input overflow-hidden flex flex-col h-full">
      <div className="overflow-x-auto overflow-y-auto flex-1">
        <table className="w-full min-w-[800px]">
          <thead className="bg-dark-300 border-b border-input sticky top-0 z-10">
            <tr>
              <th className="text-left px-4 md:px-6 py-3 md:py-4 text-light-100 font-semibold whitespace-nowrap">
                Sinf nomi
              </th>
              <th className="text-left px-4 md:px-6 py-3 md:py-4 text-light-100 font-semibold whitespace-nowrap">
                Filial
              </th>
              <th className="text-left px-4 md:px-6 py-3 md:py-4 text-light-100 font-semibold whitespace-nowrap">
                O'quv yili
              </th>
              <th className="text-left px-4 md:px-6 py-3 md:py-4 text-light-100 font-semibold whitespace-nowrap">
                Holat
              </th>
              <th className="text-left px-4 md:px-6 py-3 md:py-4 text-light-100 font-semibold whitespace-nowrap">
                Yaratilgan sana
              </th>
              <th className="text-right px-4 md:px-6 py-3 md:py-4 text-light-100 font-semibold whitespace-nowrap">
                Amallar
              </th>
            </tr>
          </thead>
          <tbody>
            {classes.map((classItem) => (
              <tr
                key={classItem.id}
                className="border-b border-input hover:bg-dark-300/50 transition-colors"
              >
                <td className="px-4 md:px-6 py-3 md:py-4 text-light-100 break-words max-w-xs">
                  {classItem.name}
                </td>
                <td className="px-4 md:px-6 py-3 md:py-4 text-light-100 break-words max-w-xs">
                  {classItem.branchName || "Noma'lum"}
                </td>
                <td className="px-4 md:px-6 py-3 md:py-4 text-light-100 whitespace-nowrap">
                  {classItem.academicYear}
                </td>
                <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                  <select
                    value={classItem.status}
                    onChange={(e) =>
                      onStatusChange(
                        classItem.id,
                        e.target.value as "active" | "inactive"
                      )
                    }
                    className="bg-dark-200 text-light-100 rounded-full px-3 md:px-4 py-1.5 border border-input focus:outline-none focus:ring-2 focus:ring-primary-200 text-sm w-full max-w-[120px]"
                  >
                    <option value="active">Faol</option>
                    <option value="inactive">Nofaol</option>
                  </select>
                </td>
                <td className="px-4 md:px-6 py-3 md:py-4 text-light-400 text-sm whitespace-nowrap">
                  {new Date(classItem.createdAt).toLocaleDateString("uz-UZ")}
                </td>
                <td className="px-4 md:px-6 py-3 md:py-4 text-right whitespace-nowrap">
                  <div className="flex gap-2 justify-end">
                    <Button
                      onClick={() => onEdit(classItem)}
                      variant="secondary"
                      size="sm"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      onClick={() => onDelete(classItem.id)}
                      variant="destructive"
                      size="sm"
                    >
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

