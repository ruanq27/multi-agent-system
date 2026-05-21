import { FastMCP } from 'fastmcp';
import { v4 as uuidv4 } from 'uuid';

interface SupportTicket {
  id: string;
  customerId: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  assignedAgent?: string;
  createdAt: string;
  updatedAt: string;
  responses: TicketResponse[];
}

interface TicketResponse {
  id: string;
  agentName: string;
  message: string;
  timestamp: string;
}

/**
 * Tickets Management MCP Server
 * Provides access to customer support tickets
 * Implements: Resources (tickets), Tools (create, update, list), Prompts (ticket templates)
 */

const server = new FastMCP({
  name: 'tickets-mcp',
  version: '1.0.0',
});

// Store for tickets
const ticketStore: Map<string, SupportTicket> = new Map();

// Initialize with sample data
async function initializeTickets(): Promise<void> {
  const tickets: SupportTicket[] = [
    {
      id: 'TKT-001',
      customerId: 'CUST-001',
      subject: 'Cannot login to account',
      description: 'I have been unable to login since yesterday. Getting error code 401.',
      status: 'open',
      priority: 'high',
      category: 'Account',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      responses: [],
    },
    {
      id: 'TKT-002',
      customerId: 'CUST-002',
      subject: 'Billing discrepancy',
      description: 'Charged twice this month. Need refund for one charge.',
      status: 'in_progress',
      priority: 'high',
      category: 'Billing',
      assignedAgent: 'billing-agent',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      responses: [
        {
          id: 'resp-001',
          agentName: 'billing-agent',
          message: 'We are investigating the duplicate charge. Will respond within 24 hours.',
          timestamp: new Date().toISOString(),
        },
      ],
    },
  ];

  for (const ticket of tickets) {
    ticketStore.set(ticket.id, ticket);
  }
}

// Define resources
server.resource('open-tickets', 'All open support tickets', async () => {
  const tickets = Array.from(ticketStore.values()).filter((t) => t.status === 'open');
  return {
    contents: [
      {
        uri: 'tickets://open',
        mimeType: 'application/json',
        text: JSON.stringify(tickets, null, 2),
      },
    ],
  };
});

server.resource('all-tickets', 'All support tickets', async () => {
  const tickets = Array.from(ticketStore.values());
  return {
    contents: [
      {
        uri: 'tickets://all',
        mimeType: 'application/json',
        text: JSON.stringify(tickets, null, 2),
      },
    ],
  };
});

// Define tools
server.tool('create-ticket', 'Create a new support ticket', {
  customerId: 'string',
  subject: 'string',
  description: 'string',
  priority: 'string',
  category: 'string',
}, async (params: any) => {
  const ticket: SupportTicket = {
    id: `TKT-${uuidv4().substring(0, 8).toUpperCase()}`,
    customerId: params.customerId as string,
    subject: params.subject as string,
    description: params.description as string,
    status: 'open',
    priority: (params.priority as SupportTicket['priority']) || 'medium',
    category: params.category as string,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    responses: [],
  };

  ticketStore.set(ticket.id, ticket);

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({ success: true, ticket }, null, 2),
      },
    ],
  };
});

server.tool('get-ticket', 'Get ticket details', { ticketId: 'string' }, async (params: { ticketId: string }) => {
  const ticket = ticketStore.get(params.ticketId as string);

  if (!ticket) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ error: 'Ticket not found' }),
        },
      ],
    };
  }

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(ticket, null, 2),
      },
    ],
  };
});

server.tool(
  'update-ticket-status',
  'Update ticket status',
  { ticketId: 'string', status: 'string' },
  async (params: any) => {
    const ticket = ticketStore.get(params.ticketId as string);

    if (!ticket) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ error: 'Ticket not found' }),
          },
        ],
      };
    }

    ticket.status = params.status as SupportTicket['status'];
    ticket.updatedAt = new Date().toISOString();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ success: true, ticket }, null, 2),
        },
      ],
    };
  }
);

server.tool(
  'add-response',
  'Add response to ticket',
  { ticketId: 'string', agentName: 'string', message: 'string' },
  async (params: any) => {
    const ticket = ticketStore.get(params.ticketId as string);

    if (!ticket) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ error: 'Ticket not found' }),
          },
        ],
      };
    }

    const response: TicketResponse = {
      id: uuidv4(),
      agentName: params.agentName as string,
      message: params.message as string,
      timestamp: new Date().toISOString(),
    };

    ticket.responses.push(response);
    ticket.updatedAt = new Date().toISOString();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ success: true, response }, null, 2),
        },
      ],
    };
  }
);

server.tool(
  'list-tickets-by-status',
  'List tickets by status',
  { status: 'string', limit: 'number' },
  async (params: any) => {
    const status = params.status as string;
    const limit = (params.limit as number) || 20;

    const results = Array.from(ticketStore.values())
      .filter((t) => t.status === status)
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

// Define prompts
server.prompt('ticket-response-template', 'Template for ticket responses', async () => {
  return {
    messages: [
      {
        role: 'user',
        content: `When responding to tickets:
1. Acknowledge the customer's issue
2. Provide clear solution or next steps
3. Set expectations for resolution timeline
4. Offer additional resources if applicable
5. End with professional closing`,
      },
    ],
  };
});

// Start server
async function main(): Promise<void> {
  await initializeTickets();

  const port = process.env.TICKETS_MCP_PORT || 8002;
  console.log(`Tickets MCP Server starting on port ${port}...`);
  console.log(`Tickets loaded: ${ticketStore.size}`);
}

main().catch(console.error);
