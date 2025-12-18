"use client";

import { useEffect, useState } from "react";
import {
  createSubject,
  deleteSubject,
  getAllSubjects,
  updateSubject,
  updateSubjectStatus,
} from "@/Admin/subject.action";
import type { Subject } from "@/Admin/subject.action";
import AdmSubjectForm from "./adm_SubjectForm";
import AdmSubjectTable from "./adm_SubjectTable";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 20;

export default function AdmSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Subject | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const loadSubjects = async () => {
    setLoading(true);
    try {
      const data = await getAllSubjects();
      setSubjects(data);
    } catch (error) {
      toast.error("Fanlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  const handleCreate = async (name: string, status: "active" | "inactive") => {
    const result = await createSubject({ name, status });
    if (result.success) {
      toast.success("Fan muvaffaqiyatli yaratildi");
      setShowForm(false);
      setCurrentPage(1);
      loadSubjects();
    } else {
      toast.error(result.error || "Xatolik yuz berdi");
    }
  };

  const handleStatusChange = async (id: string, status: "active" | "inactive") => {
    const result = await updateSubjectStatus(id, status);
    if (result.success) {
      toast.success("Fan holati yangilandi");
      loadSubjects();
    } else {
      toast.error(result.error || "Xatolik yuz berdi");
    }
  };

  const handleEdit = async (name: string, status: "active" | "inactive") => {
    if (!editTarget) return;
    const result = await updateSubject({ id: editTarget.id, name, status });
    if (result.success) {
      toast.success("Fan muvaffaqiyatli yangilandi");
      setEditTarget(null);
      loadSubjects();
    } else {
      toast.error(result.error || "Xatolik yuz berdi");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Fanni o'chirishni tasdiqlaysizmi?")) return;

    const result = await deleteSubject(id);
    if (result.success) {
      toast.success("Fan muvaffaqiyatli o'chirildi");
      const totalPages = Math.ceil((subjects.length - 1) / ITEMS_PER_PAGE);
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      }
      loadSubjects();
    } else {
      toast.error(result.error || "Xatolik yuz berdi");
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden space-y-6">
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-primary-100 mb-2">Fanlar</h1>
          <p className="text-light-100">Fanlarni boshqarish</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="size-4" />
          {showForm ? "Bekor qilish" : "Yangi fan"}
        </Button>
      </div>

      {showForm && (
        <div className="flex-shrink-0">
          <AdmSubjectForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {editTarget && (
        <div className="flex-shrink-0">
          <AdmSubjectForm
            defaultValues={editTarget}
            onSubmit={handleEdit}
            onCancel={() => setEditTarget(null)}
          />
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-hidden">
        <AdmSubjectTable
          subjects={subjects.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)}
          loading={loading}
          currentPage={currentPage}
          totalItems={subjects.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
          onStatusChange={handleStatusChange}
          onEdit={setEditTarget}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}

