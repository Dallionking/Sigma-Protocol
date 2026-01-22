import Database from 'better-sqlite3';
import pg from 'pg';
import path from 'path';
import { logger } from './logger.js';
import type { ReplyRow, RateLimitRow } from '../models/reply.js';

// Database interface for both SQLite and Postgres
export interface DatabaseClient {
  // Replies
  insertReply(reply: Omit<ReplyRow, 'id'>): Promise<number>;
  getReplyByTweetId(tweetId: string): Promise<ReplyRow | null>;
  getRepliesByAccount(accountId: string, limit?: number): Promise<ReplyRow[]>;
  hasRepliedToUser(accountId: string, username: string, withinHours: number): Promise<boolean>;
  updateEngagement(replyId: string, likes: number, replies: number, retweets: number): Promise<void>;
  
  // Rate limits
  getRateLimit(accountId: string, date: string): Promise<RateLimitRow | null>;
  incrementRateLimit(accountId: string, date: string): Promise<void>;
  
  // Cleanup
  close(): Promise<void>;
}

// SQLite implementation (for local development)
class SQLiteDatabase implements DatabaseClient {
  private db: Database.Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.initTables();
  }

  private initTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS replies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_id TEXT NOT NULL,
        tweet_id TEXT NOT NULL UNIQUE,
        tweet_author TEXT NOT NULL,
        tweet_content TEXT NOT NULL,
        reply_id TEXT,
        reply_content TEXT NOT NULL,
        tone TEXT NOT NULL,
        posted_at TEXT DEFAULT (datetime('now')),
        engagement_likes INTEGER DEFAULT 0,
        engagement_replies INTEGER DEFAULT 0,
        engagement_retweets INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS rate_limits (
        account_id TEXT NOT NULL,
        date TEXT NOT NULL,
        replies_count INTEGER DEFAULT 0,
        last_reply_at TEXT,
        PRIMARY KEY (account_id, date)
      );

      CREATE INDEX IF NOT EXISTS idx_replies_account ON replies(account_id);
      CREATE INDEX IF NOT EXISTS idx_replies_author ON replies(tweet_author);
      CREATE INDEX IF NOT EXISTS idx_replies_posted ON replies(posted_at);
    `);
  }

  async insertReply(reply: Omit<ReplyRow, 'id'>): Promise<number> {
    const stmt = this.db.prepare(`
      INSERT INTO replies (account_id, tweet_id, tweet_author, tweet_content, reply_id, reply_content, tone)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      reply.account_id,
      reply.tweet_id,
      reply.tweet_author,
      reply.tweet_content,
      reply.reply_id,
      reply.reply_content,
      reply.tone
    );
    return result.lastInsertRowid as number;
  }

  async getReplyByTweetId(tweetId: string): Promise<ReplyRow | null> {
    const stmt = this.db.prepare('SELECT * FROM replies WHERE tweet_id = ?');
    return stmt.get(tweetId) as ReplyRow | null;
  }

  async getRepliesByAccount(accountId: string, limit = 100): Promise<ReplyRow[]> {
    const stmt = this.db.prepare('SELECT * FROM replies WHERE account_id = ? ORDER BY posted_at DESC LIMIT ?');
    return stmt.all(accountId, limit) as ReplyRow[];
  }

  async hasRepliedToUser(accountId: string, username: string, withinHours: number): Promise<boolean> {
    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM replies 
      WHERE account_id = ? AND tweet_author = ? 
      AND posted_at > datetime('now', '-' || ? || ' hours')
    `);
    const result = stmt.get(accountId, username, withinHours) as { count: number };
    return result.count > 0;
  }

  async updateEngagement(replyId: string, likes: number, replies: number, retweets: number): Promise<void> {
    const stmt = this.db.prepare(`
      UPDATE replies SET engagement_likes = ?, engagement_replies = ?, engagement_retweets = ?
      WHERE reply_id = ?
    `);
    stmt.run(likes, replies, retweets, replyId);
  }

  async getRateLimit(accountId: string, date: string): Promise<RateLimitRow | null> {
    const stmt = this.db.prepare('SELECT * FROM rate_limits WHERE account_id = ? AND date = ?');
    return stmt.get(accountId, date) as RateLimitRow | null;
  }

  async incrementRateLimit(accountId: string, date: string): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO rate_limits (account_id, date, replies_count, last_reply_at)
      VALUES (?, ?, 1, datetime('now'))
      ON CONFLICT(account_id, date) DO UPDATE SET
        replies_count = replies_count + 1,
        last_reply_at = datetime('now')
    `);
    stmt.run(accountId, date);
  }

  async close(): Promise<void> {
    this.db.close();
  }
}

