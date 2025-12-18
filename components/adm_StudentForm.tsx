"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import type { Student } from "@/Admin/student.action";

interface AdmStudentFormProps {
  defaultValues?: Student;
  onSubmit: (payload: {
    firstName: string;
    lastName: string;
    gender: "male" | "female";
    status: "active" | "inactive";
    email: string;
    password: string;
  }) => void;
  onCancel: () => void;
}

export default function AdmStudentForm({ defaultValues, onSubmit, onCancel }: AdmStudentFormProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (defaultValues) {
      setFirstName(defaultValues.firstName);
      setLastName(defaultValues.lastName);
      setGender(defaultValues.gender);
      setStatus(defaultValues.status);
      setEmail(defaultValues.email);
      setPassword(""); // Don't prefill password
    }
  }, [defaultValues]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;
    if (!defaultValues && !password.trim()) {
      return; // Password required for new students
    }
    onSubmit({ firstName, lastName, gender, status, email, password: password.trim() || "" });
    if (!defaultValues) {
      setFirstName("");
      setLastName("");
      setGender("male");
      setStatus("active");
      setEmail("");
      setPassword("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="dark-gradient rounded-2xl p-6 border border-input">
      <h3 className="text-xl font-semibold text-primary-100 mb-4">
        {defaultValues ? "Talabani tahrirlash" : "Yangi talaba qo'shish"}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">Ism</Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Ism"
            required
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="lastName">Familiya</Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Familiya"
            required
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="gender">Jinsi</Label>
          <select
            id="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value as "male" | "female")}
            className="mt-2 w-full bg-dark-200 text-light-100 rounded-full min-h-12 px-5 border border-input focus:outline-none focus:ring-2 focus:ring-primary-200"
          >
            <option value="male">O'g'il</option>
            <option value="female">Qiz</option>
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
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            required
            type="email"
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="password">Parol</Label>
          <div className="relative mt-2">
            <Input
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={defaultValues ? "Parolni o'zgartirish (ixtiyoriy)" : "Yangi parol"}
              required={!defaultValues}
              type={showPassword ? "text" : "password"}
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

      <div className="flex gap-3 pt-4">
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

