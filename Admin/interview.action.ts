"use server";

import { db } from "@/firebase/admin";
import { revalidatePath } from "next/cache";
import { getTeacherAssignments } from "./teacher-assignment.action";

export interface Interview {
  id: string;
  branchId: string;
  branchName: string;
  classId: string;
  className: string;
  teacherId: string;
  teacherName: string;
  academicYear: string;
  bookName?: string;
  bookCoverImage?: string;
  questions: Array<{
    question: string;
    answer: string;
  }>;
  availableFrom: string; // ISO date string
  availableUntil: string; // ISO date string
  createdAt: string;
  createdBy: string; // Admin user ID
}

export async function createInterview(params: {
  branchId: string;
  classId: string;
  teacherId: string;
  academicYear: string;
  bookName?: string;
  bookCoverImage?: string;
  questions: Array<{ question: string; answer: string }>;
  availableFrom: string;
  availableUntil: string;
  createdBy: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const { branchId, classId, teacherId, academicYear, bookName, bookCoverImage, questions, availableFrom, availableUntil, createdBy } = params;

    // Validate required fields
    if (!branchId || !classId || !teacherId) {
      return { success: false, error: "Barcha maydonlar to'ldirilishi kerak" };
    }
    if (!questions || questions.length === 0) {
      return { success: false, error: "Kamida bitta savol qo'shishingiz kerak" };
    }
    if (!availableFrom || !availableUntil) {
      return { success: false, error: "Sana va vaqt tanlanishi kerak" };
    }

    // Get related data
    const [branchDoc, classDoc, teacherDoc] = await Promise.all([
      db.collection("branches").doc(branchId).get(),
      db.collection("classes").doc(classId).get(),
      db.collection("teachers").doc(teacherId).get(),
    ]);

    if (!branchDoc.exists) return { success: false, error: "Filial topilmadi" };
    if (!classDoc.exists) return { success: false, error: "Sinf topilmadi" };
    if (!teacherDoc.exists) return { success: false, error: "O'qituvchi topilmadi" };

    const branchData = branchDoc.data();
    const classData = classDoc.data();
    const teacherData = teacherDoc.data();

    const interview = {
      branchId,
      branchName: branchData?.name ?? "",
      classId,
      className: classData?.name ?? "",
      teacherId,
      teacherName: `${teacherData?.firstName ?? ""} ${teacherData?.lastName ?? ""}`.trim(),
      academicYear,
      bookName: bookName?.trim() || "",
      bookCoverImage: bookCoverImage || "",
      questions,
      availableFrom,
      availableUntil,
      createdAt: new Date().toISOString(),
      createdBy,
    };

    const docRef = await db.collection("adminInterviews").add(interview);
    // Invalidate teacher interview pages
    revalidatePath("/Teacher/interviews");
    revalidatePath("/Teacher/interviews/create");
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error creating interview:", error);
    return { success: false, error: "Interview yaratishda xatolik" };
  }
}

export async function getInterviews(params?: {
  branchId?: string;
  classId?: string;
}): Promise<Interview[]> {
  try {
    let query: FirebaseFirestore.Query = db
      .collection("adminInterviews")
      .orderBy("createdAt", "desc");

    if (params?.branchId) query = query.where("branchId", "==", params.branchId);
    if (params?.classId) query = query.where("classId", "==", params.classId);

    const snapshot = await query.get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Interview[];
  } catch (error) {
    console.error("Error fetching interviews:", error);
    return [];
  }
}

export async function getInterviewById(id: string): Promise<Interview | null> {
  try {
    const doc = await db.collection("adminInterviews").doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as Interview;
  } catch (error) {
    console.error("Error fetching interview:", error);
    return null;
  }
}

export async function getAvailableInterviews(): Promise<Interview[]> {
  try {
    const now = new Date().toISOString();
    // Fetch all interviews, ordered by start date
    // We want to show expired interviews too, so we don't filter by availableUntil
    const snapshot = await db
      .collection("adminInterviews")
      .orderBy("availableFrom", "desc")
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Interview[];
  } catch (error) {
    console.error("Error fetching available interviews:", error);
    return [];
  }
}

