"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import type { Subject } from "@/Admin/subject.action";

interface AdmSubjectFormProps {
  defaultValues?: Subject;
  onSubmit: (name: string, status: "active" | "inactive") => void;
  onCancel: () => void;
}

export default function AdmSubjectForm({ defaultValues, onSubmit, onCancel }: AdmSubjectFormProps) {
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");

  useEffect(() => {
    if (defaultValues) {
      setName(defaultValues.name);
      setStatus(defaultValues.status);
    }
  }, [defaultValues]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit(name, status);
    setName("");
    setStatus("active");
  };

  return (
    <form onSubmit={handleSubmit} className="dark-gradient rounded-2xl p-6 border border-input">
      <h3 className="text-xl font-semibold text-primary-100 mb-4">
        {defaultValues ? "Fanni tahrirlash" : "Yangi fan qo'shish"}
      </h3>

      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Fan nomi</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Masalan: Matematika"
            required
            className="mt-2"
          />
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

