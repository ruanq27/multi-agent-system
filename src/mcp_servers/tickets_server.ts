import { FastMCP } from 'fastmcp';
import { v4 as uuidv4 } from 'uuid';

/**
 * Tickets Management MCP Server (Simplified)
 * Provides access to customer support tickets
 */

const server = new FastMCP({
  name: 'tickets-mcp',
  version: '1.0.0',
});

interface SupportTicket {
  id: string;
  customerId: string;
  subject: string;
  description: string;
  priority: string;
  category: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  responses: Array<{ agentName: string; message: string; timestamp: string }>;
}

// Store for tickets
const ticketStore: Map<string, SupportTicket> = new Map();

// Initialize with sample data
async function initializeTickets(): Promise<void> {
  const sampleTickets: SupportTicket[] = [
    {
      id: 'TKT-A1B2C3D4',
      customerId: 'CUST-001',
      subject: 'Cannot login to account',
      description: 'I keep getting an error when trying to log in',
      priority: 'high',
      category: 'Account',
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      responses: [],
    },
    {
      id: 'TKT-E5F6G7H8',
      customerId: 'CUST-002',
      subject: 'API integration issue',
      description: 'Documentation doesn\'t match current API behavior',
      priority: 'medium',
      category: 'Technical',
      status: 'in-progress',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      responses: [],
    },
  ];

  for (const ticket of sampleTickets) {
    ticketStore.set(ticket.id, ticket);
  }
}

// Start the server
async function start(): Promise<void> {
  await initializeTickets();
  console.log('Support Tickets MCP Server initialized');
  console.log('Available operations: create, list, update, response');
}

export { server, initializeTickets, start };
