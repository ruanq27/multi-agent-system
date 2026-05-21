import { FastMCP } from 'fastmcp';
import * as fs from 'fs/promises';
import * as path from 'path';

interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Knowledge Base MCP Server
 * Provides access to customer support knowledge base
 * Implements: Resources (articles), Tools (search, categorize), Prompts (query templates)
 */

const server = new FastMCP({
  name: 'knowledge-base-mcp',
  version: '1.0.0',
});

// Store for knowledge articles
const knowledgeStore: Map<string, KnowledgeArticle> = new Map();

// Initialize with sample data
async function initializeKnowledgeBase(): Promise<void> {
  const articles: KnowledgeArticle[] = [
    {
      id: 'kb-001',
      title: 'How to Reset Password',
      content:
        'To reset your password: 1. Click "Forgot Password" on login page. 2. Enter your email. 3. Follow the link sent to your email. 4. Create a new password.',
      category: 'Account',
      tags: ['password', 'account', 'security'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'kb-002',
      title: 'Billing Questions',
      content:
        'We offer flexible billing plans. Monthly ($9.99), Quarterly ($24.99), or Annual ($89.99). All plans include 24/7 support and automatic backups.',
      category: 'Billing',
      tags: ['billing', 'pricing', 'subscription'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'kb-003',
      title: 'API Integration Guide',
      content:
        'Our API uses REST and supports JSON payloads. Base URL: https://api.example.com/v1. Authentication via API key in headers. See docs for endpoint details.',
      category: 'Technical',
      tags: ['api', 'integration', 'technical'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'kb-004',
      title: 'Common Error Codes',
      content:
        'Error 401: Unauthorized access. Error 403: Forbidden resource. Error 500: Server error. Error 429: Rate limit exceeded.',
      category: 'Technical',
      tags: ['errors', 'troubleshooting'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  for (const article of articles) {
    knowledgeStore.set(article.id, article);
  }
}

// Define resources
server.resource('knowledge-articles', 'All knowledge base articles', async () => {
  const articles = Array.from(knowledgeStore.values());
  return {
    contents: [
      {
        uri: 'knowledge://articles',
        mimeType: 'application/json',
        text: JSON.stringify(articles, null, 2),
      },
    ],
  };
});

server.resource('categories', 'Knowledge base categories', async () => {
  const categories = new Set<string>();
  for (const article of knowledgeStore.values()) {
    categories.add(article.category);
  }
  return {
    contents: [
      {
        uri: 'knowledge://categories',
        mimeType: 'application/json',
        text: JSON.stringify(Array.from(categories), null, 2),
      },
    ],
  };
});

// Define tools
server.tool('search-knowledge', 'Search knowledge base articles', { query: 'string', limit: 'number' }, async (params: { query: string; limit: number }) => {
  const query = (params.query as string).toLowerCase();
  const limit = (params.limit as number) || 10;

  const results = Array.from(knowledgeStore.values())
    .filter(
      (article) =>
        article.title.toLowerCase().includes(query) ||
        article.content.toLowerCase().includes(query) ||
        article.tags.some((tag) => tag.toLowerCase().includes(query))
    )
    .slice(0, limit);

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(results, null, 2),
      },
    ],
  };
});

server.tool(
  'get-by-category',
  'Get articles by category',
  { category: 'string', limit: 'number' },
  async (params: any) => {
    const category = params.category as string;
    const limit = (params.limit as number) || 10;

    const results = Array.from(knowledgeStore.values())
      .filter((article) => article.category === category)
      .slice(0, limit);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(results, null, 2),
        },
      ],
    };
  }
);

server.tool('get-article', 'Get specific article by ID', { id: 'string' }, async (params: any) => {
  const article = knowledgeStore.get(params.id as string);

  if (!article) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ error: 'Article not found' }),
        },
      ],
    };
  }

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(article, null, 2),
      },
    ],
  };
});

// Define prompts
server.prompt(
  'search-guidance',
  'Guidelines for searching knowledge base',
  async () => {
    return {
      messages: [
        {
          role: 'user',
          content:
            'Use the search-knowledge tool with relevant keywords. Try broad searches first, then narrow down. Check article tags for better results.',
        },
      ],
    };
  }
);

// Start server
async function main(): Promise<void> {
  await initializeKnowledgeBase();

  const port = process.env.KNOWLEDGE_MCP_PORT || 8001;
  console.log(`Knowledge Base MCP Server starting on port ${port}...`);
  console.log(`Articles loaded: ${knowledgeStore.size}`);
}

main().catch(console.error);
