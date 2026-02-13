import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import Layout from "../components/layout/Layout";
import MemberFormSheet from "../components/members/MemberFormSheet";
import {
  fetchMemberById,
  updateMember,
  memberQueryKey,
  membersQueryKey,
  type MemberUpdate,
} from "../lib/api/members";
import { fetchVehiclesByMemberId, vehiclesQueryKey } from "../lib/api/vehicles";
import {
  fetchAccessLogsByMemberId,
  accessLogsQueryKey,
} from "../lib/api/accessLogs";
import { fetchPaymentsByMemberId, paymentsQueryKey } from "../lib/api/payments";
import { useQueryClient } from "@tanstack/react-query";
import { formatPhoneDisplay } from "../constants/countryCodes";

export const Route = createFileRoute("/members/$memberId")({
  component: MemberProfilePage,
});

function formatAccessTime(ts: string): string {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 60) return `Today, ${diffMins} mins ago`;
  if (diffHours < 24)
    return `Yesterday, ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  if (diffDays < 7)
    return d.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  return d.toLocaleDateString();
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return value;
  }
}

function MemberProfilePage() {
  const { memberId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<
    "overview" | "payments" | "documents"
  >("overview");
  const [editModal, setEditModal] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    data: member,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: memberQueryKey(memberId),
    queryFn: () => fetchMemberById(memberId),
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: vehiclesQueryKey(memberId),
    queryFn: () => fetchVehiclesByMemberId(memberId),
    enabled: !!member,
  });

  const { data: accessLogs = [] } = useQuery({
    queryKey: accessLogsQueryKey(memberId),
    queryFn: () => fetchAccessLogsByMemberId(memberId),
    enabled: !!member,
  });

  const { data: payments = [] } = useQuery({
    queryKey: paymentsQueryKey(memberId),
    queryFn: () => fetchPaymentsByMemberId(memberId),
    enabled: !!member,
  });

  const updateMutation = useMutation({
    mutationFn: (row: MemberUpdate) => updateMember(memberId, row),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memberQueryKey(memberId) });
      queryClient.invalidateQueries({ queryKey: membersQueryKey });
      setEditModal(false);
      setFormError(null);
    },
    onError: (err: Error) => setFormError(err.message),
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="p-12 text-center text-text-secondary">
          Loading profile...
        </div>
      </Layout>
    );
  }
  if (isError || !member) {
    return (
      <Layout>
        <div className="p-12 text-center text-danger font-medium">
          {(error as Error)?.message ?? "Member not found"}
        </div>
        <button
          type="button"
          onClick={() => navigate({ to: "/members" })}
          className="text-primary font-medium"
        >
          Back to Residents
        </button>
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
      <div className="flex flex-col gap-1 mb-6">
        <div className="flex items-center gap-2 text-sm text-text-secondary font-medium">
          <Link to="/members" className="hover:text-text-main">
            Directory
          </Link>
          <span className="material-symbols-outlined text-sm">
            chevron_right
          </span>
          <Link to="/members" className="hover:text-text-main">
            Residents
          </Link>
          <span className="material-symbols-outlined text-sm">
            chevron_right
          </span>
          <span className="text-text-main font-bold">{member.name}</span>
        </div>
        <h2 className="text-[34px] font-bold text-text-main leading-tight">
          Resident Profile
        </h2>
      </div>

      <div className="flex flex-col xl:flex-row gap-8">
        {/* Left Column */}
        <div className="w-full xl:w-[30%] flex flex-col gap-6">
          <div className="card flex flex-col items-center text-center relative overflow-hidden">
            <div className="relative mb-4 mt-2">
              <div className="w-[100px] h-[100px] p-1 bg-white overflow-hidden">
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
              <span className="absolute bottom-1 right-1 w-5 h-5 bg-success" />
            </div>
            <h2 className="text-xl font-bold text-text-main">{member.name}</h2>
            <p className="text-text-secondary text-sm font-medium mt-1 mb-6">
              Unit {member.unit} • {member.member_type}
            </p>

            <div className="flex justify-between gap-2 w-full px-4 py-5 mb-6 bg-background-light">
              <div className="flex flex-col items-center flex-1">
                <span className="text-xl font-bold text-text-main">
                  {vehicles.length}
                </span>
                <span className="text-xs text-text-secondary font-medium">
                  Vehicles
                </span>
              </div>
              <div className="w-px bg-gray-200 h-8 self-center" />
              <div className="flex flex-col items-center flex-1">
                <span className="text-xl font-bold text-text-main">
                  {payments.length}
                </span>
                <span className="text-xs text-text-secondary font-medium">
                  Payments
                </span>
              </div>
              <div className="w-px bg-gray-200 h-8 self-center" />
              <div className="flex flex-col items-center flex-1">
                <span className="text-xl font-bold text-text-main">
                  {member.member_id}
                </span>
                <span className="text-xs text-text-secondary font-medium">
                  ID
                </span>
              </div>
            </div>

            <div className="flex gap-4 w-full justify-center">
              <button
                type="button"
                onClick={() => setEditModal(true)}
                className="w-12 h-12 bg-background-light text-primary hover:bg-primary hover:text-white flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[20px]">
                  edit
                </span>
              </button>
              <Link
                to="/id-card-studio"
                search={{ memberId }}
                className="w-12 h-12 bg-background-light text-primary hover:bg-primary hover:text-white flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[20px]">
                  badge
                </span>
              </Link>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-bold text-text-main mb-6">
              Contact Information
            </h3>
            <div className="flex flex-col gap-6">
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
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-bold text-text-main mb-6">
              Member details
            </h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              <div>
                <dt className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
                  Member ID
                </dt>
                <dd className="text-sm font-semibold text-text-main">
                  {member.member_id ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
                  Building
                </dt>
                <dd className="text-sm font-semibold text-text-main">
                  {member.building ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
                  Unit
                </dt>
                <dd className="text-sm font-semibold text-text-main">
                  {member.unit ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
                  Type
                </dt>
                <dd className="text-sm font-semibold text-text-main">
                  {member.member_type ?? "—"}
                </dd>
              </div>
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
                    {member.status ?? "—"}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
                  Date of birth
                </dt>
                <dd className="text-sm font-semibold text-text-main">
                  {formatDate(member.date_of_birth)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
                  Occupation
                </dt>
                <dd className="text-sm font-semibold text-text-main">
                  {member.occupation ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
                  Move-in date
                </dt>
                <dd className="text-sm font-semibold text-text-main">
                  {formatDate(member.move_in_date)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
                  Move-out date
                </dt>
                <dd className="text-sm font-semibold text-text-main">
                  {formatDate(member.move_out_date)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
                  Last access
                </dt>
                <dd className="text-sm font-semibold text-text-main">
                  {member.last_access
                    ? formatAccessTime(member.last_access)
                    : "—"}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
                  Residential address
                </dt>
                <dd className="text-sm font-semibold text-text-main">
                  {member.residential_address ?? "—"}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
                  Mailing address
                </dt>
                <dd className="text-sm font-semibold text-text-main">
                  {member.mailing_address ?? "—"}
                </dd>
              </div>
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
              <div>
                <dt className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
                  Created
                </dt>
                <dd className="text-sm font-semibold text-text-main">
                  {formatDate(member.created_at)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
                  Last updated
                </dt>
                <dd className="text-sm font-semibold text-text-main">
                  {formatDate(member.updated_at)}
                </dd>
              </div>
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
        </div>

        {/* Right Column */}
        <div className="w-full xl:w-[70%] flex flex-col gap-6">
          <div className="bg-primary p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden">
            <div className="flex items-center gap-5 relative z-10">
              <div className="bg-white/20 p-3.5">
                <span className="material-symbols-outlined text-3xl">
                  badge
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">Digital ID Access</h3>
                <p className="text-sm text-white/90">
                  Issue a new digital pass or revoke current access.
                </p>
              </div>
            </div>
            <Link
              to="/id-card-studio"
              search={{ memberId }}
              className="bg-white text-primary px-6 py-3 font-bold text-base hover:bg-slate-100 z-10"
            >
              Issue Digital Pass
            </Link>
          </div>

          <div className="card overflow-hidden flex-1 min-h-[400px] flex flex-col p-0">
            <div className="flex items-center gap-2 sm:gap-8 bg-surface-gray/30 px-4 sm:px-8 pt-4 overflow-x-auto scrollbar-hide">
              {(["overview", "payments", "documents"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`shrink-0 pb-4 pt-2 px-2 min-h-[44px] text-sm font-medium capitalize transition-colors ${
                    activeTab === tab
                      ? "text-primary bg-primary/10"
                      : "text-text-secondary hover:text-text-main"
                  }`}
                >
                  {tab === "overview" ? "Overview" : tab}
                </button>
              ))}
            </div>
            <div className="p-4 sm:p-8 flex flex-col gap-8 flex-1">
              {activeTab === "overview" && (
                <>
                  <div className="flex flex-col gap-4">
                    <h3 className="text-lg font-bold text-text-main">
                      Registered Vehicles
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {vehicles.length === 0 && (
                        <p className="text-text-secondary text-sm col-span-2">
                          No vehicles registered.
                        </p>
                      )}
                      {vehicles.map((v) => (
                        <div
                          key={v.id}
                          className="p-5 flex items-center gap-4 bg-surface-light"
                        >
                          <div className="w-14 h-14 bg-background-light flex items-center justify-center text-text-main">
                            <span className="material-symbols-outlined text-2xl">
                              {v.icon || "directions_car"}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-text-main text-base">
                              {v.vehicle_name}
                            </h4>
                            <p className="text-xs text-text-secondary mt-1">
                              {[v.color, v.year].filter(Boolean).join(" • ") ||
                                "—"}
                            </p>
                          </div>
                          <div className="px-4 py-2 bg-background-light">
                            <span className="text-xs font-mono font-bold text-text-main">
                              {v.license_plate}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 mt-2">
                    <h3 className="text-lg font-bold text-text-main">
                      Recent Access Logs
                    </h3>
                    <div className="overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-surface-gray/50">
                          <tr>
                            <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">
                              Location
                            </th>
                            <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">
                              Method
                            </th>
                            <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">
                              Date & Time
                            </th>
                            <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider text-right">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {accessLogs.length === 0 && (
                            <tr>
                              <td
                                colSpan={4}
                                className="px-6 py-8 text-center text-text-secondary text-sm"
                              >
                                No access logs.
                              </td>
                            </tr>
                          )}
                          {accessLogs.slice(0, 10).map((log) => (
                            <tr
                              key={log.id}
                              className="hover:bg-surface-gray/30"
                            >
                              <td className="px-6 py-4 font-medium text-text-main">
                                {log.location}
                              </td>
                              <td className="px-6 py-4 text-text-secondary text-sm">
                                {log.access_method}
                              </td>
                              <td className="px-6 py-4 text-text-main text-sm">
                                {formatAccessTime(log.accessed_at)}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <span
                                  className={`inline-flex items-center px-3 py-1 text-xs font-bold ${log.status === "Granted" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}
                                >
                                  {log.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
              {activeTab === "payments" && (
                <div className="flex flex-col gap-4">
                  <h3 className="text-lg font-bold text-text-main">
                    Payment History
                  </h3>
                  {payments.length === 0 ? (
                    <p className="text-text-secondary text-sm">No payments.</p>
                  ) : (
                    <div className="overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-surface-gray/50">
                          <tr>
                            <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase">
                              Amount
                            </th>
                            <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase">
                              Type
                            </th>
                            <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase">
                              Status
                            </th>
                            <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase">
                              Due
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {payments.map((p) => (
                            <tr key={p.id}>
                              <td className="px-6 py-4 font-bold text-text-main">
                                ${Number(p.amount).toLocaleString()}
                              </td>
                              <td className="px-6 py-4 text-text-secondary">
                                {p.payment_type}
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`px-2 py-1 text-xs font-bold ${
                                    p.status === "Completed"
                                      ? "bg-success/10 text-success"
                                      : p.status === "Pending"
                                        ? "bg-warning/10 text-warning"
                                        : "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  {p.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-text-secondary text-sm">
                                {p.due_date ?? "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
              {activeTab === "documents" && (
                <div className="flex flex-col gap-4">
                  <h3 className="text-lg font-bold text-text-main">
                    Documents
                  </h3>
                  <p className="text-text-secondary text-sm">
                    Document list can be extended with the documents API.
                  </p>
                </div>
              )}
            </div>
          </div>
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
    </Layout>
  );
}
