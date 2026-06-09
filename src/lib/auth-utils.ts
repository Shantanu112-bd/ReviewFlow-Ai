import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Securely extracts the current user's GitHub access token from the database.
 * Returns null if the user is not authenticated or the token is not found.
 */
export async function getGitHubToken(): Promise<string | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  // Find the GitHub account associated with this user
  const account = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      providerId: "github",
    },
  });

  return account?.accessToken || null;
}
