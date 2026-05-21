import { SupportAgent, AgentFactory } from '../agents/base_agent.js';
import { MemoryManager } from '../memory/memory_manager.js';
import { RAGSystem } from '../rag/rag_system.js';
import { HITLManager } from '../hitl/hitl_manager.js';
import { v4 as uuidv4 } from 'uuid';

export interface WorkflowState {
  id: string;
  currentAgent: string;
  previousAgents: string[];
  status: 'pending' | 'processing' | 'awaiting_approval' | 'completed' | 'failed';
  customerQuery: string;
  context: Record<string, unknown>;
  responses: Array<{ agent: string; response: string; timestamp: Date }>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Orchestrator for multi-agent customer support system
 * Implements: Routing, Parallelization, Evaluator-Optimizer patterns
 */
export class MultiAgentOrchestrator {
  private agents: Map<string, SupportAgent> = new Map();
  private memory: MemoryManager;
  private rag: RAGSystem;
  private hitl: HITLManager;
  private workflows: Map<string, WorkflowState> = new Map();

  constructor(
    memory: MemoryManager,
    rag: RAGSystem,
    hitl: HITLManager
  ) {
    this.memory = memory;
    this.rag = rag;
    this.hitl = hitl;
    this.initializeAgents();
  }

  /**
   * Initialize all agents
   */
  private initializeAgents(): void {
    const agentTypes = AgentFactory.getAllAgentTypes();
    for (const type of agentTypes) {
      const agent = AgentFactory.createAgent(type);
      this.agents.set(agent.getConfig().name, agent);
    }
    console.log(`Initialized ${this.agents.size} agents`);
  }

