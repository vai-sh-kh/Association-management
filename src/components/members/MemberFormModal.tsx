import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import type { Member } from "../../lib/supabase";
import type { MemberInsert, MemberUpdate } from "../../lib/api/members";
import {
  PHONE_COUNTRY_CODES,
  DEFAULT_PHONE_COUNTRY_CODE,
} from "../../constants/countryCodes";

const MEMBER_TYPES = ["Owner", "Tenant"] as const;
const STATUSES = ["Active", "Inactive"] as const;

type Props = {
  mode: "create" | "edit";
  member?: Member | null;
  onClose: () => void;
  onSubmit: (data: MemberInsert | MemberUpdate) => Promise<void>;
  error: string | null;
};

export default function MemberFormModal({
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

  useEffect(() => {
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
    setSubmitting(true);
    try {
      if (mode === "create") {
        await onSubmit({
          name,
          email,
          phone: phone || null,
          phone_country_code: phoneCountryCode || null,
          unit,
          building,
          member_type: memberType,
          status,
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
          name,
          email,
          phone: phone || null,
          phone_country_code: phoneCountryCode || null,
          unit,
          building,
          member_type: memberType,
          status,
        });
      }
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 bg-surface-gray/50">
          <h3 className="text-xl font-bold text-text-main">
            {mode === "create" ? "Add Member" : "Edit Member"}
          </h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-bold text-text-secondary uppercase tracking-wider mb-1">
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full min-h-[44px] px-4 bg-surface-light text-text-main text-base"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-text-secondary uppercase tracking-wider mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full min-h-[44px] px-4 bg-surface-light text-text-main text-base"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-text-secondary uppercase tracking-wider mb-1">
              Mobile
            </label>
            <div className="flex gap-2">
              <select
                value={phoneCountryCode}
                onChange={(e) => setPhoneCountryCode(e.target.value)}
                className="w-fit min-w-[4rem] min-h-[44px] px-4 bg-surface-light text-text-main text-base border border-[#333] shrink-0"
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
                placeholder="Phone number"
                className="flex-1 min-w-0 min-h-[44px] px-4 bg-surface-light text-text-main text-base border border-[#333]"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-text-secondary uppercase tracking-wider mb-1">
                Unit
              </label>
              <input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full min-h-[44px] px-4 bg-surface-light text-text-main text-base"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-text-secondary uppercase tracking-wider mb-1">
                Building
              </label>
              <input
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                className="w-full min-h-[44px] px-4 bg-surface-light text-text-main text-base"
                required
              />
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
                className="w-full min-h-[44px] px-4 bg-surface-light text-text-main text-base"
              >
                {MEMBER_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-text-secondary uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as typeof status)}
                className="w-full min-h-[44px] px-4 bg-surface-light text-text-main text-base"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {error && <p className="text-danger text-base">{error}</p>}
          <div className="flex gap-3 pt-2">
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
    </div>
  );
}
