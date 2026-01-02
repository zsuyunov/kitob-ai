"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  createTeacher,
  deleteTeacher,
  getAllTeachers,
  updateTeacher,
  updateTeacherStatus,
} from "@/Admin/teacher.action";
import AdmTeacherForm from "./adm_TeacherForm";
import AdmTeacherTable from "./adm_TeacherTable";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { Teacher } from "@/Admin/teacher.action";
import type { Branch } from "@/Admin/branch.action";
import type { Class } from "@/Admin/class.action";
import type { Subject } from "@/Admin/subject.action";

const ITEMS_PER_PAGE = 20;

export default function AdmTeachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Teacher | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const searchParams = useSearchParams();
  const shouldOpenForm = searchParams.get("create") === "1";

  const loadData = async () => {
    setLoading(true);
    try {
      const teachersData = await getAllTeachers();
      setTeachers(teachersData);
    } catch (error) {
      toast.error("Ma'lumotlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (shouldOpenForm) {
      setShowForm(true);
    }
  }, [shouldOpenForm]);

  const handleCreate = async (payload: {
    firstName: string;
    lastName: string;
    gender: "male" | "female";
    status: "active" | "inactive";
    email: string;
    password: string;
  }) => {
    const result = await createTeacher(payload);
    if (result.success) {
      toast.success("O'qituvchi yaratildi");
      setShowForm(false);
      setCurrentPage(1);
      loadData();
    } else {
      toast.error(result.error || "Xatolik yuz berdi");
    }
  };

  const handleStatusChange = async (id: string, status: "active" | "inactive") => {
    const result = await updateTeacherStatus(id, status);
    if (result.success) {
      toast.success("Holat yangilandi");
      loadData();
    } else {
      toast.error(result.error || "Xatolik yuz berdi");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("O'qituvchini o'chirishni tasdiqlaysizmi?")) return;
    const result = await deleteTeacher(id);
    if (result.success) {
      toast.success("O'qituvchi o'chirildi");
      const totalPages = Math.ceil((teachers.length - 1) / ITEMS_PER_PAGE);
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      }
      loadData();
    } else {
      toast.error(result.error || "Xatolik yuz berdi");
    }
  };

  const handleEdit = async (payload: {
    firstName: string;
    lastName: string;
    gender: "male" | "female";
    status: "active" | "inactive";
    email: string;
    password: string;
  }) => {
    if (!editTarget) return;
    const result = await updateTeacher({
      id: editTarget.id,
      firstName: payload.firstName,
      lastName: payload.lastName,
      gender: payload.gender,
      status: payload.status,
      email: payload.email,
    });
    if (result.success) {
      toast.success("O'qituvchi muvaffaqiyatli yangilandi");
      setEditTarget(null);
      loadData();
    } else {
      toast.error(result.error || "Xatolik yuz berdi");
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden space-y-6">
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-primary-100 mb-2">O'qituvchilar</h1>
          <p className="text-light-100">O'qituvchilarni yaratish va boshqarish</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="size-4" />
          {showForm ? "Bekor qilish" : "Yangi o'qituvchi"}
        </Button>
      </div>

      {showForm && (
        <div className="flex-shrink-0">
          <AdmTeacherForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {editTarget && (
        <div className="flex-shrink-0">
          <AdmTeacherForm
            defaultValues={editTarget}
            onSubmit={handleEdit}
            onCancel={() => setEditTarget(null)}
          />
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-hidden">
        <AdmTeacherTable
          teachers={teachers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)}
          loading={loading}
          currentPage={currentPage}
          totalItems={teachers.length}
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

