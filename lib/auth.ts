import { getServerSession } from "next-auth";
// If you have authOptions, import them here.

export async function getCurrentUser() {
  const session = await getServerSession();
  return session?.user;
}

// Old way (Error):
// export function isPatient(user: any) { ... }

// New way (Fixed):
// We tell TS: "User might be null, undefined, or an object with a role string"
export function isPatient(user: { role?: string } | null | undefined): boolean {
    return !!user && user.role === "patient";
}