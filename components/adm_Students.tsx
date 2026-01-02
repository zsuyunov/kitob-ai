"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  createStudent,
  deleteStudent,
  getAllStudents,
  updateStudent,
  updateStudentStatus,
} from "@/Admin/student.action";
import AdmStudentForm from "./adm_StudentForm";
import AdmStudentTable from "./adm_StudentTable";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { Student } from "@/Admin/student.action";
import type { Branch } from "@/Admin/branch.action";
import type { Class } from "@/Admin/class.action";

const ITEMS_PER_PAGE = 20;

export default function AdmStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Student | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const searchParams = useSearchParams();
  const shouldOpenForm = searchParams.get("create") === "1";

  const loadData = async () => {
    setLoading(true);
    try {
      const studentsData = await getAllStudents();
      setStudents(studentsData);
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
    const result = await createStudent(payload);
    if (result.success) {
      toast.success("Talaba muvaffaqiyatli yaratildi");
      setShowForm(false);
      setCurrentPage(1);
      loadData();
    } else {
      toast.error(result.error || "Xatolik yuz berdi");
    }
  };

  const handleStatusChange = async (id: string, status: "active" | "inactive") => {
    const result = await updateStudentStatus(id, status);
    if (result.success) {
      toast.success("Talaba holati yangilandi");
      loadData();
    } else {
      toast.error(result.error || "Xatolik yuz berdi");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Talabani o'chirishni tasdiqlaysizmi?")) return;
    const result = await deleteStudent(id);
    if (result.success) {
      toast.success("Talaba o'chirildi");
      const totalPages = Math.ceil((students.length - 1) / ITEMS_PER_PAGE);
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
    const result = await updateStudent({
      id: editTarget.id,
      firstName: payload.firstName,
      lastName: payload.lastName,
      gender: payload.gender,
      status: payload.status,
      email: payload.email,
    });
    if (result.success) {
      toast.success("Talaba muvaffaqiyatli yangilandi");
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
          <h1 className="text-3xl font-bold text-primary-100 mb-2">Talabalar</h1>
          <p className="text-light-100">Talabalarni yaratish va boshqarish</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="size-4" />
          {showForm ? "Bekor qilish" : "Yangi talaba"}
        </Button>
      </div>

      {showForm && (
        <div className="flex-shrink-0">
          <AdmStudentForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {editTarget && (
        <div className="flex-shrink-0">
          <AdmStudentForm
            defaultValues={editTarget}
            onSubmit={handleEdit}
            onCancel={() => setEditTarget(null)}
          />
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-hidden">
        <AdmStudentTable
          students={students.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)}
          loading={loading}
          currentPage={currentPage}
          totalItems={students.length}
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

