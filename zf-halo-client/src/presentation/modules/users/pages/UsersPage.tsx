import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Search, Shield, Mail, Eye, Pencil } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

import { Role } from "@/domain/auth/models/user.model";
import { adminApi } from "@/infrastructure/http/admin.api";
import { useAuthStore } from "@/application/auth/auth.store";
import { useDebounce } from "use-debounce";
import { cn } from "@/lib/utils";

export default function UsersPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const isAdmin = currentUser?.role === Role.ADMIN;

  const [debouncedSearch] = useDebounce(search, 500);

  const { data: result, isLoading: loading } = useQuery({
    queryKey: ["users", currentPage, itemsPerPage, debouncedSearch],
    queryFn: () =>
      adminApi.getUsers({ page: currentPage, limit: itemsPerPage }),
  });

  const users = useMemo(() => {
    if (!result?.items) return [];
    if (!debouncedSearch) return result.items;

    return result.items.filter((u) =>
      `${u.firstName} ${u.lastName} ${u.email}`
        .toLowerCase()
        .includes(debouncedSearch.toLowerCase()),
    );
  }, [result, debouncedSearch]);

  const totalPages = result?.pages || 1;
  const totalItems = result?.total || 0;

  if (currentPage > totalPages && totalPages > 0 && currentPage !== 1) {
    setCurrentPage(1);
  }

  const roleBadgeColor: Record<string, string> = {
    [Role.ADMIN]: "bg-red-500/15 text-red-500 ring-red-500/20",
    [Role.MANAGER]: "bg-amber-500/15 text-amber-500 ring-amber-500/20",
    [Role.AUDITOR]: "bg-purple-500/15 text-purple-500 ring-purple-500/20",
    [Role.USER]: "bg-blue-500/15 text-blue-500 ring-blue-500/20",
  };

  return (
    <div className="container max-w-6xl px-4 py-8 md:py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-blue-500/20 ring-1 ring-primary/20 shadow-lg shadow-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Active Team</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage {totalItems} registered members across the platform
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80 shadow-sm">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 w-full rounded-xl border border-border/50 bg-white/[0.03] pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground backdrop-blur-md transition-all focus:border-primary/50 focus:bg-white/[0.05] focus:outline-none focus:ring-4 focus:ring-primary/10"
          />
        </div>
      </motion.div>

      {/* Loading */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 opacity-70">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent mb-4 shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
          <p className="text-sm font-medium animate-pulse text-muted-foreground">
            Loading members...
          </p>
        </div>
      ) : (
        <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl overflow-hidden">
          {/* Subtly Decorative Gradient Background inside the container */}
          <div className="pointer-events-none absolute -inset-px opacity-50 transition-opacity duration-300">
            <div className="absolute -left-1/4 -top-1/4 h-1/2 w-1/2 bg-gradient-to-br from-primary/10 to-transparent blur-[100px]" />
            <div className="absolute -bottom-1/4 -right-1/4 h-1/2 w-1/2 bg-gradient-to-tl from-blue-500/10 to-transparent blur-[100px]" />
          </div>

          <div className="relative z-10 w-full overflow-x-auto min-h-[400px]">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="border-b border-border/50 bg-white/[0.02] uppercase text-xs font-semibold tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-6 py-5">User</th>
                  <th className="px-6 py-5 hidden md:table-cell">Identity</th>
                  <th className="px-6 py-5">Role</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                <AnimatePresence>
                  {users.length === 0 ? (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <td colSpan={5} className="py-24 text-center">
                        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/[0.05] mb-4">
                          <Users className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground">
                          No matches found
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Try adjusting your search terms.
                        </p>
                      </td>
                    </motion.tr>
                  ) : null}

                  {users.map((user, i) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{
                        duration: 0.2,
                        delay: Math.min(i, 15) * 0.03,
                      }}
                      className="group transition-colors hover:bg-white/[0.04]"
                    >
                      {/* Name & Avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-blue-500/10 text-sm font-bold text-primary ring-1 ring-primary/20 shadow-inner">
                            {user.firstName.charAt(0)}
                            {user.lastName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {user.firstName} {user.lastName}
                            </div>
                            {/* Make email show on mobile only in this column */}
                            <div className="md:hidden text-xs text-muted-foreground mt-0.5">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Explicit Email Column (Desktop) */}
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground/80 transition-colors">
                          <Mail className="h-4 w-4 shrink-0 opacity-70" />
                          <span className="truncate max-w-[200px]">
                            {user.email}
                          </span>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 shadow-sm",
                            roleBadgeColor[user.role] ??
                              roleBadgeColor[Role.USER],
                          )}
                        >
                          <Shield className="h-3 w-3" />
                          {user.role}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-2.5 w-2.5">
                            {user.isActive && (
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40"></span>
                            )}
                            <span
                              className={cn(
                                "relative inline-flex rounded-full h-2.5 w-2.5",
                                user.isActive ? "bg-emerald-500" : "bg-red-500",
                              )}
                            ></span>
                          </span>
                          <span
                            className={cn(
                              "text-sm font-medium",
                              user.isActive
                                ? "text-emerald-500"
                                : "text-red-500",
                            )}
                          >
                            {user.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() =>
                              void navigate({ to: `/users/${user.id}` })
                            }
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-white/[0.05] text-muted-foreground transition-all hover:bg-white/[0.1] hover:text-foreground focus:outline-none focus:ring-2 focus:ring-white/[0.2]"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {isAdmin ? (
                            <button
                              onClick={() =>
                                void navigate({ to: `/users/${user.id}/edit` })
                              }
                              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-primary/10 text-primary transition-all hover:bg-primary/20 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/40"
                              title="Edit User"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border/30 bg-white/[0.01] px-6 py-4">
              <span className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-medium text-foreground">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium text-foreground">
                  {Math.min(currentPage * itemsPerPage, totalItems)}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground">
                  {totalItems}
                </span>{" "}
                results
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex h-8 cursor-pointer items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 text-sm font-medium text-foreground transition-colors hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={cn(
                          "flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-sm font-medium transition-colors",
                          currentPage === page
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-white/[0.08] hover:text-foreground",
                        )}
                      >
                        {page}
                      </button>
                    ),
                  )}
                </div>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="flex h-8 cursor-pointer items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 text-sm font-medium text-foreground transition-colors hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
