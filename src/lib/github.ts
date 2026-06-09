import { Octokit } from '@octokit/rest';

export class GitHubService {
  private octokit: Octokit;

  private token: string;

  constructor(token: string) {
    this.token = token;
    this.octokit = new Octokit({ auth: token });
  }

  async getUserRepositories() {
    const { data } = await this.octokit.rest.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 50,
    });
    return data;
  }

  async getPullRequests(owner: string, repo: string) {
    const { data } = await this.octokit.rest.pulls.list({
      owner,
      repo,
      state: 'open',
      sort: 'updated',
      direction: 'desc',
    });
    return data;
  }

  async getPullRequestDiff(owner: string, repo: string, pull_number: number) {
    if (this.token === "mock-token") {
      return `
diff --git a/src/lib/db.ts b/src/lib/db.ts
index 1234567..890abcd 100644
--- a/src/lib/db.ts
+++ b/src/lib/db.ts
@@ -40,7 +40,7 @@
-    const user = await db.query("SELECT * FROM users WHERE id = " + req.query.id);
+    const user = await db.query("SELECT * FROM users WHERE id = $1", [req.query.id]);
      `;
    }

    const { data } = await this.octokit.rest.pulls.get({
      owner,
      repo,
      pull_number,
      mediaType: {
        format: 'diff',
      },
    });
    return data as unknown as string;
  }

  async postPullRequestComment(
    owner: string, 
    repo: string, 
    pull_number: number, 
    body: string, 
    commit_id: string, 
    path: string, 
    line: number
  ) {
    const { data } = await this.octokit.rest.pulls.createReviewComment({
      owner,
      repo,
      pull_number,
      body,
      commit_id,
      path,
      line,
    });
    return data;
  }

  async postGeneralComment(owner: string, repo: string, issue_number: number, body: string) {
    const { data } = await this.octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number,
      body,
    });
    return data;
  }
}
