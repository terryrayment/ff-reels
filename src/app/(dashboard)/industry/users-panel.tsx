"use client";

import { useState } from "react";
import { Mail, RotateCcw, Trash2, ChevronDown } from "lucide-react";

interface TeamUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
  directorName?: string | null;
  status: string;
  invitePending: boolean;
  inviteExpired: boolean;
  createdAt: string;
}

interface DirectorOption {
  id: string;
  name: string;
}

const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Admin" },
  { value: "PRODUCER", label: "Producer" },
  { value: "REP", label: "Sales Rep" },
  { value: "DIRECTOR", label: "Director" },
];

function getRoleLabel(role: string): string {
  switch (role) {
    case "ADMIN": return "Admin";
    case "PRODUCER": return "Producer";
    case "REP": return "Sales Rep";
    case "DIRECTOR": return "Director";
    default: return role;
  }
}

function getRoleColor(role: string): string {
  switch (role) {
    case "ADMIN": return "bg-violet-50 text-violet-600";
    case "PRODUCER": return "bg-blue-50 text-blue-600";
    case "REP": return "bg-amber-50 text-amber-600";
    case "DIRECTOR": return "bg-emerald-50 text-emerald-600";
    default: return "bg-gray-50 text-gray-600";
  }
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function UsersPanel({ initialUsers, currentUserId, directors = [] }: { initialUsers: TeamUser[]; currentUserId: string; directors?: DirectorOption[] }) {
  const [users, setUsers] = useState<TeamUser[]>(initialUsers);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [search, setSearch] = useState("");

  // Invite form state
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("REP");
  const [inviteDirectorId, setInviteDirectorId] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  // Action loading states
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [changingRoleId, setChangingRoleId] = useState<string | null>(null);

  const filteredUsers = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      getRoleLabel(u.role).toLowerCase().includes(q)
    );
  });

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError(null);
    setInviteSuccess(null);
    setInviteLoading(true);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: inviteName,
          email: inviteEmail,
          role: inviteRole,
          ...(inviteRole === "DIRECTOR" && inviteDirectorId ? { directorId: inviteDirectorId } : {}),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setInviteError(data.error || "Failed to invite user");
        setInviteLoading(false);
        return;
      }

      setUsers((prev) => [data, ...prev]);

      if (data.emailSent === false && data.emailError) {
        setInviteError(`User created but email failed: ${data.emailError}`);
      } else if (data.emailSent === false) {
        setInviteError("User created but invite email could not be sent. Try resending.");
      } else {
        setInviteSuccess(`Invite sent to ${inviteEmail}`);
        setTimeout(() => {
          setInviteSuccess(null);
          setShowInviteForm(false);
        }, 2000);
      }

      setInviteName("");
      setInviteEmail("");
      setInviteRole("REP");
      setInviteDirectorId("");
      setInviteLoading(false);
    } catch {
      setInviteError("Something went wrong");
      setInviteLoading(false);
    }
  };

  const handleResendInvite = async (userId: string) => {
    setResendingId(userId);
    try {
      const res = await fetch("/api/users/resend-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        // Update the user to reflect fresh invite
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId
              ? { ...u, invitePending: true, inviteExpired: false }
              : u
          )
        );
      }
    } catch {
      // Silent fail
    }
    setResendingId(null);
  };

  const handleRemove = async (userId: string) => {
    if (!confirm("Remove this team member? This cannot be undone.")) return;
    setRemovingId(userId);
    try {
      const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      }
    } catch {
      // Silent fail
    }
    setRemovingId(null);
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    setChangingRoleId(userId);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch {
      // Silent fail
    }
    setChangingRoleId(null);
  };

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-[12px] text-[#999]">
          {users.length} team member{users.length !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-3">
          {/* Search */}
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1.5 text-[12px] rounded-lg border border-[#E8E7E3]/80 bg-white/60 placeholder:text-[#ccc] focus:outline-none focus:border-[#1A1A1A]/20 transition-colors w-[180px]"
          />
          <button
            onClick={() => { setShowInviteForm(!showInviteForm); setInviteError(null); setInviteSuccess(null); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-medium transition-all ${
              showInviteForm
                ? "bg-[#1A1A1A] text-white"
                : "bg-[#1A1A1A] text-white hover:bg-[#333]"
            }`}
          >
            <Mail size={12} />
            Invite
          </button>
        </div>
      </div>

      {/* Invite form */}
      {showInviteForm && (
        <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-[#E8E7E3]/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 mb-6">
          <form onSubmit={handleInvite}>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] text-[#999] uppercase tracking-[0.12em] mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="Jane Smith"
                  className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#E8E7E3]/80 bg-white/60 placeholder:text-[#ccc] focus:outline-none focus:border-[#1A1A1A]/20 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] text-[#999] uppercase tracking-[0.12em] mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="jane@example.com"
                  className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#E8E7E3]/80 bg-white/60 placeholder:text-[#ccc] focus:outline-none focus:border-[#1A1A1A]/20 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] text-[#999] uppercase tracking-[0.12em] mb-1.5">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => { setInviteRole(e.target.value); if (e.target.value !== "DIRECTOR") setInviteDirectorId(""); }}
                  className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#E8E7E3]/80 bg-white/60 focus:outline-none focus:border-[#1A1A1A]/20 transition-colors"
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Director selector — shown when DIRECTOR role is selected */}
            {inviteRole === "DIRECTOR" && (
              <div className="mt-4">
                <label className="block text-[10px] text-[#999] uppercase tracking-[0.12em] mb-1.5">
                  Link to Director Profile
                </label>
                <select
                  value={inviteDirectorId}
                  onChange={(e) => setInviteDirectorId(e.target.value)}
                  required
                  className="w-full max-w-sm px-3 py-2 text-[13px] rounded-lg border border-[#E8E7E3]/80 bg-white/60 focus:outline-none focus:border-[#1A1A1A]/20 transition-colors"
                >
                  <option value="">Select a director...</option>
                  {directors.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center gap-3 mt-4">
              <button
                type="submit"
                disabled={inviteLoading}
                className="px-5 py-2 bg-[#1A1A1A] text-white text-[12px] font-medium rounded-lg hover:bg-[#333] transition-colors disabled:opacity-30"
              >
                {inviteLoading ? "Sending..." : "Send Invite"}
              </button>
              {inviteError && (
                <p className="text-[12px] text-[#C44]">{inviteError}</p>
              )}
              {inviteSuccess && (
                <p className="text-[12px] text-emerald-600">{inviteSuccess}</p>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Users list */}
      <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-[#E8E7E3]/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-[13px] text-[#999]">
              {search ? "No matching team members" : "No team members yet. Invite someone to get started."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#F0F0EC]">
            {filteredUsers.map((user) => {
              const isSelf = user.id === currentUserId;

              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between px-6 py-4 hover:bg-white/40 transition-colors"
                >
                  {/* User info */}
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Avatar circle */}
                    <div className="w-9 h-9 rounded-full bg-[#F0EFE9] flex items-center justify-center flex-shrink-0">
                      <span className="text-[12px] font-medium text-[#999]">
                        {(user.name || user.email).charAt(0).toUpperCase()}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] text-[#1A1A1A] font-medium truncate">
                          {user.name || user.email}
                        </p>
                        {isSelf && (
                          <span className="text-[9px] text-[#bbb] uppercase tracking-wider">You</span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#999] truncate">
                        {user.email}
                        {user.role === "DIRECTOR" && user.directorName && (
                          <span className="text-[10px] text-emerald-500/70 ml-1.5">{user.directorName}</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Role + Status + Actions */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {/* Role badge / dropdown */}
                    {isSelf ? (
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium ${getRoleColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    ) : (
                      <div className="relative">
                        <select
                          value={user.role}
                          onChange={(e) => handleChangeRole(user.id, e.target.value)}
                          disabled={changingRoleId === user.id}
                          className={`appearance-none cursor-pointer inline-flex items-center pl-2.5 pr-6 py-1 rounded-full text-[10px] font-medium border-0 focus:outline-none ${getRoleColor(user.role)}`}
                        >
                          {ROLE_OPTIONS.map((r) => (
                            <option key={r.value} value={r.value}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={8} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" />
                      </div>
                    )}

                    {/* Status */}
                    {user.invitePending ? (
                      <span className={`text-[10px] uppercase tracking-wider ${user.inviteExpired ? "text-red-400" : "text-amber-500"}`}>
                        {user.inviteExpired ? "Expired" : "Invited"}
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase tracking-wider text-emerald-500">
                        Active
                      </span>
                    )}

                    {/* Joined date */}
                    <span className="text-[10px] text-[#ccc] w-16 text-right">
                      {timeAgo(user.createdAt)}
                    </span>

                    {/* Actions */}
                    {!isSelf && (
                      <div className="flex items-center gap-1 ml-2">
                        {user.invitePending && (
                          <button
                            onClick={() => handleResendInvite(user.id)}
                            disabled={resendingId === user.id}
                            className="p-1.5 rounded-lg hover:bg-[#F0EFE9] transition-colors text-[#bbb] hover:text-[#666]"
                            title="Resend invite"
                          >
                            <RotateCcw size={12} className={resendingId === user.id ? "animate-spin" : ""} />
                          </button>
                        )}
                        <button
                          onClick={() => handleRemove(user.id)}
                          disabled={removingId === user.id}
                          className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-[#ccc] hover:text-red-400"
                          title="Remove"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
