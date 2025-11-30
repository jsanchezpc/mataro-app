/**
 * Returns the database ID based on the current environment
 * @returns "production" for production environment, "dev1" for all other cases
 */
export function getDbId(): string {
  const env = process.env.NEXT_PUBLIC_ENV;
  
  // Solo usar production si explícitamente está configurado como "production"
  if (env === "production") {
    return "production";
  }
  
  // Para cualquier otro caso (dev, staging, undefined, etc.), usar dev1
  // Esto asegura que nunca se use una base de datos "(default)" no intencionada
  return "dev1";
}
