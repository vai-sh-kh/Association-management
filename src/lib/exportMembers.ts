import * as XLSX from "xlsx";
import type { Member } from "./supabase";
import { formatPhoneDisplay } from "../constants/countryCodes";

const CSV_ESCAPE = (v: string) => {
  const s = String(v ?? "");
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

function memberToRow(m: Member, index: number) {
  return {
    No: index + 1,
    "Member ID": m.member_id ?? "",
    Name: m.name ?? "",
    Email: m.email ?? "",
    Mobile: formatPhoneDisplay(m.phone_country_code, m.phone),
    Unit: m.unit ?? "",
    Building: m.building ?? "",
    Type: m.member_type ?? "",
    Status: m.status ?? "",
    "Last Access": m.last_access
      ? new Date(m.last_access).toLocaleString()
      : "",
    Created: m.created_at ? new Date(m.created_at).toLocaleDateString() : "",
    "ID Card Created": m.id_card_created ? "Yes" : "No",
  };
}

export function exportMembersCSV(members: Member[]): void {
  if (members.length === 0) return;
  const headers = Object.keys(memberToRow(members[0], 0));
  const rows = members.map((m, i) => memberToRow(m, i));
  const line = (r: Record<string, string | number>) =>
    headers.map((h) => CSV_ESCAPE(String(r[h] ?? ""))).join(",");
  const csv = [headers.join(","), ...rows.map(line)].join("\r\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `members-export-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportMembersExcel(members: Member[]): void {
  if (members.length === 0) return;
  const rows = members.map((m, i) => memberToRow(m, i));
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Members");
  XLSX.writeFile(
    wb,
    `members-export-${new Date().toISOString().slice(0, 10)}.xlsx`,
  );
}
