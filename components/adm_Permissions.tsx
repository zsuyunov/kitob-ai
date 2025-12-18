"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getPermissions, upsertPermission, deletePermission } from "@/Admin/permission.action";
import { getEmployeeTypes } from "@/Admin/employee-type.action";
import { Button } from "./ui/button";
import AdmPagination from "./adm_Pagination";
import { toast } from "sonner";
import {
  PERMISSION_ACTIONS,
  type PermissionSet,
  type RoleKind,
} from "@/constants/permissions";
import { Pencil, Trash2 } from "lucide-react";

interface RoleOption {
  id: string;
  kind: RoleKind;
  label: string;
}

const staticRoles: RoleOption[] = [
  { id: "teacher-role", kind: "teacher", label: "O'qituvchi (barcha)" },
  { id: "student-role", kind: "student", label: "Talaba (barcha)" },
];

const PERMISSION_GROUPS = [
  {
    key: "dashboard",
    label: "Boshqaruv paneli",
    actions: ["dashboard:view"],
  },
  {
    key: "branches",
    label: "Filiallar",
    actions: ["branches:view", "branches:edit", "branches:create", "branches:delete"],
  },
  {
    key: "classes",
    label: "Sinflar",
    actions: ["classes:view", "classes:edit", "classes:create", "classes:delete"],
  },
  {
    key: "subjects",
    label: "Fanlar",
    actions: ["subjects:view", "subjects:edit", "subjects:create", "subjects:delete"],
  },
  {
    key: "students",
    label: "Talabalar",
    actions: ["students:view", "students:edit", "students:create", "students:delete"],
  },
  {
    key: "studentAssignments",
    label: "Talaba biriktirishlari",
    actions: [
      "studentAssignments:view",
      "studentAssignments:edit",
      "studentAssignments:create",
      "studentAssignments:delete",
    ],
  },
  {
    key: "teachers",
    label: "O'qituvchilar",
    actions: ["teachers:view", "teachers:edit", "teachers:create", "teachers:delete"],
  },
  {
    key: "teacherAssignments",
    label: "O'qituvchi biriktirishlari",
    actions: [
      "teacherAssignments:view",
      "teacherAssignments:edit",
      "teacherAssignments:create",
      "teacherAssignments:delete",
    ],
  },
  {
    key: "academicYears",
    label: "O'quv yillari",
    actions: ["academicYears:view", "academicYears:edit", "academicYears:create", "academicYears:delete"],
  },
  {
    key: "employees",
    label: "Xodimlar",
    actions: ["employees:view", "employees:edit", "employees:create", "employees:delete"],
  },
  {
    key: "employeeTypes",
    label: "Xodim turlari",
    actions: ["employeeTypes:view", "employeeTypes:edit", "employeeTypes:create", "employeeTypes:delete"],
  },
  {
    key: "permissions",
    label: "Ruxsatlar",
    actions: ["permissions:view", "permissions:edit", "permissions:create", "permissions:delete"],
  },
  {
    key: "interviewCreation",
    label: "Interview yaratish",
    actions: [
      "interviewCreation:view",
      "interviewCreation:edit",
      "interviewCreation:create",
      "interviewCreation:delete",
    ],
  },
  {
    key: "interviews",
    label: "Interviewlar",
    actions: ["interviews:view", "interviews:start", "interviews:viewFeedback"],
  },
];

const ITEMS_PER_PAGE = 20;

