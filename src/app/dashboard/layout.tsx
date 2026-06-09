"use client";

import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  if (isPending) return <div className="p-8 text-center text-white">Loading session...</div>;
  if (!session) return null;

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <header className="flex items-center justify-between px-8 py-4 bg-neutral-950 border-b border-neutral-800">
        <div className="flex items-center space-x-8">
          <Link href="/" className="font-bold text-xl tracking-tight">ReviewFlow<span className="text-blue-500">AI</span></Link>
          <nav className="flex items-center space-x-6 text-sm font-medium text-neutral-400">
            <Link href="/dashboard" className="hover:text-white transition-colors">Repositories</Link>
            <Link href="/dashboard/history" className="hover:text-white transition-colors">History</Link>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-neutral-300">{session.user?.name || session.user?.email}</span>
          <Button variant="outline" size="sm" className="border-neutral-700 hover:bg-neutral-800 text-white" onClick={() => signOut({ fetchOptions: { onSuccess: () => router.push("/login") } })}>
            Sign Out
          </Button>
        </div>
      </header>
      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  );
}
