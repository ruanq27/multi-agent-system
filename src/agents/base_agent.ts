import { ChatOpenAI } from '@langchain/openai';
import { SystemMessage, HumanMessage, BaseMessage } from '@langchain/core/messages';
import { v4 as uuidv4 } from 'uuid';

function resolveModel(model?: string): string {
  return model || process.env.OPENAI_MODEL || 'gpt-4o-mini';
}

export interface AgentConfig {
  name: string;
  role: string;
  description: string;
  systemPrompt: string;
  temperature: number;
  model?: string;
}

export interface AgentAction {
  id: string;
  agentName: string;
  action: string;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
}

/**
 * Base Agent class for customer support
 */
export class SupportAgent {
  private config: AgentConfig;
  private llm: ChatOpenAI;
  private actionHistory: Map<string, AgentAction> = new Map();

  constructor(config: AgentConfig) {
    this.config = config;
    this.llm = new ChatOpenAI({
      modelName: resolveModel(config.model),
      temperature: config.temperature || 0.7,
    });
  }

  /**
   * Process a customer query
   */
  async process(query: string): Promise<string> {
    try {
      const messages: BaseMessage[] = [
        new SystemMessage(this.config.systemPrompt),
        new HumanMessage(query),
      ];

      const response = await this.llm.invoke(messages as any);
      return response.content.toString();
    } catch (error) {
      console.error(`Agent ${this.config.name} error:`, error);
      throw error;
    }
  }

  /**
   * Log an action
   */
  logAction(action: string, input: Record<string, unknown>): AgentAction {
    const actionRecord: AgentAction = {
      id: uuidv4(),
      agentName: this.config.name,
      action,
      input,
      timestamp: new Date(),
      status: 'pending',
    };

    this.actionHistory.set(actionRecord.id, actionRecord);
    return actionRecord;
  }

  /**
   * Complete an action
   */
  completeAction(actionId: string, output: Record<string, unknown>): void {
    const action = this.actionHistory.get(actionId);
    if (action) {
      action.output = output;
      action.status = 'completed';
    }
  }

  /**
   * Get config
   */
  getConfig(): AgentConfig {
    return this.config;
  }

  /**
   * Get action history
   */
  getActionHistory(): AgentAction[] {
    return Array.from(this.actionHistory.values());
  }
}

/**
 * Triage Agent - Routes tickets to appropriate specialist
 */
export class TriageAgent extends SupportAgent {
  constructor() {
    super({
      name: 'triage-agent',
      role: 'Ticket Triage Specialist',
      description: 'Analyzes incoming tickets and routes them to appropriate agents',
      systemPrompt: `You are a ticket triage specialist. Your role is to:
1. Analyze customer issues
2. Determine the category and priority
3. Identify required specialist (billing, technical, account)
4. Provide initial response

Always be professional and empathetic. Ask clarifying questions if needed.`,
      temperature: 0.5,
    });
  }
}

/**
 * Technical Support Agent - Handles technical issues
 */
export class TechnicalAgent extends SupportAgent {
  constructor() {
    super({
      name: 'technical-agent',
      role: 'Technical Support Specialist',
      description: 'Handles technical problems and provides solutions',
      systemPrompt: `You are a technical support specialist. Your expertise includes:
1. API troubleshooting
2. Integration issues
3. Error code resolution
4. System access problems

Provide step-by-step solutions. Reference knowledge base when relevant.
Escalate to human engineers for complex issues.`,
      temperature: 0.3,
    });
  }
}

/**
 * Billing Agent - Handles billing and payment issues
 */
export class BillingAgent extends SupportAgent {
  constructor() {
    super({
      name: 'billing-agent',
      role: 'Billing Specialist',
      description: 'Handles billing, payment, and refund requests',
      systemPrompt: `You are a billing specialist. You handle:
1. Billing inquiries
2. Invoice questions
3. Refund requests
4. Subscription changes

Always verify customer information. Explain charges clearly.
Escalate refund requests above $500 or policy exceptions to human reviewer.`,
      temperature: 0.3,
    });
  }
}

/**
 * Account Support Agent - Handles account issues
 */
export class AccountAgent extends SupportAgent {
  constructor() {
    super({
      name: 'account-agent',
      role: 'Account Support Specialist',
      description: 'Handles account access and management issues',
      systemPrompt: `You are an account support specialist. You help with:
1. Password resets
2. Account recovery
3. Profile updates
4. Security questions

Always verify identity before making changes. Provide security best practices.
Guide users through self-service options first.`,
      temperature: 0.4,
    });
  }
}

/**
 * Quality Assurance Agent - Evaluates responses
 */
export class QAAgent extends SupportAgent {
  constructor() {
    super({
      name: 'qa-agent',
      role: 'Quality Assurance Reviewer',
      description: 'Reviews and evaluates agent responses for quality',
      systemPrompt: `You are a quality assurance reviewer. Your role is to:
1. Evaluate response clarity and accuracy
2. Check for policy compliance
3. Ensure customer satisfaction
4. Identify improvement areas

Rate responses on: accuracy, clarity, empathy, and completeness.
Provide constructive feedback for improvements.`,
      temperature: 0.5,
    });
  }
}

/**
 * Agent Factory
 */
export class AgentFactory {
  static createAgent(type: string): SupportAgent {
    switch (type) {
      case 'triage':
        return new TriageAgent();
      case 'technical':
        return new TechnicalAgent();
      case 'billing':
        return new BillingAgent();
      case 'account':
        return new AccountAgent();
      case 'qa':
        return new QAAgent();
      default:
        throw new Error(`Unknown agent type: ${type}`);
    }
  }

  static getAllAgentTypes(): string[] {
    return ['triage', 'technical', 'billing', 'account', 'qa'];
  }
}
