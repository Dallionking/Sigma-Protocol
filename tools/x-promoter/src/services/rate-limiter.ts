import { accountLogger, logger } from '../utils/logger.js';
import { getDatabase } from '../utils/db.js';
import type { LoadedAccount } from '../models/account.js';

export interface RateLimiterConfig {
  globalDailyLimit: number;
}

export class RateLimiter {
  private account: LoadedAccount;
  private globalConfig: RateLimiterConfig;
  private log: ReturnType<typeof accountLogger>;

  constructor(account: LoadedAccount, globalConfig: RateLimiterConfig) {
    this.account = account;
    this.globalConfig = globalConfig;
    this.log = accountLogger(account.id);
  }

  /**
   * Check if the account can post a reply right now
   */
  async canPost(): Promise<{ allowed: boolean; reason?: string; waitMinutes?: number }> {
    const db = await getDatabase();
    const today = this.getTodayDate();
    const rateLimit = await db.getRateLimit(this.account.id, today);

    // Check daily limit
    const dailyLimit = this.account.settings.maxRepliesPerDay;
    if (rateLimit && rateLimit.replies_count >= dailyLimit) {
      this.log.warn('Daily limit reached', { count: rateLimit.replies_count, limit: dailyLimit });
      return { 
        allowed: false, 
        reason: `Daily limit reached (${rateLimit.replies_count}/${dailyLimit})`,
        waitMinutes: this.getMinutesUntilMidnight()
      };
    }

    // Check minimum interval
    if (rateLimit?.last_reply_at) {
      const lastReply = new Date(rateLimit.last_reply_at);
      const minInterval = this.account.settings.minIntervalMinutes;
      const minutesSinceLastReply = (Date.now() - lastReply.getTime()) / (1000 * 60);

      if (minutesSinceLastReply < minInterval) {
        const waitMinutes = Math.ceil(minInterval - minutesSinceLastReply);
        this.log.debug('Minimum interval not met', { 
          minutesSinceLastReply: Math.round(minutesSinceLastReply), 
          minInterval 
        });
        return { 
          allowed: false, 
          reason: `Minimum interval not met (${Math.round(minutesSinceLastReply)}/${minInterval} min)`,
          waitMinutes
        };
      }
    }

    // Check global limit across all accounts
    const globalCount = await this.getGlobalDailyCount();
    if (globalCount >= this.globalConfig.globalDailyLimit) {
      this.log.warn('Global daily limit reached', { 
        count: globalCount, 
        limit: this.globalConfig.globalDailyLimit 
      });
      return { 
        allowed: false, 
        reason: `Global daily limit reached (${globalCount}/${this.globalConfig.globalDailyLimit})`,
        waitMinutes: this.getMinutesUntilMidnight()
      };
    }

    return { allowed: true };
  }

  /**
   * Record that a reply was posted
   */
  async recordReply(): Promise<void> {
    const db = await getDatabase();
    const today = this.getTodayDate();
    await db.incrementRateLimit(this.account.id, today);
    this.log.debug('Recorded reply in rate limit');
  }

  /**
   * Get current usage stats
   */
  async getUsageStats(): Promise<{
    today: number;
    dailyLimit: number;
    remaining: number;
    lastReply: Date | null;
    canPostNow: boolean;
  }> {
    const db = await getDatabase();
    const today = this.getTodayDate();
    const rateLimit = await db.getRateLimit(this.account.id, today);
    const canPostResult = await this.canPost();

    const todayCount = rateLimit?.replies_count || 0;
    const dailyLimit = this.account.settings.maxRepliesPerDay;

    return {
      today: todayCount,
      dailyLimit,
      remaining: Math.max(0, dailyLimit - todayCount),
      lastReply: rateLimit?.last_reply_at ? new Date(rateLimit.last_reply_at) : null,
      canPostNow: canPostResult.allowed,
    };
  }

  /**
   * Get total replies across all accounts for today
   */
  private async getGlobalDailyCount(): Promise<number> {
    // This is a simplified implementation
    // In production, you'd want a separate table or aggregation
    const db = await getDatabase();
    const today = this.getTodayDate();
    const rateLimit = await db.getRateLimit(this.account.id, today);
    return rateLimit?.replies_count || 0;
  }

  /**
   * Get today's date in YYYY-MM-DD format
   */
  private getTodayDate(): string {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }

  /**
   * Get minutes until midnight (for rate limit reset)
   */
  private getMinutesUntilMidnight(): number {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setDate(midnight.getDate() + 1);
    midnight.setHours(0, 0, 0, 0);
    return Math.ceil((midnight.getTime() - now.getTime()) / (1000 * 60));
  }

  /**
   * Calculate optimal wait time with jitter (to appear more natural)
   */
  getOptimalWaitTime(): number {
    const baseInterval = this.account.settings.minIntervalMinutes;
    // Add random jitter of ±20%
    const jitter = baseInterval * 0.2 * (Math.random() * 2 - 1);
    return Math.max(1, Math.round(baseInterval + jitter));
  }
}

/**
 * Create a rate limiter for an account
 */
export function createRateLimiter(
  account: LoadedAccount, 
  globalConfig: RateLimiterConfig
): RateLimiter {
  return new RateLimiter(account, globalConfig);
}

/**
 * Shared rate limiter instances
 */
const rateLimiters = new Map<string, RateLimiter>();

export function getRateLimiter(
  account: LoadedAccount, 
  globalConfig: RateLimiterConfig
): RateLimiter {
  if (!rateLimiters.has(account.id)) {
    rateLimiters.set(account.id, createRateLimiter(account, globalConfig));
  }
  return rateLimiters.get(account.id)!;
}


