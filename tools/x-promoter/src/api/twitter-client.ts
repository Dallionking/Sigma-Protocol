import { TwitterApi, TweetV2, UserV2 } from 'twitter-api-v2';
import { accountLogger, logger } from '../utils/logger.js';
import type { Credentials, LoadedAccount } from '../models/account.js';
import type { CandidateTweet } from '../models/reply.js';

export interface TwitterClientConfig {
  accountId: string;
  credentials: Credentials;
}

export class TwitterClient {
  private client: TwitterApi;
  private readOnlyClient: TwitterApi;
  private accountId: string;
  private log: ReturnType<typeof accountLogger>;

  constructor(config: TwitterClientConfig) {
    this.accountId = config.accountId;
    this.log = accountLogger(config.accountId);

    // Create client with user authentication (for posting)
    this.client = new TwitterApi({
      appKey: config.credentials.apiKey,
      appSecret: config.credentials.apiSecret,
      accessToken: config.credentials.accessToken,
      accessSecret: config.credentials.accessTokenSecret,
    });

    // Create read-only client with bearer token (for searching)
    if (config.credentials.bearerToken) {
      this.readOnlyClient = new TwitterApi(config.credentials.bearerToken);
    } else {
      this.readOnlyClient = this.client;
    }
  }

  /**
   * Test the connection and return the authenticated user
   */
  async verifyCredentials(): Promise<UserV2 | null> {
    try {
      const me = await this.client.v2.me({
        'user.fields': ['username', 'name', 'description', 'public_metrics'],
      });
      this.log.info(`Authenticated as @${me.data.username}`);
      return me.data;
    } catch (error) {
      this.log.error('Failed to verify credentials', { error });
      return null;
    }
  }

  /**
   * Search for tweets matching keywords
   */
  async searchTweets(
    keywords: string[],
    excludeKeywords: string[] = [],
    maxResults = 50,
    maxAgeHours = 6
  ): Promise<CandidateTweet[]> {
    try {
      // Build search query
      const keywordQuery = keywords.map(k => `"${k}"`).join(' OR ');
      const excludeQuery = excludeKeywords.map(k => `-${k}`).join(' ');
      const query = `(${keywordQuery}) ${excludeQuery} -is:retweet -is:reply lang:en`;

      this.log.debug('Searching tweets', { query: query.slice(0, 100) + '...' });

      const tweets = await this.readOnlyClient.v2.search(query, {
        max_results: Math.min(maxResults, 100),
        'tweet.fields': ['created_at', 'public_metrics', 'author_id', 'text'],
        'user.fields': ['username', 'name', 'description', 'public_metrics'],
        expansions: ['author_id'],
        // Only get tweets from the last N hours
        start_time: new Date(Date.now() - maxAgeHours * 60 * 60 * 1000).toISOString(),
      });

      if (!tweets.data?.data) {
        this.log.debug('No tweets found');
        return [];
      }

      // Create a map of user IDs to user objects
      const usersMap = new Map<string, UserV2>();
      if (tweets.includes?.users) {
        for (const user of tweets.includes.users) {
          usersMap.set(user.id, user);
        }
      }

      // Transform tweets to CandidateTweet format
      const candidates: CandidateTweet[] = tweets.data.data.map((tweet: TweetV2) => {
        const author = usersMap.get(tweet.author_id || '');
        return {
          id: tweet.id,
          text: tweet.text,
          authorId: tweet.author_id || '',
          authorUsername: author?.username || '',
          authorName: author?.name,
          authorBio: author?.description,
          authorFollowers: author?.public_metrics?.followers_count,
          createdAt: new Date(tweet.created_at || Date.now()),
          likeCount: tweet.public_metrics?.like_count,
          replyCount: tweet.public_metrics?.reply_count,
          retweetCount: tweet.public_metrics?.retweet_count,
        };
      });

      this.log.info(`Found ${candidates.length} candidate tweets`);
      return candidates;
    } catch (error) {
      this.log.error('Failed to search tweets', { error });
      return [];
    }
  }

