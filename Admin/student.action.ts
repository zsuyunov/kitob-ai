"use server";

import { auth, db } from "@/firebase/admin";

export interface Student {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  gender: "male" | "female";
  status: "active" | "inactive";
  email: string;
  role: "student";
  createdAt: string;
}

export async function createStudent(params: {
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

    await auth.setCustomUserClaims(userRecord.uid, { role: "student" });

    const studentData = {
      userId: userRecord.uid,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      gender,
      status,
      email,
      role: "student" as const,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("students").add(studentData);
    await db.collection("users").doc(userRecord.uid).set({
      name: `${firstName} ${lastName}`,
      email,
      role: "student",
      status,
      createdAt: studentData.createdAt,
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error creating student:", error);
    return { success: false, error: "Talabani yaratishda xatolik yuz berdi" };
  }
}

export async function getAllStudents(): Promise<Student[]> {
  try {
    const snapshot = await db
      .collection("students")
      .orderBy("createdAt", "desc")
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Student[];
  } catch (error) {
    console.error("Error fetching students:", error);
    return [];
  }
}

export async function updateStudent(params: {
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

    const doc = await db.collection("students").doc(params.id).get();
    const data = doc.data() as Student | undefined;
    if (!data) return { success: false, error: "Talaba topilmadi" };

    await db.collection("students").doc(params.id).update({
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
    console.error("Error updating student:", error);
    return { success: false, error: "Talabani yangilashda xatolik" };
  }
}

export async function updateStudentStatus(
  id: string,
  status: "active" | "inactive"
): Promise<{ success: boolean; error?: string }> {
  try {
    await db.collection("students").doc(id).update({ status });
    return { success: true };
  } catch (error) {
    console.error("Error updating student status:", error);
    return { success: false, error: "Talaba holatini yangilashda xatolik" };
  }
}

export async function deleteStudent(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const doc = await db.collection("students").doc(id).get();
    const data = doc.data() as Student | undefined;

    await db.collection("students").doc(id).delete();

    if (data?.userId) {
      await db.collection("users").doc(data.userId).delete().catch(() => {});
      await auth.deleteUser(data.userId).catch(() => {});
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting student:", error);
    return { success: false, error: "Talabani o'chirishda xatolik" };
  }
}

// New functions for student panel functionality
export async function getStudentByUserId(userId: string): Promise<Student | null> {
  try {
    const snapshot = await db.collection("students")
      .where("userId", "==", userId)
      .limit(1)
      .get();
      
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Student;
  } catch (error) {
    console.error("getStudentByUserId error:", error);
    return null;
  }
}

export async function getStudentAssignments(userId: string) {
  try {
    // First get the student record
    const student = await getStudentByUserId(userId);
    if (!student) return [];
    
    // Then get their class assignments
    const assignmentsSnapshot = await db.collection("assignments")
      .where("studentId", "==", student.id)
      .get();
      
    return assignmentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("getStudentAssignments error:", error);
    return [];
  }
}

