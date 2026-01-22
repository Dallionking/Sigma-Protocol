#!/usr/bin/env node
import 'dotenv/config';
import { logger } from './utils/logger.js';
import { getDatabase, closeDatabase } from './utils/db.js';
import { getAccountManager } from './services/account-manager.js';
import { initScheduler } from './services/scheduler.js';

async function main() {
  logger.info('='.repeat(50));
  logger.info('X Promoter - Automated Engagement System');
  logger.info('Part of SSS Protocol');
  logger.info('='.repeat(50));

  // Initialize database
  logger.info('Initializing database...');
  await getDatabase();

  // Load accounts
  logger.info('Loading account configurations...');
  const accountManager = getAccountManager();
  const accounts = accountManager.getEnabledAccounts();
  const allAccounts = accountManager.getAllAccounts();
  const globalSettings = accountManager.getGlobalSettings();

  logger.info(`Found ${allAccounts.length} configured account(s)`);
  logger.info(`${accounts.length} account(s) enabled with credentials`);

  if (accounts.length === 0) {
    logger.error('No accounts available. Please configure credentials in .env file.');
    logger.info('See env.example for required environment variables.');
    process.exit(1);
  }

  // Display account summary
  for (const account of accounts) {
    logger.info(`  - ${account.name} (${account.id}): ${account.settings.maxRepliesPerDay} replies/day`);
  }

  // Check for required API keys
  if (!process.env.ANTHROPIC_API_KEY) {
    logger.error('ANTHROPIC_API_KEY is required for content generation');
    process.exit(1);
  }

  // Initialize scheduler
  const intervalMinutes = globalSettings.schedulerIntervalMinutes || 
    parseInt(process.env.SCHEDULER_INTERVAL_MINUTES || '5', 10);

  logger.info(`Scheduler interval: ${intervalMinutes} minutes`);
  logger.info(`Global daily limit: ${globalSettings.globalDailyLimit} replies`);

  const scheduler = initScheduler({
    intervalMinutes,
    maxTweetsPerRun: 5, // Process up to 5 tweets per account per run
  });

  // Handle graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}, shutting down gracefully...`);
    scheduler.stop();
    await closeDatabase();
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Start the scheduler
  logger.info('Starting scheduler...');
  scheduler.start();

  logger.info('X Promoter is now running!');
  logger.info('Press Ctrl+C to stop.');

  // Keep the process alive
  await new Promise(() => {});
}

// Run
main().catch((error) => {
  logger.error('Fatal error', { error });
  process.exit(1);
});


