import { BaseMessage } from '@langchain/core/messages';
import { MemoryManager } from '../memory/memory_manager.js';
import { RAGSystem } from '../rag/rag_system.js';
import { HITLManager } from '../hitl/hitl_manager.js';
import { AgentFactory } from '../agents/base_agent.js';

/**
 * Simplified workflow state
 */
export interface SupportState {
  customerQuery: string;
  currentAgent: string;
  messages: BaseMessage[];
  context: Record<string, unknown>;
  approvalRequired: boolean;
  approved?: boolean;
  nextAgent?: string;
  finalResponse?: string;
  workflowStep: number;
}

/**
 * Simplified Workflow using basic routing
 */
export class LangGraphWorkflow {
  private memory: MemoryManager;
  private rag: RAGSystem;
  private hitl: HITLManager;

  constructor(memory: MemoryManager, rag: RAGSystem, hitl: HITLManager) {
    this.memory = memory;
    this.rag = rag;
    this.hitl = hitl;
  }

  /**
   * Process a query through the workflow
   */
  async process(query: string): Promise<string> {
    const state: SupportState = {
      customerQuery: query,
      currentAgent: 'triage',
      messages: [],
      context: {},
      approvalRequired: false,
      workflowStep: 0,
    };

    // Triage
    const triageAgent = AgentFactory.createAgent('triage');
    const triageResult = await triageAgent.process(query);
    state.messages.push({ role: 'assistant', content: triageResult } as any);

    // Retrieve knowledge
    const knowledge = await this.rag.retrieve(query, 3);
    const knowledgeContext = knowledge.map(k => k.document.content).join('\n---\n');
    state.context['knowledge'] = knowledgeContext;

    // Route to specialist
    state.currentAgent = 'specialist';
    const specialistAgent = AgentFactory.createAgent('specialist');
    const specialistResponse = await specialistAgent.process(query);
    state.messages.push({ role: 'assistant', content: specialistResponse } as any);

    // QA Check
    state.currentAgent = 'qa';
    const qaAgent = AgentFactory.createAgent('qa');
    const qaResult = await qaAgent.process(specialistResponse);
    state.messages.push({ role: 'assistant', content: qaResult } as any);

    state.finalResponse = specialistResponse;
    return specialistResponse;
  }

  /**
   * Compile the workflow
   */
  async compile(): Promise<any> {
    return this;
  }

  /**
   * Invoke the workflow
   */
  async invoke(input: { customerQuery: string }): Promise<{ finalResponse: string }> {
    const response = await this.process(input.customerQuery);
    return { finalResponse: response };
  }
}