  /**
   * Get tweets from specific accounts
   */
  async getTweetsFromAccounts(
    usernames: string[],
    maxPerUser = 10,
    maxAgeHours = 6
  ): Promise<CandidateTweet[]> {
    const allTweets: CandidateTweet[] = [];

    for (const username of usernames) {
      try {
        // Get user ID first
        const user = await this.readOnlyClient.v2.userByUsername(username, {
          'user.fields': ['description', 'public_metrics'],
        });

        if (!user.data) {
          this.log.warn(`User not found: @${username}`);
          continue;
        }

        // Get their recent tweets
        const tweets = await this.readOnlyClient.v2.userTimeline(user.data.id, {
          max_results: maxPerUser,
          'tweet.fields': ['created_at', 'public_metrics', 'text'],
          exclude: ['retweets', 'replies'],
          start_time: new Date(Date.now() - maxAgeHours * 60 * 60 * 1000).toISOString(),
        });

        if (tweets.data?.data) {
          for (const tweet of tweets.data.data) {
            allTweets.push({
              id: tweet.id,
              text: tweet.text,
              authorId: user.data.id,
              authorUsername: user.data.username,
              authorName: user.data.name,
              authorBio: user.data.description,
              authorFollowers: user.data.public_metrics?.followers_count,
              createdAt: new Date(tweet.created_at || Date.now()),
              likeCount: tweet.public_metrics?.like_count,
              replyCount: tweet.public_metrics?.reply_count,
              retweetCount: tweet.public_metrics?.retweet_count,
            });
          }
        }

        // Small delay to avoid rate limits
        await this.delay(500);
      } catch (error) {
        this.log.warn(`Failed to get tweets from @${username}`, { error });
      }
    }

    this.log.info(`Found ${allTweets.length} tweets from ${usernames.length} accounts`);
    return allTweets;
  }

  /**
   * Post a reply to a tweet
   */
  async postReply(tweetId: string, content: string): Promise<string | null> {
    try {
      // Ensure content is within limit
      if (content.length > 280) {
        this.log.warn('Reply content too long, truncating', { length: content.length });
        content = content.slice(0, 277) + '...';
      }

      const response = await this.client.v2.reply(content, tweetId);
      this.log.info(`Posted reply`, { replyId: response.data.id, tweetId });
      return response.data.id;
    } catch (error: any) {
      // Handle specific Twitter API errors
      if (error.code === 403) {
        this.log.error('Not authorized to reply - check app permissions', { error });
      } else if (error.code === 429) {
        this.log.error('Rate limit exceeded', { error });
      } else if (error.code === 187) {
        this.log.warn('Duplicate tweet detected', { error });
      } else {
        this.log.error('Failed to post reply', { error });
      }
      return null;
    }
  }

  /**
   * Get engagement metrics for a reply
   */
  async getReplyMetrics(replyId: string): Promise<{ likes: number; replies: number; retweets: number } | null> {
    try {
      const tweet = await this.readOnlyClient.v2.singleTweet(replyId, {
        'tweet.fields': ['public_metrics'],
      });

      if (tweet.data?.public_metrics) {
        return {
          likes: tweet.data.public_metrics.like_count || 0,
          replies: tweet.data.public_metrics.reply_count || 0,
          retweets: tweet.data.public_metrics.retweet_count || 0,
        };
      }
      return null;
    } catch (error) {
      this.log.warn('Failed to get reply metrics', { replyId, error });
      return null;
    }
  }

  /**
   * Get the authenticated user's timeline (home feed)
   */
  async getHomeTimeline(maxResults = 50): Promise<CandidateTweet[]> {
    try {
      // Note: Home timeline requires elevated access
      const me = await this.client.v2.me();
      const timeline = await this.client.v2.homeTimeline({
        max_results: Math.min(maxResults, 100),
        'tweet.fields': ['created_at', 'public_metrics', 'author_id', 'text'],
        'user.fields': ['username', 'name', 'description', 'public_metrics'],
        expansions: ['author_id'],
      });

      if (!timeline.data?.data) {
        return [];
      }

      const usersMap = new Map<string, UserV2>();
      if (timeline.includes?.users) {
        for (const user of timeline.includes.users) {
          usersMap.set(user.id, user);
        }
      }

      return timeline.data.data.map((tweet: TweetV2) => {
        const author = usersMap.get(tweet.author_id || '');
        return {
          id: tweet.id,
          text: tweet.text,
          authorId: tweet.author_id || '',
          authorUsername: author?.username || '',
          authorName: author?.name,
          authorBio: author?.description,
          authorFollowers: author?.public_metrics?.followers_count,
          createdAt: new Date(tweet.created_at || Date.now()),
          likeCount: tweet.public_metrics?.like_count,
          replyCount: tweet.public_metrics?.reply_count,
          retweetCount: tweet.public_metrics?.retweet_count,
        };
      });
    } catch (error) {
      this.log.error('Failed to get home timeline', { error });
      return [];
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Store for multiple Twitter clients
const clientStore = new Map<string, TwitterClient>();

/**
 * Get or create a Twitter client for an account
 */
export function getTwitterClient(account: LoadedAccount): TwitterClient {
  if (!clientStore.has(account.id)) {
    clientStore.set(account.id, new TwitterClient({
      accountId: account.id,
      credentials: account.credentials,
    }));
  }
  return clientStore.get(account.id)!;
}

/**
 * Clear all clients (useful for cleanup)
 */
export function clearTwitterClients(): void {
  clientStore.clear();
}


