"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import type { Semester } from "@/Admin/academic-year.action";

interface AdmAcademicYearFormProps {
  defaultValues?: {
    name: string;
    startDate: string;
    endDate: string;
    semesters: Semester[];
  };
  onSubmit: (payload: {
    name: string;
    startDate: string;
    endDate: string;
    semesters: Semester[];
  }) => void;
  onCancel: () => void;
}

const emptySemester = (): Semester => ({
  id: crypto.randomUUID(),
  name: "",
  startDate: "",
  endDate: "",
});

export default function AdmAcademicYearForm({ defaultValues, onSubmit, onCancel }: AdmAcademicYearFormProps) {
  const [name, setName] = useState(defaultValues?.name || "");
  const [startDate, setStartDate] = useState(defaultValues?.startDate || "");
  const [endDate, setEndDate] = useState(defaultValues?.endDate || "");
  const [semesters, setSemesters] = useState<Semester[]>(
    defaultValues?.semesters?.length ? defaultValues.semesters : [emptySemester()]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !startDate || !endDate) return;
    onSubmit({ name, startDate, endDate, semesters });
  };

  const updateSemester = (id: string, field: keyof Semester, value: string) => {
    setSemesters((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const addSemester = () => setSemesters((prev) => [...prev, emptySemester()]);
  const removeSemester = (id: string) => setSemesters((prev) => prev.filter((s) => s.id !== id));

  return (
    <form onSubmit={handleSubmit} className="dark-gradient rounded-2xl p-6 border border-input space-y-4">
      <h3 className="text-xl font-semibold text-primary-100">O'quv yilini sozlash</h3>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">O'quv yili nomi</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Masalan: 2024-2025"
            required
            className="mt-2"
          />
        </div>
        <div>
          <Label>Holat</Label>
          <div className="mt-2 text-light-100 text-sm">Yangi yaratilgan yil avtomatik faol bo'ladi.</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Boshlanish sanasi</Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="endDate">Tugash sanasi</Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
            className="mt-2"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-primary-100">Semestrlar</h4>
          <Button type="button" variant="secondary" size="sm" onClick={addSemester}>
            Semestr qo'shish
          </Button>
        </div>

        <div className="space-y-4">
          {semesters.map((sem) => (
            <div
              key={sem.id}
              className="border border-input rounded-xl p-4 grid md:grid-cols-2 gap-4 bg-dark-200/50"
            >
              <div>
                <Label>Semestr nomi</Label>
                <Input
                  value={sem.name}
                  onChange={(e) => updateSemester(sem.id, "name", e.target.value)}
                  placeholder="1-semestr"
                  className="mt-2"
                />
              </div>
              <div className="flex gap-3 md:justify-end">
                <Button type="button" variant="destructive" size="sm" onClick={() => removeSemester(sem.id)}>
                  O'chirish
                </Button>
              </div>
              <div>
                <Label>Boshlanish sanasi</Label>
                <Input
                  type="date"
                  value={sem.startDate}
                  onChange={(e) => updateSemester(sem.id, "startDate", e.target.value)}
                  required
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Tugash sanasi</Label>
                <Input
                  type="date"
                  value={sem.endDate}
                  onChange={(e) => updateSemester(sem.id, "endDate", e.target.value)}
                  required
                  className="mt-2"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" className="btn-primary flex-1">
          Saqlash
        </Button>
        <Button type="button" onClick={onCancel} variant="outline" className="flex-1">
          Bekor qilish
        </Button>
      </div>
    </form>
  );
}

