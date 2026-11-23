export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const PIN_RE = /^[1-9][0-9]{5}$/;
export const PHONE_RE = /^[+]?[0-9\s-]{10,15}$/;

export const isEmail = (v: unknown): v is string => typeof v === "string" && EMAIL_RE.test(v.trim());
export const str = (v: unknown, max = 500) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export type FieldErrors = Record<string, string>;

export function validateAddress(a: Record<string, unknown>): FieldErrors {
  const e: FieldErrors = {};
  if (str(a.fullName).length < 2) e.fullName = "Enter the recipient's full name.";
  if (!PHONE_RE.test(str(a.phone))) e.phone = "Enter a valid phone number (10–15 digits).";
  if (str(a.line1).length < 4) e.line1 = "Enter a street address.";
  if (str(a.city).length < 2) e.city = "Enter a city.";
  if (str(a.state).length < 2) e.state = "Enter a state.";
  if (!PIN_RE.test(str(a.postalCode))) e.postalCode = "Enter a valid 6-digit PIN code.";
  return e;
}

export function validatePassword(pw: unknown): string | null {
  if (typeof pw !== "string" || pw.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Za-z]/.test(pw) || !/[0-9]/.test(pw)) return "Use at least one letter and one number.";
  return null;
}

export const json = (data: unknown, status = 200) => Response.json(data, { status });
