#!/usr/bin/env node

/**
 * SSS Expo Mobile Boilerplate Setup Script
 * 
 * Run with: npm run setup
 * 
 * This script:
 * 1. Prompts for project information
 * 2. Updates package.json and app.json
 * 3. Updates .sss/boilerplate.json with provenance
 * 4. Creates .env.local from .env.example
 * 5. Optionally initializes a fresh git repo
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
  console.log('\n🚀 SSS Expo Mobile Boilerplate Setup\n');
  console.log('This will customize the boilerplate for your project.\n');

  // Gather project info
  const projectSlug = await prompt('Project slug (lowercase, dashes): ');
  const projectName = await prompt('Display name: ');
  const bundleId = await prompt('Bundle ID (com.yourcompany.appname): ');
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

  // Create/update app.json
  const appJsonPath = path.join(process.cwd(), 'app.json');
  const appJson = {
    expo: {
      name: projectName,
      slug: projectSlug,
      version: "1.0.0",
      orientation: "portrait",
      icon: "./assets/icon.png",
      userInterfaceStyle: "automatic",
      splash: {
        image: "./assets/splash.png",
        resizeMode: "contain",
        backgroundColor: "#000000"
      },
      assetBundlePatterns: ["**/*"],
      ios: {
        bundleIdentifier: bundleId,
        supportsTablet: true
      },
      android: {
        package: bundleId,
        adaptiveIcon: {
          foregroundImage: "./assets/adaptive-icon.png",
          backgroundColor: "#000000"
        }
      },
      plugins: [
        "expo-router",
        "expo-secure-store"
      ],
      scheme: projectSlug
    }
  };
  fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
  console.log('✅ Created app.json');

  // Update provenance file
  const provPath = path.join(process.cwd(), '.sss', 'boilerplate.json');
  if (fs.existsSync(provPath)) {
    const prov = JSON.parse(fs.readFileSync(provPath, 'utf8'));
    prov.project_name = projectSlug;
    prov.customizations.setup_completed_at = new Date().toISOString();
    fs.writeFileSync(provPath, JSON.stringify(prov, null, 2));
    console.log('✅ Updated .sss/boilerplate.json');
  }

  // Create .env.local
  const envContent = `# Supabase
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# RevenueCat
EXPO_PUBLIC_REVENUECAT_API_KEY_IOS=your-revenuecat-ios-key
EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID=your-revenuecat-android-key

# PostHog (optional)
EXPO_PUBLIC_POSTHOG_KEY=your-posthog-key
EXPO_PUBLIC_POSTHOG_HOST=https://app.posthog.com
`;
  fs.writeFileSync(path.join(process.cwd(), '.env.local'), envContent);
  console.log('✅ Created .env.local');

  // Create assets directory if missing
  const assetsDir = path.join(process.cwd(), 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
    console.log('✅ Created assets directory');
  }

  // Git setup
  const initGit = await prompt('\nInitialize fresh git repo? (y/n): ');
  if (initGit.toLowerCase() === 'y') {
    const gitDir = path.join(process.cwd(), '.git');
    if (fs.existsSync(gitDir)) {
      fs.rmSync(gitDir, { recursive: true });
    }
    const { execSync } = require('child_process');
    execSync('git init', { stdio: 'inherit' });
    execSync('git add .', { stdio: 'inherit' });
    execSync('git commit -m "Initial commit from sss-expo-starter"', { stdio: 'inherit' });
    console.log('✅ Initialized git repository');
  }

  console.log('\n🎉 Setup complete!\n');
  console.log('Next steps:');
  console.log('  1. npm install');
  console.log('  2. Update .env.local with your API keys');
  console.log('  3. npx expo start');
  console.log('');

  rl.close();
}

main().catch((err) => {
  console.error('Setup failed:', err);
  rl.close();
  process.exit(1);
});

