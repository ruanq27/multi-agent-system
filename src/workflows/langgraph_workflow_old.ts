import { StateGraph, START, END } from '@langchain/langgraph';
import { BaseMessage } from '@langchain/core/messages';
import { MemoryManager } from '../memory/memory_manager.js';
import { RAGSystem } from '../rag/rag_system.js';
import { HITLManager } from '../hitl/hitl_manager.js';
import { AgentFactory } from '../agents/base_agent.js';

/**
 * LangGraph State for customer support workflow
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
 * LangGraph-based Workflow for advanced state management and routing
 */
export class LangGraphWorkflow {
  private graph: StateGraph<SupportState>;
  private memory: MemoryManager;
  private rag: RAGSystem;
  private hitl: HITLManager;

  constructor(memory: MemoryManager, rag: RAGSystem, hitl: HITLManager) {
    this.memory = memory;
    this.rag = rag;
    this.hitl = hitl;
    this.graph = new StateGraph<SupportState>();
    this.buildGraph();
  }

  /**
   * Build the workflow graph
   */
  private buildGraph(): void {
    // Add nodes
    this.graph.addNode('triage', async (state: SupportState) => this.triageNode(state));
    this.graph.addNode('retrieve_knowledge', async (state: SupportState) =>
      this.retrieveKnowledgeNode(state)
    );
    this.graph.addNode('specialist', async (state: SupportState) => this.specialistNode(state));
    this.graph.addNode('human_approval', async (state: SupportState) =>
      this.humanApprovalNode(state)
    );
    this.graph.addNode('qa_check', async (state: SupportState) => this.qaCheckNode(state));
    this.graph.addNode('finalize', async (state: SupportState) => this.finalizeNode(state));

    // Add edges with conditional routing
    this.graph.addEdge(START, 'triage');
    this.graph.addEdge('triage', 'retrieve_knowledge');
    this.graph.addEdge('retrieve_knowledge', 'specialist');

    // Conditional routing based on approval requirement
    this.graph.addEdge('specialist', 'human_approval');

    this.graph.addEdge('human_approval', 'qa_check');
    this.graph.addEdge('qa_check', 'finalize');
    this.graph.addEdge('finalize', END);
  }

  /**
   * Triage node: Initial analysis
   */
  private async triageNode(state: SupportState): Promise<Partial<SupportState>> {
    const triageAgent = AgentFactory.createAgent('triage');
    const response = await triageAgent.process(state.customerQuery);

    this.memory.addShortTermMemory(
      `Triage: ${response}`,
      'triage-agent',
      'decision'
    );

    return {
      ...state,
      messages: [
        ...state.messages,
        // In production, convert to BaseMessage
      ],
      context: {
        ...state.context,
        triageAnalysis: response,
      },
      workflowStep: 1,
    };
  }

  /**
   * Knowledge retrieval node: Get relevant info from RAG
   */
  private async retrieveKnowledgeNode(
    state: SupportState
  ): Promise<Partial<SupportState>> {
    const relevantDocs = await this.rag.retrieve(state.customerQuery, 3);

    return {
      ...state,
      context: {
        ...state.context,
        relevantDocuments: relevantDocs,
      },
      workflowStep: 2,
    };
  }

  /**
   * Specialist node: Route to appropriate specialist
   */
  private async specialistNode(
    state: SupportState
  ): Promise<Partial<SupportState>> {
    const targetAgent = this.determineAgent(state.context.triageAnalysis as string);
    const specialist = AgentFactory.createAgent(
      targetAgent.replace('-agent', '')
    );

    const response = await specialist.process(
      `${state.customerQuery}\n\nContext: ${JSON.stringify(state.context.relevantDocuments)}`
    );

    this.memory.addShortTermMemory(
      `Specialist response: ${response}`,
      targetAgent,
      'interaction'
    );

    return {
      ...state,
      currentAgent: targetAgent,
      messages: [...state.messages],
      context: {
        ...state.context,
        specialistResponse: response,
      },
      approvalRequired: this.isHighRiskAction(targetAgent, response),
      workflowStep: 3,
    };
  }

  /**
   * Human approval node: Request approval for high-risk actions
   */
  private async humanApprovalNode(
    state: SupportState
  ): Promise<Partial<SupportState>> {
    const approval = this.hitl.requestApproval(
      state.currentAgent,
      'high_priority_action',
      `Specialist recommendation: ${state.context.specialistResponse}`,
      state.context
    );

    console.log(`[APPROVAL] ID: ${approval.id}, Status: ${approval.status}`);

    return {
      ...state,
      approved: true, // In production, wait for actual approval
      workflowStep: 4,
    };
  }

  /**
   * QA check node: Evaluate response quality
   */
  private async qaCheckNode(
    state: SupportState
  ): Promise<Partial<SupportState>> {
    const qaAgent = AgentFactory.createAgent('qa');
    const evaluation = await qaAgent.process(
      `Evaluate this response: "${state.context.specialistResponse}"`
    );

    return {
      ...state,
      messages: [...state.messages],
      context: {
        ...state.context,
        qaEvaluation: evaluation,
      },
      workflowStep: 5,
    };
  }

  /**
   * Finalize node: Prepare final response
   */
  private async finalizeNode(
    state: SupportState
  ): Promise<Partial<SupportState>> {
    const finalResponse = state.context.specialistResponse as string;

    this.memory.addLongTermMemory(
      `Final resolution for: ${state.customerQuery}`,
      'resolution',
      {
        query: state.customerQuery,
        agents: [state.currentAgent],
        response: finalResponse,
      }
    );

    return {
      ...state,
      finalResponse,
      workflowStep: 6,
    };
  }

  /**
   * Check if action requires approval
   */
  private requiresApproval(state: SupportState): boolean {
    return state.approvalRequired || false;
  }

  /**
   * Determine agent type from triage analysis
   */
  private determineAgent(triageAnalysis: string): string {
    const lower = triageAnalysis.toLowerCase();

    if (lower.includes('billing') || lower.includes('refund')) return 'billing-agent';
    if (lower.includes('technical') || lower.includes('error')) return 'technical-agent';
    if (lower.includes('account') || lower.includes('login')) return 'account-agent';

    return 'technical-agent';
  }

  /**
   * Check if action is high-risk
   */
  private isHighRiskAction(agent: string, response: string): boolean {
    const lower = response.toLowerCase();

    if (agent === 'billing-agent' && lower.includes('refund')) return true;
    if (agent === 'account-agent' && lower.includes('disable')) return true;

    return false;
  }

  /**
   * Compile the graph
   */
  getCompiledGraph(): any {
    return this.graph.compile();
  }
}
