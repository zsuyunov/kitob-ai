"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import type { Branch } from "@/Admin/branch.action";
import type { Class } from "@/Admin/class.action";

interface AdmClassFormProps {
  branches: Branch[];
  academicYears: string[];
  defaultValues?: Class;
  onSubmit: (
    name: string,
    branchId: string,
    status: "active" | "inactive",
    academicYear: string
  ) => void;
  onCancel: () => void;
}

export default function AdmClassForm({
  branches,
  academicYears,
  defaultValues,
  onSubmit,
  onCancel,
}: AdmClassFormProps) {
  const [name, setName] = useState("");
  const [branchId, setBranchId] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [academicYear, setAcademicYear] = useState(academicYears[0] || "");

  useEffect(() => {
    if (defaultValues) {
      setName(defaultValues.name);
      setBranchId(defaultValues.branchId);
      setStatus(defaultValues.status);
      setAcademicYear(defaultValues.academicYear);
    }
  }, [defaultValues]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !branchId || !academicYear) return;
    onSubmit(name, branchId, status, academicYear);
    setName("");
    setBranchId("");
    setStatus("active");
    setAcademicYear(academicYears[0] || "");
  };

  return (
    <form onSubmit={handleSubmit} className="dark-gradient rounded-2xl p-6 border border-input">
      <h3 className="text-xl font-semibold text-primary-100 mb-4">
        {defaultValues ? "Sinfni tahrirlash" : "Yangi sinf qo'shish"}
      </h3>

      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Sinf nomi</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Masalan: 1-A sinf"
            required
            className="mt-2"
          />
        </div>

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

        <div>
          <Label htmlFor="status">Holat</Label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as "active" | "inactive")}
            className="mt-2 w-full bg-dark-200 text-light-100 rounded-full min-h-12 px-5 border border-input focus:outline-none focus:ring-2 focus:ring-primary-200"
          >
            <option value="active">Faol</option>
            <option value="inactive">Nofaol</option>
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" className="btn-primary flex-1">
            Saqlash
          </Button>
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            className="flex-1"
          >
            Bekor qilish
          </Button>
        </div>
      </div>
    </form>
  );
}

