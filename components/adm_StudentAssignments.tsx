"use client";

import { useEffect, useMemo, useState } from "react";
import { getAssignments, createAssignment, updateAssignment, deleteAssignment } from "@/Admin/assignment.action";
import { getAllBranches } from "@/Admin/branch.action";
import { getAllClasses } from "@/Admin/class.action";
import { getAllStudents } from "@/Admin/student.action";
import { getAcademicYears } from "@/Admin/academic-year.action";
import AdmAssignmentTable from "./adm_AssignmentTable";
import AdmAssignForm from "./adm_AssignForm";
import SearchableSelect from "./adm_SearchableSelect";
import { Button } from "./ui/button";
import { Plus, Filter } from "lucide-react";
import { toast } from "sonner";
import type { Assignment } from "@/Admin/assignment.action";
import type { Branch } from "@/Admin/branch.action";
import type { Class } from "@/Admin/class.action";
import type { Student } from "@/Admin/student.action";

const ITEMS_PER_PAGE = 20;

export default function AdmStudentAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [academicYears, setAcademicYears] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<{ branchId?: string; classId?: string; academicYear?: string }>({});
  const [createMode, setCreateMode] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [editTarget, setEditTarget] = useState<Assignment | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const loadData = async () => {
    setLoading(true);
    try {
      const [branchesData, classesData, studentsData, assignmentsData, yearsData] = await Promise.all([
        getAllBranches(),
        getAllClasses(),
        getAllStudents(),
        getAssignments(filters),
        getAcademicYears(),
      ]);
      setBranches(branchesData);
      setClasses(classesData);
      setStudents(studentsData);
      setAssignments(assignmentsData);
      setAcademicYears(yearsData.map((y) => y.name));
    } catch (error) {
      toast.error("Ma'lumotlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleCreate = async (payload: { branchId: string; classId: string; academicYear: string }) => {
    if (!selectedStudentId) {
      toast.error("Talaba tanlanmagan");
      return;
    }
    const result = await createAssignment({
      studentId: selectedStudentId,
      ...payload,
    });
    if (result.success) {
      toast.success("Biriktirish yaratildi");
      setCreateMode(false);
      setSelectedStudentId("");
      setCurrentPage(1);
      loadData();
    } else {
      toast.error(result.error || "Xatolik yuz berdi");
    }
  };

  const handleUpdate = async (payload: { branchId: string; classId: string; academicYear: string }) => {
    if (!editTarget) return;
    const result = await updateAssignment(editTarget.id, payload);
    if (result.success) {
      toast.success("Biriktirish yangilandi");
      setEditTarget(null);
      loadData();
    } else {
      toast.error(result.error || "Xatolik yuz berdi");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Biriktirishni o'chirishni tasdiqlaysizmi?")) return;
    const result = await deleteAssignment(id);
    if (result.success) {
      toast.success("Biriktirish o'chirildi");
      const totalPages = Math.ceil((assignments.length - 1) / ITEMS_PER_PAGE);
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      }
      loadData();
    } else {
      toast.error(result.error || "Xatolik yuz berdi");
    }
  };

  const filteredClasses = useMemo(
    () => classes.filter((c) => !filters.branchId || c.branchId === filters.branchId),
    [classes, filters.branchId]
  );

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="space-y-6 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary-100 mb-2">Talaba biriktirishlari</h1>
            <p className="text-light-100">Filial, sinf va o'quv yili bo'yicha boshqarish</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() =>
                setFilters({
                  branchId: undefined,
                  classId: undefined,
                  academicYear: undefined,
                })
              }
            >
              <Filter className="size-4" />
              Filtrlarni tozalash
            </Button>
            <Button onClick={() => setCreateMode(!createMode)} className="btn-primary">
              <Plus className="size-4" />
              {createMode ? "Bekor qilish" : "Yangi biriktirish"}
            </Button>
          </div>
        </div>

        <div className="dark-gradient rounded-2xl p-4 border border-input grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-light-100 text-sm">Filial</label>
            <select
              value={filters.branchId || ""}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, branchId: e.target.value || undefined, classId: undefined }))
              }
              className="mt-2 w-full bg-dark-200 text-light-100 rounded-full min-h-12 px-5 border border-input focus:outline-none focus:ring-2 focus:ring-primary-200"
            >
              <option value="">Barchasi</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-light-100 text-sm">Sinf</label>
            <select
              value={filters.classId || ""}
              onChange={(e) => setFilters((prev) => ({ ...prev, classId: e.target.value || undefined }))}
              className="mt-2 w-full bg-dark-200 text-light-100 rounded-full min-h-12 px-5 border border-input focus:outline-none focus:ring-2 focus:ring-primary-200"
            >
              <option value="">Barchasi</option>
              {filteredClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-light-100 text-sm">O'quv yili</label>
            <input
              className="mt-2 w-full bg-dark-200 text-light-100 rounded-full min-h-12 px-5 border border-input focus:outline-none focus:ring-2 focus:ring-primary-200"
              placeholder="Masalan: 2024-2025"
              value={filters.academicYear || ""}
              onChange={(e) => setFilters((prev) => ({ ...prev, academicYear: e.target.value || undefined }))}
            />
          </div>
        </div>

        {createMode && (
          <div className="dark-gradient rounded-2xl p-4 border border-input space-y-4">
            <h4 className="text-lg font-semibold text-primary-100">Yangi biriktirish</h4>
            <SearchableSelect
              label="Talaba"
              options={students.map((s) => ({
                id: s.id,
                name: `${s.firstName} ${s.lastName}`,
              }))}
              value={selectedStudentId}
              onChange={setSelectedStudentId}
              placeholder="Talabani qidirish..."
              required
            />
            <AdmAssignForm
              branches={branches}
              classes={classes}
              academicYears={academicYears}
              onSubmit={handleCreate}
              onCancel={() => setCreateMode(false)}
            />
          </div>
        )}

        {editTarget && (
          <div className="dark-gradient rounded-2xl p-4 border border-input space-y-4">
            <h4 className="text-lg font-semibold text-primary-100">Biriktirishni tahrirlash</h4>
            <AdmAssignForm
              branches={branches}
              classes={classes}
              academicYears={academicYears}
              defaultValues={{
                branchId: editTarget.branchId,
                classId: editTarget.classId,
                academicYear: editTarget.academicYear,
              }}
              onSubmit={handleUpdate}
              onCancel={() => setEditTarget(null)}
            />
          </div>
        )}

        <div className="dark-gradient rounded-2xl border border-input overflow-hidden">
          <AdmAssignmentTable
            assignments={assignments.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)}
            loading={loading}
            type="student"
            currentPage={currentPage}
            totalItems={assignments.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
            onEdit={(item) => setEditTarget(item)}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
}

