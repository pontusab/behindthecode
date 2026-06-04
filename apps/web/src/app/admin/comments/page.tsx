import { commentRepo } from "@btc/db";
import {
  CommentModeration,
  type ModComment,
} from "@/components/admin/comment-moderation";

export default async function AdminCommentsPage() {
  const flagged = await commentRepo.listFlaggedComments(0, 100);
  const comments: ModComment[] = flagged.map((c) => ({
    id: c.id,
    body: c.body,
    authorName: c.authorName,
    createdAt: c.createdAt,
    status: c.status,
    aiReason: c.aiReason ?? null,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-medium tracking-tight">
          Comment moderation
        </h1>
        <p className="text-sm text-muted-foreground">
          Comments flagged by AI moderation are held here for review.
        </p>
      </div>
      <CommentModeration comments={comments} />
    </div>
  );
}
