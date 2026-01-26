# X Promoter Template

**Automated X/Twitter promotion boilerplate for your projects**

Part of [Sigma Protocol](https://github.com/dallionking/sigma-protocol) - Open source toolkit for AI developers.

---

## What is this?

This is a ready-to-use template for creating your own automated X/Twitter promotion system. It monitors X for relevant conversations and posts contextual, AI-generated replies promoting your project.

## Quick Setup

### 1. Copy the Template

```bash
# Copy the full x-promoter tool to your project
cp -r tools/x-promoter /path/to/your/project/x-promoter
cd /path/to/your/project/x-promoter
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Get API Access

**X/Twitter API:**
1. Go to [developer.twitter.com](https://developer.twitter.com/)
2. Create developer account and app
3. Apply for Basic tier ($100/month) - required for posting
4. Generate API keys and tokens

**Anthropic (Claude) API:**
1. Go to [console.anthropic.com](https://console.anthropic.com/)
2. Create account and get API key

### 4. Configure Your Product

Edit `src/config/accounts.json`:

```json
{
  "accounts": [
    {
      "id": "my-project",
      "name": "My Project Promotion",
      "enabled": true,
      "product": {
        "name": "YOUR PROJECT NAME",
        "tagline": "YOUR TAGLINE",
        "description": "Brief description of your project",
        "githubUrl": "https://github.com/YOUR/REPO",
        "creator": "YOUR NAME",
        "features": [
          "Feature 1",
          "Feature 2",
          "Feature 3"
        ]
      },
      "settings": {
        "maxRepliesPerDay": 50,
        "minIntervalMinutes": 10,
        "toneWeights": {
          "educational": 0.30,
          "relatable": 0.25,
          "valueFirst": 0.30,
          "direct": 0.15
        }
      },
      "keywords": [
        "keyword1",
        "keyword2",
        "your niche"
      ],
      "excludeKeywords": [
        "spam",
        "unrelated"
      ],
      "targetAccounts": [
        "influencer1",
        "influencer2"
      ]
    }
  ],
  "globalSettings": {
    "schedulerIntervalMinutes": 10,
    "globalDailyLimit": 100,
    "avoidReplyingToSameUserWithinHours": 48,
    "prioritizeRecentTweets": true,
    "maxTweetAgeHours": 6
  }
}
```

### 5. Set Environment Variables

Copy `env.example` to `.env`:

```bash
cp env.example .env
```

Fill in your credentials:

```bash
# Required
ANTHROPIC_API_KEY=your_key_here

# X Account Credentials  
X_ACCOUNT_1_NAME=my-project
X_ACCOUNT_1_API_KEY=your_api_key
X_ACCOUNT_1_API_SECRET=your_api_secret
X_ACCOUNT_1_ACCESS_TOKEN=your_access_token
X_ACCOUNT_1_ACCESS_SECRET=your_access_token_secret
X_ACCOUNT_1_BEARER_TOKEN=your_bearer_token
```

### 6. Customize Prompts

Edit `src/config/prompts.json` to customize the messaging:

- Update the example replies with your product messaging
- Adjust the tone guidelines to match your brand voice
- Update the relevance check to match your niche

### 7. Test and Run

```bash
# Initialize database
npm run cli db init

# Test your connection
npm run cli account test my-project

# Preview what tweets would be engaged
npm run cli preview

# Start the automation
npm start
```

---

## Deployment

See the main `x-promoter/README.md` for detailed Render deployment instructions.

---

## Customization Guide

### Adding Your Origin Story

Edit `src/config/prompts.json` and update the "relatable" tone examples with your personal story. Authentic stories resonate better than generic marketing.

### Adjusting Aggressiveness

- **Conservative:** 20-30 replies/day, 15+ min intervals
- **Moderate:** 50-75 replies/day, 10 min intervals  
- **Aggressive:** 100+ replies/day, 5 min intervals (use cautiously)

### Adding Multiple Projects

You can promote multiple projects from different accounts. Add additional accounts to `accounts.json` and set corresponding environment variables (`X_ACCOUNT_2_*`, etc.).

---

## Cost Estimate

| Service | Monthly Cost |
|---------|-------------|
| X API Basic (per account) | $100 |
| Claude API (~1000 replies) | ~$5-10 |
| Hosting (Render, etc.) | ~$15 |
| **Total** | ~$120-125/account |

---

## Tips for Effective Promotion

1. **Add value first** - Replies should be helpful, not just promotional
2. **Be authentic** - Use your real story and experiences
3. **Target wisely** - Focus on genuinely relevant conversations
4. **Start slow** - Begin with lower volumes and increase gradually
5. **Monitor feedback** - Check how people respond and adjust

---

## License

MIT - Part of Sigma Protocol

Based on the X Promoter tool by Dallion King