export default function AdmPermissions() {
  const [options, setOptions] = useState<RoleOption[]>(staticRoles);
  const [selectedRole, setSelectedRole] = useState<RoleOption | null>(null);
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [allPermissions, setAllPermissions] = useState<PermissionSet[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const groupRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [types, perms] = await Promise.all([getEmployeeTypes(), getPermissions()]);

      const typeRoles: RoleOption[] = types.map((t) => ({
        id: t.id,
        kind: "employeeType" as RoleKind,
        label: `Xodim turi: ${t.name}`,
      }));

      // Only role-level selection: employee types + teacher(all) + student(all)
      setOptions([...typeRoles, ...staticRoles]);
      setAllPermissions(perms);
    } catch (error) {
      toast.error("Ma'lumotlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const currentPerm = useMemo(() => {
    if (!selectedRole) return null;
    return allPermissions.find(
      (p) => p.roleId === selectedRole.id && p.roleKind === selectedRole.kind
    );
  }, [allPermissions, selectedRole]);

  useEffect(() => {
    if (currentPerm) {
      setSelectedActions(currentPerm.actions);
    } else {
      setSelectedActions([]);
    }
  }, [currentPerm]);

  const toggleAction = (action: string) => {
    setSelectedActions((prev) =>
      prev.includes(action) ? prev.filter((a) => a !== action) : [...prev, action]
    );
  };

  const toggleGroup = (actions: string[]) => {
    setSelectedActions((prev) => {
      const allIncluded = actions.every((a) => prev.includes(a));
      if (allIncluded) {
        return prev.filter((a) => !actions.includes(a));
      }
      const merged = new Set([...prev, ...actions]);
      return Array.from(merged);
    });
  };

  useEffect(() => {
    PERMISSION_GROUPS.forEach((g) => {
      const ref = groupRefs.current[g.key];
      if (!ref) return;
      const total = g.actions.length;
      const checkedCount = g.actions.filter((a) => selectedActions.includes(a)).length;
      ref.indeterminate = checkedCount > 0 && checkedCount < total;
      ref.checked = checkedCount === total;
    });
  }, [selectedActions]);

  const handleSave = async () => {
    if (!selectedRole) {
      toast.error("Rol tanlanmagan");
      return;
    }
    setSaving(true);
    const result = await upsertPermission({
      roleId: selectedRole.id,
      roleKind: selectedRole.kind,
      roleName: selectedRole.label,
      actions: selectedActions,
    });
    setSaving(false);
    if (result.success) {
      toast.success("Ruxsatlar saqlandi");
      loadData();
    } else {
      toast.error(result.error || "Xatolik yuz berdi");
    }
  };

  const handleEditPermission = (perm: PermissionSet) => {
    const opt = options.find((o) => o.id === perm.roleId && o.kind === perm.roleKind);
    if (!opt) {
      toast.error("Rol topilmadi");
      return;
    }
    setSelectedRole(opt);
    setSelectedActions(perm.actions);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeletePermission = async (id: string) => {
    if (!id) return;
    if (!confirm("Ruxsatlarni o'chirishni tasdiqlaysizmi?")) return;
    setDeletingId(id);
    const res = await deletePermission(id);
    setDeletingId(null);
    if (res.success) {
      toast.success("Ruxsat o'chirildi");
      loadData();
    } else {
      toast.error(res.error || "Xatolik yuz berdi");
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden space-y-6">
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-primary-100 mb-2">Ruxsatlar</h1>
          <p className="text-light-100">Lavozim, o'qituvchi va talabalar uchun aniq ruxsatlar</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="dark-gradient rounded-2xl p-4 border border-input space-y-3">
          <h4 className="text-lg font-semibold text-primary-100">Rol tanlash</h4>
          <select
            disabled={loading}
            className="w-full bg-dark-200 text-light-100 rounded-full min-h-12 px-5 border border-input focus:outline-none focus:ring-2 focus:ring-primary-200"
            value={selectedRole?.id || ""}
            onChange={(e) => {
              const opt = options.find((o) => o.id === e.target.value);
              setSelectedRole(opt || null);
            }}
          >
            <option value="">Rolni tanlang</option>
            {options.map((opt) => (
              <option key={`${opt.kind}-${opt.id}`} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="text-xs text-light-400">
            Lavozimlar (employee types), o'qituvchilar va talabalar alohida ko'rib chiqiladi.
          </div>
        </div>

        <div className="md:col-span-2 dark-gradient rounded-2xl p-4 border border-input space-y-4 max-h-[70vh] overflow-y-auto">
          <h4 className="text-lg font-semibold text-primary-100">Ruxsatlar ro'yxati</h4>
          {selectedRole ? (
            <div className="space-y-3">
              {PERMISSION_GROUPS.map((group) => (
                <div key={group.key} className="border border-input rounded-xl p-3 bg-dark-200/60 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      ref={(el) => {
                        groupRefs.current[group.key] = el;
                      }}
                      onChange={() => toggleGroup(group.actions)}
                      className="size-4"
                    />
                    <span className="text-light-100 font-semibold">{group.label}</span>
                  </label>
                  <div className="grid md:grid-cols-2 gap-2 pl-1">
                    {group.actions.map((action) => {
                      const checked = selectedActions.includes(action);
                      return (
                        <label
                          key={action}
                          className="flex items-center gap-2 p-2 rounded-lg border border-input bg-dark-300/40 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleAction(action)}
                            className="size-4"
                          />
                          <span className="text-light-100 text-sm">{action}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-light-100">Rol tanlang va ruxsatlarni belgilang</p>
          )}

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedRole(null);
                setSelectedActions([]);
              }}
            >
              Bekor qilish
            </Button>
            <Button
              onClick={handleSave}
              disabled={!selectedRole || saving}
              className="btn-primary"
            >
              {saving ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </div>
        </div>
      </div>

      <div className="dark-gradient rounded-2xl border border-input flex flex-col max-h-[65vh]">
        <div className="p-4 flex-shrink-0">
          <h4 className="text-lg font-semibold text-primary-100">Joriy ruxsatlar</h4>
        </div>
        <div className="p-4 pt-0 flex-1 overflow-auto">
          {allPermissions.length === 0 ? (
            <p className="text-light-100">Hozircha ruxsatlar yo'q</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-3">
              {allPermissions
                .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                .map((p) => (
                  <div key={p.id} className="border border-input rounded-xl p-3 bg-dark-200/60 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-light-100">{p.roleName}</div>
                        <div className="text-xs text-light-400">
                          {p.roleKind === "employeeType"
                            ? "Lavozim"
                            : p.roleKind === "teacher"
                            ? "O'qituvchi"
                            : "Talaba"}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleEditPermission(p)}
                          aria-label="Tahrirlash"
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeletePermission(p.id)}
                          disabled={deletingId === p.id}
                          aria-label="O'chirish"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-xs text-light-100 space-y-1">
                      {p.actions.map((a) => (
                        <div key={a} className="px-2 py-1 rounded bg-dark-300 inline-block mr-1">
                          {a}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
        {allPermissions.length > ITEMS_PER_PAGE && (
          <div className="border-t border-input p-3">
            <AdmPagination
              currentPage={currentPage}
              totalPages={Math.ceil(allPermissions.length / ITEMS_PER_PAGE)}
              onPageChange={setCurrentPage}
              totalItems={allPermissions.length}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          </div>
        )}
      </div>
    </div>
  );
}

