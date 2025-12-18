"use client";

import { useState, useEffect } from "react";
import { getAllBranches, createBranch, updateBranch, updateBranchStatus, deleteBranch } from "@/Admin/branch.action";
import type { Branch } from "@/Admin/branch.action";
import AdmBranchForm from "./adm_BranchForm";
import AdmBranchTable from "./adm_BranchTable";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 20;

export default function AdmBranches() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Branch | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const loadBranches = async () => {
    setLoading(true);
    try {
      const data = await getAllBranches();
      setBranches(data);
    } catch (error) {
      toast.error("Filiallarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  const handleCreate = async (name: string, status: "active" | "inactive") => {
    const result = await createBranch({ name, status });
    if (result.success) {
      toast.success("Filial muvaffaqiyatli yaratildi");
      setShowForm(false);
      setCurrentPage(1);
      loadBranches();
    } else {
      toast.error(result.error || "Xatolik yuz berdi");
    }
  };

  const handleEdit = async (name: string, status: "active" | "inactive") => {
    if (!editTarget) return;
    const result = await updateBranch({ id: editTarget.id, name, status });
    if (result.success) {
      toast.success("Filial muvaffaqiyatli yangilandi");
      setEditTarget(null);
      loadBranches();
    } else {
      toast.error(result.error || "Xatolik yuz berdi");
    }
  };

  const handleStatusChange = async (id: string, status: "active" | "inactive") => {
    const result = await updateBranchStatus(id, status);
    if (result.success) {
      toast.success("Filial holati yangilandi");
      loadBranches();
    } else {
      toast.error(result.error || "Xatolik yuz berdi");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Filialni o'chirishni tasdiqlaysizmi?")) return;

    const result = await deleteBranch(id);
    if (result.success) {
      toast.success("Filial muvaffaqiyatli o'chirildi");
      const totalPages = Math.ceil((branches.length - 1) / ITEMS_PER_PAGE);
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      }
      loadBranches();
    } else {
      toast.error(result.error || "Xatolik yuz berdi");
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden space-y-6">
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-primary-100 mb-2">Filiallar</h1>
          <p className="text-light-100">Filiallarni boshqarish</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          <Plus className="size-4" />
          {showForm ? "Bekor qilish" : "Yangi filial"}
        </Button>
      </div>

      {showForm && (
        <div className="flex-shrink-0">
          <AdmBranchForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {editTarget && (
        <div className="flex-shrink-0">
          <AdmBranchForm
            defaultValues={editTarget}
            onSubmit={handleEdit}
            onCancel={() => setEditTarget(null)}
          />
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-hidden">
        <AdmBranchTable
          branches={branches.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)}
          loading={loading}
          currentPage={currentPage}
          totalItems={branches.length}
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

