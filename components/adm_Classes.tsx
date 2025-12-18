"use client";

import { useState, useEffect } from "react";
import { getAllClasses, createClass, updateClass, updateClassStatus, deleteClass } from "@/Admin/class.action";
import { getAllBranches } from "@/Admin/branch.action";
import { getAcademicYears } from "@/Admin/academic-year.action";
import type { Class } from "@/Admin/class.action";
import type { Branch } from "@/Admin/branch.action";
import AdmClassForm from "./adm_ClassForm";
import AdmClassTable from "./adm_ClassTable";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 20;

export default function AdmClasses() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [academicYears, setAcademicYears] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Class | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const loadData = async () => {
    setLoading(true);
    try {
      const [classesData, branchesData, yearsData] = await Promise.all([
        getAllClasses(),
        getAllBranches(),
        getAcademicYears(),
      ]);
      setClasses(classesData);
      setBranches(branchesData);
      setAcademicYears(yearsData.map((y) => y.name));
    } catch (error) {
      toast.error("Ma'lumotlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (
    name: string,
    branchId: string,
    status: "active" | "inactive",
    academicYear: string
  ) => {
    const result = await createClass({ name, branchId, status, academicYear });
    if (result.success) {
      toast.success("Sinf muvaffaqiyatli yaratildi");
      setShowForm(false);
      setCurrentPage(1);
      loadData();
    } else {
      toast.error(result.error || "Xatolik yuz berdi");
    }
  };

  const handleStatusChange = async (id: string, status: "active" | "inactive") => {
    const result = await updateClassStatus(id, status);
    if (result.success) {
      toast.success("Sinf holati yangilandi");
      loadData();
    } else {
      toast.error(result.error || "Xatolik yuz berdi");
    }
  };

  const handleEdit = async (
    name: string,
    branchId: string,
    status: "active" | "inactive",
    academicYear: string
  ) => {
    if (!editTarget) return;
    const result = await updateClass({ id: editTarget.id, name, branchId, status, academicYear });
    if (result.success) {
      toast.success("Sinf muvaffaqiyatli yangilandi");
      setEditTarget(null);
      loadData();
    } else {
      toast.error(result.error || "Xatolik yuz berdi");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Sinfni o'chirishni tasdiqlaysizmi?")) return;

    const result = await deleteClass(id);
    if (result.success) {
      toast.success("Sinf muvaffaqiyatli o'chirildi");
      const totalPages = Math.ceil((classes.length - 1) / ITEMS_PER_PAGE);
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
          <h1 className="text-3xl font-bold text-primary-100 mb-2">Sinflar</h1>
          <p className="text-light-100">Sinflarni boshqarish</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          <Plus className="size-4" />
          {showForm ? "Bekor qilish" : "Yangi sinf"}
        </Button>
      </div>

      {showForm && (
        <div className="flex-shrink-0">
          <AdmClassForm
            branches={branches}
            academicYears={academicYears}
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {editTarget && (
        <div className="flex-shrink-0">
          <AdmClassForm
            branches={branches}
            academicYears={academicYears}
            defaultValues={editTarget}
            onSubmit={handleEdit}
            onCancel={() => setEditTarget(null)}
          />
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-hidden">
        <AdmClassTable
          classes={classes.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)}
          loading={loading}
          currentPage={currentPage}
          totalItems={classes.length}
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

