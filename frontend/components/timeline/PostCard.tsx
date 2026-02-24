type PostCardProps = {
  post: {
    id: string;
    content: string;
    xPostUrl: string | null;
    publishedAt: string | null;
    status: string;
  };
};

export function PostCard({ post }: PostCardProps) {
  return (
    <div className="space-y-2">
      <p className="whitespace-pre-line text-sm leading-relaxed">{post.content}</p>
      <div className="text-muted-foreground flex items-center justify-between text-xs">
        <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleString() : '—'}</span>
        {post.xPostUrl ? (
          <a
            href={post.xPostUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold hover:text-gold/80"
          >
            Ver no X
          </a>
        ) : (
          <span>Status: {post.status}</span>
        )}
      </div>
    </div>
  );
}
