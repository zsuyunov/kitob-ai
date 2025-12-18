"use server";

import { db } from "@/firebase/admin";

export interface Subject {
  id: string;
  name: string;
  status: "active" | "inactive";
  createdAt: string;
}

export async function createSubject(params: {
  name: string;
  status: "active" | "inactive";
}): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    if (!params.name || params.name.trim().length === 0) {
      return { success: false, error: "Fan nomi bo'sh bo'lishi mumkin emas" };
    }

    const subject = {
      name: params.name.trim(),
      status: params.status,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("subjects").add(subject);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error creating subject:", error);
    return { success: false, error: "Fan yaratishda xatolik yuz berdi" };
  }
}

export async function getAllSubjects(): Promise<Subject[]> {
  try {
    const snapshot = await db
      .collection("subjects")
      .orderBy("createdAt", "desc")
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Subject[];
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return [];
  }
}

export async function updateSubject(params: {
  id: string;
  name: string;
  status: "active" | "inactive";
}): Promise<{ success: boolean; error?: string }> {
  try {
    if (!params.name || params.name.trim().length === 0) {
      return { success: false, error: "Fan nomi bo'sh bo'lishi mumkin emas" };
    }
    await db.collection("subjects").doc(params.id).update({
      name: params.name.trim(),
      status: params.status,
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating subject:", error);
    return { success: false, error: "Fan yangilashda xatolik yuz berdi" };
  }
}

export async function updateSubjectStatus(
  id: string,
  status: "active" | "inactive"
): Promise<{ success: boolean; error?: string }> {
  try {
    await db.collection("subjects").doc(id).update({ status });
    return { success: true };
  } catch (error) {
    console.error("Error updating subject:", error);
    return { success: false, error: "Fan yangilashda xatolik yuz berdi" };
  }
}

export async function deleteSubject(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await db.collection("subjects").doc(id).delete();
    return { success: true };
  } catch (error) {
    console.error("Error deleting subject:", error);
    return { success: false, error: "Fanni o'chirishda xatolik yuz berdi" };
  }
}

