import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  createFileRoute,
  Link,
  useMatchRoute,
  useNavigate,
  Outlet,
} from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Layout from "../components/layout/Layout";
import MemberFormSheet from "../components/members/MemberFormSheet";
import {
  fetchMembers,
  createMember,
  updateMember,
  deleteMember,
  membersQueryKey,
  type MemberInsert,
  type MemberUpdate,
} from "../lib/api/members";
import type { Member } from "../lib/supabase";
import { toast } from "sonner";
import {
  Loader2,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  IdCard,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FileDown,
  FileSpreadsheet,
  UsersRound,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { exportMembersCSV, exportMembersExcel } from "../lib/exportMembers";
import { formatPhoneDisplay } from "../constants/countryCodes";

export const Route = createFileRoute("/members")({
  component: Members,
});

function getStatusStyles(status: string) {
  switch (status) {
    case "Active":
      return "bg-success/10 text-success";
    case "Inactive":
      return "bg-gray-100 text-gray-500";
    default:
      return "bg-gray-100 text-gray-500";
  }
}

function getStatusDotColor(status: string) {
  switch (status) {
    case "Active":
      return "bg-success";
    case "Inactive":
      return "bg-gray-400";
    default:
      return "bg-gray-400";
  }
}

function Members() {
  const navigate = useNavigate();
  const matchRoute = useMatchRoute();
  const queryClient = useQueryClient();
  const isMemberDetail = matchRoute({ to: "/members/$memberId", fuzzy: true });
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterIdCard, setFilterIdCard] = useState<
    "" | "created" | "not_created"
  >("");
  const [sheet, setSheet] = useState<"add" | "edit" | null>(null);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<
    "name" | "status" | "created_at" | "id_card_created"
  >("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [exportConfirm, setExportConfirm] = useState<"csv" | "excel" | null>(
    null,
  );
  const [createIdMemberId, setCreateIdMemberId] = useState<string | null>(null);
  const [createIdStep, setCreateIdStep] = useState<
    "confirm" | "navigate" | null
  >(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  const pageSizeOptions = [10, 25, 50, 100];

  const {
    data: members = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [...membersQueryKey, search],
    queryFn: () => fetchMembers(search),
  });

  useEffect(() => {
    setPage(1);
  }, [search, filterStatus, filterIdCard]);

  useEffect(() => {
    setPage((p) =>
      Math.min(p, Math.max(1, Math.ceil(members.length / pageSize))),
    );
  }, [members.length, pageSize]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        actionMenuRef.current &&
        !actionMenuRef.current.contains(e.target as Node)
      ) {
        setActionMenuOpen(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const sortedMembers = useMemo(() => {
    const list = [...members];
    const mult = sortOrder === "asc" ? 1 : -1;
    list.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "name") {
        cmp = (a.name ?? "").localeCompare(b.name ?? "");
      } else if (sortBy === "status") {
        cmp = (a.status ?? "").localeCompare(b.status ?? "");
      } else if (sortBy === "created_at") {
        cmp =
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sortBy === "id_card_created") {
        const ac = a.id_card_created ? 1 : 0;
        const bc = b.id_card_created ? 1 : 0;
        cmp = ac - bc;
      }
      return mult * cmp;
    });
    return list;
  }, [members, sortBy, sortOrder]);

  const filteredMembers = useMemo(() => {
    let list = sortedMembers;
    if (filterStatus) {
      list = list.filter((m) => (m.status ?? "") === filterStatus);
    }
    if (filterIdCard === "created") {
      list = list.filter((m) => m.id_card_created === true);
    } else if (filterIdCard === "not_created") {
      list = list.filter((m) => m.id_card_created !== true);
    }
    return list;
  }, [sortedMembers, filterStatus, filterIdCard]);

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const toggleSort = useCallback(
    (column: typeof sortBy) => {
      setSortBy(column);
      setSortOrder((o) => {
        if (sortBy === column) return o === "asc" ? "desc" : "asc";
        return column === "name" || column === "status" ? "asc" : "desc";
      });
      setPage(1);
    },
    [sortBy],
  );

  const createMutation = useMutation({
    mutationFn: (row: MemberInsert) => createMember(row),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: membersQueryKey });
      setSheet(null);
      setFormError(null);
      toast.success("Member added successfully");
    },
    onError: (err: Error) => {
      setFormError(err.message);
      toast.error(err.message || "Failed to add member");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, row }: { id: string; row: MemberUpdate }) =>
      updateMember(id, row),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: membersQueryKey });
      setSheet(null);
      setEditingMember(null);
      setFormError(null);
      toast.success("Member updated successfully");
    },
    onError: (err: Error) => {
      setFormError(err.message);
      toast.error(err.message || "Failed to update member");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: membersQueryKey });
      setDeleteConfirm(null);
      toast.success("Member removed successfully");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to remove member");
    },
  });

  const openEdit = (e: React.MouseEvent, m: Member) => {
    e.stopPropagation();
    setEditingMember(m);
    setSheet("edit");
    setFormError(null);
  };

  const openDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteConfirm(id);
  };

  const openCreateIdConfirm = (e: React.MouseEvent, memberId: string) => {
    e.stopPropagation();
    setCreateIdMemberId(memberId);
    setCreateIdStep("confirm");
  };

  const closeCreateIdFlow = () => {
    setCreateIdMemberId(null);
    setCreateIdStep(null);
  };

  const initials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const hasActiveFilters = !!filterStatus || !!filterIdCard;
  const idCardSortValue = filterIdCard;
  const handleIdCardSortChange = (value: string) =>
    setFilterIdCard(value as "" | "created" | "not_created");
  const filterLabel = hasActiveFilters
    ? [
        filterStatus && `Status: ${filterStatus}`,
        filterIdCard === "created" && "ID Card: Created",
        filterIdCard === "not_created" && "ID Card: Not created",
      ]
        .filter(Boolean)
        .join(", ")
    : "";

  const handleExportCSV = () => {
    if (filteredMembers.length === 0) {
      toast.info("No members to export.");
      return;
    }
    setExportConfirm("csv");
  };

  const handleExportExcel = () => {
    if (filteredMembers.length === 0) {
      toast.info("No members to export.");
      return;
    }
    setExportConfirm("excel");
  };

  const handleExportConfirm = () => {
    if (!exportConfirm) return;
    const count = filteredMembers.length;
    const format = exportConfirm === "csv" ? "CSV" : "Excel";
    try {
      if (exportConfirm === "csv") {
        exportMembersCSV(filteredMembers);
      } else {
        exportMembersExcel(filteredMembers);
      }
      setExportConfirm(null);
      toast.success(
        hasActiveFilters
          ? `Exported ${count} member(s) (filtered by ${filterLabel}) as ${format}`
          : `Exported ${count} member(s) as ${format}`,
      );
    } catch (e) {
      toast.error(`Failed to export ${format}.`);
      setExportConfirm(null);
    }
  };

  if (isMemberDetail) {
    return <Outlet />;
  }

  return (
    <Layout>
      <div className="w-full flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div className="shrink-0">
          <p className="text-text-secondary text-sm font-medium mb-1">
            Pages / Members
          </p>
          <h2 className="text-text-main text-2xl md:text-[34px] font-bold tracking-tight leading-tight">
            All Members
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-3 min-w-0 md:justify-end">
          {/* Desktop: search + Status All + Add in one flex; then ID Card, Clear, export */}
          <div className="hidden md:flex flex-wrap items-center gap-3 min-w-0">
            <div className="flex items-center gap-3 shrink-0">
              <div className="relative bg-surface-light h-11 flex items-center px-4 w-[400px] shrink-0">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-[18px]">
                  search
                </span>
                <input
                  className="block w-full pl-9 pr-4 py-0 h-full bg-transparent border-none text-base text-text-main placeholder-text-muted focus:ring-0"
                  placeholder="Search name, email..."
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-11 min-w-[120px] px-3 bg-surface-light border border-[#333] text-text-main text-sm rounded focus:outline-none focus:ring-2 focus:ring-primary/30"
                aria-label="Filter by status"
              >
                <option value="">Status: All</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <button
                type="button"
                onClick={() => {
                  setSheet("add");
                  setFormError(null);
                }}
                className="btn-primary flex items-center gap-2 shrink-0"
              >
                <span className="material-symbols-outlined text-[18px]">
                  add
                </span>
                Add Member
              </button>
            </div>
            <select
              value={idCardSortValue}
              onChange={(e) => handleIdCardSortChange(e.target.value)}
              className="h-11 min-w-[160px] px-3 bg-surface-light border border-[#333] text-text-main text-sm rounded focus:outline-none focus:ring-2 focus:ring-primary/30"
              aria-label="Filter by ID card (created / not created)"
            >
              <option value="">ID Card: All</option>
              <option value="created">ID Card: Created only</option>
              <option value="not_created">ID Card: Not created only</option>
            </select>
            {(filterStatus || filterIdCard) && (
              <>
                <span className="text-sm text-text-secondary">
                  Selected: {filterLabel}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setFilterStatus("");
                    setFilterIdCard("");
                  }}
                  className="h-11 px-3 text-sm font-medium text-text-main bg-surface-light border border-[#333] rounded hover:bg-surface-gray"
                >
                  Clear
                </button>
              </>
            )}
          </div>

          {/* Mobile: search bar + Add button only */}
          <div className="flex md:hidden items-stretch gap-3 w-full min-w-0">
            <div className="relative bg-surface-light h-11 flex items-center px-4 flex-1 min-w-0 rounded border border-[#333]">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-[18px]">
                search
              </span>
              <input
                className="block w-full pl-9 pr-4 py-0 h-full bg-transparent border-none text-base text-text-main placeholder-text-muted focus:ring-0"
                placeholder="Search name, email..."
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setSheet("add");
                setFormError(null);
              }}
              className="btn-primary h-11 w-11 min-w-11 flex items-center justify-center shrink-0 rounded border border-transparent"
              aria-label="Add Member"
            >
              <span className="material-symbols-outlined text-[22px]">add</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="hidden md:flex h-11 px-3 text-sm font-medium text-text-main bg-surface-light border border-[#333] rounded hover:bg-surface-gray items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
            title="Export as CSV"
          >
            <FileDown size={18} />
            CSV
          </button>
          <button
            type="button"
            onClick={handleExportExcel}
            className="hidden md:flex h-11 px-3 text-sm font-medium text-text-main bg-surface-light border border-[#333] rounded hover:bg-surface-gray items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
            title="Export as Excel"
          >
            <FileSpreadsheet size={18} />
            Excel
          </button>
        </div>
      </div>

      <section className="card flex-1 overflow-hidden p-0! w-full flex flex-col min-h-0">
        {/* Mobile card list - below md */}
        <div className="md:hidden flex flex-col w-full flex-1 min-h-0 overflow-hidden">
          <div className="shrink-0 py-3 px-4 bg-surface-gray border-b border-[#333]">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Members
            </h3>
          </div>
          <div className="flex-1 min-h-0 overflow-auto max-h-[70vh]">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <Loader2
                  size={40}
                  className="animate-spin text-text-muted shrink-0"
                  aria-hidden
                />
                <span className="text-sm font-medium text-text-secondary mt-3">
                  Loading…
                </span>
              </div>
            )}
            {isError && !isLoading && (
              <div className="py-12 text-center text-danger font-medium px-4">
                {(error as Error)?.message ?? "Failed to load members"}
              </div>
            )}
            {!isLoading && !isError && filteredMembers.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <UsersRound
                  size={64}
                  className="text-text-muted/60 mb-4"
                  strokeWidth={1.25}
                  aria-hidden
                />
                <h3 className="text-xl font-bold text-text-main mb-2">
                  No residents found
                </h3>
                <p className="text-sm text-text-secondary max-w-sm">
                  {search || filterStatus
                    ? "Try adjusting your search or filters to see more results."
                    : "Add your first member to get started."}
                </p>
              </div>
            )}
            {!isLoading && !isError && paginatedMembers.length > 0 && (
              <ul className="divide-y divide-[#333]">
                {paginatedMembers.map((member, index) => {
                  const rowNo = (currentPage - 1) * pageSize + index + 1;
                  return (
                    <li key={member.id} className="bg-surface-light">
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() =>
                          navigate({
                            to: "/members/$memberId",
                            params: { memberId: member.id },
                          })
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            navigate({
                              to: "/members/$memberId",
                              params: { memberId: member.id },
                            });
                          }
                        }}
                        className="flex items-center gap-3 p-4 min-h-[72px] active:bg-surface-gray transition-colors"
                      >
                        <span className="shrink-0 w-8 text-xs font-bold text-text-muted tabular-nums">
                          {rowNo}
                        </span>
                        <div className="shrink-0 h-12 w-12">
                          {member.avatar_url ? (
                            <img
                              alt=""
                              className="h-12 w-12 object-cover"
                              src={member.avatar_url}
                            />
                          ) : (
                            <div className="h-12 w-12 bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                              {initials(member.name)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-text-main truncate">
                            {member.name}
                          </div>
                          <div className="text-xs text-text-secondary truncate">
                            Unit {member.unit} • {member.member_type}
                          </div>
                          <span
                            className={`inline-flex items-center mt-1 text-xs font-bold px-2 py-0.5 ${getStatusStyles(member.status)}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 mr-1.5 ${getStatusDotColor(member.status)}`}
                            />
                            {member.status}
                          </span>
                        </div>
                        <div
                          className="flex items-center gap-2 shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {member.id_card_created ? (
                            <Link
                              to="/id-card-studio"
                              search={{ memberId: member.id }}
                              className="inline-flex items-center gap-1 px-2.5 py-2 min-h-[44px] text-sm font-semibold bg-success/10 text-success border border-success/30"
                            >
                              <Check size={14} strokeWidth={2.5} />
                              ID
                            </Link>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => openCreateIdConfirm(e, member.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-2 min-h-[44px] text-sm font-semibold bg-primary text-white hover:bg-primary-dark border border-primary"
                            >
                              Create
                            </button>
                          )}
                          <div
                            className="relative"
                            ref={
                              actionMenuOpen === member.id
                                ? actionMenuRef
                                : undefined
                            }
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActionMenuOpen((id) =>
                                  id === member.id ? null : member.id,
                                );
                              }}
                              className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-text-secondary hover:text-primary hover:bg-primary/10 rounded"
                              aria-label="Actions"
                              aria-expanded={actionMenuOpen === member.id}
                            >
                              <MoreVertical size={20} />
                            </button>
                            {actionMenuOpen === member.id && (
                              <div className="absolute right-0 top-full mt-1 z-20 min-w-[180px] py-1 bg-surface-light border border-[#333] shadow-lg rounded">
                                <button
                                  type="button"
                                  className="w-full px-4 py-3 min-h-[44px] text-left text-sm font-medium text-text-main hover:bg-surface-gray flex items-center gap-2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActionMenuOpen(null);
                                    navigate({
                                      to: "/members/$memberId",
                                      params: { memberId: member.id },
                                    });
                                  }}
                                >
                                  <Eye size={16} />
                                  View
                                </button>
                                <button
                                  type="button"
                                  className="w-full px-4 py-3 min-h-[44px] text-left text-sm font-medium text-text-main hover:bg-surface-gray flex items-center gap-2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActionMenuOpen(null);
                                    openEdit(e, member);
                                  }}
                                >
                                  <Pencil size={16} />
                                  Edit
                                </button>
                                <Link
                                  to="/id-card-studio"
                                  search={{ memberId: member.id }}
                                  className="w-full px-4 py-3 min-h-[44px] text-left text-sm font-medium text-text-main hover:bg-surface-gray flex items-center gap-2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActionMenuOpen(null);
                                  }}
                                >
                                  <IdCard size={16} />
                                  {member.id_card_created
                                    ? "View ID Card"
                                    : "Create ID Card"}
                                </Link>
                                <button
                                  type="button"
                                  className="w-full px-4 py-3 min-h-[44px] text-left text-sm font-medium text-danger hover:bg-danger/10 flex items-center gap-2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActionMenuOpen(null);
                                    openDelete(e, member.id);
                                  }}
                                >
                                  <Trash2 size={16} />
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Desktop table - md and up */}
        <div className="hidden md:block overflow-auto w-full scrollbar-hide max-h-[70vh]">
          <table className="w-full min-w-[900px] border-collapse">
            <thead className="sticky top-0 z-10 bg-surface-gray border-b-2 border-[#333]">
              <tr className="text-left">
                <th className="py-4 pl-4 pr-2 text-xs font-bold text-text-muted uppercase tracking-wider bg-surface-gray w-12">
                  No
                </th>
                <th
                  className="py-4 px-2 text-xs font-bold text-text-muted uppercase tracking-wider bg-surface-gray cursor-pointer hover:bg-surface-gray/80 select-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSort("name");
                  }}
                >
                  <span className="inline-flex items-center gap-1">
                    Name
                    {sortBy === "name" ? (
                      sortOrder === "asc" ? (
                        <ArrowUp size={14} />
                      ) : (
                        <ArrowDown size={14} />
                      )
                    ) : (
                      <ArrowUpDown size={14} className="opacity-50" />
                    )}
                  </span>
                </th>
                <th className="py-4 px-2 text-xs font-bold text-text-muted uppercase tracking-wider bg-surface-gray">
                  Unit
                </th>
                <th className="py-4 px-2 text-xs font-bold text-text-muted uppercase tracking-wider bg-surface-gray">
                  Type
                </th>
                <th
                  className="py-4 px-2 text-xs font-bold text-text-muted uppercase tracking-wider bg-surface-gray cursor-pointer hover:bg-surface-gray/80 select-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSort("status");
                  }}
                >
                  <span className="inline-flex items-center gap-1">
                    Status
                    {sortBy === "status" ? (
                      sortOrder === "asc" ? (
                        <ArrowUp size={14} />
                      ) : (
                        <ArrowDown size={14} />
                      )
                    ) : (
                      <ArrowUpDown size={14} className="opacity-50" />
                    )}
                  </span>
                </th>
                <th className="py-4 px-2 text-xs font-bold text-text-muted uppercase tracking-wider bg-surface-gray">
                  Mobile
                </th>
                <th
                  className="py-4 px-2 text-xs font-bold text-text-muted uppercase tracking-wider bg-surface-gray cursor-pointer hover:bg-surface-gray/80 select-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSort("created_at");
                  }}
                >
                  <span className="inline-flex items-center gap-1">
                    Created
                    {sortBy === "created_at" ? (
                      sortOrder === "asc" ? (
                        <ArrowUp size={14} />
                      ) : (
                        <ArrowDown size={14} />
                      )
                    ) : (
                      <ArrowUpDown size={14} className="opacity-50" />
                    )}
                  </span>
                </th>
                <th
                  className="py-4 px-2 text-xs font-bold text-text-muted uppercase tracking-wider bg-surface-gray cursor-pointer hover:bg-surface-gray/80 select-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSort("id_card_created");
                  }}
                >
                  <span className="inline-flex items-center gap-1">
                    ID Card
                    {sortBy === "id_card_created" ? (
                      sortOrder === "asc" ? (
                        <ArrowUp size={14} />
                      ) : (
                        <ArrowDown size={14} />
                      )
                    ) : (
                      <ArrowUpDown size={14} className="opacity-50" />
                    )}
                  </span>
                </th>
                <th className="py-4 pr-4 pl-2 bg-surface-gray w-28 text-xs font-bold text-text-muted uppercase tracking-wider text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333] bg-surface-light">
              {isLoading && (
                <tr>
                  <td colSpan={9} className="p-0">
                    <div className="flex flex-col items-center justify-center py-16 px-4">
                      <Loader2
                        size={40}
                        className="animate-spin text-text-muted shrink-0"
                        aria-hidden
                      />
                      <span className="text-sm font-medium text-text-secondary mt-3">
                        Loading…
                      </span>
                    </div>
                  </td>
                </tr>
              )}
              {isError && !isLoading && (
                <tr>
                  <td
                    colSpan={9}
                    className="py-12 text-center text-danger font-medium"
                  >
                    {(error as Error)?.message ?? "Failed to load members"}
                  </td>
                </tr>
              )}
              {!isLoading && !isError && filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-0">
                    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                      <UsersRound
                        size={64}
                        className="text-text-muted/60 mb-4"
                        strokeWidth={1.25}
                        aria-hidden
                      />
                      <h3 className="text-xl font-bold text-text-main mb-2">
                        No residents found
                      </h3>
                      <p className="text-sm text-text-secondary max-w-sm">
                        {search || filterStatus
                          ? "Try adjusting your search or filters to see more results."
                          : "Add your first member to get started."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
              {!isLoading &&
                !isError &&
                paginatedMembers.map((member, index) => (
                  <tr
                    key={member.id}
                    className="group hover:bg-surface-gray transition-colors cursor-pointer"
                    onClick={() =>
                      navigate({
                        to: "/members/$memberId",
                        params: { memberId: member.id },
                      })
                    }
                  >
                    <td className="py-3 pl-4 pr-2 whitespace-nowrap text-sm font-medium text-text-secondary tabular-nums">
                      {(currentPage - 1) * pageSize + index + 1}
                    </td>
                    <td className="py-3 px-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {member.avatar_url ? (
                            <img
                              alt=""
                              className="h-10 w-10 object-cover"
                              src={member.avatar_url}
                            />
                          ) : (
                            <div className="h-10 w-10 bg-primary/10 flex items-center justify-center text-primary font-bold">
                              {initials(member.name)}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-text-main">
                            {member.name}
                          </div>
                          <div className="text-xs text-text-secondary">
                            {member.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 whitespace-nowrap">
                      <div className="text-sm font-bold text-text-main">
                        {member.unit}
                      </div>
                      <div className="text-xs text-text-secondary">
                        {member.building}
                      </div>
                    </td>
                    <td className="py-3 px-2 whitespace-nowrap">
                      <span className="text-sm font-medium text-text-main">
                        {member.member_type}
                      </span>
                    </td>
                    <td className="py-3 px-2 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex items-center text-xs font-bold ${getStatusStyles(member.status)}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 mr-2 ${getStatusDotColor(member.status)}`}
                        />
                        {member.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 whitespace-nowrap text-sm font-medium text-text-main">
                      {formatPhoneDisplay(
                        member.phone_country_code,
                        member.phone,
                      )}
                    </td>
                    <td className="py-3 px-2 whitespace-nowrap text-sm text-text-secondary">
                      {member.created_at
                        ? new Date(member.created_at).toLocaleDateString()
                        : "—"}
                    </td>
                    <td
                      className="py-3 px-2 whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {member.id_card_created ? (
                        <Link
                          to="/id-card-studio"
                          search={{ memberId: member.id }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-semibold bg-success/10 text-success border border-success/30"
                        >
                          <Check size={16} strokeWidth={2.5} />
                          Created
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => openCreateIdConfirm(e, member.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-semibold bg-primary text-white hover:bg-primary-dark border border-primary"
                        >
                          Create
                        </button>
                      )}
                    </td>
                    <td
                      className="py-3 pr-4 pl-2 whitespace-nowrap text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div
                        className="relative inline-block"
                        ref={
                          actionMenuOpen === member.id
                            ? actionMenuRef
                            : undefined
                        }
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActionMenuOpen((id) =>
                              id === member.id ? null : member.id,
                            );
                          }}
                          className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-text-secondary hover:text-primary hover:bg-primary/10 rounded"
                          aria-label="Actions"
                          aria-expanded={actionMenuOpen === member.id}
                        >
                          <MoreVertical size={20} />
                        </button>
                        {actionMenuOpen === member.id && (
                          <div className="absolute right-0 top-full mt-1 z-20 min-w-[180px] py-1 bg-surface-light border border-[#333] shadow-lg rounded">
                            <button
                              type="button"
                              className="w-full px-4 py-2.5 text-left text-sm font-medium text-text-main hover:bg-surface-gray flex items-center gap-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActionMenuOpen(null);
                                navigate({
                                  to: "/members/$memberId",
                                  params: { memberId: member.id },
                                });
                              }}
                            >
                              <Eye size={16} />
                              View
                            </button>
                            <button
                              type="button"
                              className="w-full px-4 py-2.5 text-left text-sm font-medium text-text-main hover:bg-surface-gray flex items-center gap-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActionMenuOpen(null);
                                openEdit(e, member);
                              }}
                            >
                              <Pencil size={16} />
                              Edit
                            </button>
                            <Link
                              to="/id-card-studio"
                              search={{ memberId: member.id }}
                              className="w-full px-4 py-2.5 text-left text-sm font-medium text-text-main hover:bg-surface-gray flex items-center gap-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActionMenuOpen(null);
                              }}
                            >
                              <IdCard size={16} />
                              {member.id_card_created
                                ? "View ID Card"
                                : "Create ID Card"}
                            </Link>
                            <button
                              type="button"
                              className="w-full px-4 py-2.5 text-left text-sm font-medium text-danger hover:bg-danger/10 flex items-center gap-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActionMenuOpen(null);
                                openDelete(e, member.id);
                              }}
                            >
                              <Trash2 size={16} />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {!isLoading && !isError && members.length > 0 && (
          <div className="mt-auto shrink-0 w-full py-4 px-4 flex flex-wrap items-center justify-center md:justify-between gap-4 border-t border-[#333] bg-white">
            <div className="hidden md:flex flex-wrap items-center gap-4 sm:gap-6">
              <p className="text-sm text-text-secondary">
                Showing{" "}
                <span className="font-semibold text-text-main">
                  {(currentPage - 1) * pageSize + 1}–
                  {Math.min(currentPage * pageSize, filteredMembers.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-text-main">
                  {filteredMembers.length}
                </span>{" "}
                result{filteredMembers.length !== 1 ? "s" : ""}
              </p>
              <label className="flex items-center gap-2 text-sm text-text-secondary">
                <span>Rows per page</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="h-9 min-w-16 pl-3 pr-8 bg-surface-light border border-[#333] text-text-main text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 0.5rem center",
                  }}
                >
                  {pageSizeOptions.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="inline-flex items-center gap-1.5 h-9 px-3 text-sm font-medium rounded-md border border-[#333] bg-surface-light text-text-main hover:bg-surface-gray hover:border-[#333] disabled:opacity-50 disabled:pointer-events-none disabled:bg-surface-gray/50 disabled:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-1"
                aria-label="Previous page"
              >
                <ChevronLeft size={18} />
                Previous
              </button>
              <span className="min-w-28 text-center text-sm text-text-secondary px-3 py-2">
                Page{" "}
                <span className="font-semibold text-text-main">
                  {currentPage}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-text-main">
                  {totalPages}
                </span>
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="inline-flex items-center gap-1.5 h-9 px-3 text-sm font-medium rounded-md border border-[#333] bg-surface-light text-text-main hover:bg-surface-gray hover:border-[#333] disabled:opacity-50 disabled:pointer-events-none disabled:bg-surface-gray/50 disabled:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-1"
                aria-label="Next page"
              >
                Next
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </section>

      {sheet === "add" && (
        <MemberFormSheet
          mode="create"
          onClose={() => {
            setSheet(null);
            setFormError(null);
          }}
          onSubmit={async (data) => {
            await createMutation.mutateAsync(data as MemberInsert);
          }}
          error={formError}
        />
      )}
      {sheet === "edit" && editingMember && (
        <MemberFormSheet
          mode="edit"
          member={editingMember}
          onClose={() => {
            setSheet(null);
            setEditingMember(null);
            setFormError(null);
          }}
          onSubmit={async (data) => {
            await updateMutation.mutateAsync({
              id: editingMember.id,
              row: data as MemberUpdate,
            });
          }}
          error={formError}
        />
      )}

      {deleteConfirm && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="bg-surface-light shadow-xl max-w-sm w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-text-main font-medium text-base mb-4">
              Remove this resident? This will also delete their vehicles,
              payments, and documents.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="btn-secondary flex-1 min-h-[44px] text-base"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => deleteMutation.mutate(deleteConfirm)}
                disabled={deleteMutation.isPending}
                className="flex-1 min-h-[44px] bg-danger text-white font-bold text-base disabled:opacity-50 hover:bg-red-800 flex items-center justify-center gap-2"
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 size={18} className="animate-spin shrink-0" />
                    Removing...
                  </>
                ) : (
                  "Remove"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {createIdMemberId && createIdStep === "confirm" && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
          onClick={closeCreateIdFlow}
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-id-dialog-title"
        >
          <div
            className="bg-surface-light shadow-xl max-w-sm w-full p-6 rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <p
              id="create-id-dialog-title"
              className="text-text-main font-medium text-base mb-4"
            >
              Create ID card for this member? You will set it up in the ID Card
              Studio.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={closeCreateIdFlow}
                className="btn-secondary flex-1 min-h-[44px] text-base"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  navigate({
                    to: "/id-card-studio",
                    search: { memberId: createIdMemberId },
                  });
                  closeCreateIdFlow();
                }}
                className="flex-1 min-h-[44px] bg-primary text-white font-bold text-base hover:bg-primary-dark flex items-center justify-center gap-2"
              >
               Card Studio
              </button>
            </div>
          </div>
        </div>
      )}

      {exportConfirm && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
          onClick={() => setExportConfirm(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="export-confirm-title"
        >
          <div
            className="bg-surface-light shadow-xl max-w-sm w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <p
              id="export-confirm-title"
              className="text-text-main font-medium text-base mb-4"
            >
              Export {filteredMembers.length} member(s) as{" "}
              {exportConfirm === "csv" ? "CSV" : "Excel"}?
              {hasActiveFilters && (
                <span className="block mt-1 text-sm text-text-secondary font-normal">
                  Filtered by: {filterLabel}
                </span>
              )}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setExportConfirm(null)}
                className="btn-secondary flex-1 min-h-[44px] text-base"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExportConfirm}
                className="flex-1 min-h-[44px] bg-primary text-white font-bold text-base hover:bg-primary-dark flex items-center justify-center gap-2"
              >
                Export {exportConfirm === "csv" ? "CSV" : "Excel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
