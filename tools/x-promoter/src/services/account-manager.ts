import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger.js';
import { 
  AccountsConfigSchema, 
  AccountSchema,
  type Account, 
  type AccountsConfig, 
  type LoadedAccount,
  type Credentials 
} from '../models/account.js';

const CONFIG_PATH = path.join(process.cwd(), 'src', 'config', 'accounts.json');

export class AccountManager {
  private config: AccountsConfig;
  private loadedAccounts: Map<string, LoadedAccount> = new Map();

  constructor() {
    this.config = this.loadConfig();
    this.loadCredentials();
  }

  /**
   * Load configuration from JSON file
   */
  private loadConfig(): AccountsConfig {
    try {
      const configPath = fs.existsSync(CONFIG_PATH) 
        ? CONFIG_PATH 
        : path.join(process.cwd(), 'dist', 'config', 'accounts.json');
      
      const rawConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      return AccountsConfigSchema.parse(rawConfig);
    } catch (error) {
      logger.error('Failed to load accounts config', { error });
      throw new Error('Invalid accounts configuration');
    }
  }

  /**
   * Load credentials from environment variables
   */
  private loadCredentials(): void {
    for (const account of this.config.accounts) {
      const credentials = this.getCredentialsFromEnv(account.id);
      
      if (credentials) {
        this.loadedAccounts.set(account.id, {
          ...account,
          credentials,
        });
        logger.info(`Loaded credentials for account: ${account.id}`);
      } else {
        logger.warn(`No credentials found for account: ${account.id}`);
      }
    }
  }

  /**
   * Get credentials from environment variables
   * Supports multiple naming conventions
   */
  private getCredentialsFromEnv(accountId: string): Credentials | null {
    // Try different env var naming patterns
    const patterns = [
      // Pattern 1: X_ACCOUNT_1_API_KEY (numbered)
      this.findNumberedCredentials(),
      // Pattern 2: X_{ACCOUNT_ID}_API_KEY (named)
      this.getNamedCredentials(accountId),
    ];

    for (const creds of patterns) {
      if (creds && this.isValidCredentials(creds)) {
        return creds;
      }
    }

    return null;
  }

  /**
   * Find credentials by numbered pattern (X_ACCOUNT_1_*, X_ACCOUNT_2_*, etc.)
   */
  private findNumberedCredentials(): Credentials | null {
    for (let i = 1; i <= 10; i++) {
      const prefix = `X_ACCOUNT_${i}`;
      const name = process.env[`${prefix}_NAME`];
      
      if (!name) continue;

      const creds = {
        apiKey: process.env[`${prefix}_API_KEY`] || '',
        apiSecret: process.env[`${prefix}_API_SECRET`] || '',
        accessToken: process.env[`${prefix}_ACCESS_TOKEN`] || '',
        accessTokenSecret: process.env[`${prefix}_ACCESS_SECRET`] || '',
        bearerToken: process.env[`${prefix}_BEARER_TOKEN`],
      };

      if (this.isValidCredentials(creds)) {
        return creds;
      }
    }
    return null;
  }

  /**
   * Get credentials by account name pattern
   */
  private getNamedCredentials(accountId: string): Credentials | null {
    const prefix = `X_${accountId.toUpperCase().replace(/-/g, '_')}`;
    
    return {
      apiKey: process.env[`${prefix}_API_KEY`] || '',
      apiSecret: process.env[`${prefix}_API_SECRET`] || '',
      accessToken: process.env[`${prefix}_ACCESS_TOKEN`] || '',
      accessTokenSecret: process.env[`${prefix}_ACCESS_SECRET`] || '',
      bearerToken: process.env[`${prefix}_BEARER_TOKEN`],
    };
  }

  /**
   * Check if credentials are valid (all required fields present)
   */
  private isValidCredentials(creds: Credentials): boolean {
    return !!(
      creds.apiKey &&
      creds.apiSecret &&
      creds.accessToken &&
      creds.accessTokenSecret
    );
  }

  /**
   * Get all enabled accounts with loaded credentials
   */
  getEnabledAccounts(): LoadedAccount[] {
    return Array.from(this.loadedAccounts.values())
      .filter(account => account.enabled);
  }

  /**
   * Get a specific account by ID
   */
  getAccount(accountId: string): LoadedAccount | null {
    return this.loadedAccounts.get(accountId) || null;
  }

  /**
   * Get all configured accounts (including those without credentials)
   */
  getAllAccounts(): Account[] {
    return this.config.accounts;
  }

  /**
   * Get global settings
   */
  getGlobalSettings() {
    return this.config.globalSettings;
  }

  /**
   * Enable an account
   */
  enableAccount(accountId: string): boolean {
    const account = this.config.accounts.find(a => a.id === accountId);
    if (!account) return false;

    account.enabled = true;
    this.saveConfig();
    return true;
  }

  /**
   * Disable an account
   */
  disableAccount(accountId: string): boolean {
    const account = this.config.accounts.find(a => a.id === accountId);
    if (!account) return false;

    account.enabled = false;
    this.saveConfig();
    return true;
  }

  /**
   * Add a new account configuration
   */
  addAccount(account: Account): void {
    // Validate account
    AccountSchema.parse(account);

    // Check for duplicate ID
    if (this.config.accounts.some(a => a.id === account.id)) {
      throw new Error(`Account with ID "${account.id}" already exists`);
    }

    this.config.accounts.push(account);
    this.saveConfig();

    // Try to load credentials
    const credentials = this.getCredentialsFromEnv(account.id);
    if (credentials) {
      this.loadedAccounts.set(account.id, { ...account, credentials });
    }

    logger.info(`Added new account: ${account.id}`);
  }

  /**
   * Remove an account
   */
  removeAccount(accountId: string): boolean {
    const index = this.config.accounts.findIndex(a => a.id === accountId);
    if (index === -1) return false;

    this.config.accounts.splice(index, 1);
    this.loadedAccounts.delete(accountId);
    this.saveConfig();
    
    logger.info(`Removed account: ${accountId}`);
    return true;
  }

  /**
   * Update account settings
   */
  updateAccountSettings(accountId: string, settings: Partial<Account['settings']>): boolean {
    const account = this.config.accounts.find(a => a.id === accountId);
    if (!account) return false;

    account.settings = { ...account.settings, ...settings };
    this.saveConfig();

    // Update loaded account if exists
    const loaded = this.loadedAccounts.get(accountId);
    if (loaded) {
      loaded.settings = account.settings;
    }

    return true;
  }

  /**
   * Save configuration to file
   */
  private saveConfig(): void {
    try {
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(this.config, null, 2));
      logger.debug('Saved accounts configuration');
    } catch (error) {
      logger.error('Failed to save accounts config', { error });
    }
  }

  /**
   * Reload configuration from file
   */
  reload(): void {
    this.config = this.loadConfig();
    this.loadedAccounts.clear();
    this.loadCredentials();
    logger.info('Reloaded accounts configuration');
  }

  /**
   * Get account statistics summary
   */
  getAccountsSummary(): Array<{
    id: string;
    name: string;
    enabled: boolean;
    hasCredentials: boolean;
    maxRepliesPerDay: number;
  }> {
    return this.config.accounts.map(account => ({
      id: account.id,
      name: account.name,
      enabled: account.enabled,
      hasCredentials: this.loadedAccounts.has(account.id),
      maxRepliesPerDay: account.settings.maxRepliesPerDay,
    }));
  }
}

// Singleton instance
let accountManager: AccountManager | null = null;

export function getAccountManager(): AccountManager {
  if (!accountManager) {
    accountManager = new AccountManager();
  }
  return accountManager;
}


