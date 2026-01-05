#!/usr/bin/env node

/**
 * SSS Boilerplate Setup Script
 * 
 * This script customizes a freshly cloned boilerplate for your project:
 * - Renames the project in package.json
 * - Updates metadata in layout.tsx
 * - Configures environment variables
 * - Initializes fresh git repository
 * 
 * Usage: npm run setup
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  step: (msg) => console.log(`${colors.cyan}→${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bright}${msg}${colors.reset}\n`),
};

async function main() {
  console.log(`
${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 SSS Boilerplate Setup
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}
`);

  // Step 1: Project Information
  log.header('📝 Project Information');
  
  const projectName = await question('Project name (kebab-case): ');
  const displayName = await question('Display name (for UI): ');
  const description = await question('Description: ');
  const author = await question('Author: ');
  
  if (!projectName) {
    log.warn('Project name is required. Exiting.');
    rl.close();
    process.exit(1);
  }

  // Validate project name
  const kebabCaseRegex = /^[a-z][a-z0-9-]*$/;
  if (!kebabCaseRegex.test(projectName)) {
    log.warn('Project name must be kebab-case (lowercase with hyphens). Exiting.');
    rl.close();
    process.exit(1);
  }

  // Step 2: Environment Setup
  log.header('🔧 Environment Configuration');
  
  const setupEnv = await question('Configure environment variables now? (y/n): ');
  let envConfig = {};
  
  if (setupEnv.toLowerCase() === 'y') {
    console.log('\n(Leave blank to skip - you can configure later in .env.local)\n');
    
    envConfig.NEXT_PUBLIC_SUPABASE_URL = await question('Supabase URL: ');
    envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY = await question('Supabase Anon Key: ');
    envConfig.SUPABASE_SERVICE_ROLE_KEY = await question('Supabase Service Role Key: ');
    envConfig.STRIPE_SECRET_KEY = await question('Stripe Secret Key: ');
    envConfig.STRIPE_WEBHOOK_SECRET = await question('Stripe Webhook Secret: ');
    envConfig.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = await question('Stripe Publishable Key: ');
    envConfig.OPENAI_API_KEY = await question('OpenAI API Key: ');
    envConfig.RESEND_API_KEY = await question('Resend API Key: ');
    envConfig.NEXT_PUBLIC_POSTHOG_KEY = await question('PostHog Key: ');
    envConfig.NEXT_PUBLIC_POSTHOG_HOST = await question('PostHog Host (default: https://app.posthog.com): ') || 'https://app.posthog.com';
  }

  // Step 3: Apply Changes
  log.header('🔄 Applying Changes');

  // Update package.json
  log.step('Updating package.json...');
  const packagePath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  packageJson.name = projectName;
  packageJson.description = description || packageJson.description;
  packageJson.author = author || packageJson.author;
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  log.success('Updated package.json');

  // Update layout.tsx metadata
  log.step('Updating app metadata...');
  const layoutPath = path.join(process.cwd(), 'src', 'app', 'layout.tsx');
  if (fs.existsSync(layoutPath)) {
    let layoutContent = fs.readFileSync(layoutPath, 'utf-8');
    layoutContent = layoutContent.replace(
      /title:\s*["'].*["']/,
      `title: "${displayName || projectName}"`
    );
    layoutContent = layoutContent.replace(
      /description:\s*["'].*["']/,
      `description: "${description || 'Built with SSS Methodology'}"`
    );
    fs.writeFileSync(layoutPath, layoutContent);
    log.success('Updated app metadata');
  } else {
    log.warn('layout.tsx not found - skipping metadata update');
  }

  // Update README.md
  log.step('Updating README...');
  const readmePath = path.join(process.cwd(), 'README.md');
  if (fs.existsSync(readmePath)) {
    let readmeContent = fs.readFileSync(readmePath, 'utf-8');
    readmeContent = readmeContent.replace(
      /^#\s+.+$/m,
      `# ${displayName || projectName}`
    );
    if (description) {
      readmeContent = readmeContent.replace(
        /^>\s*.+$/m,
        `> ${description}`
      );
    }
    fs.writeFileSync(readmePath, readmeContent);
    log.success('Updated README.md');
  }

  // Update provenance file
  log.step('Updating provenance metadata...');
  const provenancePath = path.join(process.cwd(), '.sss', 'boilerplate.json');
  if (fs.existsSync(provenancePath)) {
    const provenance = JSON.parse(fs.readFileSync(provenancePath, 'utf-8'));
    provenance.project_name = projectName;
    provenance.customizations = {
      setup_completed_at: new Date().toISOString(),
      branded: false,
      theme_applied: null,
    };
    fs.writeFileSync(provenancePath, JSON.stringify(provenance, null, 2));
    log.success('Updated provenance metadata');
  }

  // Create .env.local
  log.step('Creating .env.local...');
  const envExamplePath = path.join(process.cwd(), '.env.example');
  const envLocalPath = path.join(process.cwd(), '.env.local');
  
  if (fs.existsSync(envExamplePath) && !fs.existsSync(envLocalPath)) {
    let envContent = fs.readFileSync(envExamplePath, 'utf-8');
    
    // Apply provided values
    for (const [key, value] of Object.entries(envConfig)) {
      if (value) {
        const regex = new RegExp(`^${key}=.*$`, 'm');
        if (envContent.match(regex)) {
          envContent = envContent.replace(regex, `${key}=${value}`);
        } else {
          envContent += `\n${key}=${value}`;
        }
      }
    }
    
    fs.writeFileSync(envLocalPath, envContent);
    log.success('Created .env.local');
  } else if (fs.existsSync(envLocalPath)) {
    log.warn('.env.local already exists - skipping');
  }

  // Git initialization
  log.header('🔀 Git Setup');
  
  const initGit = await question('Initialize fresh git repository? (y/n): ');
  
  if (initGit.toLowerCase() === 'y') {
    log.step('Removing old git history...');
    const gitDir = path.join(process.cwd(), '.git');
    if (fs.existsSync(gitDir)) {
      fs.rmSync(gitDir, { recursive: true });
    }
    
    log.step('Initializing new repository...');
    execSync('git init', { stdio: 'ignore' });
    execSync('git add .', { stdio: 'ignore' });
    execSync(`git commit -m "Initial commit from SSS ${packageJson.name || 'boilerplate'}"`, { stdio: 'ignore' });
    log.success('Git repository initialized');
  }

  // Done!
  console.log(`
${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Setup Complete!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}

${colors.green}Your project "${displayName || projectName}" is ready!${colors.reset}

Next steps:
  1. ${colors.cyan}npm install${colors.reset}     - Install dependencies
  2. ${colors.cyan}npm run dev${colors.reset}     - Start development server
  3. Review ${colors.yellow}.env.local${colors.reset} and add any missing keys

SSS Commands available:
  ${colors.cyan}@step-1-ideation${colors.reset}   - Define your product
  ${colors.cyan}@step-2-architecture${colors.reset} - Choose your stack
  ${colors.cyan}@security-audit${colors.reset}    - Check security posture

Happy building! 🚀
`);

  rl.close();
}

main().catch((error) => {
  console.error('Setup failed:', error);
  rl.close();
  process.exit(1);
});

