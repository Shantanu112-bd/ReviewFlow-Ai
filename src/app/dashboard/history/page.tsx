import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { reviewQueue } from "@/lib/queue/queues";

export default async function HistoryPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) redirect('/login');

  const reviews = await prisma.review.findMany({
    where: { reviewerId: session.user.id },
    include: {
      pullRequest: {
        include: { repository: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Review History</h1>
          <p className="text-neutral-400">Browse and search past code reviews.</p>
        </div>
        <div className="flex items-center space-x-4">
          <Input 
            placeholder="Search by PR or Repo..." 
            className="bg-neutral-900 border-neutral-800 text-white w-64"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {reviews.length === 0 ? (
          <div className="p-12 text-center border border-neutral-800 rounded-lg text-neutral-500">
            No history found. Start a review first!
          </div>
        ) : reviews.map(review => (
          <Card key={review.id} className="bg-neutral-950 border-neutral-800 hover:border-neutral-700 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-lg text-neutral-200">
                  {review.pullRequest.repository.fullName} <span className="text-neutral-500 font-normal">#{review.pullRequest.number}</span>
                </CardTitle>
                <div className="text-sm text-neutral-400">{review.pullRequest.title}</div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <StatusBadge status={review.status === "COMPLETED" ? (review.recommendation || review.status) : review.status} />
                {review.score !== null && <span className="text-sm font-bold">Score: {review.score}/100</span>}
              </div>
            </CardHeader>
            <CardContent className="flex justify-between items-center mt-4">
              <div className="text-xs text-neutral-500">
                {new Date(review.createdAt).toLocaleString()}
              </div>
              <div className="flex space-x-2">
                <Link href={`/dashboard/review/${review.id}`}>
                  <Button variant="outline" size="sm" className="border-neutral-700 hover:bg-neutral-800 text-white">
                    View Report
                  </Button>
                </Link>
                {review.status === "COMPLETED" && (
                  <form action={async () => {
                    "use server";
                    const newReview = await prisma.review.create({
                      data: {
                        pullRequestId: review.pullRequest.id,
                        reviewerId: session.user.id,
                        status: "PENDING"
                      }
                    });
                    await reviewQueue.add("start-review", { 
                      reviewId: newReview.id,
                      repositoryId: review.pullRequest.repositoryId,
                      pullRequestId: review.pullRequestId,
                      userId: session.user.id
                    });
                    redirect(`/dashboard/review/${newReview.id}`);
                  }}>
                    <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                      Re-Review
                    </Button>
                  </form>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
