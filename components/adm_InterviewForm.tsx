"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Plus, X, Upload } from "lucide-react";
import SearchableSelect from "./adm_SearchableSelect";
import Image from "next/image";
import { toast } from "sonner";
import type { Branch } from "@/Admin/branch.action";
import type { Class } from "@/Admin/class.action";
import { getTeachersByClass } from "@/Admin/interview.action";
import { getAssignments } from "@/Admin/assignment.action";

interface QuestionAnswer {
  question: string;
  answer: string;
}

interface AdmInterviewFormProps {
  branches: Branch[];
  classes: Class[];
  academicYears: string[];
  defaultValues?: {
    branchId: string;
    classId: string;
    teacherId: string;
    academicYear: string;
    bookName?: string;
    bookCoverImage?: string;
    questions: QuestionAnswer[];
    availableFrom: string;
    availableUntil: string;
  };
  onSubmit: (payload: {
    branchId: string;
    classId: string;
    teacherId: string;
    academicYear: string;
    bookName?: string;
    bookCoverImage?: string;
    questions: QuestionAnswer[];
    availableFrom: string;
    availableUntil: string;
  }) => void;
  onCancel: () => void;
  // New prop to indicate if the user is a teacher (and restrict branch selection)
  teacherMode?: boolean;
}

export default function AdmInterviewForm({
  branches,
  classes,
  academicYears,
  defaultValues,
  onSubmit,
  onCancel,
  teacherMode = false,
}: AdmInterviewFormProps) {
  const [branchId, setBranchId] = useState(defaultValues?.branchId || "");
  const [academicYear, setAcademicYear] = useState(defaultValues?.academicYear || "");
  const [classId, setClassId] = useState(defaultValues?.classId || "");
  const [teacherId, setTeacherId] = useState(defaultValues?.teacherId || "");
  const [questions, setQuestions] = useState<QuestionAnswer[]>(
    defaultValues?.questions && defaultValues.questions.length > 0
      ? defaultValues.questions
      : [{ question: "", answer: "" }]
  );
  const [availableFrom, setAvailableFrom] = useState(
    defaultValues?.availableFrom
      ? new Date(defaultValues.availableFrom).toISOString().slice(0, 16)
      : ""
  );
  const [availableUntil, setAvailableUntil] = useState(
    defaultValues?.availableUntil
      ? new Date(defaultValues.availableUntil).toISOString().slice(0, 16)
      : ""
  );
  const [teachers, setTeachers] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [assignedClasses, setAssignedClasses] = useState<string[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [bookName, setBookName] = useState(defaultValues?.bookName || "");
  const [bookCoverImage, setBookCoverImage] = useState(defaultValues?.bookCoverImage || "");
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter classes by branch
  const branchClasses = classes.filter((c) => !branchId || c.branchId === branchId);
  
  // Filter classes to only show assigned ones
  const filteredClasses = branchClasses.filter((c) => {
    if (!branchId || !academicYear) return false;
    return assignedClasses.includes(c.id);
  });

  // Sync state when defaultValues change (important for async data loading)
  useEffect(() => {
    if (defaultValues) {
      if (defaultValues.branchId) setBranchId(defaultValues.branchId);
      if (defaultValues.academicYear) setAcademicYear(defaultValues.academicYear);
      if (defaultValues.teacherId) setTeacherId(defaultValues.teacherId);
      if (defaultValues.classId) setClassId(defaultValues.classId);
      if (defaultValues.bookName) setBookName(defaultValues.bookName);
      if (defaultValues.bookCoverImage) setBookCoverImage(defaultValues.bookCoverImage);
    }
  }, [defaultValues?.branchId, defaultValues?.academicYear, defaultValues?.teacherId, defaultValues?.classId]);

  useEffect(() => {
    if (branchId && academicYear) {
      loadAssignedClasses();
    } else {
      setAssignedClasses([]);
      setClassId("");
    }
  }, [branchId, academicYear]);

  useEffect(() => {
    if (classId && academicYear) {
      loadTeachers();
    } else {
      setTeachers([]);
      if (!teacherMode) setTeacherId("");
    }
  }, [classId, academicYear]);

  const loadAssignedClasses = async () => {
    if (!branchId || !academicYear) return;
    setLoadingClasses(true);
    try {
      const assignments = await getAssignments({ branchId, academicYear });
      const classIds = [...new Set(assignments.map((a) => a.classId))];
      setAssignedClasses(classIds);
    } catch (error) {
      console.error("Error loading assigned classes:", error);
    } finally {
      setLoadingClasses(false);
    }
  };

  const loadTeachers = async () => {
    if (!classId || !academicYear) return;
    setLoadingTeachers(true);
    try {
      const teachersData = await getTeachersByClass(classId, academicYear);
      setTeachers(teachersData);
    } catch (error) {
      console.error("Error loading teachers:", error);
    } finally {
      setLoadingTeachers(false);
    }
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, { question: "", answer: "" }]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const handleQuestionChange = (index: number, field: "question" | "answer", value: string) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Faqat JPEG, JPG va PNG formatlari qo'llab-quvvatlanadi");
      return;
    }

    // Validate file extension
    const fileName = file.name.toLowerCase();
    const validExtensions = [".jpeg", ".jpg", ".png"];
    const hasValidExtension = validExtensions.some((ext) => fileName.endsWith(ext));
    if (!hasValidExtension) {
      toast.error("Faqat JPEG, JPG va PNG formatlari qo'llab-quvvatlanadi");
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success && data.url) {
        setBookCoverImage(data.url);
        toast.success("Rasm muvaffaqiyatli yuklandi");
      } else {
        toast.error(data.error || "Rasm yuklashda xatolik");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Rasm yuklashda xatolik");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Form submit - values:", { branchId, academicYear, classId, teacherId, teacherMode });
    
    if (!branchId || !academicYear || !classId || !teacherId) {
      if (!branchId) toast.error("Filial tanlanmagan");
      else if (!academicYear) toast.error("O'quv yili tanlanmagan");
      else if (!classId) toast.error("Sinf tanlanmagan");
      else if (!teacherId) toast.error("O'qituvchi tanlanmagan");
      return;
    }
    if (questions.some((q) => !q.question.trim() || !q.answer.trim())) {
      toast.error("Barcha savollar va javoblar to'ldirilishi shart");
      return;
    }
    if (!availableFrom || !availableUntil) {
      toast.error("Boshlanish va tugash vaqtlari belgilanmagan");
      return;
    }

    onSubmit({
      branchId,
      classId,
      teacherId,
      academicYear,
      bookName,
      bookCoverImage,
      questions,
      availableFrom: new Date(availableFrom).toISOString(),
      availableUntil: new Date(availableUntil).toISOString(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Branch selection: Hidden in teacherMode if branchId is already set (which it should be) */}
        {!teacherMode ? (
          <div>
            <Label htmlFor="branch">Filial</Label>
            <select
              id="branch"
              value={branchId}
              onChange={(e) => {
                setBranchId(e.target.value);
                setAcademicYear("");
                setClassId("");
              }}
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
        ) : (
           <div className="hidden">
              <input type="hidden" name="branch" value={branchId} />
           </div>
        )}

        {/* Academic Year: Hidden in teacherMode, uses auto-selected active year */}
        {!teacherMode ? (
          <div>
            <Label htmlFor="academicYear">O'quv yili</Label>
            <select
              id="academicYear"
              value={academicYear}
              onChange={(e) => {
                setAcademicYear(e.target.value);
                setClassId("");
              }}
              required
              disabled={!branchId}
              className="mt-2 w-full bg-dark-200 text-light-100 rounded-full min-h-12 px-5 border border-input focus:outline-none focus:ring-2 focus:ring-primary-200 disabled:opacity-50"
            >
              <option value="">O'quv yilini tanlang</option>
              {academicYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        ) : (
           <div className="hidden">
              <input type="hidden" name="academicYear" value={academicYear} />
           </div>
        )}
      </div>

      <div>
        <Label htmlFor="class">Sinf</Label>
        <select
          id="class"
          value={classId}
          onChange={(e) => {
            setClassId(e.target.value);
            if (!teacherMode) setTeacherId("");
          }}
          required
          disabled={!branchId || !academicYear || loadingClasses}
          className="mt-2 w-full bg-dark-200 text-light-100 rounded-full min-h-12 px-5 border border-input focus:outline-none focus:ring-2 focus:ring-primary-200 disabled:opacity-50"
        >
          <option value="">
            {loadingClasses 
              ? "Yuklanmoqda..." 
              : !branchId || !academicYear 
                ? teacherMode 
                  ? "Ma'lumotlar yuklanmoqda..." 
                  : "Avval filial va o'quv yilini tanlang" 
                : filteredClasses.length === 0 
                  ? "Bu filial va o'quv yili uchun sinflar topilmadi" 
                  : "Sinfni tanlang"}
          </option>
          {filteredClasses.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        {/* If teacherMode, we lock teacherId too. */}
        {!teacherMode ? (
            <SearchableSelect
              label="O'qituvchi"
              options={teachers}
              value={teacherId}
              onChange={setTeacherId}
              placeholder={loadingTeachers ? "Yuklanmoqda..." : (classId && academicYear) ? "O'qituvchini qidirish..." : "Avval sinf va o'quv yilini tanlang"}
              required
              disabled={!classId || !academicYear || loadingTeachers}
            />
        ) : (
             <div className="hidden">
                 <input type="hidden" name="teacherId" value={teacherId} />
             </div>
        )}
      </div>

      {/* Rest of the form remains same */}
      <div>
        <Label htmlFor="bookName">Kitob nomi</Label>
        <input
          id="bookName"
          type="text"
          value={bookName}
          onChange={(e) => setBookName(e.target.value)}
          className="mt-2 w-full bg-dark-200 text-light-100 rounded-full min-h-12 px-5 border border-input focus:outline-none focus:ring-2 focus:ring-primary-200"
          placeholder="Kitob nomini kiriting..."
        />
      </div>

      <div>
        <Label htmlFor="bookCoverImage">Kitob muqovasi rasmi</Label>
        <div className="mt-2 space-y-3">
          {bookCoverImage && (
            <div className="relative w-full max-w-xs">
              <Image
                src={bookCoverImage}
                alt="Book cover"
                width={200}
                height={300}
                className="rounded-lg object-cover border border-input"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setBookCoverImage("")}
                className="absolute top-2 right-2 text-red-400 hover:text-red-300 bg-dark-200/80"
              >
                <X className="size-4" />
              </Button>
            </div>
          )}
          <div>
            <input
              ref={fileInputRef}
              id="bookCoverImage"
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleImageUpload}
              disabled={uploadingImage}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              className="flex items-center gap-2"
            >
              <Upload className="size-4" />
              {uploadingImage ? "Yuklanmoqda..." : bookCoverImage ? "Rasmni o'zgartirish" : "Rasm yuklash"}
            </Button>
            <p className="text-xs text-light-200 mt-1">
              Faqat JPEG, JPG va PNG formatlari qo'llab-quvvatlanadi
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Savollar va javoblar</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddQuestion}
            className="flex items-center gap-2"
          >
            <Plus className="size-4" />
            Savol qo'shish
          </Button>
        </div>

        {questions.map((qa, index) => (
          <div key={index} className="p-4 bg-dark-200/50 rounded-lg border border-input space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-light-200">Savol #{index + 1}</span>
              {questions.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveQuestion(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  <X className="size-4" />
                </Button>
              )}
            </div>
            <div>
              <Label htmlFor={`question-${index}`}>Savol</Label>
              <textarea
                id={`question-${index}`}
                value={qa.question}
                onChange={(e) => handleQuestionChange(index, "question", e.target.value)}
                required
                rows={2}
                className="mt-2 w-full bg-dark-200 text-light-100 rounded-lg px-4 py-3 border border-input focus:outline-none focus:ring-2 focus:ring-primary-200 resize-none"
                placeholder="Savolni kiriting..."
              />
            </div>
            <div>
              <Label htmlFor={`answer-${index}`}>Javob</Label>
              <textarea
                id={`answer-${index}`}
                value={qa.answer}
                onChange={(e) => handleQuestionChange(index, "answer", e.target.value)}
                required
                rows={3}
                className="mt-2 w-full bg-dark-200 text-light-100 rounded-lg px-4 py-3 border border-input focus:outline-none focus:ring-2 focus:ring-primary-200 resize-none"
                placeholder="Javobni kiriting..."
              />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="availableFrom">Boshlanish vaqti</Label>
          <input
            id="availableFrom"
            type="datetime-local"
            value={availableFrom}
            onChange={(e) => setAvailableFrom(e.target.value)}
            required
            className="mt-2 w-full bg-dark-200 text-light-100 rounded-full min-h-12 px-5 border border-input focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
        </div>

        <div>
          <Label htmlFor="availableUntil">Tugash vaqti</Label>
          <input
            id="availableUntil"
            type="datetime-local"
            value={availableUntil}
            onChange={(e) => setAvailableUntil(e.target.value)}
            required
            min={availableFrom}
            className="mt-2 w-full bg-dark-200 text-light-100 rounded-full min-h-12 px-5 border border-input focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
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