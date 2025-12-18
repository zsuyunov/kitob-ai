"use server";

import { db } from "@/firebase/admin";

export interface Assignment {
  id: string;
  studentId: string;
  studentName: string;
  branchId: string;
  branchName: string;
  classId: string;
  className: string;
  academicYear: string;
  createdAt: string;
}

export async function createAssignment(params: {
  studentId: string;
  branchId: string;
  classId: string;
  academicYear: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const { studentId, branchId, classId, academicYear } = params;

    const [studentDoc, branchDoc, classDoc] = await Promise.all([
      db.collection("students").doc(studentId).get(),
      db.collection("branches").doc(branchId).get(),
      db.collection("classes").doc(classId).get(),
    ]);

    if (!studentDoc.exists) return { success: false, error: "Talaba topilmadi" };
    if (!branchDoc.exists) return { success: false, error: "Filial topilmadi" };
    if (!classDoc.exists) return { success: false, error: "Sinf topilmadi" };

    const studentData = studentDoc.data();
    const branchData = branchDoc.data();
    const classData = classDoc.data();

    const assignment = {
      studentId,
      studentName: `${studentData?.firstName ?? ""} ${studentData?.lastName ?? ""}`.trim(),
      branchId,
      branchName: branchData?.name ?? "",
      classId,
      className: classData?.name ?? "",
      academicYear,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("assignments").add(assignment);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error creating assignment:", error);
    return { success: false, error: "Biriktirishda xatolik yuz berdi" };
  }
}

export async function updateAssignment(
  id: string,
  params: {
    branchId: string;
    classId: string;
    academicYear: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const { branchId, classId, academicYear } = params;

    const [branchDoc, classDoc] = await Promise.all([
      db.collection("branches").doc(branchId).get(),
      db.collection("classes").doc(classId).get(),
    ]);

    if (!branchDoc.exists) return { success: false, error: "Filial topilmadi" };
    if (!classDoc.exists) return { success: false, error: "Sinf topilmadi" };

    const branchData = branchDoc.data();
    const classData = classDoc.data();

    await db.collection("assignments").doc(id).update({
      branchId,
      branchName: branchData?.name ?? "",
      classId,
      className: classData?.name ?? "",
      academicYear,
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating assignment:", error);
    return { success: false, error: "Biriktirishni yangilashda xatolik" };
  }
}

export async function deleteAssignment(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await db.collection("assignments").doc(id).delete();
    return { success: true };
  } catch (error) {
    console.error("Error deleting assignment:", error);
    return { success: false, error: "Biriktirishni o'chirishda xatolik" };
  }
}

export async function getAssignments(params?: {
  branchId?: string;
  classId?: string;
  academicYear?: string;
}): Promise<Assignment[]> {
  try {
    let query: FirebaseFirestore.Query = db
      .collection("assignments")
      .orderBy("createdAt", "desc");

    if (params?.branchId) {
      query = query.where("branchId", "==", params.branchId);
    }
    if (params?.classId) {
      query = query.where("classId", "==", params.classId);
    }
    if (params?.academicYear) {
      query = query.where("academicYear", "==", params.academicYear);
    }

    const snapshot = await query.get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Assignment[];
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return [];
  }
}

