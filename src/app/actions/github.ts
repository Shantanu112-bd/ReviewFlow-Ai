"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/db";
import { GitHubService } from "@/lib/github";

export async function publishComment(reviewId: string, markdown: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      pullRequest: {
        include: { repository: true }
      }
    }
  });

  if (!review) {
    return { success: false, error: "Review not found" };
  }

  if (review.reviewerId !== session.user.id) {
    return { success: false, error: "Unauthorized: You do not own this review." };
  }

  const [owner, repo] = review.pullRequest.repository.fullName.split('/');
  
  const token = process.env.GITHUB_DUMMY_TOKEN || "mock-token";
  const github = new GitHubService(token);

  try {
    // In a real scenario with a valid token, this will hit GitHub.
    // For local dev/demo without a real token, it will throw unless mocked.
    await github.postGeneralComment(
      owner,
      repo,
      review.pullRequest.number,
      markdown
    );
    
    return { success: true };
  } catch (error: any) {
    console.error("Failed to post comment:", error);
    // If we're just demoing and the token is fake, we pretend it worked.
    if (token === "mock-token") {
      return { success: true, mocked: true };
    }
    return { success: false, error: error.message || "Failed to post to GitHub" };
  }
}
