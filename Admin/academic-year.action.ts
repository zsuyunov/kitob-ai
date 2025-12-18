"use server";

import { db } from "@/firebase/admin";

export interface Semester {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

export interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  semesters: Semester[];
  status: "active" | "inactive";
  createdAt: string;
}

async function deactivateOthers(exceptId: string) {
  const snapshot = await db.collection("academicYears").get();
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    if (doc.id !== exceptId) {
      batch.update(doc.ref, { status: "inactive" });
    }
  });
  await batch.commit();
}

export async function createAcademicYear(params: {
  name: string;
  startDate: string;
  endDate: string;
  semesters: Semester[];
}): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const { name, startDate, endDate, semesters } = params;
    if (!name.trim()) return { success: false, error: "O'quv yili nomi majburiy" };
    if (!startDate || !endDate) return { success: false, error: "Boshlanish va tugash sanasi majburiy" };

    const data = {
      name: name.trim(),
      startDate,
      endDate,
      semesters: semesters.map((s) => ({
        ...s,
        name: s.name?.trim() || s.id,
      })),
      status: "active" as const,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("academicYears").add(data);
    await deactivateOthers(docRef.id);

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("createAcademicYear error:", error);
    return { success: false, error: "O'quv yilini yaratishda xatolik" };
  }
}

export async function getAcademicYears(): Promise<AcademicYear[]> {
  try {
    const snapshot = await db.collection("academicYears").orderBy("createdAt", "desc").get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as AcademicYear[];
  } catch (error) {
    console.error("getAcademicYears error:", error);
    return [];
  }
}

export async function getActiveAcademicYear(): Promise<AcademicYear | null> {
  try {
    const snapshot = await db.collection("academicYears")
      .where("status", "==", "active")
      .limit(1)
      .get();
      
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as AcademicYear;
  } catch (error) {
    console.error("getActiveAcademicYear error:", error);
    return null;
  }
}

export async function updateAcademicYear(
  id: string,
  params: {
    name: string;
    startDate: string;
    endDate: string;
    semesters: Semester[];
    status?: "active" | "inactive";
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const payload = {
      name: params.name.trim(),
      startDate: params.startDate,
      endDate: params.endDate,
      semesters: params.semesters.map((s) => ({
        ...s,
        name: s.name?.trim() || s.id,
      })),
      status: params.status || "inactive",
    };

    await db.collection("academicYears").doc(id).update(payload);

    if (payload.status === "active") {
      await deactivateOthers(id);
    }

    return { success: true };
  } catch (error) {
    console.error("updateAcademicYear error:", error);
    return { success: false, error: "O'quv yilini yangilashda xatolik" };
  }
}

export async function deleteAcademicYear(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const doc = await db.collection("academicYears").doc(id).get();
    const wasActive = doc.data()?.status === "active";

    await db.collection("academicYears").doc(id).delete();

    if (wasActive) {
      const snapshot = await db.collection("academicYears").orderBy("createdAt", "desc").limit(1).get();
      if (!snapshot.empty) {
        await db.collection("academicYears").doc(snapshot.docs[0].id).update({ status: "active" });
      }
    }

    return { success: true };
  } catch (error) {
    console.error("deleteAcademicYear error:", error);
    return { success: false, error: "O'quv yilini o'chirishda xatolik" };
  }
}