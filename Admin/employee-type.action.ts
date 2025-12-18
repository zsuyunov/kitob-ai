"use server";

import { db } from "@/firebase/admin";

export interface EmployeeType {
  id: string;
  name: string;
  status: "active" | "inactive";
  createdAt: string;
}

export async function createEmployeeType(params: {
  name: string;
  status: "active" | "inactive";
}): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    if (!params.name.trim()) return { success: false, error: "Lavozim nomi majburiy" };

    const docRef = await db.collection("employeeTypes").add({
      name: params.name.trim(),
      status: params.status,
      createdAt: new Date().toISOString(),
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("createEmployeeType error:", error);
    return { success: false, error: "Lavozim yaratishda xatolik" };
  }
}

export async function getEmployeeTypes(): Promise<EmployeeType[]> {
  try {
    const snapshot = await db.collection("employeeTypes").orderBy("createdAt", "desc").get();
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as EmployeeType[];
  } catch (error) {
    console.error("getEmployeeTypes error:", error);
    return [];
  }
}

export async function updateEmployeeType(
  id: string,
  params: { name: string; status: "active" | "inactive" }
): Promise<{ success: boolean; error?: string }> {
  try {
    await db.collection("employeeTypes").doc(id).update({
      name: params.name.trim(),
      status: params.status,
    });
    return { success: true };
  } catch (error) {
    console.error("updateEmployeeType error:", error);
    return { success: false, error: "Lavozimni yangilashda xatolik" };
  }
}

export async function deleteEmployeeType(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await db.collection("employeeTypes").doc(id).delete();
    return { success: true };
  } catch (error) {
    console.error("deleteEmployeeType error:", error);
    return { success: false, error: "Lavozimni o'chirishda xatolik" };
  }
}