export async function getTeachersByClass(classId: string, academicYear: string): Promise<Array<{ id: string; name: string }>> {
  try {
    if (!classId || !academicYear) return [];
    
    const assignments = await getTeacherAssignments({ classId, academicYear });
    const teacherIds = [...new Set(assignments.map((a) => a.teacherId))];
    
    const teachers = await Promise.all(
      teacherIds.map(async (teacherId) => {
        const teacherDoc = await db.collection("teachers").doc(teacherId).get();
        if (!teacherDoc.exists) return null;
        const data = teacherDoc.data();
        return {
          id: teacherId,
          name: `${data?.firstName ?? ""} ${data?.lastName ?? ""}`.trim(),
        };
      })
    );

    return teachers.filter((t) => t !== null) as Array<{ id: string; name: string }>;
  } catch (error) {
    console.error("Error fetching teachers by class:", error);
    return [];
  }
}

export async function updateInterview(
  id: string,
  params: {
    branchId: string;
    classId: string;
    teacherId: string;
    academicYear: string;
    bookName?: string;
    bookCoverImage?: string;
    questions: Array<{ question: string; answer: string }>;
    availableFrom: string;
    availableUntil: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const { branchId, classId, teacherId, academicYear, bookName, bookCoverImage, questions, availableFrom, availableUntil } = params;

    // Get related data
    const [branchDoc, classDoc, teacherDoc] = await Promise.all([
      db.collection("branches").doc(branchId).get(),
      db.collection("classes").doc(classId).get(),
      db.collection("teachers").doc(teacherId).get(),
    ]);

    if (!branchDoc.exists) return { success: false, error: "Filial topilmadi" };
    if (!classDoc.exists) return { success: false, error: "Sinf topilmadi" };
    if (!teacherDoc.exists) return { success: false, error: "O'qituvchi topilmadi" };

    const branchData = branchDoc.data();
    const classData = classDoc.data();
    const teacherData = teacherDoc.data();

    await db.collection("adminInterviews").doc(id).update({
      branchId,
      branchName: branchData?.name ?? "",
      classId,
      className: classData?.name ?? "",
      teacherId,
      teacherName: `${teacherData?.firstName ?? ""} ${teacherData?.lastName ?? ""}`.trim(),
      academicYear,
      bookName: bookName?.trim() || "",
      bookCoverImage: bookCoverImage || "",
      questions,
      availableFrom,
      availableUntil,
    });

    revalidatePath("/Teacher/interviews");
    revalidatePath("/Teacher/interviews/create");

    return { success: true };
  } catch (error) {
    console.error("Error updating interview:", error);
    return { success: false, error: "Interview yangilashda xatolik" };
  }
}

export async function deleteInterview(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await db.collection("adminInterviews").doc(id).delete();
    revalidatePath("/Admin/interviews");
    revalidatePath("/Admin/interviews/create");
    return { success: true };
  } catch (error) {
    console.error("Error deleting interview:", error);
    return { success: false, error: "Interview o'chirishda xatolik" };
  }
}

// Get interviews available for a specific student based on their class assignments
export async function getAvailableInterviewsForStudent(userId: string): Promise<Interview[]> {
  try {
    // Import dynamically to avoid circular dependencies
    const { getStudentAssignments } = await import("./student.action");
    
    // Get student's class assignments
    const assignments = await getStudentAssignments(userId);
    if (!assignments || assignments.length === 0) return [];
    
    // Get current date/time
    const now = new Date().toISOString();
    
    // Fetch all interviews
    const allInterviews = await db.collection("adminInterviews").get();
    
    // Filter interviews that match student's classes
    const availableInterviews = allInterviews.docs
      .map(doc => ({ id: doc.id, ...doc.data() }) as Interview)
      .filter(interview => {
        // Check if interview matches any of student's class assignments
        const matchesClass = assignments.some((assignment: any) => 
          assignment.classId === interview.classId &&
          assignment.academicYear === interview.academicYear
        );
        
        return matchesClass;
      })
      .sort((a, b) => new Date(b.availableFrom).getTime() - new Date(a.availableFrom).getTime());
    
    return availableInterviews;
  } catch (error) {
    console.error("Error fetching available interviews for student:", error);
    return [];
  }
}

