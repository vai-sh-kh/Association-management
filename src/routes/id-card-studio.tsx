import { useState, useMemo, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import Layout from "../components/layout/Layout";
import {
  fetchMemberById,
  fetchMembers,
  memberQueryKey,
  membersQueryKey,
} from "../lib/api/members";
import type { Member } from "../lib/supabase";
import { Check, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/id-card-studio")({
  component: IDCardStudio,
  validateSearch: (search: Record<string, unknown>): { memberId?: string } => ({
    memberId: typeof search.memberId === "string" ? search.memberId : undefined,
  }),
});

type SortField = "name" | "created_at";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getStatusStyles(status: string) {
  switch (status) {
    case "Active":
      return "bg-success/10 text-success";
    case "Inactive":
      return "bg-surface-gray text-text-secondary";
    default:
      return "bg-surface-gray text-text-secondary";
  }
}

const PAGE_SIZE = 8;

function MemberSelectorSection({
  members,
  selectedMemberId,
  search,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderChange,
  page,
  totalCount,
  onPageChange,
  sectionTitle,
}: {
  members: Member[];
  selectedMemberId: string | undefined;
  search: string;
  onSearchChange: (v: string) => void;
  filterStatus: string;
  onFilterStatusChange: (v: string) => void;
  sortBy: SortField;
  sortOrder: "asc" | "desc";
  onSortByChange: (v: SortField) => void;
  onSortOrderChange: (v: "asc" | "desc") => void;
  page: number;
  totalCount: number;
  onPageChange: (p: number) => void;
  sectionTitle?: string;
}) {
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, totalCount);
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <div className="flex flex-col gap-4 flex-1 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        {sectionTitle ? (
          <h3 className="text-text-main font-bold text-lg shrink-0">
            {sectionTitle}
          </h3>
        ) : null}
        <div className="flex flex-wrap items-center justify-end gap-3 min-w-0 flex-1">
          <div className="relative bg-white border border-gray-200 h-11 flex items-center px-4 w-full min-w-[200px] max-w-[280px] sm:max-w-[320px]">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-[18px]">
              search
            </span>
            <input
              className="block w-full pl-9 pr-4 py-0 h-full bg-transparent border-none text-base text-text-main placeholder-text-muted focus:ring-0"
              placeholder="Search name, email..."
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => onFilterStatusChange(e.target.value)}
              className="h-11 min-w-[120px] pl-3 pr-8 bg-white border border-gray-200 text-text-main text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 appearance-none cursor-pointer"
              aria-label="Filter by status"
            >
              <option value="">Status: All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <span className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-text-muted text-[18px]">
              expand_more
            </span>
          </div>
          <div className="relative">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split("-") as [
                  SortField,
                  "asc" | "desc",
                ];
                onSortByChange(field);
                onSortOrderChange(order);
              }}
              className="h-11 min-w-[160px] pl-3 pr-8 bg-white border border-gray-200 text-text-main text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 appearance-none cursor-pointer"
              aria-label="Sort"
            >
              <option value="name-asc">Name (A–Z)</option>
              <option value="name-desc">Name (Z–A)</option>
              <option value="created_at-desc">Created (newest)</option>
              <option value="created_at-asc">Created (oldest)</option>
            </select>
            <span className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-text-muted text-[18px]">
              expand_more
            </span>
          </div>
        </div>
      </div>
      <div className="min-h-[280px]">
        {members.length === 0 ? (
          <p className="text-text-muted text-sm py-8 text-center">
            No members with an ID card match your search or filters.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {members.map((m, index) => {
                const isSelected = selectedMemberId === m.id;
                const orderNum = start + index + 1;
                return (
                  <div
                    key={m.id}
                    className={`card p-4 flex flex-col gap-3 transition-shadow hover:shadow-sm relative ${isSelected ? "ring-2 ring-primary bg-primary/5" : ""}`}
                  >
                    <span
                      className="absolute top-3 right-3 text-xs font-bold text-text-muted tabular-nums"
                      aria-hidden
                    >
                      #{orderNum}
                    </span>
                    <Link
                      to="/id-card-studio"
                      search={{ memberId: m.id }}
                      className="flex items-center gap-3 min-w-0 flex-1"
                    >
                      <div className="h-12 w-12 shrink-0 overflow-hidden bg-surface-gray flex items-center justify-center">
                        {m.avatar_url ? (
                          <img
                            alt=""
                            className="h-full w-full object-cover"
                            src={m.avatar_url}
                          />
                        ) : (
                          <span className="text-primary font-bold text-base">
                            {initials(m.name)}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-medium text-text-main truncate block text-sm">
                          {m.name}
                        </span>
                        <span className="text-xs text-text-muted block">
                          Unit {m.unit} • {m.member_type}
                        </span>
                        <span
                          className={`inline-block mt-1 text-xs font-semibold px-2 py-0.5 ${getStatusStyles(m.status ?? "")}`}
                        >
                          {m.status ?? "—"}
                        </span>
                      </div>
                    </Link>
                    <div className="flex flex-wrap items-center gap-2 mt-2 pt-1">
                      <Link
                        to="/id-card-studio"
                        search={{ memberId: m.id }}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-semibold bg-success/10 text-success border border-success/30 hover:bg-success/20"
                      >
                        <Check size={14} strokeWidth={2.5} />
                        View card
                      </Link>
                      <Link
                        to="/members/$memberId"
                        params={{ memberId: m.id }}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-semibold bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20"
                      >
                        View profile
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
            {totalCount > PAGE_SIZE && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-surface-gray/80">
                <p className="text-sm text-text-secondary font-medium">
                  Showing{" "}
                  <span className="font-bold text-text-main">{start + 1}</span>{" "}
                  to <span className="font-bold text-text-main">{end}</span> of{" "}
                  <span className="font-bold text-text-main">{totalCount}</span>{" "}
                  members
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onPageChange(page - 1)}
                    disabled={!hasPrev}
                    className="h-9 min-w-[36px] px-2 flex items-center justify-center border border-[#333] bg-surface-light text-text-main font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-gray"
                    aria-label="Previous page"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      chevron_left
                    </span>
                  </button>
                  <span className="text-sm text-text-secondary font-medium px-2">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => onPageChange(page + 1)}
                    disabled={!hasNext}
                    className="h-9 min-w-[36px] px-2 flex items-center justify-center border border-[#333] bg-surface-light text-text-main font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-gray"
                    aria-label="Next page"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      chevron_right
                    </span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function IDCardStudio() {
  const { memberId } = Route.useSearch();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortBy, setSortBy] = useState<SortField>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const { data: members = [] } = useQuery({
    queryKey: membersQueryKey,
    queryFn: () => fetchMembers(),
  });

  const {
    data: member,
    isLoading,
    isError: isMemberError,
    error: memberError,
  } = useQuery({
    queryKey: memberQueryKey(memberId ?? ""),
    queryFn: () => fetchMemberById(memberId!),
    enabled: !!memberId,
  });

  const sortedMembers = useMemo(() => {
    const list = [...members];
    const mult = sortOrder === "asc" ? 1 : -1;
    list.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "name") {
        cmp = (a.name ?? "").localeCompare(b.name ?? "");
      } else {
        cmp =
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return mult * cmp;
    });
    return list;
  }, [members, sortBy, sortOrder]);

  const filteredAndSortedMembers = useMemo(() => {
    let list = sortedMembers.filter((m) => m.id_card_created === true);
    if (filterStatus) {
      list = list.filter((m) => (m.status ?? "") === filterStatus);
    }
    const term = search.trim().toLowerCase();
    if (term) {
      list = list.filter(
        (m) =>
          (m.name ?? "").toLowerCase().includes(term) ||
          (m.email ?? "").toLowerCase().includes(term) ||
          (m.member_id ?? "").toLowerCase().includes(term),
      );
    }
    return list;
  }, [sortedMembers, filterStatus, search]);

  const paginatedMembers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredAndSortedMembers.slice(start, start + PAGE_SIZE);
  }, [filteredAndSortedMembers, page]);

  useEffect(() => {
    setPage(1);
  }, [search, filterStatus, sortBy, sortOrder]);

  const displayName = member?.name ?? "Select a member";
  const unitLabel = member
    ? `Unit ${member.unit} (${member.member_type})`
    : "—";
  const avatarUrl = member?.avatar_url ?? null;
  const nameStr = member?.name ?? "";
  const initialsStr = nameStr
    ? nameStr
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "—";

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        {!memberId && (
          <>
            {/* Header - when no member selected */}
            <div className="card">
              <div className="flex items-center gap-2 text-text-secondary text-sm font-medium mb-1">
                <span>Pages</span>
                <span className="text-text-muted">/</span>
                <span className="text-primary font-bold">ID Card Studio</span>
              </div>
              <h1 className="text-text-main text-2xl md:text-3xl font-bold mb-1 tracking-tight">
                ID Card Studio
              </h1>
              <p className="text-text-secondary text-sm">
                View and manage digital ID cards for members with an issued
                card.
              </p>
            </div>

            <div>
              <MemberSelectorSection
                sectionTitle="Members with ID card"
                members={paginatedMembers}
                selectedMemberId={undefined}
                search={search}
                onSearchChange={setSearch}
                filterStatus={filterStatus}
                onFilterStatusChange={setFilterStatus}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortByChange={setSortBy}
                onSortOrderChange={setSortOrder}
                page={page}
                totalCount={filteredAndSortedMembers.length}
                onPageChange={setPage}
              />
            </div>
          </>
        )}

        {memberId && !member && !isLoading && (
          <>
            <div className="card p-8 text-center text-text-secondary text-base">
              {isMemberError ? (
                <>
                  <p className="mb-2 font-medium text-danger">
                    Failed to load member
                  </p>
                  <p className="mb-4 text-sm text-text-muted">
                    {memberError instanceof Error
                      ? memberError.message
                      : "Network or server error. Check the console for details."}
                  </p>
                </>
              ) : (
                <p className="mb-4">Member not found.</p>
              )}
              <Link
                to="/id-card-studio"
                className="text-primary font-bold hover:underline"
              >
                Back to ID Card Studio
              </Link>
            </div>
            <div>
              <MemberSelectorSection
                sectionTitle="Members with ID card"
                members={paginatedMembers}
                selectedMemberId={undefined}
                search={search}
                onSearchChange={setSearch}
                filterStatus={filterStatus}
                onFilterStatusChange={setFilterStatus}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortByChange={setSortBy}
                onSortOrderChange={setSortOrder}
                page={page}
                totalCount={filteredAndSortedMembers.length}
                onPageChange={setPage}
              />
            </div>
          </>
        )}

        {(isLoading || member) && memberId && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap w-full items-center gap-2 sm:gap-3 mb-2">
              <button
                type="button"
                onClick={() => navigate({ to: "/id-card-studio" })}
                className="inline-flex items-center gap-2 text-text-secondary hover:text-text-main font-medium text-sm"
                aria-label="Back to ID Card Studio"
              >
                <ArrowLeft size={20} />
                Back
              </button>
              <span className="text-text-muted text-sm">|</span>
              <nav
                className="flex items-center gap-2 text-sm text-text-secondary font-medium"
                aria-label="Breadcrumb"
              >
                <Link to="/id-card-studio" className="hover:text-text-main">
                  ID Card Studio
                </Link>
                <span className="material-symbols-outlined text-sm text-text-muted">
                  chevron_right
                </span>
                <span className="text-text-main font-semibold truncate max-w-[200px] sm:max-w-none">
                  {isLoading ? "Loading…" : (member?.name ?? "ID Card")}
                </span>
              </nav>
            </div>
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] py-10">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center w-full max-w-[420px] mx-auto">
                  <div className="relative w-full overflow-hidden flex flex-col bg-surface-light border-2 border-[#333] shadow-lg animate-pulse">
                    <div className="h-36 bg-surface-gray" />
                    <div className="flex flex-col items-center px-8 pb-8 -mt-12">
                      <div className="h-28 w-28 rounded-full bg-surface-gray border-4 border-white shadow-md" />
                      <div className="h-6 w-48 bg-surface-gray rounded mt-4" />
                      <div className="h-4 w-32 bg-surface-gray rounded mt-2" />
                      <div className="h-4 w-40 bg-surface-gray rounded mt-4" />
                      <div className="mt-6 p-3 bg-surface-gray h-32 w-32" />
                      <div className="h-3 w-24 bg-surface-gray rounded mt-3" />
                    </div>
                  </div>
                </div>
              ) : member ? (
                <>
                  <div className="flex flex-col items-center justify-center w-full max-w-[420px] mx-auto">
                    <div className="relative w-full overflow-hidden flex flex-col bg-surface-light border-2 border-[#333] shadow-lg">
                      <div className="h-36 bg-primary p-5 flex justify-between items-start text-white">
                        <span className="font-bold text-xs tracking-wider uppercase">
                          Association
                        </span>
                        <span className="text-xs font-bold uppercase bg-white/20 px-2.5 py-1">
                          Member
                        </span>
                      </div>
                      <div className="flex flex-col items-center px-8 pb-8 -mt-12">
                        <div className="h-28 w-28 overflow-hidden bg-surface-gray flex items-center justify-center rounded-full border-4 border-white shadow-md">
                          {avatarUrl ? (
                            <img
                              alt=""
                              className="h-full w-full object-cover"
                              src={avatarUrl}
                            />
                          ) : (
                            <span className="text-primary font-bold text-3xl">
                              {initialsStr}
                            </span>
                          )}
                        </div>
                        <p className="mt-4 text-xl font-bold text-text-main tracking-tight text-center">
                          {displayName}
                        </p>
                        <p className="text-base text-text-secondary mt-1">
                          {unitLabel}
                        </p>
                        <p className="mt-4 text-sm font-semibold text-primary uppercase tracking-wider">
                          All Amenities Access
                        </p>
                        <div className="mt-6 p-3 bg-white border border-surface-gray">
                          <img
                            alt="QR code for member entry"
                            className="h-32 w-32 block"
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(member.id)}`}
                          />
                        </div>
                        <p className="text-xs text-text-muted mt-3 uppercase tracking-wide">
                          Scan for entry
                        </p>
                      </div>
                    </div>
                  </div>
                  <Link
                    to="/id-card-studio"
                    className="mt-8 text-sm font-semibold text-primary hover:underline"
                  >
                    Back to ID Card Studio
                  </Link>
                </>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
