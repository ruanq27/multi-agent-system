# Multi-Agent Customer Support System - Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    CUSTOMER SUPPORT SYSTEM                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  INPUT: Customer Queries / Tickets                               │
│    ↓                                                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  ORCHESTRATOR (Multi-Agent Coordinator)                  │   │
│  │  ├─ Routing Pattern: Route to specialist                │   │
│  │  ├─ Parallelization: Process multiple queries           │   │
│  │  └─ Evaluator-Optimizer: Continuous improvement         │   │
│  └──────────────────────────────────────────────────────────┘   │
│    ↓         ↓         ↓         ↓         ↓                     │
│    │         │         │         │         │                     │
│  ┌─┴──┐   ┌──┴──┐   ┌──┴──┐   ┌──┴──┐   ┌─┴──┐               │
│  │   Triage  │   Technical  │   Billing    │   Account   │    QA   │               │
│  │  Agent   │    Agent      │    Agent     │    Agent    │  Agent  │               │
│  │  (Sort)  │  (API, Error) │ (Refunds)    │  (Password) │ (Eval)  │               │
│  └─┬──┘   └──┬──┘   └──┬──┘   └──┬──┘   └─┬──┘               │
│    └─────────┴─────────┴─────────┴─────────┘                     │
│      All agents use: LangChain + LangGraph                        │
│    ↓                                                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              MEMORY MANAGEMENT                            │   │
│  │  ┌────────────────┐      ┌────────────────┐              │   │
│  │  │ Short-Term     │      │  Long-Term     │              │   │
│  │  │ Memory         │      │  Memory        │              │   │
│  │  │ (Recent)       │      │  (Persistent)  │              │   │
│  │  │ TTL: 10 min    │      │  LRU Eviction  │              │   │
│  │  │ Size: 10       │      │  Size: 1000    │              │   │
│  │  └────────────────┘      └────────────────┘              │   │
│  └──────────────────────────────────────────────────────────┘   │
│    ↓                                                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              RAG SYSTEM                                   │   │
│  │  Documents → Chunks → Embeddings → Vector Store          │   │
│  │  (Knowledge Base + Semantic Search)                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│    ↓                                                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         HUMAN-IN-THE-LOOP (HITL)                          │   │
│  │  High-Risk Actions → Supervisor Approval → Action        │   │
│  │  Checkpoints:                                             │   │
│  │  - High Priority Escalation                              │   │
│  │  - Customer Refund                                        │   │
│  │  - Policy Exception                                       │   │
│  │  - External Escalation                                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│    ↓                                                              │
│  OUTPUT: Customer Response + Approval Records                    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## MCP Integration Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│              MCP SERVERS (Model Context Protocol)                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────┐  ┌──────────────────────────────┐ │
│  │ KNOWLEDGE BASE MCP        │  │  TICKETS MCP                 │ │
│  │ (Port 8001)               │  │  (Port 8002)                 │ │
│  ├──────────────────────────┤  ├──────────────────────────────┤ │
│  │ RESOURCES:                │  │ RESOURCES:                   │ │
│  │ - Articles (all)          │  │ - Open Tickets               │ │
│  │ - Categories              │  │ - All Tickets                │ │
│  │                            │  │                              │ │
│  │ TOOLS:                     │  │ TOOLS:                       │ │
│  │ - search-knowledge        │  │ - create-ticket              │ │
│  │ - get-by-category         │  │ - get-ticket                 │ │
│  │ - get-article             │  │ - update-ticket-status       │ │
│  │                            │  │ - add-response               │ │
│  │ PROMPTS:                   │  │ - list-tickets-by-status     │ │
│  │ - search-guidance          │  │                              │ │
│  │                            │  │ PROMPTS:                     │ │
│  │                            │  │ - ticket-response-template   │ │
│  └──────────────────────────┘  └──────────────────────────────┘ │
│           ↑                              ↑                        │
│           │ Agents Query Data            │                        │
│           └──────────────────────────────┘                        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## LangGraph Workflow State Machine

