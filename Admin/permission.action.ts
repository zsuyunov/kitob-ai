"use server";

import { db } from "@/firebase/admin";
import type { PermissionSet, RoleKind } from "@/constants/permissions";

const collection = () => db.collection("permissions");

export async function getPermissions(): Promise<PermissionSet[]> {
  const snapshot = await collection().get();
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as PermissionSet[];
}

export async function upsertPermission(params: {
  roleId: string;
  roleKind: RoleKind;
  roleName: string;
  actions: string[];
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { roleId, roleKind, roleName, actions } = params;
    const existing = await collection()
      .where("roleId", "==", roleId)
      .where("roleKind", "==", roleKind)
      .limit(1)
      .get();

    if (!actions || actions.length === 0) {
      if (!existing.empty) await collection().doc(existing.docs[0].id).delete();
      return { success: true };
    }

    const payload = {
      roleId,
      roleKind,
      roleName,
      actions: Array.from(new Set(actions)),
      updatedAt: new Date().toISOString(),
    };

    if (existing.empty) {
      await collection().add(payload);
    } else {
      await collection().doc(existing.docs[0].id).set(payload);
    }

    return { success: true };
  } catch (error) {
    console.error("upsertPermission error:", error);
    return { success: false, error: "Ruxsatlarni saqlashda xatolik" };
  }
}

export async function deletePermission(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await collection().doc(id).delete();
    return { success: true };
  } catch (error) {
    console.error("deletePermission error:", error);
    return { success: false, error: "Ruxsatni o'chirishda xatolik" };
  }
}

