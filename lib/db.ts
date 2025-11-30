/**
 * Returns the database ID based on the current environment
 * @returns "dev1" for dev/staging environments, "production" for production
 */
export function getDbId(): string {
  const env = process.env.NEXT_PUBLIC_ENV;
  
  if (env === "production") {
    return "production";
  }
  
  if (env === "dev" || env === "staging") {
    return "dev1";
  }
  
  // Default fallback
  return "(default)";
}
