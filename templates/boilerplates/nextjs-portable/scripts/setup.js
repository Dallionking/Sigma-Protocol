#!/usr/bin/env node

/**
 * SSS Next.js Portable Boilerplate Setup Script
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
  console.log('\n🔧 SSS Next.js Portable Boilerplate Setup\n');

  const projectSlug = await prompt('Project slug (lowercase, dashes): ');
  const projectName = await prompt('Display name: ');
  const description = await prompt('Description: ');
  const authorName = await prompt('Author name: ');
  const databaseUrl = await prompt('Database URL (or press Enter to skip): ');

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
  const provPath = path.join(process.cwd(), '.sigma', 'boilerplate.json');
  if (fs.existsSync(provPath)) {
    const prov = JSON.parse(fs.readFileSync(provPath, 'utf8'));
    prov.project_name = projectSlug;
    prov.customizations.setup_completed_at = new Date().toISOString();
    fs.writeFileSync(provPath, JSON.stringify(prov, null, 2));
    console.log('✅ Updated .sigma/boilerplate.json');
  }

  // Create .env.local
  const envContent = `# Database (any PostgreSQL)
DATABASE_URL=${databaseUrl || 'postgresql://postgres:postgres@localhost:5432/myapp'}

# Better Auth
BETTER_AUTH_SECRET=your-random-secret-here
BETTER_AUTH_URL=http://localhost:3000

# GitHub OAuth (optional)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Google OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# OpenAI
OPENAI_API_KEY=sk-...

# Resend
RESEND_API_KEY=re_...

# PostHog (optional)
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
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
    execSync('git commit -m "Initial commit from sss-nextjs-portable"', { stdio: 'inherit' });
    console.log('✅ Initialized git repository');
  }

  console.log('\n🎉 Setup complete!\n');
  console.log('Next steps:');
  console.log('  1. npm install');
  console.log('  2. Update .env.local with your database URL');
  console.log('  3. npm run db:push (apply schema)');
  console.log('  4. npm run dev');
  console.log('');

  rl.close();
}

main().catch((err) => {
  console.error('Setup failed:', err);
  rl.close();
  process.exit(1);
});

