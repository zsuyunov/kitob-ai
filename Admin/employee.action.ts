"use server";

import { auth, db } from "@/firebase/admin";

export interface Employee {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  typeId: string;
  typeName: string;
  branchId: string;
  branchName: string;
  gender: "male" | "female";
  status: "active" | "inactive";
  email: string;
  createdAt: string;
}

export async function createEmployee(params: {
  firstName: string;
  lastName: string;
  typeId: string;
  branchId: string;
  gender: "male" | "female";
  status: "active" | "inactive";
  email: string;
  password: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const { firstName, lastName, typeId, branchId, gender, status, email, password } = params;
    if (!firstName.trim() || !lastName.trim()) return { success: false, error: "Ism va familiya majburiy" };
    if (!typeId || !branchId) return { success: false, error: "Lavozim va filial majburiy" };

    const [typeDoc, branchDoc] = await Promise.all([
      db.collection("employeeTypes").doc(typeId).get(),
      db.collection("branches").doc(branchId).get(),
    ]);

    if (!typeDoc.exists) return { success: false, error: "Lavozim topilmadi" };
    if (!branchDoc.exists) return { success: false, error: "Filial topilmadi" };

    const existingUser = await auth.getUserByEmail(email).catch(() => null);
    if (existingUser) return { success: false, error: "Bu email allaqachon mavjud" };

    const userRecord = await auth.createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`,
    });

    await auth.setCustomUserClaims(userRecord.uid, { role: typeDoc.data()?.name || "employee" });

    const employeeData = {
      userId: userRecord.uid,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      typeId,
      typeName: typeDoc.data()?.name || "",
      branchId,
      branchName: branchDoc.data()?.name || "",
      gender,
      status,
      email,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("employees").add(employeeData);
    await db.collection("users").doc(userRecord.uid).set({
      name: `${firstName} ${lastName}`,
      email,
      role: typeDoc.data()?.name || "employee",
      branchId,
      status,
      createdAt: employeeData.createdAt,
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("createEmployee error:", error);
    return { success: false, error: "Xodimni yaratishda xatolik" };
  }
}

export async function getEmployees(): Promise<Employee[]> {
  try {
    const snapshot = await db.collection("employees").orderBy("createdAt", "desc").get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Employee[];
  } catch (error) {
    console.error("getEmployees error:", error);
    return [];
  }
}

export async function updateEmployee(params: {
  id: string;
  firstName: string;
  lastName: string;
  typeId: string;
  branchId: string;
  gender: "male" | "female";
  status: "active" | "inactive";
  email: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    if (!params.firstName.trim() || !params.lastName.trim()) {
      return { success: false, error: "Ism va familiya majburiy" };
    }
    if (!params.typeId || !params.branchId) {
      return { success: false, error: "Lavozim va filial majburiy" };
    }

    const [typeDoc, branchDoc] = await Promise.all([
      db.collection("employeeTypes").doc(params.typeId).get(),
      db.collection("branches").doc(params.branchId).get(),
    ]);

    if (!typeDoc.exists) return { success: false, error: "Lavozim topilmadi" };
    if (!branchDoc.exists) return { success: false, error: "Filial topilmadi" };

    const doc = await db.collection("employees").doc(params.id).get();
    const data = doc.data() as Employee | undefined;
    if (!data) return { success: false, error: "Xodim topilmadi" };

    await db.collection("employees").doc(params.id).update({
      firstName: params.firstName.trim(),
      lastName: params.lastName.trim(),
      typeId: params.typeId,
      typeName: typeDoc.data()?.name || "",
      branchId: params.branchId,
      branchName: branchDoc.data()?.name || "",
      gender: params.gender,
      status: params.status,
      email: params.email,
    });

    if (data.userId) {
      await auth.updateUser(data.userId, {
        displayName: `${params.firstName} ${params.lastName}`,
        email: params.email,
      });
      await auth.setCustomUserClaims(data.userId, { role: typeDoc.data()?.name || "employee" });
      await db.collection("users").doc(data.userId).update({
        name: `${params.firstName} ${params.lastName}`,
        email: params.email,
        role: typeDoc.data()?.name || "employee",
        branchId: params.branchId,
        status: params.status,
      });
    }

    return { success: true };
  } catch (error) {
    console.error("updateEmployee error:", error);
    return { success: false, error: "Xodimni yangilashda xatolik" };
  }
}

export async function updateEmployeeStatus(
  id: string,
  status: "active" | "inactive"
): Promise<{ success: boolean; error?: string }> {
  try {
    await db.collection("employees").doc(id).update({ status });
    return { success: true };
  } catch (error) {
    console.error("updateEmployeeStatus error:", error);
    return { success: false, error: "Holatni yangilashda xatolik" };
  }
}

export async function deleteEmployee(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const doc = await db.collection("employees").doc(id).get();
    const data = doc.data() as Employee | undefined;

    await db.collection("employees").doc(id).delete();
    if (data?.userId) {
      await db.collection("users").doc(data.userId).delete().catch(() => {});
      await auth.deleteUser(data.userId).catch(() => {});
    }

    return { success: true };
  } catch (error) {
    console.error("deleteEmployee error:", error);
    return { success: false, error: "Xodimni o'chirishda xatolik" };
  }
}

