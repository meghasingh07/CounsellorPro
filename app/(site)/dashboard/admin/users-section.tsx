import { updateUserRole } from "@/app/(site)/dashboard/admin/actions";
import type { UserRole } from "@/lib/types/user-role";
import { USER_ROLES } from "@/lib/types/user-role";
import { btnPrimarySm, cardSection, inputClass } from "@/lib/ui/style";

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export function UsersSection({
  users,
  currentAdminId,
}: {
  users: AdminUserRow[];
  currentAdminId: string;
}) {
  return (
    <section className={cardSection}>
      <h2 className="text-lg font-semibold text-foreground">All users</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Change roles here. Promoting someone to counselor creates their counselor profile.
      </p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="py-2 pr-4 font-medium">Name</th>
              <th className="py-2 pr-4 font-medium">Email</th>
              <th className="py-2 font-medium">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isSelf = u.id === currentAdminId;
              return (
                <tr key={u.id} className="border-b border-border">
                  <td className="py-3 pr-4 text-foreground">{u.name || "—"}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{u.email}</td>
                  <td className="py-3">
                    <form
                      action={updateUserRole}
                      className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center"
                    >
                      <input type="hidden" name="user_id" value={u.id} />
                      <select
                        name="role"
                        defaultValue={u.role}
                        disabled={isSelf}
                        className={`rounded-lg px-2 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-60 ${inputClass}`}
                      >
                        {USER_ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                      <button type="submit" disabled={isSelf} className={btnPrimarySm}>
                        Save
                      </button>
                      {isSelf ? (
                        <span className="text-xs text-muted-foreground">Cannot edit your own role.</span>
                      ) : null}
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
