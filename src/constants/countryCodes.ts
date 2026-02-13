/**
 * Popular country calling codes with flag emoji. India is default.
 * Source: ITU country calling codes (web search verified).
 */
export const PHONE_COUNTRY_CODES = [
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+1", country: "United States", flag: "🇺🇸" },
  { code: "+44", country: "United Kingdom", flag: "🇬🇧" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
  { code: "+86", country: "China", flag: "🇨🇳" },
  { code: "+81", country: "Japan", flag: "🇯🇵" },
  { code: "+49", country: "Germany", flag: "🇩🇪" },
  { code: "+33", country: "France", flag: "🇫🇷" },
  { code: "+55", country: "Brazil", flag: "🇧🇷" },
  { code: "+1", country: "Canada", flag: "🇨🇦" },
] as const;

export const DEFAULT_PHONE_COUNTRY_CODE = "+91";

export function getCountryByCode(code: string | null) {
  if (!code) return null;
  return PHONE_COUNTRY_CODES.find((c) => c.code === code) ?? null;
}

export function formatPhoneDisplay(
  countryCode: string | null,
  phone: string | null
): string {
  if (!phone?.trim()) return "—";
  const country = getCountryByCode(countryCode);
  const prefix = country ? `${country.flag} ${country.code} ` : countryCode ? `${countryCode} ` : "";
  return `${prefix}${phone.trim()}`;
}
