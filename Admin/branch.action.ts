"use server";

import { db } from "@/firebase/admin";

export interface Branch {
  id: string;
  name: string;
  status: "active" | "inactive";
  createdAt: string;
}

export async function createBranch(params: {
  name: string;
  status: "active" | "inactive";
}): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    if (!params.name || params.name.trim().length === 0) {
      return { success: false, error: "Filial nomi bo'sh bo'lishi mumkin emas" };
    }

    const branch = {
      name: params.name.trim(),
      status: params.status,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("branches").add(branch);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error creating branch:", error);
    return { success: false, error: "Filial yaratishda xatolik yuz berdi" };
  }
}

export async function getAllBranches(): Promise<Branch[]> {
  try {
    const snapshot = await db
      .collection("branches")
      .orderBy("createdAt", "desc")
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Branch[];
  } catch (error) {
    console.error("Error fetching branches:", error);
    return [];
  }
}

export async function updateBranch(params: {
  id: string;
  name: string;
  status: "active" | "inactive";
}): Promise<{ success: boolean; error?: string }> {
  try {
    if (!params.name || params.name.trim().length === 0) {
      return { success: false, error: "Filial nomi bo'sh bo'lishi mumkin emas" };
    }
    await db.collection("branches").doc(params.id).update({
      name: params.name.trim(),
      status: params.status,
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating branch:", error);
    return { success: false, error: "Filial yangilashda xatolik yuz berdi" };
  }
}

export async function updateBranchStatus(
  id: string,
  status: "active" | "inactive"
): Promise<{ success: boolean; error?: string }> {
  try {
    await db.collection("branches").doc(id).update({ status });
    return { success: true };
  } catch (error) {
    console.error("Error updating branch:", error);
    return { success: false, error: "Filial yangilashda xatolik yuz berdi" };
  }
}

export async function deleteBranch(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await db.collection("branches").doc(id).delete();
    return { success: true };
  } catch (error) {
    console.error("Error deleting branch:", error);
    return { success: false, error: "Filialni o'chirishda xatolik yuz berdi" };
  }
}