```
┌────────┐
│ START  │
└───┬────┘
    │
    ↓
┌─────────────┐
│   TRIAGE    │  - Analyze customer query
│   NODE      │  - Determine category/priority
└──────┬──────┘
       │
       ↓
┌──────────────────┐
│ RETRIEVE         │  - Query RAG system
│ KNOWLEDGE        │  - Get relevant documents
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│  SPECIALIST      │  - Route to appropriate agent
│  NODE            │  - Generate solution
└────────┬─────────┘
         │
         ├─ High Risk? ─YES─→ ┌────────────────┐
         │                    │ HUMAN APPROVAL │  - Request supervisor approval
         │                    │ NODE           │  - Wait for decision
         │                    └────────┬────────┘
         │                             │
         └──────────────┬──────────────┘
                        │
                        ↓
                   ┌────────────┐
                   │ QA CHECK   │  - Evaluate response
                   │ NODE       │  - Check compliance
                   └─────┬──────┘
                         │
                         ↓
                   ┌────────────┐
                   │ FINALIZE   │  - Prepare final response
                   │ NODE       │  - Update memory
                   └─────┬──────┘
                         │
                         ↓
                      ┌─────┐
                      │ END │
                      └─────┘
```

## Agentic Patterns Implementation

### 1. Routing Pattern
```
Customer Query
    ↓
Analyze Content → Determine Type
    ↓         ↓         ↓
    Billing  Technical  Account
    ↓         ↓         ↓
  [Specialist Agents]
```

### 2. Parallelization Pattern
```
Query 1 ──┐
Query 2 ──┼→ Process in Parallel → Responses [1, 2, 3]
Query 3 ──┘
```

### 3. Evaluator-Optimizer Pattern
```
Responses → QA Evaluation → Metrics
    ↓           ↓            ↓
Success Rate   Quality      Patterns
    ↓           ↓            ↓
Long-Term Memory ← Continuous Improvement
```

## Data Flow Diagram

```
┌────────────────┐
│  Input Queue   │
│  (Tickets)     │
└────────┬───────┘
         │
         ↓
┌──────────────────────┐
│  Orchestrator        │
│  ├─ Route            │
│  ├─ Coordinate       │
│  └─ Track            │
└────────┬─────────────┘
         │
    ┌────┴────┐
    ↓         ↓
┌────────┐  ┌─────────────┐
│ Agents │  │ RAG System  │
│        │  │             │
│ •Triage│  │ Knowledge   │
│ •Tech  │  │ Base        │
│ •Bill  │  │             │
│ •Acct  │  │ Embeddings  │
│ •QA    │  │             │
└───┬────┘  └──────┬──────┘
    │               │
    └────┬──────────┘
         │
         ↓
┌──────────────────┐
│  Memory System   │
│  ├─ Short-Term   │
│  └─ Long-Term    │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│  HITL Manager    │
│  ├─ Check Risk   │
│  ├─ Request Appr │
│  └─ Track Status │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│  Output Queue    │
│  (Responses)     │
└──────────────────┘
```

## Technology Stack

```
┌─────────────────────────────────────────────────┐
│           FRAMEWORKS & LIBRARIES                 │
├─────────────────────────────────────────────────┤
│                                                  │
│ LangGraph  ─┐                                    │
│ LangChain  ─┼→ Agent Orchestration              │
│ CrewAI     ─┘                                    │
│                                                  │
│ OpenAI API ──→ LLM (GPT-4 Turbo)               │
│                                                  │
│ fastMCP ────→ MCP Server Implementation          │
│                                                  │
│ TypeScript ──→ Type-Safe Implementation          │
│                                                  │
└─────────────────────────────────────────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────┐
│           DEPLOYMENT                                 │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Node.js Runtime                                    │
│  ├─ Main Application                               │
│  │  ├─ Orchestrator                                │
│  │  ├─ Agents (LangChain + LangGraph)            │
│  │  └─ Memory & RAG                               │
│  │                                                  │
│  ├─ MCP Server 1 (Knowledge Base)                 │
│  │  └─ Port 8001                                  │
│  │                                                  │
│  ├─ MCP Server 2 (Tickets)                        │
│  │  └─ Port 8002                                  │
│  │                                                  │
│  └─ External Services                             │
│     ├─ OpenAI API (LLM)                          │
│     └─ Vector Store (Embeddings)                 │
│                                                      │
└─────────────────────────────────────────────────────┘
```

## Key Integration Points

1. **Agent-to-Agent Communication**: Via orchestrator coordination
2. **Agent-to-MCP**: REST-based tool invocation
3. **Agent-to-LLM**: OpenAI API calls
4. **Agent-to-Memory**: Direct memory manager access
5. **Agent-to-RAG**: Vector similarity search
6. **Agent-to-HITL**: Approval request submission

## Error Handling & Fallback

```
Request
    ↓
Try Primary Agent
    ↓
    ├─ Success? ──YES─→ Return Response
    │
    └─ No ──→ Try Fallback Agent
               ↓
               ├─ Success? ──YES─→ Return Response
               │
               └─ No ──→ Escalate to Human
                         ↓
                         Human Resolution
```

---

**Architecture Version**: 1.0
**Last Updated**: May 2026
