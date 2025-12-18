// Helper functions for role-based authorization
export function isAdminRole(role?: string): boolean {
  if (!role) return false;
  // Admin-level roles that should access Admin panel
  return role === "admin" || 
         role === "administrator" || 
         role === "Administrator" || 
         role === "Admin" ||
         role === "employee" ||
         role === "manager" ||
         role === "Manager";
}

export function isTeacherRole(role?: string): boolean {
  if (!role) return false;
  return role === "teacher";
}

export function isStudentRole(role?: string): boolean {
  if (!role) return false;
  return role === "student";
}

export function getRedirectPathForRole(role?: string): string {
  if (!role) return "/Admin"; // Default fallback for undefined roles
  
  if (isTeacherRole(role)) return "/Teacher";
  if (isStudentRole(role)) return "/Student";
  if (isAdminRole(role)) return "/Admin";
  
  // Default fallback - treat unknown roles as needing admin access
  return "/Admin";
}