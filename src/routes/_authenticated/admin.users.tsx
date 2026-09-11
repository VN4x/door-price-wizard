import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import type { AppRole, AccountStatus } from "@/lib/account.functions";
import {
  listUsers,
  rejectStaffRequest,
  setUserRole,
  setUserStatus,
  type StaffUser,
} from "@/lib/admin.functions";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/admin/users")({
  head: () => ({
    meta: [
      { title: "Users | Kvaliteetaken" },
      { name: "description", content: "Approve staff access and manage who may do what." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: UsersPage,
});

const ROLE_LABEL: Record<AppRole, string> = {
  owner: "Owner",
  sales: "Sales",
  production: "Production",
  customer: "Customer",
};

const STATUS_LABEL: Record<AccountStatus, string> = {
  active: "Active",
  pending: "Pending",
  disabled: "Switched off",
};

function UsersPage() {
  const { account } = useAuth();
  const qc = useQueryClient();
  const fetchUsers = useServerFn(listUsers);
  const changeRole = useServerFn(setUserRole);
  const changeStatus = useServerFn(setUserStatus);
  const reject = useServerFn(rejectStaffRequest);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => fetchUsers(),
    enabled: Boolean(account?.isOwner),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-users"] });
  const roleMutation = useMutation({
    mutationFn: (v: { userId: string; role: AppRole }) => changeRole({ data: v }),
    onSuccess: invalidate,
  });
  const statusMutation = useMutation({
    mutationFn: (v: { userId: string; status: AccountStatus }) => changeStatus({ data: v }),
    onSuccess: invalidate,
  });
  const rejectMutation = useMutation({
    mutationFn: (v: { userId: string }) => reject({ data: v }),
    onSuccess: invalidate,
  });

  const busy = roleMutation.isPending || statusMutation.isPending || rejectMutation.isPending;
  const problem =
    roleMutation.error ?? statusMutation.error ?? rejectMutation.error ?? (error as Error | null);

  if (!account?.isOwner) {
    return (
      <p className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
        Only the owner can see this page.
      </p>
    );
  }

  const users = data ?? [];
  const pending = users.filter((u) => u.staffRequested);

  return (
    <div className="grid gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Approve who may work in the internal screens and what they may do.
        </p>
      </header>

      {problem && <p className="text-sm text-destructive">{problem.message}</p>}

      {pending.length > 0 && (
        <section className="rounded-2xl border border-accent/40 bg-accent/5 p-5">
          <h2 className="text-sm font-semibold text-foreground">
            Waiting for approval ({pending.length})
          </h2>
          <ul className="mt-3 grid gap-3">
            {pending.map((u) => (
              <li
                key={u.id}
                className="flex flex-wrap items-center gap-3 rounded-xl bg-card p-3 shadow-sm"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {u.fullName || u.email}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">{u.email}</span>
                </span>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => roleMutation.mutate({ userId: u.id, role: "sales" })}
                  className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-60"
                >
                  Approve as sales
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => roleMutation.mutate({ userId: u.id, role: "production" })}
                  className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-secondary disabled:opacity-60"
                >
                  Approve as production
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => rejectMutation.mutate({ userId: u.id })}
                  className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-secondary disabled:opacity-60"
                >
                  Turn down
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="overflow-x-auto rounded-2xl border border-border bg-card">
        {isLoading ? (
          <p className="p-6 text-sm text-muted-foreground">Loading…</p>
        ) : (
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Person</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {users.map((u: StaffUser) => (
                <tr key={u.id} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-3">
                    <span className="block font-medium text-foreground">
                      {u.fullName || u.email}
                    </span>
                    <span className="block text-xs text-muted-foreground">{u.email}</span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.roles[0] ?? "customer"}
                      disabled={busy}
                      onChange={(e) =>
                        roleMutation.mutate({ userId: u.id, role: e.target.value as AppRole })
                      }
                      className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm"
                    >
                      {(Object.keys(ROLE_LABEL) as AppRole[]).map((r) => (
                        <option key={r} value={r}>
                          {ROLE_LABEL[r]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {STATUS_LABEL[u.status]}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{u.createdAt.slice(0, 10)}</td>
                  <td className="px-4 py-3 text-right">
                    {u.id !== account.id && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          statusMutation.mutate({
                            userId: u.id,
                            status: u.status === "active" ? "disabled" : "active",
                          })
                        }
                        className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary disabled:opacity-60"
                      >
                        {u.status === "active" ? "Switch off" : "Switch on"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
