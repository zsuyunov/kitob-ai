"use client";

import { useEffect, useState } from "react";
import {
  createEmployeeType,
  deleteEmployeeType,
  getEmployeeTypes,
  updateEmployeeType,
  type EmployeeType,
} from "@/Admin/employee-type.action";
import AdmEmployeeTypeForm from "./adm_EmployeeTypeForm";
import AdmEmployeeTypeTable from "./adm_EmployeeTypeTable";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 20;

export default function AdmEmployeeTypes() {
  const [types, setTypes] = useState<EmployeeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<EmployeeType | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getEmployeeTypes();
      setTypes(data);
    } catch (error) {
      toast.error("Ma'lumotlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (payload: { name: string; status: "active" | "inactive" }) => {
    const result = await createEmployeeType(payload);
    if (result.success) {
      toast.success("Lavozim yaratildi");
      setShowForm(false);
      setCurrentPage(1);
      loadData();
    } else {
      toast.error(result.error || "Xatolik yuz berdi");
    }
  };

  const handleUpdate = async (payload: { name: string; status: "active" | "inactive" }) => {
    if (!editTarget) return;
    const result = await updateEmployeeType(editTarget.id, payload);
    if (result.success) {
      toast.success("Lavozim yangilandi");
      setEditTarget(null);
      loadData();
    } else {
      toast.error(result.error || "Xatolik yuz berdi");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Lavozimni o'chirishni tasdiqlaysizmi?")) return;
    const result = await deleteEmployeeType(id);
    if (result.success) {
      toast.success("Lavozim o'chirildi");
      const totalPages = Math.ceil((types.length - 1) / ITEMS_PER_PAGE);
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
          <h1 className="text-3xl font-bold text-primary-100 mb-2">Xodim turlari</h1>
          <p className="text-light-100">Lavozimlar ro'yxati va holati</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="size-4" />
          {showForm ? "Bekor qilish" : "Yangi lavozim"}
        </Button>
      </div>

      {showForm && (
        <div className="flex-shrink-0">
          <AdmEmployeeTypeForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {editTarget && (
        <div className="flex-shrink-0">
          <AdmEmployeeTypeForm
            defaultValues={{ name: editTarget.name, status: editTarget.status }}
            onSubmit={handleUpdate}
            onCancel={() => setEditTarget(null)}
          />
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-hidden">
        <AdmEmployeeTypeTable
          types={types.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)}
          loading={loading}
          currentPage={currentPage}
          totalItems={types.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
          onEdit={setEditTarget}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}

