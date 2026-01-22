import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * Blog Index Page (Shell)
 * 
 * Placeholder blog page. Customize with your CMS or MDX content.
 * 
 * @module marketing
 */
export default function BlogPage() {
  return (
    <div className="py-20 md:py-32">
      <div className="container px-4 md:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Insights, updates, and best practices for building modern SaaS applications.
          </p>
        </div>

        {/* Blog Grid (Placeholder) */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {blogPosts.map((post, idx) => (
            <article
              key={idx}
              className="group rounded-2xl border overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Image placeholder */}
              <div className="aspect-video bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20" />
              
              <div className="p-6">
                <div className="text-sm text-muted-foreground mb-2">
                  {post.date} · {post.readTime}
                </div>
                <h2 className="text-xl font-semibold mb-2 group-hover:text-purple-600 transition-colors">
                  {post.title}
                </h2>
                <p className="text-muted-foreground mb-4">{post.excerpt}</p>
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center text-purple-600 hover:underline"
                >
                  Read more
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Empty State */}
        <div className="mt-16 text-center p-12 border-2 border-dashed rounded-2xl">
          <p className="text-muted-foreground mb-4">
            This is a blog shell. Connect your CMS or add MDX files to populate content.
          </p>
          <code className="text-sm bg-muted px-3 py-1 rounded">
            /src/app/(marketing)/blog/[slug]/page.tsx
          </code>
        </div>
      </div>
    </div>
  );
}

// Placeholder blog posts
const blogPosts = [
  {
    slug: "getting-started",
    title: "Getting Started with SSS SaaS",
    excerpt: "Learn how to set up your project and start building in minutes.",
    date: "Dec 20, 2025",
    readTime: "5 min read",
  },
  {
    slug: "authentication-guide",
    title: "Complete Authentication Guide",
    excerpt: "Implement secure authentication with Supabase and best practices.",
    date: "Dec 18, 2025",
    readTime: "8 min read",
  },
  {
    slug: "stripe-integration",
    title: "Stripe Integration Deep Dive",
    excerpt: "Set up subscriptions, one-time payments, and usage-based billing.",
    date: "Dec 15, 2025",
    readTime: "10 min read",
  },
];

