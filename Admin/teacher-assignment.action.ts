"use server";

import { db } from "@/firebase/admin";

export interface TeacherAssignment {
  id: string;
  teacherId: string;
  teacherName: string;
  branchId: string;
  branchName: string;
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  academicYear: string;
  createdAt: string;
}

export async function createTeacherAssignment(params: {
  teacherId: string;
  branchId: string;
  classId: string;
  subjectId: string;
  academicYear: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const { teacherId, branchId, classId, subjectId, academicYear } = params;

    const [teacherDoc, branchDoc, classDoc, subjectDoc] = await Promise.all([
      db.collection("teachers").doc(teacherId).get(),
      db.collection("branches").doc(branchId).get(),
      db.collection("classes").doc(classId).get(),
      db.collection("subjects").doc(subjectId).get(),
    ]);

    if (!teacherDoc.exists) return { success: false, error: "O'qituvchi topilmadi" };
    if (!branchDoc.exists) return { success: false, error: "Filial topilmadi" };
    if (!classDoc.exists) return { success: false, error: "Sinf topilmadi" };
    if (!subjectDoc.exists) return { success: false, error: "Fan topilmadi" };

    const teacherData = teacherDoc.data();
    const branchData = branchDoc.data();
    const classData = classDoc.data();
    const subjectData = subjectDoc.data();

    const assignment = {
      teacherId,
      teacherName: `${teacherData?.firstName ?? ""} ${teacherData?.lastName ?? ""}`.trim(),
      branchId,
      branchName: branchData?.name ?? "",
      classId,
      className: classData?.name ?? "",
      subjectId,
      subjectName: subjectData?.name ?? "",
      academicYear,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("teacherAssignments").add(assignment);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error creating teacher assignment:", error);
    return { success: false, error: "Biriktirishda xatolik yuz berdi" };
  }
}

export async function updateTeacherAssignment(
  id: string,
  params: {
    branchId: string;
    classId: string;
    subjectId: string;
    academicYear: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const { branchId, classId, subjectId, academicYear } = params;

    const [branchDoc, classDoc, subjectDoc] = await Promise.all([
      db.collection("branches").doc(branchId).get(),
      db.collection("classes").doc(classId).get(),
      db.collection("subjects").doc(subjectId).get(),
    ]);

    if (!branchDoc.exists) return { success: false, error: "Filial topilmadi" };
    if (!classDoc.exists) return { success: false, error: "Sinf topilmadi" };
    if (!subjectDoc.exists) return { success: false, error: "Fan topilmadi" };

    const branchData = branchDoc.data();
    const classData = classDoc.data();
    const subjectData = subjectDoc.data();

    await db.collection("teacherAssignments").doc(id).update({
      branchId,
      branchName: branchData?.name ?? "",
      classId,
      className: classData?.name ?? "",
      subjectId,
      subjectName: subjectData?.name ?? "",
      academicYear,
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating teacher assignment:", error);
    return { success: false, error: "Biriktirishni yangilashda xatolik" };
  }
}

export async function deleteTeacherAssignment(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await db.collection("teacherAssignments").doc(id).delete();
    return { success: true };
  } catch (error) {
    console.error("Error deleting teacher assignment:", error);
    return { success: false, error: "Biriktirishni o'chirishda xatolik" };
  }
}

export async function getTeacherAssignments(params?: {
  branchId?: string;
  classId?: string;
  subjectId?: string;
  academicYear?: string;
}): Promise<TeacherAssignment[]> {
  try {
    let query: FirebaseFirestore.Query = db
      .collection("teacherAssignments")
      .orderBy("createdAt", "desc");

    if (params?.branchId) query = query.where("branchId", "==", params.branchId);
    if (params?.classId) query = query.where("classId", "==", params.classId);
    if (params?.subjectId) query = query.where("subjectId", "==", params.subjectId);
    if (params?.academicYear) query = query.where("academicYear", "==", params.academicYear);

    const snapshot = await query.get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as TeacherAssignment[];
  } catch (error) {
    console.error("Error fetching teacher assignments:", error);
    return [];
  }
}

