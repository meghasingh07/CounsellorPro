/** Matches Postgres enum `user_role` and `public.users.role`. */
export type UserRole = "student" | "counselor" | "admin";

export const USER_ROLES: UserRole[] = ["student", "counselor", "admin"];

export function isUserRole(value: string): value is UserRole {
  return value === "student" || value === "counselor" || value === "admin";
}
