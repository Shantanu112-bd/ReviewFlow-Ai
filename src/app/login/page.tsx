"use client";

import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const handleGithubLogin = async () => {
    await signIn.social({ provider: "github", callbackURL: "/dashboard" });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">ReviewFlow AI</CardTitle>
          <CardDescription className="text-center">
            Sign in to manage your automated PR reviews.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={handleGithubLogin}>
            Sign in with GitHub
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
