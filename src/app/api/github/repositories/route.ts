import { NextResponse } from "next/server";
import { GitHubService } from "@/lib/github";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getGitHubToken } from "@/lib/auth-utils";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = await getGitHubToken();
  if (!token) {
    return NextResponse.json({ error: "GitHub account not linked" }, { status: 403 });
  }
  
  try {
    const github = new GitHubService(token);
    const repos = await github.getUserRepositories();
    return NextResponse.json(repos);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch repositories" }, { status: 500 });
  }
}