// Postgres implementation (for production on Render)
class PostgresDatabase implements DatabaseClient {
  private pool: pg.Pool;

  constructor(connectionString: string) {
    this.pool = new pg.Pool({ connectionString });
  }

  async initTables(): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS replies (
          id SERIAL PRIMARY KEY,
          account_id TEXT NOT NULL,
          tweet_id TEXT NOT NULL UNIQUE,
          tweet_author TEXT NOT NULL,
          tweet_content TEXT NOT NULL,
          reply_id TEXT,
          reply_content TEXT NOT NULL,
          tone TEXT NOT NULL,
          posted_at TIMESTAMP DEFAULT NOW(),
          engagement_likes INTEGER DEFAULT 0,
          engagement_replies INTEGER DEFAULT 0,
          engagement_retweets INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS rate_limits (
          account_id TEXT NOT NULL,
          date DATE NOT NULL,
          replies_count INTEGER DEFAULT 0,
          last_reply_at TIMESTAMP,
          PRIMARY KEY (account_id, date)
        );

        CREATE INDEX IF NOT EXISTS idx_replies_account ON replies(account_id);
        CREATE INDEX IF NOT EXISTS idx_replies_author ON replies(tweet_author);
        CREATE INDEX IF NOT EXISTS idx_replies_posted ON replies(posted_at);
      `);
      logger.info('Database tables initialized');
    } finally {
      client.release();
    }
  }

  async insertReply(reply: Omit<ReplyRow, 'id'>): Promise<number> {
    const result = await this.pool.query(
      `INSERT INTO replies (account_id, tweet_id, tweet_author, tweet_content, reply_id, reply_content, tone)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [reply.account_id, reply.tweet_id, reply.tweet_author, reply.tweet_content, reply.reply_id, reply.reply_content, reply.tone]
    );
    return result.rows[0].id;
  }

  async getReplyByTweetId(tweetId: string): Promise<ReplyRow | null> {
    const result = await this.pool.query('SELECT * FROM replies WHERE tweet_id = $1', [tweetId]);
    return result.rows[0] || null;
  }

  async getRepliesByAccount(accountId: string, limit = 100): Promise<ReplyRow[]> {
    const result = await this.pool.query(
      'SELECT * FROM replies WHERE account_id = $1 ORDER BY posted_at DESC LIMIT $2',
      [accountId, limit]
    );
    return result.rows;
  }

  async hasRepliedToUser(accountId: string, username: string, withinHours: number): Promise<boolean> {
    const result = await this.pool.query(
      `SELECT COUNT(*) as count FROM replies 
       WHERE account_id = $1 AND tweet_author = $2 
       AND posted_at > NOW() - INTERVAL '${withinHours} hours'`,
      [accountId, username]
    );
    return parseInt(result.rows[0].count) > 0;
  }

  async updateEngagement(replyId: string, likes: number, replies: number, retweets: number): Promise<void> {
    await this.pool.query(
      `UPDATE replies SET engagement_likes = $1, engagement_replies = $2, engagement_retweets = $3
       WHERE reply_id = $4`,
      [likes, replies, retweets, replyId]
    );
  }

  async getRateLimit(accountId: string, date: string): Promise<RateLimitRow | null> {
    const result = await this.pool.query(
      'SELECT * FROM rate_limits WHERE account_id = $1 AND date = $2',
      [accountId, date]
    );
    return result.rows[0] || null;
  }

  async incrementRateLimit(accountId: string, date: string): Promise<void> {
    await this.pool.query(
      `INSERT INTO rate_limits (account_id, date, replies_count, last_reply_at)
       VALUES ($1, $2, 1, NOW())
       ON CONFLICT(account_id, date) DO UPDATE SET
         replies_count = rate_limits.replies_count + 1,
         last_reply_at = NOW()`,
      [accountId, date]
    );
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

// Factory function to create the appropriate database client
let dbInstance: DatabaseClient | null = null;

export async function getDatabase(): Promise<DatabaseClient> {
  if (dbInstance) return dbInstance;

  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    // Use Postgres for production
    logger.info('Using Postgres database');
    const pgDb = new PostgresDatabase(databaseUrl);
    await pgDb.initTables();
    dbInstance = pgDb;
  } else {
    // Use SQLite for local development
    const dbPath = path.join(process.cwd(), 'data', 'x-promoter.db');
    logger.info(`Using SQLite database at ${dbPath}`);
    
    // Ensure data directory exists
    const fs = await import('fs');
    const dataDir = path.dirname(dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    dbInstance = new SQLiteDatabase(dbPath);
  }

  return dbInstance;
}

export async function closeDatabase(): Promise<void> {
  if (dbInstance) {
    await dbInstance.close();
    dbInstance = null;
  }
}


