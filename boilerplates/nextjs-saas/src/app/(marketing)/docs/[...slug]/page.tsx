import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen } from "lucide-react";

interface DocsPageProps {
  params: Promise<{ slug: string[] }>;
}

const docCategories: Record<string, { title: string; icon: string }> = {
  "getting-started": { title: "Getting Started", icon: "🚀" },
  authentication: { title: "Authentication", icon: "🔐" },
  payments: { title: "Payments", icon: "💳" },
  "ai-integration": { title: "AI Integration", icon: "🤖" },
  analytics: { title: "Analytics", icon: "📊" },
  email: { title: "Email", icon: "📧" },
};

const docTopics: Record<string, string[]> = {
  "getting-started": ["installation", "configuration", "first-steps"],
  authentication: ["email-password", "oauth-providers", "session-management"],
  payments: ["checkout-flow", "webhooks", "customer-portal"],
  "ai-integration": ["streaming-responses", "chat-interface", "credits-system"],
  analytics: ["event-tracking", "feature-flags", "ab-testing"],
  email: ["templates", "sending-emails", "webhooks"],
};

function formatSlug(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default async function DocsContentPage({ params }: DocsPageProps) {
  const { slug } = await params;
  const category = slug[0];
  const topic = slug[1];

  const categoryInfo = docCategories[category];
  const categoryTopics = docTopics[category];
  const isValidTopic = categoryTopics?.includes(topic);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="py-20 md:py-32">
        <div className="container px-4 md:px-6 max-w-4xl mx-auto">
          <Link
            href="/docs"
            className="inline-flex items-center text-slate-400 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Docs
          </Link>

          {categoryInfo && isValidTopic ? (
            <>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">{categoryInfo.icon}</span>
                <div>
                  <p className="text-sm text-emerald-400 font-medium">
                    {categoryInfo.title}
                  </p>
                  <h1 className="text-3xl md:text-4xl font-bold text-white">
                    {formatSlug(topic)}
                  </h1>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-12 text-center">
                <div className="text-6xl mb-4">📚</div>
                <h2 className="text-2xl font-semibold text-white mb-2">
                  Documentation Coming Soon
                </h2>
                <p className="text-slate-400 mb-6 max-w-md mx-auto">
                  We&apos;re working on comprehensive documentation for{" "}
                  {formatSlug(topic)}. Check back soon!
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/docs">
                    <Button
                      variant="outline"
                      className="border-slate-600 text-white hover:bg-slate-800"
                    >
                      <BookOpen className="mr-2 h-4 w-4" />
                      Browse All Docs
                    </Button>
                  </Link>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-700/50">
                  <p className="text-sm text-slate-500 mb-2">
                    Want to contribute? Add documentation to:
                  </p>
                  <code className="text-sm bg-slate-900 px-3 py-1 rounded text-emerald-400">
                    /content/docs/{category}/{topic}.mdx
                  </code>
                </div>
              </div>

              <div className="mt-12">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Other topics in {categoryInfo.title}
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {categoryTopics
                    ?.filter((t) => t !== topic)
                    .map((t) => (
                      <Link
                        key={t}
                        href={`/docs/${category}/${t}`}
                        className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/20 hover:bg-slate-800/40 transition-colors"
                      >
                        <span className="text-white font-medium">
                          {formatSlug(t)}
                        </span>
                      </Link>
                    ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h1 className="text-3xl font-bold text-white mb-4">
                Documentation Not Found
              </h1>
              <p className="text-slate-400 mb-8">
                The documentation page you&apos;re looking for doesn&apos;t
                exist or has been moved.
              </p>
              <Link href="/docs">
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  View All Documentation
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
