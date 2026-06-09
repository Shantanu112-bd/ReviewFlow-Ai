import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-24">
      <div className="max-w-3xl text-center space-y-8">
        <h1 className="text-6xl font-bold tracking-tighter sm:text-7xl">
          Code Review, <span className="text-neutral-500">Automated.</span>
        </h1>
        <p className="text-xl text-neutral-400">
          ReviewFlow AI uses 5 specialized AI agents to analyze your pull requests for security, performance, architecture, and code quality in real-time.
        </p>
        <div className="flex justify-center pt-8">
          <Link href="/login">
            <Button size="lg" className="bg-white text-black hover:bg-neutral-200 rounded-md px-8 font-medium">
              Get Started with GitHub
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
