import cron from 'node-cron';
import { logger, accountLogger } from '../utils/logger.js';
import { getDatabase } from '../utils/db.js';
import { getAccountManager } from './account-manager.js';
import { createFeedMonitor } from './feed-monitor.js';
import { getRateLimiter } from './rate-limiter.js';
import { getContentGenerator } from './content-generator.js';
import { getTwitterClient } from '../api/twitter-client.js';
import type { LoadedAccount } from '../models/account.js';

export interface SchedulerConfig {
  intervalMinutes: number;
  maxTweetsPerRun: number;
}

export class Scheduler {
  private config: SchedulerConfig;
  private cronJob: cron.ScheduledTask | null = null;
  private isRunning = false;
  private lastRunTime: Date | null = null;
  private runCount = 0;

  constructor(config: SchedulerConfig) {
    this.config = config;
  }

  /**
   * Start the scheduler
   */
  start(): void {
    if (this.cronJob) {
      logger.warn('Scheduler is already running');
      return;
    }

    // Run immediately on start
    this.runCycle();

    // Then schedule recurring runs
    const cronExpression = `*/${this.config.intervalMinutes} * * * *`;
    this.cronJob = cron.schedule(cronExpression, () => {
      this.runCycle();
    });

    logger.info(`Scheduler started with ${this.config.intervalMinutes} minute interval`);
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
      logger.info('Scheduler stopped');
    }
  }

  /**
   * Run a single engagement cycle
   */
  async runCycle(): Promise<void> {
    if (this.isRunning) {
      logger.debug('Previous cycle still running, skipping');
      return;
    }

    this.isRunning = true;
    this.runCount++;
    this.lastRunTime = new Date();

    logger.info(`Starting engagement cycle #${this.runCount}`);

    try {
      const accountManager = getAccountManager();
      const accounts = accountManager.getEnabledAccounts();
      const globalSettings = accountManager.getGlobalSettings();

      if (accounts.length === 0) {
        logger.warn('No enabled accounts with credentials found');
        return;
      }

      logger.info(`Processing ${accounts.length} enabled account(s)`);

      // Process each account
      for (const account of accounts) {
        await this.processAccount(account, globalSettings);
        // Small delay between accounts
        await this.delay(2000);
      }

      logger.info(`Engagement cycle #${this.runCount} completed`);
    } catch (error) {
      logger.error('Error in engagement cycle', { error });
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Process a single account
   */
  private async processAccount(
    account: LoadedAccount, 
    globalSettings: ReturnType<ReturnType<typeof getAccountManager>['getGlobalSettings']>
  ): Promise<void> {
    const log = accountLogger(account.id);
    log.info('Processing account');

    // Check rate limits
    const rateLimiter = getRateLimiter(account, {
      globalDailyLimit: globalSettings.globalDailyLimit,
    });

    const canPost = await rateLimiter.canPost();
    if (!canPost.allowed) {
      log.info(`Rate limited: ${canPost.reason}`);
      return;
    }

    // Find candidate tweets
    const feedMonitor = createFeedMonitor(account, {
      maxTweetAgeHours: globalSettings.maxTweetAgeHours,
      prioritizeRecentTweets: globalSettings.prioritizeRecentTweets,
      avoidReplyingToSameUserWithinHours: globalSettings.avoidReplyingToSameUserWithinHours,
    });

    const candidateTweets = await feedMonitor.getBestTweets(this.config.maxTweetsPerRun);

    if (candidateTweets.length === 0) {
      log.info('No suitable tweets found this cycle');
      return;
    }

    log.info(`Found ${candidateTweets.length} candidate tweet(s)`);

    // Process each candidate tweet
    const contentGenerator = getContentGenerator(account);
    const twitterClient = getTwitterClient(account);
    const db = await getDatabase();

    let repliesPosted = 0;

    for (const tweet of candidateTweets) {
      // Re-check rate limit before each reply
      const stillCanPost = await rateLimiter.canPost();
      if (!stillCanPost.allowed) {
        log.info(`Rate limit reached during processing: ${stillCanPost.reason}`);
        break;
      }

      try {
        // Generate reply
        const replyResult = await contentGenerator.generateUniqueReply(tweet);
        if (!replyResult) {
          log.debug('Could not generate suitable reply', { tweetId: tweet.id });
          continue;
        }

        // Post the reply
        const replyId = await twitterClient.postReply(tweet.id, replyResult.content);
        
        if (replyId) {
          // Record in database
          await db.insertReply({
            account_id: account.id,
            tweet_id: tweet.id,
            tweet_author: tweet.authorUsername,
            tweet_content: tweet.text,
            reply_id: replyId,
            reply_content: replyResult.content,
            tone: replyResult.tone,
            posted_at: new Date().toISOString(),
            engagement_likes: 0,
            engagement_replies: 0,
            engagement_retweets: 0,
          });

          // Record in rate limiter
          await rateLimiter.recordReply();

          repliesPosted++;
          log.info('Posted reply', { 
            tweetId: tweet.id, 
            replyId, 
            tone: replyResult.tone,
            author: `@${tweet.authorUsername}` 
          });

          // Wait before next reply
          const waitTime = rateLimiter.getOptimalWaitTime();
          log.debug(`Waiting ${waitTime} minutes before next reply`);
          await this.delay(waitTime * 60 * 1000);
        }
      } catch (error) {
        log.error('Error processing tweet', { tweetId: tweet.id, error });
      }
    }

    log.info(`Cycle complete for account: ${repliesPosted} replies posted`);
  }

  /**
   * Get scheduler status
   */
  getStatus(): {
    isRunning: boolean;
    lastRunTime: Date | null;
    runCount: number;
    intervalMinutes: number;
  } {
    return {
      isRunning: this.isRunning,
      lastRunTime: this.lastRunTime,
      runCount: this.runCount,
      intervalMinutes: this.config.intervalMinutes,
    };
  }

  /**
   * Manually trigger a cycle
   */
  async triggerManualRun(): Promise<void> {
    logger.info('Manual run triggered');
    await this.runCycle();
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton scheduler instance
let scheduler: Scheduler | null = null;

export function getScheduler(config?: SchedulerConfig): Scheduler {
  if (!scheduler && config) {
    scheduler = new Scheduler(config);
  }
  if (!scheduler) {
    throw new Error('Scheduler not initialized. Call with config first.');
  }
  return scheduler;
}

export function initScheduler(config: SchedulerConfig): Scheduler {
  scheduler = new Scheduler(config);
  return scheduler;
}

