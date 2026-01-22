import { getTwitterClient } from '../api/twitter-client.js';
import { getClaudeClient } from '../api/claude-client.js';
import { accountLogger, logger } from '../utils/logger.js';
import { getDatabase } from '../utils/db.js';
import type { LoadedAccount } from '../models/account.js';
import type { CandidateTweet } from '../models/reply.js';

export interface FeedMonitorConfig {
  maxTweetAgeHours: number;
  prioritizeRecentTweets: boolean;
  avoidReplyingToSameUserWithinHours: number;
}

export class FeedMonitor {
  private account: LoadedAccount;
  private config: FeedMonitorConfig;
  private log: ReturnType<typeof accountLogger>;

  constructor(account: LoadedAccount, config: FeedMonitorConfig) {
    this.account = account;
    this.config = config;
    this.log = accountLogger(account.id);
  }

  /**
   * Find tweets to reply to based on keywords and target accounts
   */
  async findCandidateTweets(): Promise<CandidateTweet[]> {
    const twitterClient = getTwitterClient(this.account);
    const allCandidates: CandidateTweet[] = [];

    // 1. Search by keywords
    if (this.account.keywords.length > 0) {
      this.log.info('Searching by keywords', { count: this.account.keywords.length });
      const keywordTweets = await twitterClient.searchTweets(
        this.account.keywords,
        this.account.excludeKeywords || [],
        50,
        this.config.maxTweetAgeHours
      );
      allCandidates.push(...keywordTweets);
    }

    // 2. Get tweets from target accounts
    if (this.account.targetAccounts && this.account.targetAccounts.length > 0) {
      this.log.info('Getting tweets from target accounts', { 
        count: this.account.targetAccounts.length 
      });
      const accountTweets = await twitterClient.getTweetsFromAccounts(
        this.account.targetAccounts,
        10,
        this.config.maxTweetAgeHours
      );
      allCandidates.push(...accountTweets);
    }

    // 3. Deduplicate by tweet ID
    const uniqueTweets = this.deduplicateTweets(allCandidates);
    this.log.info(`Found ${uniqueTweets.length} unique candidate tweets`);

    // 4. Filter out tweets we've already replied to
    const db = await getDatabase();
    const newTweets: CandidateTweet[] = [];
    
    for (const tweet of uniqueTweets) {
      const existingReply = await db.getReplyByTweetId(tweet.id);
      if (!existingReply) {
        newTweets.push(tweet);
      }
    }

    this.log.info(`${newTweets.length} tweets haven't been replied to yet`);

    // 5. Filter out users we've recently replied to
    const eligibleTweets: CandidateTweet[] = [];
    
    for (const tweet of newTweets) {
      const recentlyReplied = await db.hasRepliedToUser(
        this.account.id,
        tweet.authorUsername,
        this.config.avoidReplyingToSameUserWithinHours
      );
      
      if (!recentlyReplied) {
        eligibleTweets.push(tweet);
      }
    }

    this.log.info(`${eligibleTweets.length} tweets from users not recently engaged`);

    return eligibleTweets;
  }

  /**
   * Check and score tweet relevance using AI
   */
  async scoreTweetRelevance(tweets: CandidateTweet[]): Promise<CandidateTweet[]> {
    const claude = getClaudeClient();
    const scoredTweets: CandidateTweet[] = [];

    for (const tweet of tweets) {
      try {
        const relevance = await claude.checkRelevance(tweet);
        
        if (relevance.relevant && relevance.confidence >= 60) {
          scoredTweets.push({
            ...tweet,
            relevanceScore: relevance.confidence,
          });
          this.log.debug('Tweet is relevant', { 
            tweetId: tweet.id, 
            confidence: relevance.confidence,
            reason: relevance.reason 
          });
        } else {
          this.log.debug('Tweet not relevant', { 
            tweetId: tweet.id, 
            confidence: relevance.confidence,
            reason: relevance.reason 
          });
        }

        // Small delay to avoid rate limiting Claude
        await this.delay(200);
      } catch (error) {
        this.log.warn('Failed to score tweet relevance', { tweetId: tweet.id, error });
      }
    }

    // Sort by relevance score (highest first)
    scoredTweets.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

    this.log.info(`${scoredTweets.length} tweets passed relevance check`);
    return scoredTweets;
  }

  /**
   * Prioritize tweets based on various factors
   */
  prioritizeTweets(tweets: CandidateTweet[]): CandidateTweet[] {
    return tweets.sort((a, b) => {
      // Calculate a priority score
      const scoreA = this.calculatePriorityScore(a);
      const scoreB = this.calculatePriorityScore(b);
      return scoreB - scoreA;
    });
  }

  /**
   * Calculate priority score for a tweet
   */
  private calculatePriorityScore(tweet: CandidateTweet): number {
    let score = tweet.relevanceScore || 50;

    // Boost for tweets from accounts with more followers
    if (tweet.authorFollowers) {
      if (tweet.authorFollowers > 100000) score += 30;
      else if (tweet.authorFollowers > 10000) score += 20;
      else if (tweet.authorFollowers > 1000) score += 10;
    }

    // Boost for tweets with engagement
    const engagement = (tweet.likeCount || 0) + (tweet.replyCount || 0) * 2 + (tweet.retweetCount || 0) * 3;
    if (engagement > 100) score += 20;
    else if (engagement > 50) score += 10;
    else if (engagement > 10) score += 5;

    // Boost for recent tweets
    if (this.config.prioritizeRecentTweets) {
      const ageHours = (Date.now() - tweet.createdAt.getTime()) / (1000 * 60 * 60);
      if (ageHours < 1) score += 15;
      else if (ageHours < 3) score += 10;
      else if (ageHours < 6) score += 5;
    }

    return score;
  }

  /**
   * Remove duplicate tweets by ID
   */
  private deduplicateTweets(tweets: CandidateTweet[]): CandidateTweet[] {
    const seen = new Set<string>();
    return tweets.filter(tweet => {
      if (seen.has(tweet.id)) return false;
      seen.add(tweet.id);
      return true;
    });
  }

  /**
   * Get the best tweets to reply to (combines all filtering and prioritization)
   */
  async getBestTweets(limit = 10): Promise<CandidateTweet[]> {
    // 1. Find all candidate tweets
    const candidates = await this.findCandidateTweets();
    
    if (candidates.length === 0) {
      this.log.info('No candidate tweets found');
      return [];
    }

    // 2. Score relevance (limit to first 50 to save API calls)
    const toScore = candidates.slice(0, 50);
    const scoredTweets = await this.scoreTweetRelevance(toScore);

    if (scoredTweets.length === 0) {
      this.log.info('No tweets passed relevance check');
      return [];
    }

    // 3. Prioritize and return top N
    const prioritized = this.prioritizeTweets(scoredTweets);
    return prioritized.slice(0, limit);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Create a feed monitor for an account
 */
export function createFeedMonitor(
  account: LoadedAccount, 
  globalConfig: FeedMonitorConfig
): FeedMonitor {
  return new FeedMonitor(account, globalConfig);
}


