"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, CreditCard, Download, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Billing Page
 * 
 * Subscription management, plan display, and payment methods.
 * 
 * @module billing
 */
export default function BillingPage() {
  const [currentPlan] = useState("pro");

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Billing</h1>
        <p className="text-muted-foreground mt-1">
          Manage your subscription and payment methods.
        </p>
      </div>

      {/* Current Plan */}
      <div className="rounded-xl border bg-background p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Current Plan</h2>
          <span className="px-3 py-1 text-sm font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 rounded-full">
            Pro Plan
          </span>
        </div>

        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-4xl font-bold">$29</span>
          <span className="text-muted-foreground">/month</span>
        </div>
        <p className="text-muted-foreground mb-6">
          Billed monthly. Next billing date: January 20, 2026
        </p>

        <div className="flex gap-4">
          <Button variant="outline">Change Plan</Button>
          <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
            Cancel Subscription
          </Button>
        </div>
      </div>

      {/* Usage */}
      <div className="rounded-xl border bg-background p-6">
        <h2 className="text-lg font-semibold mb-6">Usage This Month</h2>
        
        <div className="space-y-4">
          {usageItems.map((item, idx) => (
            <div key={idx}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{item.label}</span>
                <span className="text-sm text-muted-foreground">
                  {item.used} / {item.limit}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    item.percentage > 80 ? "bg-red-500" : "bg-purple-600"
                  )}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <div className="rounded-xl border bg-background p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Payment Method</h2>
          <Button variant="outline" size="sm">Add New</Button>
        </div>

        <div className="flex items-center gap-4 p-4 border rounded-lg">
          <div className="h-10 w-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded flex items-center justify-center">
            <CreditCard className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-medium">•••• •••• •••• 4242</p>
            <p className="text-sm text-muted-foreground">Expires 12/2028</p>
          </div>
          <Button variant="ghost" size="sm">Edit</Button>
        </div>
      </div>

      {/* Invoices */}
      <div className="rounded-xl border bg-background p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Invoices</h2>
          <Button variant="outline" size="sm">View All</Button>
        </div>

        <div className="space-y-3">
          {invoices.map((invoice, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <p className="font-medium">{invoice.date}</p>
                <p className="text-sm text-muted-foreground">{invoice.description}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className={cn(
                  "px-2 py-1 text-xs font-medium rounded-full",
                  invoice.status === "Paid" 
                    ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
                )}>
                  {invoice.status}
                </span>
                <span className="font-medium">{invoice.amount}</span>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const usageItems = [
  { label: "AI Credits", used: 750, limit: 1000, percentage: 75 },
  { label: "Storage", used: "4.2 GB", limit: "10 GB", percentage: 42 },
  { label: "API Requests", used: "45K", limit: "100K", percentage: 45 },
];

const invoices = [
  { date: "Dec 20, 2025", description: "Pro Plan - Monthly", amount: "$29.00", status: "Paid" },
  { date: "Nov 20, 2025", description: "Pro Plan - Monthly", amount: "$29.00", status: "Paid" },
  { date: "Oct 20, 2025", description: "Pro Plan - Monthly", amount: "$29.00", status: "Paid" },
];

