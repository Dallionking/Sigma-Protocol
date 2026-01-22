import { getClaudeClient } from '../api/claude-client.js';
import { accountLogger } from '../utils/logger.js';
import { getDatabase } from '../utils/db.js';
import type { LoadedAccount, ToneType, ToneWeights } from '../models/account.js';
import type { CandidateTweet } from '../models/reply.js';

export class ContentGenerator {
  private account: LoadedAccount;
  private log: ReturnType<typeof accountLogger>;
  private recentTones: ToneType[] = [];

  constructor(account: LoadedAccount) {
    this.account = account;
    this.log = accountLogger(account.id);
  }

  /**
   * Generate a reply for a tweet
   */
  async generateReply(tweet: CandidateTweet): Promise<{ content: string; tone: ToneType } | null> {
    const claude = getClaudeClient();
    
    // Select tone based on weights
    const tone = this.selectTone();
    this.log.debug('Selected tone', { tone });

    // Generate the reply
    const reply = await claude.generateReply(tweet, this.account.product, tone);
    
    if (!reply) {
      this.log.warn('Failed to generate reply');
      return null;
    }

    // Validate content quality
    const validation = await claude.validateContent(reply);
    if (!validation.valid) {
      this.log.warn('Generated reply failed validation', { reason: validation.reason });
      // Try once more with a different tone
      const altTone = this.selectAlternativeTone(tone);
      const altReply = await claude.generateReply(tweet, this.account.product, altTone);
      
      if (altReply) {
        const altValidation = await claude.validateContent(altReply);
        if (altValidation.valid) {
          this.recordToneUsage(altTone);
          return { content: altReply, tone: altTone };
        }
      }
      return null;
    }

    this.recordToneUsage(tone);
    return { content: reply, tone };
  }

  /**
   * Select a tone based on configured weights
   */
  private selectTone(): ToneType {
    const weights = this.account.settings.toneWeights || {
      educational: 0.25,
      relatable: 0.25,
      valueFirst: 0.25,
      direct: 0.25,
    };

    // Adjust weights based on recent usage (avoid repeating same tone)
    const adjustedWeights = this.adjustWeightsForVariety(weights);

    // Weighted random selection
    const random = Math.random();
    let cumulative = 0;

    const tones: ToneType[] = ['educational', 'relatable', 'valueFirst', 'direct'];
    for (const tone of tones) {
      cumulative += adjustedWeights[tone];
      if (random <= cumulative) {
        return tone;
      }
    }

    return 'educational'; // Default fallback
  }

  /**
   * Adjust weights to encourage variety
   */
  private adjustWeightsForVariety(weights: ToneWeights): ToneWeights {
    if (this.recentTones.length === 0) {
      return weights;
    }

    const adjusted = { ...weights };
    const lastTone = this.recentTones[this.recentTones.length - 1];
    
    // Reduce weight of last used tone
    adjusted[lastTone] *= 0.5;

    // If same tone used twice in a row, reduce even more
    if (this.recentTones.length >= 2 && this.recentTones[this.recentTones.length - 2] === lastTone) {
      adjusted[lastTone] *= 0.3;
    }

    // Normalize weights to sum to 1
    const total = Object.values(adjusted).reduce((sum, w) => sum + w, 0);
    for (const tone of Object.keys(adjusted) as ToneType[]) {
      adjusted[tone] /= total;
    }

    return adjusted;
  }

  /**
   * Select an alternative tone (different from the given one)
   */
  private selectAlternativeTone(exclude: ToneType): ToneType {
    const alternatives: ToneType[] = ['educational', 'relatable', 'valueFirst', 'direct']
      .filter(t => t !== exclude) as ToneType[];
    return alternatives[Math.floor(Math.random() * alternatives.length)];
  }

  /**
   * Record tone usage for variety tracking
   */
  private recordToneUsage(tone: ToneType): void {
    this.recentTones.push(tone);
    // Keep only last 10 tones
    if (this.recentTones.length > 10) {
      this.recentTones.shift();
    }
  }

  /**
   * Check if content is too similar to recent replies
   */
  async isDuplicate(content: string): Promise<boolean> {
    const db = await getDatabase();
    const recentReplies = await db.getRepliesByAccount(this.account.id, 50);

    // Simple similarity check using word overlap
    const contentWords = new Set(content.toLowerCase().split(/\s+/));
    
    for (const reply of recentReplies) {
      const replyWords = new Set(reply.reply_content.toLowerCase().split(/\s+/));
      const intersection = [...contentWords].filter(w => replyWords.has(w));
      const similarity = intersection.length / Math.max(contentWords.size, replyWords.size);
      
      if (similarity > 0.7) {
        this.log.warn('Content too similar to recent reply', { 
          similarity: Math.round(similarity * 100) + '%' 
        });
        return true;
      }
    }

    return false;
  }

  /**
   * Generate and validate a unique reply
   */
  async generateUniqueReply(
    tweet: CandidateTweet, 
    maxAttempts = 3
  ): Promise<{ content: string; tone: ToneType } | null> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      this.log.debug(`Generating reply attempt ${attempt}/${maxAttempts}`);
      
      const result = await this.generateReply(tweet);
      if (!result) continue;

      const isDupe = await this.isDuplicate(result.content);
      if (!isDupe) {
        return result;
      }

      this.log.debug('Reply was duplicate, retrying');
    }

    this.log.warn('Failed to generate unique reply after max attempts');
    return null;
  }

  /**
   * Get statistics about generated content
   */
  async getContentStats(): Promise<{
    totalReplies: number;
    toneDistribution: Record<ToneType, number>;
    averageLength: number;
  }> {
    const db = await getDatabase();
    const replies = await db.getRepliesByAccount(this.account.id, 1000);

    const toneDistribution: Record<ToneType, number> = {
      educational: 0,
      relatable: 0,
      valueFirst: 0,
      direct: 0,
    };

    let totalLength = 0;

    for (const reply of replies) {
      const tone = reply.tone as ToneType;
      if (tone in toneDistribution) {
        toneDistribution[tone]++;
      }
      totalLength += reply.reply_content.length;
    }

    return {
      totalReplies: replies.length,
      toneDistribution,
      averageLength: replies.length > 0 ? Math.round(totalLength / replies.length) : 0,
    };
  }
}

/**
 * Content generator instances per account
 */
const generators = new Map<string, ContentGenerator>();

export function getContentGenerator(account: LoadedAccount): ContentGenerator {
  if (!generators.has(account.id)) {
    generators.set(account.id, new ContentGenerator(account));
  }
  return generators.get(account.id)!;
}


