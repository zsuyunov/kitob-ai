export type RoleKind = "employeeType" | "teacher" | "student";

export interface PermissionSet {
  id: string;
  roleId: string;
  roleKind: RoleKind;
  roleName: string;
  actions: string[];
  updatedAt: string;
}

export const PERMISSION_ACTIONS = [
  "dashboard:view",
  "branches:view",
  "branches:edit",
  "branches:create",
  "branches:delete",
  "classes:view",
  "classes:edit",
  "classes:create",
  "classes:delete",
  "subjects:view",
  "subjects:edit",
  "subjects:create",
  "subjects:delete",
  "students:view",
  "students:edit",
  "students:create",
  "students:delete",
  "studentAssignments:view",
  "studentAssignments:edit",
  "studentAssignments:create",
  "studentAssignments:delete",
  "teachers:view",
  "teachers:edit",
  "teachers:create",
  "teachers:delete",
  "teacherAssignments:view",
  "teacherAssignments:edit",
  "teacherAssignments:create",
  "teacherAssignments:delete",
  "academicYears:view",
  "academicYears:edit",
  "academicYears:create",
  "academicYears:delete",
  "employees:view",
  "employees:edit",
  "employees:create",
  "employees:delete",
  "employeeTypes:view",
  "employeeTypes:edit",
  "employeeTypes:create",
  "employeeTypes:delete",
  "permissions:view",
  "permissions:edit",
  "permissions:create",
  "permissions:delete",
  "interviewCreation:view",
  "interviewCreation:edit",
  "interviewCreation:create",
  "interviewCreation:delete",
  "interviews:view",
  "interviews:start",
  "interviews:viewFeedback",
];

