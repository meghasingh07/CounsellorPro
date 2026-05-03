import type { UserRole } from "@/lib/types/user-role";

/** Where to send someone after login based on their profile role. */
export function dashboardPathForRole(role: UserRole): string {
  switch (role) {
    case "counselor":
      return "/dashboard/counselor";
    case "admin":
      return "/dashboard/admin";
    default:
      return "/dashboard/student";
  }
}
