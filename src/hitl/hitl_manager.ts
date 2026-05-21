import { v4 as uuidv4 } from 'uuid';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'revision_requested';

export interface ApprovalRequest {
  id: string;
  agentName: string;
  action: string;
  description: string;
  data: Record<string, unknown>;
  status: ApprovalStatus;
  createdAt: Date;
  resolvedAt?: Date;
  reviewer?: string;
  feedback?: string;
}

export interface ApprovalCheckpoint {
  id: string;
  name: string;
  description: string;
  required: boolean;
  enabled: boolean;
}

/**
 * Human-in-the-Loop (HITL) Manager for approval workflows
 */
export class HITLManager {
  private pendingApprovals: Map<string, ApprovalRequest> = new Map();
  private approvalHistory: ApprovalRequest[] = [];
  private checkpoints: Map<string, ApprovalCheckpoint> = new Map();

  constructor() {
    this.initializeCheckpoints();
  }

  /**
   * Initialize default checkpoints
   */
  private initializeCheckpoints(): void {
    const checkpoints: ApprovalCheckpoint[] = [
      {
        id: 'high_priority_escalation',
        name: 'High Priority Escalation',
        description: 'Approve escalation of high-priority tickets',
        required: true,
        enabled: true,
      },
      {
        id: 'customer_refund',
        name: 'Customer Refund',
        description: 'Approve customer refund requests',
        required: true,
        enabled: true,
      },
      {
        id: 'policy_exception',
        name: 'Policy Exception',
        description: 'Approve exceptions to standard policies',
        required: true,
        enabled: true,
      },
      {
        id: 'external_escalation',
        name: 'External Escalation',
        description: 'Escalate to external systems',
        required: false,
        enabled: true,
      },
    ];

    for (const checkpoint of checkpoints) {
      this.checkpoints.set(checkpoint.id, checkpoint);
    }
  }

  /**
   * Create an approval request
   */
  requestApproval(
    agentName: string,
    action: string,
    description: string,
    data: Record<string, unknown>
  ): ApprovalRequest {
    const request: ApprovalRequest = {
      id: uuidv4(),
      agentName,
      action,
      description,
      data,
      status: 'pending',
      createdAt: new Date(),
    };

    this.pendingApprovals.set(request.id, request);
    return request;
  }

  /**
   * Approve a request
   */
  approve(requestId: string, reviewer: string, feedback?: string): ApprovalRequest {
    const request = this.pendingApprovals.get(requestId);
    if (!request) {
      throw new Error(`Approval request not found: ${requestId}`);
    }

    request.status = 'approved';
    request.resolvedAt = new Date();
    request.reviewer = reviewer;
    request.feedback = feedback;

    this.pendingApprovals.delete(requestId);
    this.approvalHistory.push(request);

    return request;
  }

  /**
   * Reject a request
   */
  reject(requestId: string, reviewer: string, feedback: string): ApprovalRequest {
    const request = this.pendingApprovals.get(requestId);
    if (!request) {
      throw new Error(`Approval request not found: ${requestId}`);
    }

    request.status = 'rejected';
    request.resolvedAt = new Date();
    request.reviewer = reviewer;
    request.feedback = feedback;

    this.pendingApprovals.delete(requestId);
    this.approvalHistory.push(request);

    return request;
  }

  /**
   * Request revision
   */
  requestRevision(requestId: string, reviewer: string, feedback: string): ApprovalRequest {
    const request = this.pendingApprovals.get(requestId);
    if (!request) {
      throw new Error(`Approval request not found: ${requestId}`);
    }

    request.status = 'revision_requested';
    request.resolvedAt = new Date();
    request.reviewer = reviewer;
    request.feedback = feedback;

    return request;
  }

  /**
   * Get pending approvals
   */
  getPendingApprovals(agentName?: string): ApprovalRequest[] {
    const pending = Array.from(this.pendingApprovals.values());
    if (agentName) {
      return pending.filter((p) => p.agentName === agentName);
    }
    return pending;
  }

  /**
   * Get approval status
   */
  getApprovalStatus(requestId: string): ApprovalStatus | null {
    const request = this.pendingApprovals.get(requestId) || this.approvalHistory.find((r) => r.id === requestId);
    return request?.status || null;
  }

  /**
   * Check if checkpoint is required
   */
  isCheckpointRequired(checkpointId: string): boolean {
    const checkpoint = this.checkpoints.get(checkpointId);
    return checkpoint?.required && checkpoint?.enabled ? true : false;
  }

  /**
   * Get approval statistics
   */
  getStats(): Record<string, unknown> {
    return {
      pendingCount: this.pendingApprovals.size,
      approvedCount: this.approvalHistory.filter((r) => r.status === 'approved').length,
      rejectedCount: this.approvalHistory.filter((r) => r.status === 'rejected').length,
      revisionRequestedCount: this.approvalHistory.filter((r) => r.status === 'revision_requested').length,
      totalProcessed: this.approvalHistory.length,
    };
  }
}
