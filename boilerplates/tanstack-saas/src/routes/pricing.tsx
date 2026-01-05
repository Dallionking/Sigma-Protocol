import { createFileRoute, Link } from '@tanstack/react-router';
import { Check, ArrowLeft } from 'lucide-react';

/**
 * Pricing Page
 * 
 * Marketing pricing plans.
 * 
 * @module marketing
 */
export const Route = createFileRoute('/pricing')({
  component: PricingPage,
});

function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </header>

      <div className="py-20">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Simple, transparent pricing
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your needs. Start free and upgrade as you grow.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-8 ${
                  plan.popular ? 'border-purple-500 shadow-lg shadow-purple-500/10' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium rounded-full">
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  {plan.price > 0 && <span className="text-muted-foreground">/month</span>}
                </div>

                <Link
                  to="/signup"
                  className={`block w-full py-3 px-4 text-center font-medium rounded-lg mb-8 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                      : 'border hover:bg-muted'
                  }`}
                >
                  {plan.cta}
                </Link>

                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-purple-600 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const plans = [
  {
    name: 'Free',
    description: 'Perfect for side projects',
    price: 0,
    cta: 'Get Started',
    popular: false,
    features: ['100 AI credits/month', '1 project', 'Basic analytics', 'Community support'],
  },
  {
    name: 'Pro',
    description: 'For growing businesses',
    price: 29,
    cta: 'Start Pro Trial',
    popular: true,
    features: ['Unlimited AI credits', 'Unlimited projects', 'Advanced analytics', 'Priority support', 'API access'],
  },
  {
    name: 'Enterprise',
    description: 'For large organizations',
    price: 99,
    cta: 'Contact Sales',
    popular: false,
    features: ['Everything in Pro', 'SSO/SAML', 'Dedicated support', 'SLA guarantee', 'Custom integrations'],
  },
];

