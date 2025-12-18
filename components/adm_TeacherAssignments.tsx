"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getTeacherAssignments,
  updateTeacherAssignment,
  deleteTeacherAssignment,
  createTeacherAssignment,
} from "@/Admin/teacher-assignment.action";
import { getAllBranches } from "@/Admin/branch.action";
import { getAllClasses } from "@/Admin/class.action";
import { getAllSubjects } from "@/Admin/subject.action";
import { getAllTeachers } from "@/Admin/teacher.action";
import { getAcademicYears } from "@/Admin/academic-year.action";
import AdmTeacherAssignForm from "./adm_TeacherAssignForm";
import AdmAssignmentTable from "./adm_AssignmentTable";
import SearchableSelect from "./adm_SearchableSelect";
import { Button } from "./ui/button";
import { Plus, Filter } from "lucide-react";
import { toast } from "sonner";
import type { TeacherAssignment } from "@/Admin/teacher-assignment.action";
import type { Branch } from "@/Admin/branch.action";
import type { Class } from "@/Admin/class.action";
import type { Subject } from "@/Admin/subject.action";
import type { Teacher } from "@/Admin/teacher.action";

const ITEMS_PER_PAGE = 20;

export default function AdmTeacherAssignments() {
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [academicYears, setAcademicYears] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<{
    branchId?: string;
    classId?: string;
    subjectId?: string;
    academicYear?: string;
  }>({});
  const [createMode, setCreateMode] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [editTarget, setEditTarget] = useState<TeacherAssignment | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Multiple assignment combinations state
  type AssignmentDraft = {
    branchId: string;
    classId: string;
    subjectId: string;
  };
  const [assignmentDrafts, setAssignmentDrafts] = useState<AssignmentDraft[]>([]);
  const [storedAcademicYear, setStoredAcademicYear] = useState<string>("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [branchesData, classesData, subjectsData, teachersData, assignmentsData, yearsData] = await Promise.all([
        getAllBranches(),
        getAllClasses(),
        getAllSubjects(),
        getAllTeachers(),
        getTeacherAssignments(filters),
        getAcademicYears(),
      ]);
      setBranches(branchesData);
      setClasses(classesData);
      setSubjects(subjectsData);
      setTeachers(teachersData);
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

  const handleCreate = async () => {
    if (!selectedTeacherId) {
      toast.error("O'qituvchi tanlanmagan");
      return;
    }
    if (!storedAcademicYear) {
      toast.error("O'quv yili tanlanmagan");
      return;
    }
    if (assignmentDrafts.length === 0) {
      toast.error("Kamida bitta biriktirish qo'shishingiz kerak");
      return;
    }
    
    // Validate all drafts
    const invalidDrafts = assignmentDrafts.filter(
      (draft) => !draft.branchId || !draft.classId || !draft.subjectId
    );
    if (invalidDrafts.length > 0) {
      toast.error("Barcha maydonlar to'ldirilishi kerak");
      return;
    }

    // Create all assignments
    try {
      const promises = assignmentDrafts.map((draft) =>
        createTeacherAssignment({
          teacherId: selectedTeacherId,
          branchId: draft.branchId,
          classId: draft.classId,
          subjectId: draft.subjectId,
          academicYear: storedAcademicYear,
        })
      );
      
      const results = await Promise.all(promises);
      const failed = results.filter((r) => !r.success);
      
      if (failed.length > 0) {
        toast.error(`${failed.length} ta biriktirish yaratishda xatolik`);
      } else {
        toast.success(`${assignmentDrafts.length} ta biriktirish yaratildi`);
        setCreateMode(false);
        setSelectedTeacherId("");
        setAssignmentDrafts([]);
        setStoredAcademicYear("");
        setCurrentPage(1);
        loadData();
      }
    } catch (error) {
      toast.error("Xatolik yuz berdi");
    }
  };

  const handleAddExtra = () => {
    if (!selectedTeacherId) {
      toast.error("Avval o'qituvchini tanlang");
      return;
    }
    if (!storedAcademicYear) {
      toast.error("Avval o'quv yilini tanlang");
      return;
    }
    if (assignmentDrafts.length === 0) {
      toast.error("Avval birinchi biriktirishni to'ldiring");
      return;
    }
    // Check if first draft is complete
    const firstDraft = assignmentDrafts[0];
    if (!firstDraft.branchId || !firstDraft.classId || !firstDraft.subjectId) {
      toast.error("Avval birinchi biriktirishni to'liq to'ldiring");
      return;
    }
    setAssignmentDrafts([...assignmentDrafts, { branchId: "", classId: "", subjectId: "" }]);
  };

  const handleUpdateDraft = (index: number, field: keyof AssignmentDraft, value: string) => {
    const updated = [...assignmentDrafts];
    updated[index] = { ...updated[index], [field]: value };
    if (field === "branchId") {
      updated[index].classId = ""; // Reset class when branch changes
    }
    setAssignmentDrafts(updated);
  };

  const handleRemoveDraft = (index: number) => {
    setAssignmentDrafts(assignmentDrafts.filter((_, i) => i !== index));
  };

  const handleUpdate = async (payload: {
    branchId: string;
    classId: string;
    subjectId: string;
    academicYear: string;
  }) => {
    if (!editTarget) return;
    const result = await updateTeacherAssignment(editTarget.id, payload);
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
    const result = await deleteTeacherAssignment(id);
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
            <h1 className="text-3xl font-bold text-primary-100 mb-2">O'qituvchi biriktirishlari</h1>
            <p className="text-light-100">Filial, sinf, fan va o'quv yilini boshqarish</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() =>
                setFilters({
                  branchId: undefined,
                  classId: undefined,
                  subjectId: undefined,
                  academicYear: undefined,
                })
              }
            >
              <Filter className="size-4" />
              Filtrlarni tozalash
            </Button>
            <Button
              onClick={() => {
                if (createMode) {
                  setCreateMode(false);
                  setSelectedTeacherId("");
                  setAssignmentDrafts([]);
                  setStoredAcademicYear("");
                } else {
                  setCreateMode(true);
                  setAssignmentDrafts([{ branchId: "", classId: "", subjectId: "" }]);
                }
              }}
              className="btn-primary"
            >
              <Plus className="size-4" />
              {createMode ? "Bekor qilish" : "Yangi biriktirish"}
            </Button>
          </div>
        </div>

        <div className="dark-gradient rounded-2xl p-4 border border-input grid gap-4 md:grid-cols-4">
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
            <label className="text-light-100 text-sm">Fan</label>
            <select
              value={filters.subjectId || ""}
              onChange={(e) => setFilters((prev) => ({ ...prev, subjectId: e.target.value || undefined }))}
              className="mt-2 w-full bg-dark-200 text-light-100 rounded-full min-h-12 px-5 border border-input focus:outline-none focus:ring-2 focus:ring-primary-200"
            >
              <option value="">Barchasi</option>
              {subjects.map((subj) => (
                <option key={subj.id} value={subj.id}>
                  {subj.name}
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
              label="O'qituvchi"
              options={teachers.map((t) => ({
                id: t.id,
                name: `${t.firstName} ${t.lastName}`,
              }))}
              value={selectedTeacherId}
              onChange={setSelectedTeacherId}
              placeholder="O'qituvchini qidirish..."
              required
            />

            {assignmentDrafts.map((draft, index) => {
              const filteredClasses = classes.filter(
                (c) => !draft.branchId || c.branchId === draft.branchId
              );
              const isFirstRow = index === 0;
              
              return (
                <div key={index} className="space-y-3">
                  {!isFirstRow && (
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-light-200">Qo'shimcha biriktirish #{index + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveDraft(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        O'chirish
                      </Button>
                    </div>
                  )}
                  <div className={`grid gap-4 ${isFirstRow ? "md:grid-cols-4" : "md:grid-cols-3"}`}>
                    <div>
                      <label className="text-light-100 text-sm">Filial</label>
                      <select
                        value={draft.branchId}
                        onChange={(e) => handleUpdateDraft(index, "branchId", e.target.value)}
                        required
                        className="mt-2 w-full bg-dark-200 text-light-100 rounded-full min-h-12 px-5 border border-input focus:outline-none focus:ring-2 focus:ring-primary-200"
                      >
                        <option value="">Filialni tanlang</option>
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
                        value={draft.classId}
                        onChange={(e) => handleUpdateDraft(index, "classId", e.target.value)}
                        required
                        disabled={!draft.branchId}
                        className="mt-2 w-full bg-dark-200 text-light-100 rounded-full min-h-12 px-5 border border-input focus:outline-none focus:ring-2 focus:ring-primary-200 disabled:opacity-50"
                      >
                        <option value="">Sinfni tanlang</option>
                        {filteredClasses.map((cls) => (
                          <option key={cls.id} value={cls.id}>
                            {cls.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-light-100 text-sm">Fan</label>
                      <select
                        value={draft.subjectId}
                        onChange={(e) => handleUpdateDraft(index, "subjectId", e.target.value)}
                        required
                        className="mt-2 w-full bg-dark-200 text-light-100 rounded-full min-h-12 px-5 border border-input focus:outline-none focus:ring-2 focus:ring-primary-200"
                      >
                        <option value="">Fanni tanlang</option>
                        {subjects.map((subj) => (
                          <option key={subj.id} value={subj.id}>
                            {subj.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {isFirstRow && (
                      <div>
                        <label className="text-light-100 text-sm">O'quv yili</label>
                        <select
                          value={storedAcademicYear}
                          onChange={(e) => setStoredAcademicYear(e.target.value)}
                          required
                          className="mt-2 w-full bg-dark-200 text-light-100 rounded-full min-h-12 px-5 border border-input focus:outline-none focus:ring-2 focus:ring-primary-200"
                        >
                          <option value="">O'quv yilini tanlang</option>
                          {academicYears.map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {assignmentDrafts.length > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleAddExtra}
                className="w-full"
              >
                <Plus className="size-4 mr-2" />
                Qo'shimcha biriktirish qo'shish
              </Button>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="button" onClick={handleCreate} className="btn-primary flex-1">
                Saqlash
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCreateMode(false);
                  setSelectedTeacherId("");
                  setAssignmentDrafts([]);
                  setStoredAcademicYear("");
                }}
                className="flex-1"
              >
                Bekor qilish
              </Button>
            </div>
          </div>
        )}

        {editTarget && (
          <div className="dark-gradient rounded-2xl p-4 border border-input space-y-4">
            <h4 className="text-lg font-semibold text-primary-100">Biriktirishni tahrirlash</h4>
            <AdmTeacherAssignForm
              branches={branches}
              classes={classes}
              subjects={subjects}
              academicYears={academicYears}
              defaultValues={{
                branchId: editTarget.branchId,
                classId: editTarget.classId,
                subjectId: editTarget.subjectId,
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
            type="teacher"
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

