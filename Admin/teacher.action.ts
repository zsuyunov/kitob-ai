"use server";

import { auth, db } from "@/firebase/admin";

export interface Teacher {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  gender: "male" | "female";
  status: "active" | "inactive";
  email: string;
  createdAt: string;
}

export async function createTeacher(params: {
  firstName: string;
  lastName: string;
  gender: "male" | "female";
  status: "active" | "inactive";
  email: string;
  password: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const { firstName, lastName, gender, status, email, password } = params;

    if (!firstName.trim() || !lastName.trim()) {
      return { success: false, error: "Ism va familiya majburiy" };
    }

    const existingUser = await auth.getUserByEmail(email).catch(() => null);
    if (existingUser) {
      return { success: false, error: "Bu email allaqachon mavjud" };
    }

    const userRecord = await auth.createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`,
    });

    await auth.setCustomUserClaims(userRecord.uid, { role: "teacher" });

    const teacherData = {
      userId: userRecord.uid,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      gender,
      status,
      email,
      role: "teacher" as const,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("teachers").add(teacherData);
    await db.collection("users").doc(userRecord.uid).set({
      name: `${firstName} ${lastName}`,
      email,
      role: "teacher",
      status,
      createdAt: teacherData.createdAt,
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error creating teacher:", error);
    return { success: false, error: "O'qituvchini yaratishda xatolik yuz berdi" };
  }
}

export async function getAllTeachers(): Promise<Teacher[]> {
  try {
    const snapshot = await db
      .collection("teachers")
      .orderBy("createdAt", "desc")
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Teacher[];
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return [];
  }
}

export async function updateTeacher(params: {
  id: string;
  firstName: string;
  lastName: string;
  gender: "male" | "female";
  status: "active" | "inactive";
  email: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    if (!params.firstName.trim() || !params.lastName.trim()) {
      return { success: false, error: "Ism va familiya majburiy" };
    }

    const doc = await db.collection("teachers").doc(params.id).get();
    const data = doc.data() as Teacher | undefined;
    if (!data) return { success: false, error: "O'qituvchi topilmadi" };

    await db.collection("teachers").doc(params.id).update({
      firstName: params.firstName.trim(),
      lastName: params.lastName.trim(),
      gender: params.gender,
      status: params.status,
      email: params.email,
    });

    if (data.userId) {
      await auth.updateUser(data.userId, {
        displayName: `${params.firstName} ${params.lastName}`,
        email: params.email,
      });
      await db.collection("users").doc(data.userId).update({
        name: `${params.firstName} ${params.lastName}`,
        email: params.email,
        status: params.status,
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating teacher:", error);
    return { success: false, error: "O'qituvchini yangilashda xatolik" };
  }
}

export async function updateTeacherStatus(
  id: string,
  status: "active" | "inactive"
): Promise<{ success: boolean; error?: string }> {
  try {
    await db.collection("teachers").doc(id).update({ status });
    return { success: true };
  } catch (error) {
    console.error("Error updating teacher status:", error);
    return { success: false, error: "O'qituvchi holatini yangilashda xatolik" };
  }
}

export async function deleteTeacher(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const doc = await db.collection("teachers").doc(id).get();
    const data = doc.data() as Teacher | undefined;

    await db.collection("teachers").doc(id).delete();

    if (data?.userId) {
      await db.collection("users").doc(data.userId).delete().catch(() => {});
      await auth.deleteUser(data.userId).catch(() => {});
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting teacher:", error);
    return { success: false, error: "O'qituvchini o'chirishda xatolik" };
  }
}

// New functions for teacher panel functionality
export async function getTeacherByUserId(userId: string): Promise<Teacher | null> {
  try {
    const snapshot = await db.collection("teachers")
      .where("userId", "==", userId)
      .limit(1)
      .get();
      
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Teacher;
  } catch (error) {
    console.error("getTeacherByUserId error:", error);
    return null;
  }
}

export async function getTeacherBranchAndAssignments(userId: string): Promise<{ teacher: Teacher; branchId: string | null } | null> {
  try {
    // First get the teacher record
    const teacher = await getTeacherByUserId(userId);
    if (!teacher) return null;
    
    // Then get their assignments to find their branch
    const assignmentsSnapshot = await db.collection("teacherAssignments")
      .where("teacherId", "==", teacher.id)
      .limit(1)
      .get();
      
    if (assignmentsSnapshot.empty) return { teacher, branchId: null };
    
    const assignment = assignmentsSnapshot.docs[0].data();
    return { teacher, branchId: assignment.branchId };
  } catch (error) {
    console.error("getTeacherBranchAndAssignments error:", error);
    return null;
  }
}