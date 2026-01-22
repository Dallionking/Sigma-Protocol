#!/usr/bin/env node
import 'dotenv/config';
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { getAccountManager } from './services/account-manager.js';
import { getDatabase, closeDatabase } from './utils/db.js';
import { getTwitterClient } from './api/twitter-client.js';
import { getRateLimiter } from './services/rate-limiter.js';
import { getContentGenerator } from './services/content-generator.js';
import { initScheduler } from './services/scheduler.js';
import { createFeedMonitor } from './services/feed-monitor.js';
import type { Account } from './models/account.js';

const program = new Command();

program
  .name('x-promoter')
  .description('Automated X/Twitter promotion system - Part of SSS Protocol')
  .version('1.0.0');

// ============================================
// Account Commands
// ============================================
const accountCmd = program.command('account')
  .description('Manage X accounts');

accountCmd
  .command('list')
  .description('List all configured accounts')
  .action(async () => {
    const accountManager = getAccountManager();
    const accounts = accountManager.getAccountsSummary();

    console.log(chalk.bold('\n📱 Configured Accounts:\n'));
    
    if (accounts.length === 0) {
      console.log(chalk.yellow('  No accounts configured.'));
      console.log(chalk.gray('  Run `x-promoter account add` to add an account.\n'));
      return;
    }

    for (const account of accounts) {
      const status = account.enabled 
        ? chalk.green('●') 
        : chalk.gray('○');
      const creds = account.hasCredentials 
        ? chalk.green('✓ credentials') 
        : chalk.red('✗ no credentials');
      
      console.log(`  ${status} ${chalk.bold(account.name)} (${account.id})`);
      console.log(`    ${creds} | ${account.maxRepliesPerDay} replies/day`);
    }
    console.log();
  });

accountCmd
  .command('add')
  .description('Add a new account configuration')
  .action(async () => {
    console.log(chalk.bold('\n➕ Add New Account\n'));

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'id',
        message: 'Account ID (lowercase, alphanumeric, hyphens):',
        validate: (input) => /^[a-z0-9-]+$/.test(input) || 'Invalid ID format',
      },
      {
        type: 'input',
        name: 'name',
        message: 'Display name:',
      },
      {
        type: 'input',
        name: 'productName',
        message: 'Product/Project name:',
      },
      {
        type: 'input',
        name: 'productTagline',
        message: 'Product tagline:',
      },
      {
        type: 'input',
        name: 'githubUrl',
        message: 'GitHub URL:',
        validate: (input) => input.startsWith('http') || 'Must be a valid URL',
      },
      {
        type: 'input',
        name: 'creator',
        message: 'Creator name:',
      },
      {
        type: 'number',
        name: 'maxRepliesPerDay',
        message: 'Max replies per day:',
        default: 100,
      },
      {
        type: 'input',
        name: 'keywords',
        message: 'Keywords to monitor (comma-separated):',
      },
    ]);

    const newAccount: Account = {
      id: answers.id,
      name: answers.name,
      enabled: true,
      product: {
        name: answers.productName,
        tagline: answers.productTagline,
        githubUrl: answers.githubUrl,
        creator: answers.creator,
      },
      settings: {
        maxRepliesPerDay: answers.maxRepliesPerDay,
        minIntervalMinutes: 5,
      },
      keywords: answers.keywords.split(',').map((k: string) => k.trim()).filter(Boolean),
    };

    try {
      const accountManager = getAccountManager();
      accountManager.addAccount(newAccount);
      console.log(chalk.green(`\n✓ Account "${answers.id}" added successfully!`));
      console.log(chalk.yellow('\nRemember to add credentials to your .env file:'));
      console.log(chalk.gray(`  X_ACCOUNT_${answers.id.toUpperCase().replace(/-/g, '_')}_API_KEY=...`));
      console.log(chalk.gray(`  X_ACCOUNT_${answers.id.toUpperCase().replace(/-/g, '_')}_API_SECRET=...`));
      console.log(chalk.gray(`  X_ACCOUNT_${answers.id.toUpperCase().replace(/-/g, '_')}_ACCESS_TOKEN=...`));
      console.log(chalk.gray(`  X_ACCOUNT_${answers.id.toUpperCase().replace(/-/g, '_')}_ACCESS_SECRET=...\n`));
    } catch (error: any) {
      console.log(chalk.red(`\n✗ Error: ${error.message}\n`));
    }
  });

accountCmd
  .command('enable <accountId>')
  .description('Enable an account')
  .action(async (accountId: string) => {
    const accountManager = getAccountManager();
    if (accountManager.enableAccount(accountId)) {
      console.log(chalk.green(`✓ Account "${accountId}" enabled`));
    } else {
      console.log(chalk.red(`✗ Account "${accountId}" not found`));
    }
  });

accountCmd
  .command('disable <accountId>')
  .description('Disable an account')
  .action(async (accountId: string) => {
    const accountManager = getAccountManager();
    if (accountManager.disableAccount(accountId)) {
      console.log(chalk.green(`✓ Account "${accountId}" disabled`));
    } else {
      console.log(chalk.red(`✗ Account "${accountId}" not found`));
    }
  });

accountCmd
  .command('test <accountId>')
  .description('Test account connection')
  .action(async (accountId: string) => {
    const spinner = ora('Testing connection...').start();
    
    try {
      const accountManager = getAccountManager();
      const account = accountManager.getAccount(accountId);
      
      if (!account) {
        spinner.fail(`Account "${accountId}" not found or missing credentials`);
        return;
      }

      const client = getTwitterClient(account);
      const user = await client.verifyCredentials();
      
      if (user) {
        spinner.succeed(`Connected as @${user.username} (${user.name})`);
        if (user.public_metrics) {
          console.log(chalk.gray(`  Followers: ${user.public_metrics.followers_count}`));
          console.log(chalk.gray(`  Following: ${user.public_metrics.following_count}`));
        }
      } else {
        spinner.fail('Failed to verify credentials');
      }
    } catch (error: any) {
      spinner.fail(`Connection failed: ${error.message}`);
    }
  });

