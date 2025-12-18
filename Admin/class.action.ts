"use server";

import { db } from "@/firebase/admin";

export interface Class {
  id: string;
  name: string;
  branchId: string;
  branchName?: string;
  status: "active" | "inactive";
  academicYear: string;
  createdAt: string;
}

export async function createClass(params: {
  name: string;
  branchId: string;
  status: "active" | "inactive";
  academicYear: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    if (!params.name || params.name.trim().length === 0) {
      return { success: false, error: "Sinf nomi bo'sh bo'lishi mumkin emas" };
    }

    if (!params.branchId) {
      return { success: false, error: "Filial tanlash majburiy" };
    }

    if (!params.academicYear) {
      return { success: false, error: "O'quv yili tanlash majburiy" };
    }

    const branchDoc = await db.collection("branches").doc(params.branchId).get();
    if (!branchDoc.exists) {
      return { success: false, error: "Tanlangan filial topilmadi" };
    }

    const branchData = branchDoc.data();
    const classData = {
      name: params.name.trim(),
      branchId: params.branchId,
      branchName: branchData?.name || "",
      status: params.status,
      academicYear: params.academicYear,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("classes").add(classData);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error creating class:", error);
    return { success: false, error: "Sinf yaratishda xatolik yuz berdi" };
  }
}

export async function getAllClasses(): Promise<Class[]> {
  try {
    const snapshot = await db
      .collection("classes")
      .orderBy("createdAt", "desc")
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Class[];
  } catch (error) {
    console.error("Error fetching classes:", error);
    return [];
  }
}

export async function updateClass(params: {
  id: string;
  name: string;
  branchId: string;
  status: "active" | "inactive";
  academicYear: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    if (!params.name || params.name.trim().length === 0) {
      return { success: false, error: "Sinf nomi bo'sh bo'lishi mumkin emas" };
    }
    if (!params.branchId) {
      return { success: false, error: "Filial tanlash majburiy" };
    }
    if (!params.academicYear) {
      return { success: false, error: "O'quv yili tanlash majburiy" };
    }

    const branchDoc = await db.collection("branches").doc(params.branchId).get();
    if (!branchDoc.exists) {
      return { success: false, error: "Tanlangan filial topilmadi" };
    }

    const branchData = branchDoc.data();
    await db.collection("classes").doc(params.id).update({
      name: params.name.trim(),
      branchId: params.branchId,
      branchName: branchData?.name || "",
      status: params.status,
      academicYear: params.academicYear,
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating class:", error);
    return { success: false, error: "Sinf yangilashda xatolik yuz berdi" };
  }
}

export async function updateClassStatus(
  id: string,
  status: "active" | "inactive"
): Promise<{ success: boolean; error?: string }> {
  try {
    await db.collection("classes").doc(id).update({ status });
    return { success: true };
  } catch (error) {
    console.error("Error updating class:", error);
    return { success: false, error: "Sinf yangilashda xatolik yuz berdi" };
  }
}

export async function deleteClass(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await db.collection("classes").doc(id).delete();
    return { success: true };
  } catch (error) {
    console.error("Error deleting class:", error);
    return { success: false, error: "Sinfni o'chirishda xatolik yuz berdi" };
  }
}

