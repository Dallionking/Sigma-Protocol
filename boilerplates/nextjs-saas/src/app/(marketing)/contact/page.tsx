"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/ui/blur-fade";
import { BorderBeam } from "@/components/ui/border-beam";
import { Mail, MessageSquare, Twitter } from "lucide-react";

/**
 * Contact Page
 *
 * Contact form with company info, styled to match site design system.
 *
 * @module marketing
 */
export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Add your form submission logic here
  };

  return (
    <div className="py-20 md:py-32">
      <div className="container px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Left Column - Info */}
            <div>
              <BlurFade delay={0.1} inView>
                <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium bg-background shadow-sm mb-6">
                  <Mail className="mr-2 h-4 w-4 text-purple-600" />
                  <span>Contact Us</span>
                </div>
              </BlurFade>

              <BlurFade delay={0.2} inView>
                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                  Let&apos;s start a{" "}
                  <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    conversation
                  </span>
                </h1>
              </BlurFade>

              <BlurFade delay={0.3} inView>
                <p className="text-xl text-muted-foreground mb-12">
                  Have a question or want to work together? We&apos;d love to
                  hear from you.
                </p>
              </BlurFade>

              <div className="space-y-6">
                {contactMethods.map((item, i) => (
                  <BlurFade key={i} delay={0.4 + i * 0.1} inView>
                    <div className="flex gap-4 p-4 rounded-xl border hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/5 transition-all">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/10 to-blue-500/10 flex items-center justify-center">
                        <item.icon className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">
                          {item.title}
                        </div>
                        <div className="font-medium">{item.value}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.description}
                        </div>
                      </div>
                    </div>
                  </BlurFade>
                ))}
              </div>
            </div>

            {/* Right Column - Form */}
            <BlurFade delay={0.3} inView>
              <div className="relative rounded-2xl border p-8 bg-background">
                <BorderBeam
                  size={100}
                  duration={10}
                  colorFrom="#8b5cf6"
                  colorTo="#3b82f6"
                  borderWidth={1}
                />

                {submitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/10 to-blue-500/10 flex items-center justify-center mx-auto mb-4">
                      <Mail className="h-8 w-8 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      Message Sent!
                    </h3>
                    <p className="text-muted-foreground">
                      We&apos;ll get back to you within 24 hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-colors"
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-colors"
                          placeholder="Doe"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-colors"
                        placeholder="john@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Subject
                      </label>
                      <select
                        required
                        className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-colors"
                      >
                        <option value="">Select a topic</option>
                        <option value="sales">Sales Inquiry</option>
                        <option value="support">Technical Support</option>
                        <option value="partnership">Partnership</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Message
                      </label>
                      <textarea
                        rows={5}
                        required
                        className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-colors resize-none"
                        placeholder="Tell us about your project..."
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      Send Message
                    </Button>
                  </form>
                )}
              </div>
            </BlurFade>
          </div>
        </div>
      </div>
    </div>
  );
}

const contactMethods = [
  {
    icon: Mail,
    title: "Email",
    value: "hello@example.com",
    description: "We'll respond within 24 hours",
  },
  {
    icon: MessageSquare,
    title: "Live Chat",
    value: "Available 9am-5pm EST",
    description: "Get instant help from our team",
  },
  {
    icon: Twitter,
    title: "Twitter",
    value: "@yourhandle",
    description: "Follow us for updates",
  },
];
