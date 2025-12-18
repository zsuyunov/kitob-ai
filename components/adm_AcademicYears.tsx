"use client";

import { useEffect, useState } from "react";
import {
  createAcademicYear,
  deleteAcademicYear,
  getAcademicYears,
  updateAcademicYear,
  type AcademicYear,
  type Semester,
} from "@/Admin/academic-year.action";
import AdmAcademicYearForm from "./adm_AcademicYearForm";
import AdmAcademicYearTable from "./adm_AcademicYearTable";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 20;

export default function AdmAcademicYears() {
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<AcademicYear | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getAcademicYears();
      setYears(data);
    } catch (error) {
      toast.error("Ma'lumotlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (payload: {
    name: string;
    startDate: string;
    endDate: string;
    semesters: Semester[];
  }) => {
    const result = await createAcademicYear(payload);
    if (result.success) {
      toast.success("O'quv yili yaratildi (faol holatda)");
      setShowForm(false);
      setCurrentPage(1);
      loadData();
    } else {
      toast.error(result.error || "Xatolik yuz berdi");
    }
  };

  const handleUpdate = async (payload: {
    name: string;
    startDate: string;
    endDate: string;
    semesters: Semester[];
  }) => {
    if (!editTarget) return;
    const result = await updateAcademicYear(editTarget.id, {
      ...payload,
      status: editTarget.status,
    });
    if (result.success) {
      toast.success("O'quv yili yangilandi");
      setEditTarget(null);
      loadData();
    } else {
      toast.error(result.error || "Xatolik yuz berdi");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("O'quv yilini o'chirishni tasdiqlaysizmi?")) return;
    const result = await deleteAcademicYear(id);
    if (result.success) {
      toast.success("O'quv yili o'chirildi");
      const totalPages = Math.ceil((years.length - 1) / ITEMS_PER_PAGE);
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      }
      loadData();
    } else {
      toast.error(result.error || "Xatolik yuz berdi");
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden space-y-6">
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-primary-100 mb-2">O'quv yillari</h1>
          <p className="text-light-100">Faol yil faqat eng oxirgi yaratilgan bo'ladi</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="size-4" />
          {showForm ? "Bekor qilish" : "Yangi o'quv yili"}
        </Button>
      </div>

      {showForm && (
        <div className="flex-shrink-0">
          <AdmAcademicYearForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {editTarget && (
        <div className="flex-shrink-0">
          <AdmAcademicYearForm
            defaultValues={{
              name: editTarget.name,
              startDate: editTarget.startDate,
              endDate: editTarget.endDate,
              semesters: editTarget.semesters,
            }}
            onSubmit={handleUpdate}
            onCancel={() => setEditTarget(null)}
          />
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-hidden">
        <AdmAcademicYearTable
          years={years.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)}
          loading={loading}
          currentPage={currentPage}
          totalItems={years.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
          onEdit={setEditTarget}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}

