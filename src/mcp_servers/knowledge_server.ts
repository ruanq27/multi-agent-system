import { FastMCP } from 'fastmcp';

/**
 * Knowledge Base MCP Server (Simplified)
 * Provides access to customer support knowledge base
 */

const server = new FastMCP({
  name: 'knowledge-base-mcp',
  version: '1.0.0',
});

// Store for knowledge articles
const knowledgeStore: Map<string, any> = new Map();

// Initialize with sample data
async function initializeKnowledgeBase(): Promise<void> {
  const articles = [
    {
      id: 'kb-001',
      title: 'How to Reset Password',
      content: 'To reset your password: 1. Click "Forgot Password" on login page. 2. Enter your email. 3. Follow the link sent to your email. 4. Create a new password.',
      category: 'Account',
      tags: ['password', 'account', 'security'],
    },
    {
      id: 'kb-002',
      title: 'API Rate Limits',
      content: 'Our API has the following rate limits: 100 requests per minute for free tier, 1000 for premium. See documentation for burst limits.',
      category: 'Technical',
      tags: ['api', 'rate-limit', 'technical'],
    },
    {
      id: 'kb-003',
      title: 'Billing Cycle',
      content: 'We bill on the first of every month. You can upgrade or downgrade your plan anytime. Changes take effect on the next billing cycle.',
      category: 'Billing',
      tags: ['billing', 'subscription', 'payment'],
    },
    {
      id: 'kb-004',
      title: 'Two-Factor Authentication',
      content: 'Enable 2FA in account settings. We support authenticator apps and SMS. 2FA adds an extra layer of security to your account.',
      category: 'Account',
      tags: ['security', '2fa', 'authentication'],
    },
  ];

  for (const article of articles) {
    knowledgeStore.set(article.id, article);
  }
}

// Start the server
async function start(): Promise<void> {
  console.log('Knowledge Base MCP Server initialized');
  console.log('Available operations: search, categorize, retrieve');
}

export { server, initializeKnowledgeBase, start };
