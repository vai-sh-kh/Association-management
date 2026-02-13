import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import Layout from "../components/layout/Layout";
import MemberFormSheet from "../components/members/MemberFormSheet";
import {
  fetchMemberById,
  updateMember,
  deleteMember,
  memberQueryKey,
  membersQueryKey,
  type MemberUpdate,
} from "../lib/api/members";
import { useQueryClient } from "@tanstack/react-query";
import { formatPhoneDisplay } from "../constants/countryCodes";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/members/$memberId")({
  component: MemberProfilePage,
});

function MemberProfilePage() {
  const { memberId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editModal, setEditModal] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const {
    data: member,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: memberQueryKey(memberId),
    queryFn: () => fetchMemberById(memberId),
  });

  const updateMutation = useMutation({
    mutationFn: (row: MemberUpdate) => updateMember(memberId, row),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memberQueryKey(memberId) });
      queryClient.invalidateQueries({ queryKey: membersQueryKey });
      setEditModal(false);
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
      setDeleteConfirm(false);
      toast.success("Member removed successfully");
      navigate({ to: "/members" });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to remove member");
    },
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] w-full bg-white flex flex-col items-center justify-center gap-4">
          <Loader2
            size={40}
            className="animate-spin text-primary"
            aria-hidden
          />
          <span className="text-sm font-medium text-text-secondary">
            Loading…
          </span>
        </div>
      </Layout>
    );
  }
  if (isError || !member) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => navigate({ to: "/members" })}
              className="inline-flex items-center gap-2 text-text-secondary hover:text-text-main font-medium text-sm"
              aria-label="Back to members"
            >
              <ArrowLeft size={20} />
              Back
            </button>
            <span className="text-text-muted text-sm">|</span>
            <nav
              className="flex items-center gap-2 text-sm text-text-secondary font-medium"
              aria-label="Breadcrumb"
            >
              <Link to="/members" className="hover:text-text-main">
                Members
              </Link>
            </nav>
          </div>
          <div className="p-12 text-center">
            <p className="text-danger font-medium mb-4">
              {(error as Error)?.message ?? "Member not found"}
            </p>
            <button
              type="button"
              onClick={() => navigate({ to: "/members" })}
              className="text-primary font-medium"
            >
              Back to Members
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const emergencyContact = member.emergency_contact_name
    ? member.emergency_contact_relationship
      ? `${member.emergency_contact_name} (${member.emergency_contact_relationship})`
      : member.emergency_contact_name
    : "—";
  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Layout>
      <div className="w-full flex justify-center">
        <div className=" max-w-[1000px]  w-full flex flex-col gap-6">
          <div className="flex flex-wrap w-full items-center gap-2 sm:gap-3 mb-2">
            <button
              type="button"
              onClick={() => navigate({ to: "/members" })}
              className="inline-flex items-center gap-2 text-text-secondary hover:text-text-main font-medium text-sm"
              aria-label="Back to members"
            >
              <ArrowLeft size={20} />
              Back
            </button>
            <span className="text-text-muted text-sm">|</span>
            <nav
              className="flex items-center gap-2 text-sm text-text-secondary font-medium"
              aria-label="Breadcrumb"
            >
              <Link to="/members" className="hover:text-text-main">
                Members
              </Link>
              <span className="material-symbols-outlined text-sm text-text-muted">
                chevron_right
              </span>
              <span className="text-text-main font-semibold truncate max-w-[200px] sm:max-w-none">
                {member.name}
              </span>
            </nav>
          </div>
          <div className="w-full bg-red-800">
            <div className="card flex flex-col items-center text-center">
              <div className="relative mb-4 mt-2">
                <div className="w-[100px] h-[100px] p-1 bg-surface-light border border-[#333] overflow-hidden">
                  {member.avatar_url ? (
                    <img
                      alt=""
                      className="w-full h-full object-cover"
                      src={member.avatar_url}
                    />
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                      {initials}
                    </div>
                  )}
                </div>
                <span className="absolute bottom-1 right-1 w-5 h-5 bg-success border-2 border-white" />
              </div>
              <h2 className="text-xl font-bold text-text-main">
                {member.name}
              </h2>
              {(member.unit != null && member.unit !== "") ||
              member.member_type ? (
                <p className="text-text-secondary text-sm font-medium mt-1 mb-1">
                  {[member.unit, member.member_type]
                    .filter(Boolean)
                    .join(" • ")}
                </p>
              ) : null}
              {member.member_id != null && member.member_id !== "" ? (
                <p className="text-xs text-text-muted mb-6">
                  ID {member.member_id}
                </p>
              ) : (
                <div className="mb-6" />
              )}

              <div className="flex flex-wrap gap-3 w-full justify-center">
                <button
                  type="button"
                  onClick={() => setEditModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-background-light text-primary hover:bg-primary hover:text-white font-medium text-sm"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    edit
                  </span>
                  Edit
                </button>
                {member.id_card_created ? (
                  <Link
                    to="/id-card-studio"
                    search={{ memberId }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-background-light text-primary hover:bg-primary hover:text-white font-medium text-sm"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      badge
                    </span>
                    View ID Card
                  </Link>
                ) : (
                  <Link
                    to="/id-card-studio"
                    search={{ memberId }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-background-light text-primary hover:bg-primary hover:text-white font-medium text-sm"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      add_card
                    </span>
                    Create ID
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-danger/10 text-danger hover:bg-danger hover:text-white font-medium text-sm"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    delete
                  </span>
                  Delete
                </button>
              </div>
            </div>
          </div>

          {(member.email != null && member.email !== "") ||
          (member.phone != null && member.phone !== "") ||
          (member.phone_country_code != null &&
            member.phone_country_code !== "") ||
          emergencyContact !== "—" ? (
            <div className="card">
              <div className="flex flex-col gap-6">
                {member.email != null && member.email !== "" && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-background-light flex items-center justify-center text-primary shrink-0">
                      <span className="material-symbols-outlined text-xl">
                        mail
                      </span>
                    </div>
                    <div className="flex flex-col pt-1">
                      <span className="text-xs text-text-secondary font-medium mb-1">
                        Email
                      </span>
                      <span className="text-sm font-bold text-text-main break-all">
                        {member.email}
                      </span>
                    </div>
                  </div>
                )}
                {(member.phone != null && member.phone !== "") ||
                (member.phone_country_code != null &&
                  member.phone_country_code !== "") ? (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-background-light flex items-center justify-center text-primary shrink-0">
                      <span className="material-symbols-outlined text-xl">
                        smartphone
                      </span>
                    </div>
                    <div className="flex flex-col pt-1">
                      <span className="text-xs text-text-secondary font-medium mb-1">
                        Mobile
                      </span>
                      <span className="text-sm font-bold text-text-main">
                        {formatPhoneDisplay(
                          member.phone_country_code,
                          member.phone,
                        )}
                      </span>
                    </div>
                  </div>
                ) : null}
                {emergencyContact !== "—" && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-background-light flex items-center justify-center text-primary shrink-0">
                      <span className="material-symbols-outlined text-xl">
                        emergency
                      </span>
                    </div>
                    <div className="flex flex-col pt-1">
                      <span className="text-xs text-text-secondary font-medium mb-1">
                        Emergency Contact
                      </span>
                      <span className="text-sm font-bold text-text-main">
                        {emergencyContact}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}
          {/* 
        {hasAnyDetail && (
          <div className="card">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              {member.member_id != null && member.member_id !== "" && (
                <div>
                  <dt className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
                    Member ID
                  </dt>
                  <dd className="text-sm font-semibold text-text-main">
                    {member.member_id}
                  </dd>
                </div>
              )}
              {member.building != null && member.building !== "" && (
                <div>
                  <dt className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
                    Building
                  </dt>
                  <dd className="text-sm font-semibold text-text-main">
                    {member.building}
                  </dd>
                </div>
              )}
              {member.unit != null && member.unit !== "" && (
                <div>
                  <dt className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
                    Unit
                  </dt>
                  <dd className="text-sm font-semibold text-text-main">
                    {member.unit}
                  </dd>
                </div>
              )}
              {member.member_type && (
                <div>
                  <dt className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
                    Type
                  </dt>
                  <dd className="text-sm font-semibold text-text-main">
                    {member.member_type}
                  </dd>
                </div>
              )}
              {member.status && (
                <div>
                  <dt className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
                    Status
                  </dt>
                  <dd>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 text-xs font-bold ${
                        member.status === "Active"
                          ? "bg-success/10 text-success"
                          : "bg-surface-gray text-text-secondary"
                      }`}
                    >
                      {member.status}
                    </span>
                  </dd>
                </div>
              )}
              {member.date_of_birth != null && member.date_of_birth !== "" && (
                <div>
                  <dt className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
                    Date of birth
                  </dt>
                  <dd className="text-sm font-semibold text-text-main">
                    {formatDate(member.date_of_birth)}
                  </dd>
                </div>
              )}
              {member.occupation != null && member.occupation !== "" && (
                <div>
                  <dt className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
                    Occupation
                  </dt>
                  <dd className="text-sm font-semibold text-text-main">
                    {member.occupation}
                  </dd>
                </div>
              )}
              {member.move_in_date != null && member.move_in_date !== "" && (
                <div>
                  <dt className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
                    Move-in date
                  </dt>
                  <dd className="text-sm font-semibold text-text-main">
                    {formatDate(member.move_in_date)}
                  </dd>
                </div>
              )}
              {member.move_out_date != null && member.move_out_date !== "" && (
                <div>
                  <dt className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
                    Move-out date
                  </dt>
                  <dd className="text-sm font-semibold text-text-main">
                    {formatDate(member.move_out_date)}
                  </dd>
                </div>
              )}
              {member.last_access != null && member.last_access !== "" && (
                <div>
                  <dt className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
                    Last access
                  </dt>
                  <dd className="text-sm font-semibold text-text-main">
                    {formatAccessTime(member.last_access)}
                  </dd>
                </div>
              )}
              {member.residential_address != null &&
                member.residential_address !== "" && (
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
                      Residential address
                    </dt>
                    <dd className="text-sm font-semibold text-text-main">
                      {member.residential_address}
                    </dd>
                  </div>
                )}
              {member.mailing_address != null &&
                member.mailing_address !== "" && (
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
                      Mailing address
                    </dt>
                    <dd className="text-sm font-semibold text-text-main">
                      {member.mailing_address}
                    </dd>
                  </div>
                )}
              {member.emergency_contact_phone != null &&
                member.emergency_contact_phone !== "" && (
                  <div>
                    <dt className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
                      Emergency phone
                    </dt>
                    <dd className="text-sm font-semibold text-text-main">
                      {member.emergency_contact_phone}
                    </dd>
                  </div>
                )}
              {member.emergency_contact_email != null &&
                member.emergency_contact_email !== "" && (
                  <div>
                    <dt className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
                      Emergency email
                    </dt>
                    <dd className="text-sm font-semibold text-text-main break-all">
                      {member.emergency_contact_email}
                    </dd>
                  </div>
                )}
              {member.notes != null && member.notes !== "" && (
                <div className="sm:col-span-2">
                  <dt className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
                    Notes
                  </dt>
                  <dd className="text-sm font-semibold text-text-main whitespace-pre-wrap">
                    {member.notes}
                  </dd>
                </div>
              )}
              {member.created_at != null && member.created_at !== "" && (
                <div>
                  <dt className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
                    Created
                  </dt>
                  <dd className="text-sm font-semibold text-text-main">
                    {formatDate(member.created_at)}
                  </dd>
                </div>
              )}
              {member.updated_at != null && member.updated_at !== "" && (
                <div>
                  <dt className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
                    Last updated
                  </dt>
                  <dd className="text-sm font-semibold text-text-main">
                    {formatDate(member.updated_at)}
                  </dd>
                </div>
              )}
              {member.last_access_location != null &&
                member.last_access_location !== "" && (
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
                      Last access location
                    </dt>
                    <dd className="text-sm font-semibold text-text-main">
                      {member.last_access_location}
                    </dd>
                  </div>
                )}
            </dl>
          </div>
        )} */}
        </div>
      </div>

      {editModal && (
        <MemberFormSheet
          mode="edit"
          member={member}
          onClose={() => {
            setEditModal(false);
            setFormError(null);
          }}
          onSubmit={async (data) => {
            await updateMutation.mutateAsync(data as MemberUpdate);
          }}
          error={formError}
        />
      )}

      {deleteConfirm && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
          onClick={() => setDeleteConfirm(false)}
        >
          <div
            className="bg-surface-light shadow-xl max-w-sm w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-text-main font-medium text-base mb-4">
              Remove this member? This will also delete their vehicles,
              payments, and documents.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(false)}
                className="btn-secondary flex-1 min-h-[44px] text-base"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => deleteMutation.mutate(memberId)}
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
    </Layout>
  );
}
