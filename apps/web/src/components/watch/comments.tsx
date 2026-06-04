import { commentRepo } from "@btc/db";
import { formatRelativeTime } from "@btc/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@btc/ui/components/avatar";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { CommentComposer } from "./comment-composer";

export async function Comments({ videoId }: { videoId: string }) {
  const [user, page] = await Promise.all([
    getCurrentUser(),
    commentRepo.listPublishedComments(videoId, 0, 50),
  ]);

  return (
    <section className="space-y-6">
      <h2 className="text-lg font-semibold">
        {page.total} {page.total === 1 ? "comment" : "comments"}
      </h2>

      {user ? (
        <CommentComposer
          videoId={videoId}
          user={{ name: user.name, image: user.image }}
        />
      ) : (
        <div className="glass flex items-center justify-between gap-4 rounded-xl px-4 py-3 text-sm">
          <span className="text-muted-foreground">
            Sign in to join the conversation.
          </span>
          <Link
            href={`/login?redirect=/watch`}
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </div>
      )}

      <ul className="space-y-5">
        {page.items.map((c) => {
          const initials = (c.authorName || "?").slice(0, 2).toUpperCase();
          return (
            <li key={c.id} className="flex gap-3">
              <Avatar className="size-9 shrink-0">
                {c.authorImage ? (
                  <AvatarImage src={c.authorImage} alt={c.authorName} />
                ) : null}
                <AvatarFallback className="bg-secondary text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{c.authorName}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(c.createdAt)}
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                  {c.body}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
