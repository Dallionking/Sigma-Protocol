import { createFileRoute } from '@tanstack/react-router';
import { CreditCard, Download } from 'lucide-react';

/**
 * Billing Page
 * 
 * Subscription management and payment methods.
 * 
 * @module billing
 */
export const Route = createFileRoute('/(app)/billing')({
  component: BillingPage,
});

function BillingPage() {
  return (
    <div className="max-w-4xl space-y-8">
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
          <button className="px-4 py-2 border rounded-lg hover:bg-muted">
            Change Plan
          </button>
          <button className="px-4 py-2 border rounded-lg text-red-600 hover:bg-red-50">
            Cancel Subscription
          </button>
        </div>
      </div>

      {/* Payment Method */}
      <div className="rounded-xl border bg-background p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Payment Method</h2>
          <button className="px-3 py-1.5 text-sm border rounded-lg hover:bg-muted">
            Add New
          </button>
        </div>

        <div className="flex items-center gap-4 p-4 border rounded-lg">
          <div className="h-10 w-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded flex items-center justify-center">
            <CreditCard className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-medium">•••• •••• •••• 4242</p>
            <p className="text-sm text-muted-foreground">Expires 12/2028</p>
          </div>
          <button className="px-3 py-1.5 text-sm hover:bg-muted rounded-lg">
            Edit
          </button>
        </div>
      </div>

      {/* Invoices */}
      <div className="rounded-xl border bg-background p-6">
        <h2 className="text-lg font-semibold mb-6">Invoices</h2>

        <div className="space-y-3">
          {invoices.map((invoice, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">{invoice.date}</p>
                <p className="text-sm text-muted-foreground">{invoice.description}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                  {invoice.status}
                </span>
                <span className="font-medium">{invoice.amount}</span>
                <button className="p-2 hover:bg-muted rounded-lg">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const invoices = [
  { date: 'Dec 20, 2025', description: 'Pro Plan - Monthly', amount: '$29.00', status: 'Paid' },
  { date: 'Nov 20, 2025', description: 'Pro Plan - Monthly', amount: '$29.00', status: 'Paid' },
  { date: 'Oct 20, 2025', description: 'Pro Plan - Monthly', amount: '$29.00', status: 'Paid' },
];

