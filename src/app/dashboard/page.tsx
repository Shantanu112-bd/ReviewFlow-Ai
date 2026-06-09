"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface Repository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string;
}

export default function DashboardPage() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRepos() {
      try {
        const res = await fetch("/api/github/repositories");
        if (res.ok) {
          const data = await res.json();
          setRepos(data);
        }
      } catch (err) {
        console.error("Failed to fetch repositories", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRepos();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Repositories</h1>
        <p className="text-muted-foreground">Select a repository to view and review pull requests.</p>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading repositories from GitHub...</div>
      ) : repos.length === 0 ? (
        <div className="text-center py-12 border rounded-lg border-dashed">
          <p className="text-muted-foreground">No repositories found.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {repos.map((repo) => (
            <Link key={repo.id} href={`/dashboard/${repo.full_name}`}>
              <Card className="hover:bg-slate-50 transition-colors h-full cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg">{repo.name}</CardTitle>
                  <CardDescription className="truncate">{repo.full_name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-500 line-clamp-2">
                    {repo.description || "No description provided."}
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                      {repo.private ? "Private" : "Public"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
