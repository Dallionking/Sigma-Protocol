export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Terms of Service
            </h1>
            <p className="text-slate-400">
              Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>

          <div className="prose prose-invert prose-slate max-w-none">
            <div className="space-y-12">
              {[
                {
                  title: "1. Acceptance of Terms",
                  content: `By accessing and using this service, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.`,
                },
                {
                  title: "2. Description of Service",
                  content: `We provide a software-as-a-service platform that enables users to build and deploy applications. The service includes access to our web application, API, documentation, and customer support.`,
                },
                {
                  title: "3. User Accounts",
                  content: `You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account. You may not use another person's account without permission.`,
                },
                {
                  title: "4. Acceptable Use",
                  content: `You agree not to use the service for any unlawful purpose or in any way that could damage, disable, or impair the service. You may not attempt to gain unauthorized access to any part of the service.`,
                },
                {
                  title: "5. Payment Terms",
                  content: `Paid subscriptions are billed in advance on a monthly or annual basis. All fees are non-refundable except as required by law. We may change our fees upon 30 days' notice.`,
                },
                {
                  title: "6. Intellectual Property",
                  content: `The service and its original content, features, and functionality are owned by us and are protected by international copyright, trademark, and other intellectual property laws.`,
                },
                {
                  title: "7. Termination",
                  content: `We may terminate or suspend your account and access to the service immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.`,
                },
                {
                  title: "8. Limitation of Liability",
                  content: `In no event shall we be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or other intangible losses.`,
                },
                {
                  title: "9. Changes to Terms",
                  content: `We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the service. Continued use after changes constitutes acceptance.`,
                },
                {
                  title: "10. Contact Information",
                  content: `If you have any questions about these Terms, please contact us at legal@example.com.`,
                },
              ].map((section, i) => (
                <div key={i} className="bg-slate-800/20 border border-slate-700/30 rounded-2xl p-8">
                  <h2 className="text-xl font-semibold text-white mb-4">{section.title}</h2>
                  <p className="text-slate-400 leading-relaxed">{section.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

