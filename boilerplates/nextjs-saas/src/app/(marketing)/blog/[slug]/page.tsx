import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Calendar } from "lucide-react";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

const blogPosts: Record<
  string,
  { title: string; date: string; readTime: string }
> = {
  "getting-started": {
    title: "Getting Started with SSS SaaS",
    date: "Dec 20, 2025",
    readTime: "5 min read",
  },
  "authentication-guide": {
    title: "Complete Authentication Guide",
    date: "Dec 18, 2025",
    readTime: "8 min read",
  },
  "stripe-integration": {
    title: "Stripe Integration Deep Dive",
    date: "Dec 15, 2025",
    readTime: "10 min read",
  },
};

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = blogPosts[slug];

  return (
    <div className="py-20 md:py-32">
      <div className="container px-4 md:px-6 max-w-3xl mx-auto">
        <Link
          href="/blog"
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blog
        </Link>

        {post ? (
          <>
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {post.title}
              </h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {post.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {post.readTime}
                </span>
              </div>
            </div>

            <div className="prose dark:prose-invert max-w-none">
              <div className="rounded-2xl border-2 border-dashed p-12 text-center bg-muted/30">
                <div className="text-6xl mb-4">📝</div>
                <h2 className="text-2xl font-semibold mb-2">Coming Soon</h2>
                <p className="text-muted-foreground mb-6">
                  This blog post is currently being written. Check back soon for
                  the full content!
                </p>
                <p className="text-sm text-muted-foreground">
                  Want to contribute? Add your MDX content to:
                </p>
                <code className="text-sm bg-muted px-3 py-1 rounded mt-2 inline-block">
                  /content/blog/{slug}.mdx
                </code>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The blog post you&apos;re looking for doesn&apos;t exist or has
              been moved.
            </p>
            <Link href="/blog">
              <Button>View All Posts</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export function generateStaticParams() {
  return Object.keys(blogPosts).map((slug) => ({ slug }));
}
