"use client";

import { useEffect, useState } from "react";
import { getEmployeeTypes } from "@/Admin/employee-type.action";
import {
  createEmployee,
  deleteEmployee,
  getEmployees,
  updateEmployee,
  updateEmployeeStatus,
  type Employee,
} from "@/Admin/employee.action";
import { getAllBranches } from "@/Admin/branch.action";
import AdmEmployeeForm from "./adm_EmployeeForm";
import AdmEmployeeTable from "./adm_EmployeeTable";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { EmployeeType } from "@/Admin/employee-type.action";
import type { Branch } from "@/Admin/branch.action";

const ITEMS_PER_PAGE = 20;

export default function AdmEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [types, setTypes] = useState<EmployeeType[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Employee | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const loadData = async () => {
    setLoading(true);
    try {
      const [empData, typeData, branchData] = await Promise.all([
        getEmployees(),
        getEmployeeTypes(),
        getAllBranches(),
      ]);
      setEmployees(empData);
      setTypes(typeData);
      setBranches(branchData);
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
    firstName: string;
    lastName: string;
    typeId: string;
    branchId: string;
    gender: "male" | "female";
    status: "active" | "inactive";
    email: string;
    password: string;
  }) => {
    const result = await createEmployee(payload);
    if (result.success) {
      toast.success("Xodim yaratildi");
      setShowForm(false);
      setCurrentPage(1);
      loadData();
    } else {
      toast.error(result.error || "Xatolik yuz berdi");
    }
  };

  const handleStatusChange = async (id: string, status: "active" | "inactive") => {
    const result = await updateEmployeeStatus(id, status);
    if (result.success) {
      toast.success("Holat yangilandi");
      loadData();
    } else {
      toast.error(result.error || "Xatolik yuz berdi");
    }
  };

  const handleEdit = async (payload: {
    firstName: string;
    lastName: string;
    typeId: string;
    branchId: string;
    gender: "male" | "female";
    status: "active" | "inactive";
    email: string;
    password: string;
  }) => {
    if (!editTarget) return;
    const result = await updateEmployee({
      id: editTarget.id,
      firstName: payload.firstName,
      lastName: payload.lastName,
      typeId: payload.typeId,
      branchId: payload.branchId,
      gender: payload.gender,
      status: payload.status,
      email: payload.email,
    });
    if (result.success) {
      toast.success("Xodim muvaffaqiyatli yangilandi");
      setEditTarget(null);
      loadData();
    } else {
      toast.error(result.error || "Xatolik yuz berdi");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xodimni o'chirishni tasdiqlaysizmi?")) return;
    const result = await deleteEmployee(id);
    if (result.success) {
      toast.success("Xodim o'chirildi");
      const totalPages = Math.ceil((employees.length - 1) / ITEMS_PER_PAGE);
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
          <h1 className="text-3xl font-bold text-primary-100 mb-2">Xodimlar</h1>
          <p className="text-light-100">Lavozim va filialga biriktirilgan xodimlar</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="size-4" />
          {showForm ? "Bekor qilish" : "Yangi xodim"}
        </Button>
      </div>

      {showForm && (
        <div className="flex-shrink-0">
          <AdmEmployeeForm
            types={types}
            branches={branches}
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {editTarget && (
        <div className="flex-shrink-0">
          <AdmEmployeeForm
            types={types}
            branches={branches}
            defaultValues={editTarget}
            onSubmit={handleEdit}
            onCancel={() => setEditTarget(null)}
          />
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-hidden">
        <AdmEmployeeTable
          employees={employees.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)}
          loading={loading}
          currentPage={currentPage}
          totalItems={employees.length}
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

