import { useState, useMemo, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Layout from "../components/layout/Layout";
import {
  fetchMemberById,
  fetchMembers,
  updateMember,
  memberQueryKey,
  membersQueryKey,
} from "../lib/api/members";
import { dashboardQueryKey } from "../lib/api/dashboard";
import type { Member } from "../lib/supabase";
import { Check } from "lucide-react";

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
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortBy, setSortBy] = useState<SortField>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const { data: members = [] } = useQuery({
    queryKey: membersQueryKey,
    queryFn: () => fetchMembers(),
  });

  const { data: member, isLoading } = useQuery({
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

  const markIdCreatedMutation = useMutation({
    mutationFn: () =>
      memberId
        ? updateMember(memberId, { id_card_created: true })
        : Promise.reject(new Error("No member")),
    onSuccess: () => {
      if (memberId) {
        queryClient.invalidateQueries({ queryKey: memberQueryKey(memberId) });
        queryClient.invalidateQueries({ queryKey: membersQueryKey });
        queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
      }
    },
  });

  const handleIssueMobilePass = () => markIdCreatedMutation.mutate();
  const handleDownloadPdf = () => markIdCreatedMutation.mutate();

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        {/* Header - same as Dashboard */}
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
            View and manage digital ID cards for members with an issued card.
          </p>
        </div>

        {!memberId && (
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
        )}

        {memberId && !member && !isLoading && (
          <>
            <div className="card p-8 text-center text-text-secondary text-base">
              <p className="mb-4">Member not found.</p>
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
          <div className="grid grid-cols-12 gap-5">
            {isLoading ? (
              <div className="col-span-12 card">
                <div className="h-64 flex items-center justify-center text-text-muted animate-pulse">
                  Loading member...
                </div>
              </div>
            ) : member ? (
              <>
                {/* Left column - same as Dashboard main content (8 cols) */}
                <div className="col-span-12 lg:col-span-8 flex flex-col gap-5">
                  <div className="card">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-text-main font-bold text-lg mb-1">
                          Credential details
                        </h3>
                        <p className="text-text-secondary text-sm">
                          Configure access and identity for this member.
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                          Member name
                        </label>
                        <input
                          className="w-full h-11 px-4 bg-surface-gray text-text-main font-medium border border-[#333]"
                          readOnly
                          value={displayName}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                          Unit
                        </label>
                        <input
                          className="w-full h-11 px-4 bg-surface-gray text-text-main font-medium border border-[#333]"
                          readOnly
                          value={unitLabel}
                        />
                      </div>
                    </div>
                    <div className="mt-5">
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        Member photo
                      </label>
                      <div className="flex items-center gap-4 p-4 bg-surface-gray border border-[#333]">
                        <div className="h-16 w-16 shrink-0 overflow-hidden bg-background-light flex items-center justify-center">
                          {avatarUrl ? (
                            <img
                              alt=""
                              className="h-full w-full object-cover"
                              src={avatarUrl}
                            />
                          ) : (
                            <span className="text-primary font-bold text-xl">
                              {initialsStr}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-text-main">
                            Replace photo
                          </span>
                          <span className="block text-xs text-text-muted">
                            JPG, PNG (max 5MB)
                          </span>
                        </div>
                        <span className="material-symbols-outlined text-text-secondary text-[20px]">
                          cloud_upload
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                          Access level
                        </label>
                        <select className="w-full h-11 px-4 bg-surface-gray text-text-main font-medium border border-[#333]">
                          <option>All Amenities</option>
                          <option>Gym Only</option>
                          <option>Gate Only</option>
                          <option>Clubhouse & Pool</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                          Valid until
                        </label>
                        <input
                          className="w-full h-11 px-4 bg-surface-gray text-text-main font-medium border border-[#333]"
                          type="date"
                          defaultValue="2024-12-31"
                        />
                      </div>
                    </div>
                    <div className="mt-5">
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        Internal notes
                      </label>
                      <textarea
                        className="w-full min-h-[80px] p-4 bg-surface-gray text-text-main text-sm border border-[#333] resize-y"
                        placeholder="Notes about this credential..."
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-surface-gray/80">
                      <button
                        type="button"
                        onClick={handleDownloadPdf}
                        disabled={markIdCreatedMutation.isPending}
                        className="flex-1 h-11 bg-surface-gray text-text-main font-semibold border border-[#333] hover:bg-surface-gray/80 disabled:opacity-50"
                      >
                        Download PDF
                      </button>
                      <button
                        type="button"
                        onClick={handleIssueMobilePass}
                        disabled={markIdCreatedMutation.isPending}
                        className="flex-[1.5] h-11 bg-primary text-white font-bold hover:bg-primary-dark flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          send_to_mobile
                        </span>
                        {markIdCreatedMutation.isPending
                          ? "Saving..."
                          : "Issue mobile pass"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right column - same as Dashboard sidebar (4 cols) */}
                <div className="col-span-12 lg:col-span-4 flex flex-col gap-5">
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-text-main font-bold text-lg">
                        Members with ID card
                      </h3>
                    </div>
                    <MemberSelectorSection
                      members={paginatedMembers}
                      selectedMemberId={memberId}
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
                  <div className="card">
                    <h3 className="text-text-main font-bold text-lg mb-6">
                      Live preview
                    </h3>
                    <div className="flex flex-col items-center justify-center py-6 w-full max-w-[280px] mx-auto">
                      <div className="relative w-full overflow-hidden flex flex-col bg-surface-light border border-[#333] shadow-sm">
                        <div className="h-28 bg-primary p-4 flex justify-between items-start text-white">
                          <span className="font-bold text-[10px] tracking-wider uppercase">
                            Association
                          </span>
                          <span className="text-[10px] font-bold uppercase bg-white/20 px-2 py-0.5">
                            Member
                          </span>
                        </div>
                        <div className="flex flex-col items-center px-6 pb-6 -mt-10">
                          <div className="h-20 w-20 overflow-hidden bg-surface-gray flex items-center justify-center">
                            {avatarUrl ? (
                              <img
                                alt=""
                                className="h-full w-full object-cover"
                                src={avatarUrl}
                              />
                            ) : (
                              <span className="text-primary font-bold text-2xl">
                                {initialsStr}
                              </span>
                            )}
                          </div>
                          <p className="mt-3 text-lg font-bold text-text-main tracking-tight text-center">
                            {displayName}
                          </p>
                          <p className="text-sm text-text-secondary mt-0.5">
                            {unitLabel}
                          </p>
                          <p className="mt-3 text-xs font-semibold text-primary uppercase tracking-wider">
                            All Amenities Access
                          </p>
                          <div className="mt-4 p-2 bg-surface-gray">
                            <img
                              alt="QR"
                              className="h-16 w-16"
                              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6HA8CUcBOCRJAHfQJOxSdV2gO_s-Op6h2k13anBOTSid0Tc6aE9fO26s4_0qlSYCSYy1_0PLlxgcTqWNu3qGzfNmAljUdMTWmTnQ3zd3o5C1CArXYuMO29UZZU2VVYrxXUR8KMMQj2u8K7KnyadHItpiOEBbOeTDNh-iqDMLRwMBRrYf42THxxhF9exhDvgjg43Fl8krhXoa_tHcemzyt3a519Kwf-vQ28IBSV0uWfUwXmjQbCGa1d-hWro9zl4p3wiUX835wcNnV"
                            />
                          </div>
                          <p className="text-[10px] text-text-muted mt-2 uppercase tracking-wide">
                            Scan for entry
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}
      </div>
    </Layout>
  );
}
