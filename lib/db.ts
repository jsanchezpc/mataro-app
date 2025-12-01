export function getDbId(): string {
  const env = process.env.NEXT_PUBLIC_ENV;
  if (env === "production") {
    console.log("Be boop 🚀")
    return "production";
  }
  return "dev1";
}
