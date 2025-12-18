"use client";

import { useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import type { Branch } from "@/Admin/branch.action";
import type { Class } from "@/Admin/class.action";
import type { Subject } from "@/Admin/subject.action";

interface AdmTeacherAssignFormProps {
  branches: Branch[];
  classes: Class[];
  subjects: Subject[];
  academicYears: string[];
  defaultValues?: {
    branchId: string;
    classId: string;
    subjectId: string;
    academicYear: string;
  };
  onSubmit: (payload: {
    branchId: string;
    classId: string;
    subjectId: string;
    academicYear: string;
  }) => void;
  onCancel: () => void;
}

export default function AdmTeacherAssignForm({
  branches,
  classes,
  subjects,
  academicYears,
  defaultValues,
  onSubmit,
  onCancel,
}: AdmTeacherAssignFormProps) {
  const [branchId, setBranchId] = useState(defaultValues?.branchId || "");
  const [classId, setClassId] = useState(defaultValues?.classId || "");
  const [subjectId, setSubjectId] = useState(defaultValues?.subjectId || "");
  const [academicYear, setAcademicYear] = useState(defaultValues?.academicYear || academicYears[0] || "");

  const filteredClasses = useMemo(
    () => classes.filter((c) => !branchId || c.branchId === branchId),
    [classes, branchId]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchId || !classId || !subjectId || !academicYear) return;
    onSubmit({ branchId, classId, subjectId, academicYear });
  };

  return (
    <form onSubmit={handleSubmit} className="dark-gradient rounded-2xl p-4 border border-input space-y-4">
      <div>
        <Label htmlFor="branch">Filial</Label>
        <select
          id="branch"
          value={branchId}
          onChange={(e) => setBranchId(e.target.value)}
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
        <Label htmlFor="class">Sinf</Label>
        <select
          id="class"
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          required
          className="mt-2 w-full bg-dark-200 text-light-100 rounded-full min-h-12 px-5 border border-input focus:outline-none focus:ring-2 focus:ring-primary-200"
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
        <Label htmlFor="subject">Fan</Label>
        <select
          id="subject"
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
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

      <div>
        <Label htmlFor="academicYear">O'quv yili</Label>
        <select
          id="academicYear"
          value={academicYear}
          onChange={(e) => setAcademicYear(e.target.value)}
          required
          className="mt-2 w-full bg-dark-200 text-light-100 rounded-full min-h-12 px-5 border border-input focus:outline-none focus:ring-2 focus:ring-primary-200"
        >
          {academicYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" className="btn-primary flex-1">
          Saqlash
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Bekor qilish
        </Button>
      </div>
    </form>
  );
}

