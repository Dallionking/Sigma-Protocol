#!/usr/bin/env node

/**
 * SSS TanStack Start Boilerplate Setup Script
 * 
 * Run with: npm run setup
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function main() {
  console.log('\n⚡ SSS TanStack Start Boilerplate Setup\n');

  const projectSlug = await prompt('Project slug (lowercase, dashes): ');
  const projectName = await prompt('Display name: ');
  const description = await prompt('Description: ');
  const authorName = await prompt('Author name: ');

  console.log('\n📝 Updating project files...\n');

  // Update package.json
  const pkgPath = path.join(process.cwd(), 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  pkg.name = projectSlug;
  pkg.description = description;
  pkg.author = authorName;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
  console.log('✅ Updated package.json');

  // Update provenance
  const provPath = path.join(process.cwd(), '.sss', 'boilerplate.json');
  if (fs.existsSync(provPath)) {
    const prov = JSON.parse(fs.readFileSync(provPath, 'utf8'));
    prov.project_name = projectSlug;
    prov.customizations.setup_completed_at = new Date().toISOString();
    fs.writeFileSync(provPath, JSON.stringify(prov, null, 2));
    console.log('✅ Updated .sigma/boilerplate.json');
  }

  // Create .env.local
  const envContent = `# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# OpenAI
OPENAI_API_KEY=sk-...

# Resend
RESEND_API_KEY=re_...

# PostHog (optional)
VITE_POSTHOG_KEY=
VITE_POSTHOG_HOST=https://app.posthog.com
`;
  fs.writeFileSync(path.join(process.cwd(), '.env.local'), envContent);
  console.log('✅ Created .env.local');

  const initGit = await prompt('\nInitialize fresh git repo? (y/n): ');
  if (initGit.toLowerCase() === 'y') {
    const gitDir = path.join(process.cwd(), '.git');
    if (fs.existsSync(gitDir)) fs.rmSync(gitDir, { recursive: true });
    const { execSync } = require('child_process');
    execSync('git init', { stdio: 'inherit' });
    execSync('git add .', { stdio: 'inherit' });
    execSync('git commit -m "Initial commit from sss-tanstack-starter"', { stdio: 'inherit' });
    console.log('✅ Initialized git repository');
  }

  console.log('\n🎉 Setup complete!\n');
  console.log('Next steps:');
  console.log('  1. npm install');
  console.log('  2. Update .env.local with your API keys');
  console.log('  3. npm run dev');
  console.log('');

  rl.close();
}

main().catch((err) => {
  console.error('Setup failed:', err);
  rl.close();
  process.exit(1);
});