accountCmd
  .command('stats <accountId>')
  .description('Show account statistics')
  .action(async (accountId: string) => {
    const spinner = ora('Loading stats...').start();
    
    try {
      const accountManager = getAccountManager();
      const account = accountManager.getAccount(accountId);
      
      if (!account) {
        spinner.fail(`Account "${accountId}" not found or missing credentials`);
        return;
      }

      await getDatabase();
      
      const rateLimiter = getRateLimiter(account, { globalDailyLimit: 300 });
      const usage = await rateLimiter.getUsageStats();
      
      const contentGenerator = getContentGenerator(account);
      const contentStats = await contentGenerator.getContentStats();

      spinner.stop();

      console.log(chalk.bold(`\n📊 Stats for ${account.name}:\n`));
      
      console.log(chalk.cyan('Today:'));
      console.log(`  Replies: ${usage.today}/${usage.dailyLimit} (${usage.remaining} remaining)`);
      console.log(`  Can post now: ${usage.canPostNow ? chalk.green('Yes') : chalk.red('No')}`);
      if (usage.lastReply) {
        console.log(`  Last reply: ${usage.lastReply.toLocaleString()}`);
      }

      console.log(chalk.cyan('\nAll Time:'));
      console.log(`  Total replies: ${contentStats.totalReplies}`);
      console.log(`  Average length: ${contentStats.averageLength} chars`);
      
      console.log(chalk.cyan('\nTone Distribution:'));
      for (const [tone, count] of Object.entries(contentStats.toneDistribution)) {
        const percentage = contentStats.totalReplies > 0 
          ? Math.round((count / contentStats.totalReplies) * 100) 
          : 0;
        console.log(`  ${tone}: ${count} (${percentage}%)`);
      }
      console.log();

      await closeDatabase();
    } catch (error: any) {
      spinner.fail(`Error: ${error.message}`);
    }
  });

// ============================================
// Run Commands
// ============================================
program
  .command('start')
  .description('Start the automated promotion system')
  .option('-i, --interval <minutes>', 'Check interval in minutes', '5')
  .action(async (options) => {
    console.log(chalk.bold('\n🚀 Starting X Promoter...\n'));
    
    // Import and run the main module
    await import('./index.js');
  });

program
  .command('run-once')
  .description('Run a single engagement cycle')
  .option('-a, --account <id>', 'Only process specific account')
  .action(async (options) => {
    const spinner = ora('Running engagement cycle...').start();
    
    try {
      await getDatabase();
      const accountManager = getAccountManager();
      const globalSettings = accountManager.getGlobalSettings();

      const scheduler = initScheduler({
        intervalMinutes: 5,
        maxTweetsPerRun: 5,
      });

      spinner.text = 'Finding and processing tweets...';
      await scheduler.triggerManualRun();
      
      spinner.succeed('Engagement cycle completed');
      await closeDatabase();
    } catch (error: any) {
      spinner.fail(`Error: ${error.message}`);
    }
  });

program
  .command('preview')
  .description('Preview what tweets would be engaged with (dry run)')
  .option('-a, --account <id>', 'Only preview for specific account')
  .option('-n, --num <count>', 'Number of tweets to preview', '5')
  .action(async (options) => {
    const spinner = ora('Finding candidate tweets...').start();
    
    try {
      await getDatabase();
      const accountManager = getAccountManager();
      const globalSettings = accountManager.getGlobalSettings();
      
      let accounts = accountManager.getEnabledAccounts();
      if (options.account) {
        accounts = accounts.filter(a => a.id === options.account);
      }

      if (accounts.length === 0) {
        spinner.fail('No matching accounts found');
        return;
      }

      for (const account of accounts) {
        spinner.text = `Finding tweets for ${account.name}...`;
        
        const feedMonitor = createFeedMonitor(account, {
          maxTweetAgeHours: globalSettings.maxTweetAgeHours,
          prioritizeRecentTweets: globalSettings.prioritizeRecentTweets,
          avoidReplyingToSameUserWithinHours: globalSettings.avoidReplyingToSameUserWithinHours,
        });

        const tweets = await feedMonitor.getBestTweets(parseInt(options.num));
        
        spinner.stop();
        console.log(chalk.bold(`\n🔍 Top ${tweets.length} tweets for ${account.name}:\n`));
        
        for (const tweet of tweets) {
          console.log(chalk.cyan(`@${tweet.authorUsername}`) + chalk.gray(` (${tweet.authorFollowers || '?'} followers)`));
          console.log(chalk.white(tweet.text.slice(0, 200) + (tweet.text.length > 200 ? '...' : '')));
          console.log(chalk.gray(`Relevance: ${tweet.relevanceScore}% | ❤️ ${tweet.likeCount || 0} | 💬 ${tweet.replyCount || 0}`));
          console.log();
        }
      }

      await closeDatabase();
    } catch (error: any) {
      spinner.fail(`Error: ${error.message}`);
    }
  });

// ============================================
// Database Commands
// ============================================
const dbCmd = program.command('db')
  .description('Database operations');

dbCmd
  .command('init')
  .description('Initialize/migrate database')
  .action(async () => {
    const spinner = ora('Initializing database...').start();
    try {
      await getDatabase();
      spinner.succeed('Database initialized');
      await closeDatabase();
    } catch (error: any) {
      spinner.fail(`Error: ${error.message}`);
    }
  });

// Parse arguments
program.parse();

