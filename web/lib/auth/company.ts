import "server-only";

/**
 * The authentication integration owns this boundary in production. Development
 * uses one server environment value only; callers cannot select a company.
 */
export function requireCompanyId(): string {
  if (process.env.NODE_ENV !== "production") {
    const companyId = process.env.KVCH_DEVELOPMENT_COMPANY_ID?.trim();
    if (companyId) return companyId;
  }
  throw new Error("No verified KVCH company is available for this request");
}
