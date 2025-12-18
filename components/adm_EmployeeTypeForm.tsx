"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface AdmEmployeeTypeFormProps {
  defaultValues?: { name: string; status: "active" | "inactive" };
  onSubmit: (payload: { name: string; status: "active" | "inactive" }) => void;
  onCancel: () => void;
}

export default function AdmEmployeeTypeForm({ defaultValues, onSubmit, onCancel }: AdmEmployeeTypeFormProps) {
  const [name, setName] = useState(defaultValues?.name || "");
  const [status, setStatus] = useState<"active" | "inactive">(defaultValues?.status || "active");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name, status });
    if (!defaultValues) {
      setName("");
      setStatus("active");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="dark-gradient rounded-2xl p-6 border border-input space-y-4">
      <h3 className="text-xl font-semibold text-primary-100">
        {defaultValues ? "Lavozimni tahrirlash" : "Yangi lavozim qo'shish"}
      </h3>
      <div className="space-y-2">
        <Label htmlFor="name">Lavozim nomi</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Masalan: Admin, Direktor"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Holat</Label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as "active" | "inactive")}
          className="w-full bg-dark-200 text-light-100 rounded-full min-h-12 px-5 border border-input focus:outline-none focus:ring-2 focus:ring-primary-200"
        >
          <option value="active">Faol</option>
          <option value="inactive">Nofaol</option>
        </select>
      </div>
      <div className="flex gap-3">
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

