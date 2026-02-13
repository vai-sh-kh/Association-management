import React, { useEffect, useState } from "react";
import { z } from "zod";
import { X, Loader2 } from "lucide-react";
import type { Member } from "../../lib/supabase";
import type { MemberInsert, MemberUpdate } from "../../lib/api/members";
import {
  PHONE_COUNTRY_CODES,
  DEFAULT_PHONE_COUNTRY_CODE,
} from "../../constants/countryCodes";

const MEMBER_TYPES = ["Owner", "Tenant"] as const;
const STATUSES = ["Active", "Inactive"] as const;

const memberFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  phone: z.string().optional(),
  unit: z.string().min(1, "Unit is required"),
  building: z.string().min(1, "Building is required"),
  member_type: z.enum(["Owner", "Tenant"]),
  status: z.enum(["Active", "Inactive"]),
});

type MemberFormValues = z.infer<typeof memberFormSchema>;

const INPUT_CLASS =
  "w-full min-h-[44px] px-4 bg-surface-light text-text-main text-base border border-[#333] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary";

type Props = {
  mode: "create" | "edit";
  member?: Member | null;
  onClose: () => void;
  onSubmit: (data: MemberInsert | MemberUpdate) => Promise<void>;
  error: string | null;
};

export default function MemberFormSheet({
  mode,
  member,
  onClose,
  onSubmit,
  error,
}: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState(
    DEFAULT_PHONE_COUNTRY_CODE,
  );
  const [phone, setPhone] = useState("");
  const [unit, setUnit] = useState("");
  const [building, setBuilding] = useState("");
  const [memberType, setMemberType] = useState<"Owner" | "Tenant">("Owner");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof MemberFormValues, string>>
  >({});

  useEffect(() => {
    setFieldErrors({});
    if (member) {
      setName(member.name);
      setEmail(member.email);
      setPhoneCountryCode(
        member.phone_country_code ?? DEFAULT_PHONE_COUNTRY_CODE,
      );
      setPhone(member.phone ?? "");
      setUnit(member.unit);
      setBuilding(member.building);
      setMemberType(member.member_type);
      setStatus(member.status);
    } else {
      setName("");
      setEmail("");
      setPhoneCountryCode(DEFAULT_PHONE_COUNTRY_CODE);
      setPhone("");
      setUnit("");
      setBuilding("");
      setMemberType("Owner");
      setStatus("Active");
    }
  }, [member]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    const payload: MemberFormValues = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      unit: unit.trim(),
      building: building.trim(),
      member_type: memberType,
      status,
    };
    const result = memberFormSchema.safeParse(payload);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors as Partial<
        Record<keyof MemberFormValues, string[]>
      >;
      setFieldErrors(
        Object.fromEntries(
          Object.entries(errors).map(([k, v]) => [
            k,
            Array.isArray(v) ? v[0] : v,
          ]),
        ) as Partial<Record<keyof MemberFormValues, string>>,
      );
      return;
    }
    setSubmitting(true);
    try {
      if (mode === "create") {
        await onSubmit({
          name: result.data.name,
          email: result.data.email,
          phone: result.data.phone || null,
          phone_country_code: phoneCountryCode || null,
          unit: result.data.unit,
          building: result.data.building,
          member_type: result.data.member_type,
          status: result.data.status,
          date_of_birth: null,
          occupation: null,
          residential_address: null,
          mailing_address: null,
          move_in_date: null,
          move_out_date: null,
          emergency_contact_name: null,
          emergency_contact_relationship: null,
          emergency_contact_phone: null,
          emergency_contact_email: null,
          last_access: null,
          last_access_location: null,
          avatar_url: null,
          notes: null,
        });
      } else if (member) {
        await onSubmit({
          name: result.data.name,
          email: result.data.email,
          phone: result.data.phone || null,
          phone_country_code: phoneCountryCode || null,
          unit: result.data.unit,
          building: result.data.building,
          member_type: result.data.member_type,
          status: result.data.status,
        });
      }
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[90] bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="fixed top-0 right-0 bottom-0 z-[100] w-full max-w-2xl bg-surface-light shadow-xl flex flex-col"
        role="dialog"
        aria-labelledby="sheet-title"
      >
        <div className="p-4 flex items-center justify-between bg-surface-gray/50 shrink-0">
          <h2 id="sheet-title" className="text-xl font-bold text-text-main">
            {mode === "create" ? "Add Member" : "Edit Member"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-text-secondary hover:text-text-main hover:bg-surface-gray"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>
        <form
          onSubmit={handleSubmit}
          className="p-6 flex flex-col gap-4 overflow-y-auto flex-1"
        >
          <div>
            <label className="block text-sm font-bold text-text-secondary uppercase tracking-wider mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Smith"
              className={INPUT_CLASS}
              aria-invalid={!!fieldErrors.name}
              aria-describedby={fieldErrors.name ? "name-error" : undefined}
            />
            {fieldErrors.name && (
              <p id="name-error" className="mt-1 text-sm text-danger">
                {fieldErrors.name}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-bold text-text-secondary uppercase tracking-wider mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. john@example.com"
              className={INPUT_CLASS}
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
            />
            {fieldErrors.email && (
              <p id="email-error" className="mt-1 text-sm text-danger">
                {fieldErrors.email}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-bold text-text-secondary uppercase tracking-wider mb-1">
              Mobile
            </label>
            <div className="flex gap-2">
              <select
                value={phoneCountryCode}
                onChange={(e) => setPhoneCountryCode(e.target.value)}
                className={`${INPUT_CLASS} w-32! min-w-32! shrink-0`}
                aria-label="Country code"
              >
                {PHONE_COUNTRY_CODES.map((c) => (
                  <option key={`${c.code}-${c.country}`} value={c.code}>
                    {c.flag} {c.code}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 849222626"
                className={`${INPUT_CLASS} flex-1 min-w-0`}
                aria-invalid={!!fieldErrors.phone}
                aria-describedby={fieldErrors.phone ? "phone-error" : undefined}
              />
            </div>
            {fieldErrors.phone && (
              <p id="phone-error" className="mt-1 text-sm text-danger">
                {fieldErrors.phone}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-text-secondary uppercase tracking-wider mb-1">
                Unit
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. 101"
                className={INPUT_CLASS}
                aria-invalid={!!fieldErrors.unit}
                aria-describedby={fieldErrors.unit ? "unit-error" : undefined}
              />
              {fieldErrors.unit && (
                <p id="unit-error" className="mt-1 text-sm text-danger">
                  {fieldErrors.unit}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-bold text-text-secondary uppercase tracking-wider mb-1">
                Building
              </label>
              <input
                type="text"
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                placeholder="e.g. Tower A"
                className={INPUT_CLASS}
                aria-invalid={!!fieldErrors.building}
                aria-describedby={
                  fieldErrors.building ? "building-error" : undefined
                }
              />
              {fieldErrors.building && (
                <p id="building-error" className="mt-1 text-sm text-danger">
                  {fieldErrors.building}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-text-secondary uppercase tracking-wider mb-1">
                Type
              </label>
              <select
                value={memberType}
                onChange={(e) =>
                  setMemberType(e.target.value as "Owner" | "Tenant")
                }
                className={INPUT_CLASS}
                aria-invalid={!!fieldErrors.member_type}
                aria-describedby={
                  fieldErrors.member_type ? "member_type-error" : undefined
                }
              >
                {MEMBER_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              {fieldErrors.member_type && (
                <p id="member_type-error" className="mt-1 text-sm text-danger">
                  {fieldErrors.member_type}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-bold text-text-secondary uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as typeof status)}
                className={INPUT_CLASS}
                aria-invalid={!!fieldErrors.status}
                aria-describedby={
                  fieldErrors.status ? "status-error" : undefined
                }
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {fieldErrors.status && (
                <p id="status-error" className="mt-1 text-sm text-danger">
                  {fieldErrors.status}
                </p>
              )}
            </div>
          </div>
          {error && <p className="text-danger text-base">{error}</p>}
          <div className="flex gap-3 mt-6 pt-5 mt-auto border-t border-[#333]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 min-h-[44px] text-base border-2 border-[#333] bg-transparent text-text-main hover:bg-surface-gray/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 min-h-[44px] bg-primary text-white font-bold text-base hover:bg-primary-dark disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin shrink-0" />
                  {mode === "create" ? "Creating..." : "Saving..."}
                </>
              ) : mode === "create" ? (
                "Create"
              ) : (
                "Save"
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
