import { NextResponse } from "next/server";
import { GitHubService } from "@/lib/github";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Retrieve the user's Github account token
  // Better Auth stores provider tokens in the Account table if configured
  // Note: For full implementation, ensure you request the access token from the DB.
  
  // Example dummy token until real DB sync
  const token = process.env.GITHUB_DUMMY_TOKEN || "mock-token";
  
  try {
    const github = new GitHubService(token);
    const repos = await github.getUserRepositories();
    return NextResponse.json(repos);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch repositories" }, { status: 500 });
  }
}
