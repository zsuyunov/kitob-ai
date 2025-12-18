"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import type { EmployeeType } from "@/Admin/employee-type.action";
import type { Branch } from "@/Admin/branch.action";
import type { Employee } from "@/Admin/employee.action";

interface AdmEmployeeFormProps {
  types: EmployeeType[];
  branches: Branch[];
  defaultValues?: Employee;
  onSubmit: (payload: {
    firstName: string;
    lastName: string;
    typeId: string;
    branchId: string;
    gender: "male" | "female";
    status: "active" | "inactive";
    email: string;
    password: string;
  }) => void;
  onCancel: () => void;
}

export default function AdmEmployeeForm({ types, branches, defaultValues, onSubmit, onCancel }: AdmEmployeeFormProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [typeId, setTypeId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (defaultValues) {
      setFirstName(defaultValues.firstName);
      setLastName(defaultValues.lastName);
      setTypeId(defaultValues.typeId);
      setBranchId(defaultValues.branchId);
      setGender(defaultValues.gender);
      setStatus(defaultValues.status);
      setEmail(defaultValues.email);
      setPassword(""); // Don't prefill password
    }
  }, [defaultValues]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !typeId || !branchId) return;
    if (!defaultValues && !password.trim()) {
      return; // Password required for new employees
    }
    onSubmit({ firstName, lastName, typeId, branchId, gender, status, email, password: password.trim() || "" });
    if (!defaultValues) {
      setFirstName("");
      setLastName("");
      setTypeId("");
      setBranchId("");
      setGender("male");
      setStatus("active");
      setEmail("");
      setPassword("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="dark-gradient rounded-2xl p-6 border border-input space-y-4">
      <h3 className="text-xl font-semibold text-primary-100">
        {defaultValues ? "Xodimni tahrirlash" : "Yangi xodim qo'shish"}
      </h3>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>Ism</Label>
          <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required placeholder="Ism" />
        </div>
        <div>
          <Label>Familiya</Label>
          <Input value={lastName} onChange={(e) => setLastName(e.target.value)} required placeholder="Familiya" />
        </div>
        <div>
          <Label>Lavozim</Label>
          <select
            value={typeId}
            onChange={(e) => setTypeId(e.target.value)}
            required
            className="mt-2 w-full bg-dark-200 text-light-100 rounded-full min-h-12 px-5 border border-input focus:outline-none focus:ring-2 focus:ring-primary-200"
          >
            <option value="">Lavozimni tanlang</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Filial</Label>
          <select
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            required
            className="mt-2 w-full bg-dark-200 text-light-100 rounded-full min-h-12 px-5 border border-input focus:outline-none focus:ring-2 focus:ring-primary-200"
          >
            <option value="">Filialni tanlang</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Jinsi</Label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value as "male" | "female")}
            className="mt-2 w-full bg-dark-200 text-light-100 rounded-full min-h-12 px-5 border border-input focus:outline-none focus:ring-2 focus:ring-primary-200"
          >
            <option value="male">Erkak</option>
            <option value="female">Ayol</option>
          </select>
        </div>
        <div>
          <Label>Holat</Label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "active" | "inactive")}
            className="mt-2 w-full bg-dark-200 text-light-100 rounded-full min-h-12 px-5 border border-input focus:outline-none focus:ring-2 focus:ring-primary-200"
          >
            <option value="active">Faol</option>
            <option value="inactive">Nofaol</option>
          </select>
        </div>
        <div>
          <Label>Email</Label>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            type="email"
            placeholder="email@example.com"
          />
        </div>
        <div>
          <Label>Parol</Label>
          <div className="relative mt-2">
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!defaultValues}
              type={showPassword ? "text" : "password"}
              placeholder={defaultValues ? "Parolni o'zgartirish (ixtiyoriy)" : "Yangi parol"}
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-3 flex items-center text-light-100"
              aria-label={showPassword ? "Parolni yashirish" : "Parolni ko'rsatish"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>
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

