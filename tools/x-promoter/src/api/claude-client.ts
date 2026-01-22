import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger.js';
import type { ToneType, Product } from '../models/account.js';
import type { CandidateTweet, RelevanceResult } from '../models/reply.js';

// Load prompts config
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const promptsPath = path.join(__dirname, '..', 'config', 'prompts.json');
const promptsConfig = JSON.parse(fs.readFileSync(promptsPath, 'utf-8'));

export class ClaudeClient {
  private client: Anthropic;
  private model = 'claude-sonnet-4-20250514';

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }
    this.client = new Anthropic({ apiKey });
  }

  /**
   * Check if a tweet is relevant for engagement
   */
  async checkRelevance(tweet: CandidateTweet): Promise<RelevanceResult> {
    try {
      const prompt = promptsConfig.relevanceCheckPrompt
        .replace('{{tweetContent}}', tweet.text);

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 200,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        return { relevant: false, confidence: 0, reason: 'Invalid response type' };
      }

      // Parse JSON response
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return { relevant: false, confidence: 0, reason: 'Could not parse response' };
      }

      const result = JSON.parse(jsonMatch[0]);
      return {
        relevant: Boolean(result.relevant),
        confidence: Number(result.confidence) || 0,
        reason: String(result.reason) || '',
      };
    } catch (error) {
      logger.error('Failed to check tweet relevance', { error, tweetId: tweet.id });
      return { relevant: false, confidence: 0, reason: 'API error' };
    }
  }

  /**
   * Generate a reply for a tweet
   */
  async generateReply(
    tweet: CandidateTweet,
    product: Product,
    tone: ToneType
  ): Promise<string | null> {
    try {
      const toneConfig = promptsConfig.toneTemplates[tone];
      
      const prompt = promptsConfig.replyGenerationPrompt
        .replace('{{productName}}', product.name)
        .replace('{{tweetContent}}', tweet.text)
        .replace('{{authorUsername}}', tweet.authorUsername)
        .replace('{{authorBio}}', tweet.authorBio || 'Not available')
        .replace('{{productTagline}}', product.tagline)
        .replace('{{githubUrl}}', product.githubUrl)
        .replace('{{creator}}', product.creator)
        .replace('{{features}}', product.features?.join(', ') || '')
        .replace('{{tone}}', tone)
        .replace('{{toneGuidelines}}', toneConfig.guidelines.join('. '));

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 300,
        system: promptsConfig.systemPrompt,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        logger.warn('Invalid response type from Claude');
        return null;
      }

      let reply = content.text.trim();

      // Remove any quotes if the AI wrapped the response
      if ((reply.startsWith('"') && reply.endsWith('"')) ||
          (reply.startsWith("'") && reply.endsWith("'"))) {
        reply = reply.slice(1, -1);
      }

      // Validate length
      if (reply.length > 280) {
        logger.warn('Generated reply too long, will truncate', { length: reply.length });
        // Try to cut at a sentence boundary
        const truncated = reply.slice(0, 277);
        const lastPeriod = truncated.lastIndexOf('.');
        const lastSpace = truncated.lastIndexOf(' ');
        
        if (lastPeriod > 200) {
          reply = truncated.slice(0, lastPeriod + 1);
        } else if (lastSpace > 200) {
          reply = truncated.slice(0, lastSpace) + '...';
        } else {
          reply = truncated + '...';
        }
      }

      // Ensure GitHub URL is included
      if (!reply.includes(product.githubUrl) && !reply.includes('github.com')) {
        logger.warn('Reply missing GitHub URL, appending');
        const urlToAdd = ` ${product.githubUrl}`;
        if (reply.length + urlToAdd.length <= 280) {
          reply += urlToAdd;
        } else {
          // Truncate to make room for URL
          reply = reply.slice(0, 280 - urlToAdd.length - 3) + '...' + urlToAdd;
        }
      }

      return reply;
    } catch (error) {
      logger.error('Failed to generate reply', { error, tweetId: tweet.id });
      return null;
    }
  }

  /**
   * Generate multiple reply variations for A/B testing (future feature)
   */
  async generateReplyVariations(
    tweet: CandidateTweet,
    product: Product,
    count = 3
  ): Promise<string[]> {
    const variations: string[] = [];
    const tones: ToneType[] = ['educational', 'relatable', 'valueFirst', 'direct'];
    
    for (let i = 0; i < count && i < tones.length; i++) {
      const reply = await this.generateReply(tweet, product, tones[i]);
      if (reply) {
        variations.push(reply);
      }
    }

    return variations;
  }

  /**
   * Check if content would be considered spam or low quality
   */
  async validateContent(content: string): Promise<{ valid: boolean; reason?: string }> {
    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 100,
        messages: [
          {
            role: 'user',
            content: `Analyze this Twitter reply and determine if it would be considered spam or low quality.
            
Reply: "${content}"

Respond with JSON: {"valid": true/false, "reason": "brief explanation if invalid"}`,
          },
        ],
      });

      const responseContent = response.content[0];
      if (responseContent.type !== 'text') {
        return { valid: true };
      }

      const jsonMatch = responseContent.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return { valid: true };
      }

      const result = JSON.parse(jsonMatch[0]);
      return {
        valid: Boolean(result.valid),
        reason: result.reason,
      };
    } catch (error) {
      logger.warn('Failed to validate content', { error });
      return { valid: true }; // Default to valid on error
    }
  }
}

// Singleton instance
let claudeClient: ClaudeClient | null = null;

export function getClaudeClient(): ClaudeClient {
  if (!claudeClient) {
    claudeClient = new ClaudeClient();
  }
  return claudeClient;
}