  /**
   * ROUTING PATTERN: Route customer query to appropriate agent
   */
  async routeQuery(query: string): Promise<string> {
    // Create workflow
    const workflowId = uuidv4();
    const workflow: WorkflowState = {
      id: workflowId,
      currentAgent: 'triage-agent',
      previousAgents: [],
      status: 'processing',
      customerQuery: query,
      context: {},
      responses: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.workflows.set(workflowId, workflow);

    // Store in short-term memory
    this.memory.addShortTermMemory(
      `New customer query: ${query}`,
      'orchestrator',
      'interaction'
    );

    // Retrieve relevant knowledge (RAG)
    const relevantDocuments = await this.rag.retrieve(query, 3);
    workflow.context.relevantDocs = relevantDocuments;

    // STEP 1: Triage agent analyzes and routes
    const triageAgent = this.agents.get('triage-agent')!;
    const triageResponse = await triageAgent.process(
      `Customer query: "${query}"\n\nRelevant information: ${JSON.stringify(relevantDocuments)}`
    );

    workflow.responses.push({
      agent: 'triage-agent',
      response: triageResponse,
      timestamp: new Date(),
    });

    // Parse routing decision (in production, use structured output)
    const targetAgent = this.determineTargetAgent(triageResponse, query);
    workflow.currentAgent = targetAgent;
    workflow.previousAgents.push('triage-agent');

    // STEP 2: Route to specialist agent
    const specialistAgent = this.agents.get(targetAgent);
    let specialistResponse = '';
    if (specialistAgent) {
      specialistResponse = await specialistAgent.process(query);

      workflow.responses.push({
        agent: targetAgent,
        response: specialistResponse,
        timestamp: new Date(),
      });

      workflow.context.resolution = specialistResponse;
    }

    // STEP 3: QA evaluation
    const qaAgent = this.agents.get('qa-agent')!;
    const qaEvaluation = await qaAgent.process(
      `Evaluate this response: "${workflow.responses[workflow.responses.length - 1]?.response || 'No response generated'}"`
    );

    workflow.responses.push({
      agent: 'qa-agent',
      response: qaEvaluation,
      timestamp: new Date(),
    });

    // Store final response in long-term memory
    this.memory.addLongTermMemory(
      `Resolution for query: ${query}`,
      'resolution',
      {
        agents: workflow.previousAgents,
        resolution: specialistResponse || triageResponse,
      }
    );

    workflow.status = 'completed';
    workflow.updatedAt = new Date();

    const finalResponse = specialistResponse || triageResponse;
    return finalResponse;
  }

  /**
   * PARALLELIZATION PATTERN: Process multiple queries concurrently
   */
  async processQueriesParallel(queries: string[]): Promise<string[]> {
    const promises = queries.map((query) => this.routeQuery(query));
    return Promise.all(promises);
  }

  /**
   * EVALUATOR-OPTIMIZER PATTERN: Continuous improvement
   */
  async optimizeResponses(): Promise<void> {
    // Analyze workflow statistics
    const workflows = Array.from(this.workflows.values());
    const successCount = workflows.filter((w) => w.status === 'completed').length;
    const failureCount = workflows.filter((w) => w.status === 'failed').length;

    console.log(`Workflow Statistics:
      Total: ${workflows.length}
      Successful: ${successCount}
      Failed: ${failureCount}
      Success Rate: ${((successCount / workflows.length) * 100).toFixed(2)}%`);

    // Identify patterns in failures
    const failedWorkflows = workflows.filter((w) => w.status === 'failed');
    if (failedWorkflows.length > 0) {
      const pattern = `Failed workflows pattern: ${failedWorkflows.map((w) => w.customerQuery).join(', ')}`;
      this.memory.addLongTermMemory(pattern, 'pattern', {
        type: 'failure_pattern',
        count: failedWorkflows.length,
      });
    }
  }

  /**
   * HUMAN-IN-THE-LOOP: Request approval for high-impact actions
   */
  async requestHumanApproval(
    agentName: string,
    action: string,
    description: string,
    data: Record<string, unknown>
  ): Promise<boolean> {
    const request = this.hitl.requestApproval(agentName, action, description, data);

    console.log(`[HITL] Approval requested: ${request.id}
      Agent: ${agentName}
      Action: ${action}
      Description: ${description}`);

    // In production, this would wait for human approval
    // For now, simulate approval
    const approved = Math.random() > 0.3; // 70% approval rate
    if (approved) {
      this.hitl.approve(request.id, 'system-supervisor', 'Auto-approved based on threshold');
    } else {
      this.hitl.reject(request.id, 'system-supervisor', 'Rejected due to risk threshold');
    }

    return approved;
  }

  /**
   * Determine target agent based on query analysis
   */
  private determineTargetAgent(triageResponse: string, query: string): string {
    const lowercaseQuery = query.toLowerCase();
    const lowercaseResponse = triageResponse.toLowerCase();

    if (
      lowercaseQuery.includes('billing') ||
      lowercaseQuery.includes('refund') ||
      lowercaseQuery.includes('charge') ||
      lowercaseResponse.includes('billing')
    ) {
      return 'billing-agent';
    } else if (
      lowercaseQuery.includes('api') ||
      lowercaseQuery.includes('error') ||
      lowercaseQuery.includes('integration') ||
      lowercaseResponse.includes('technical')
    ) {
      return 'technical-agent';
    } else if (
      lowercaseQuery.includes('password') ||
      lowercaseQuery.includes('login') ||
      lowercaseQuery.includes('account') ||
      lowercaseResponse.includes('account')
    ) {
      return 'account-agent';
    }

    return 'technical-agent'; // Default
  }

  /**
   * Get workflow status
   */
  getWorkflowStatus(workflowId: string): WorkflowState | undefined {
    return this.workflows.get(workflowId);
  }

  /**
   * Get all workflows
   */
  getAllWorkflows(): WorkflowState[] {
    return Array.from(this.workflows.values());
  }

  /**
   * Get orchestrator statistics
   */
  getStats(): Record<string, unknown> {
    return {
      agentsInitialized: this.agents.size,
      totalWorkflows: this.workflows.size,
      completedWorkflows: Array.from(this.workflows.values()).filter(
        (w) => w.status === 'completed'
      ).length,
      memoryStats: this.memory.getStats(),
      ragStats: this.rag.getStats(),
      hitlStats: this.hitl.getStats(),
    };
  }
}
