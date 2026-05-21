# Multi-Agent Customer Support System

A simplified AI prototype for customer support with multiple agent roles, workflow orchestration, in-memory retrieval, and basic MCP server stubs.

## 🎯 Project Overview

This project demonstrates a working multi-agent prototype that:

- **Routes** customer queries to specialist agents using a triage workflow
- **Retrieves** relevant information from a simplified knowledge base
- **Processes** queries with specialized agents (billing, technical, account support)
- **Evaluates** responses using a QA agent
- **Manages** short-term and long-term memory for context awareness
- **Exposes** simplified MCP server stubs for knowledge and ticket management

## 🏗️ Architecture

### Core Components

1. **Multi-Agent Framework**
   - LangGraph-inspired workflow scaffolding for sequential orchestration
   - LangChain: Agent orchestration and LLM integration
   - CrewAI: Architecture prepared for future role-based team collaboration

2. **Agent Types**
   - **Triage Agent**: Analyzes and routes tickets to specialists
   - **Technical Agent**: Handles API, integration, and error issues
   - **Billing Agent**: Manages billing, refunds, subscriptions
   - **Account Agent**: Supports password resets, account recovery
   - **QA Agent**: Evaluates response quality and compliance

3. **Agentic Patterns**
   - **Routing**: Query routing based on content and triage output
   - **Parallelization**: Concurrent processing of multiple queries
   - **Evaluator-Optimizer**: Basic workflow statistics and improvement tracking
   - **Orchestrator-Workers**: Central coordinator with specialized workers

4. **Memory Management**
   - **Short-Term Memory**: Recent interactions and context
   - **Long-Term Memory**: Stored resolutions and failure patterns
   - LRU-style behavior for capacity control

5. **RAG System**
   - In-memory document storage with keyword-based retrieval
   - Simplified similarity scoring for demo purposes
   - No external vector store or embedding model is required in current implementation

6. **MCP Integration**

   **Knowledge Base Server** (`knowledge_server.ts`)
   - Simplified server stub for knowledge access
   - Startup initialization with sample data

   **Tickets Server** (`tickets_server.ts`)
   - Simplified server stub for ticket operations
   - Startup initialization with sample data

7. **Human-in-the-Loop (HITL)**
   - Approval simulation for high-risk actions
   - Configurable approval workflow class
   - Human review is currently simulated in the demo

## 🚀 Setup Instructions

### Prerequisites

- Node.js 18+ or Python 3.10+
- OpenAI API key
- npm or yarn

### Installation

1. **Clone and navigate to project**
   ```bash
   cd c:\Users\ruanq\multi-agent-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```

4. **Add your OpenAI API key to `.env`**
   ```
   OPENAI_API_KEY=sk-...
   ```

### Running the System

#### Option 1: Run Main Orchestrator

```bash
npm run dev
```

This starts the multi-agent system and processes sample customer queries.

#### Option 2: Start Individual MCP Servers

Terminal 1 - Knowledge Base Server:
```bash
npm run mcp:knowledge
```

Terminal 2 - Tickets Server:
```bash
npm run mcp:tickets
```

Terminal 3 - Main Application:
```bash
npm run dev
```

## 📋 Configuration

### Environment Variables

```env
# OpenAI Configuration
OPENAI_API_KEY=your_api_key
OPENAI_MODEL=gpt-4-turbo-preview

# MCP Servers
KNOWLEDGE_MCP_PORT=8001
TICKETS_MCP_PORT=8002

# Memory Settings
SHORT_TERM_MEMORY_SIZE=10
LONG_TERM_MEMORY_SIZE=1000

# Application Settings
LOG_LEVEL=DEBUG
ENABLE_HUMAN_APPROVAL=true
```

## 🔄 Workflow Execution

### Query Processing Flow

```
1. Customer Query
   ↓
2. Triage Agent
   ├─ Analyzes query
   └─ Determines category
   ↓
3. RAG Retrieval
   ├─ Searches knowledge base
   └─ Ranks relevant documents
   ↓
4. Specialist Agent
   ├─ Technical/Billing/Account Agent
   └─ Generates solution
   ↓
5. [HITL] Approval simulation (if high-risk)
   ├─ Simulated human supervisor review
   └─ Approval/Rejection
   ↓
6. QA Evaluation
   ├─ Checks quality
   └─ Validates compliance
   ↓
7. Response Delivery
```

### Agentic Patterns in Action

**Routing Pattern:**
- Triage agent analyzes incoming query
- Routes to most appropriate specialist (technical, billing, account)
- Specialist generates targeted solution

**Parallelization Pattern:**
- Multiple customer queries processed concurrently
- Each query follows the full workflow
- Reduced overall processing time

**Evaluator-Optimizer Pattern:**
- QA agent evaluates each response
- System collects success/failure metrics
- Identifies patterns for improvement
- Updates agent behaviors based on feedback

## 🛠️ API & Integration

### Agent Interface

```typescript
// Process a customer query
const response = await orchestrator.routeQuery(
  "I can't login to my account"
);

// Process multiple queries in parallel
const responses = await orchestrator.processQueriesParallel([
  "Query 1",
  "Query 2",
  "Query 3"
]);

// Get system statistics
const stats = orchestrator.getStats();
```

### Memory Interface

```typescript
// Add short-term memory
memory.addShortTermMemory(content, agent, type, ttl);

// Search long-term memory
const results = memory.searchLongTermMemory(query, type);

// Get statistics
const stats = memory.getStats();
```

### RAG Interface

```typescript
// Index a document
await rag.indexDocument(content, source, metadata);

// Retrieve relevant documents
const results = await rag.retrieve(query, limit);
```

### HITL Interface

```typescript
// Request approval
const request = hitl.requestApproval(agent, action, description, data);

// Approve or reject
hitl.approve(requestId, reviewer, feedback);
hitl.reject(requestId, reviewer, feedback);

// Check if approval required
const required = hitl.isCheckpointRequired(checkpointId);
```

## 📊 Output Example

```
📩 Customer Query: "I can't login to my account"
---

Triage Analysis:
- Category: Account Support
- Priority: High
- Recommended Agent: Account Agent

Knowledge Base Match:
- Document: "How to Reset Password"
- Relevance: 0.92

Account Agent Response:
"Let me help you regain access to your account. Here are the steps..."

QA Evaluation:
- Clarity: Excellent
- Accuracy: Verified
- Empathy: High
- Completeness: Full solution provided

✓ Response delivered to customer
```

## 📈 System Metrics

The system tracks and reports:

- **Agent Performance**: Response quality, resolution rate
- **Memory Usage**: Short-term/long-term memory stats
- **RAG Effectiveness**: Document retrieval success rate
- **HITL Approvals**: Approval/rejection ratios
- **Workflow Success**: Completion rate, failure patterns

## 🔒 Security & Compliance

- API key management via environment variables
- No sensitive data in logs
- Human approval for refunds and policy exceptions
- Audit trail of all decisions
- Configurable data retention

## 🧪 Testing

```bash
npm test
```

Runs test suites for:
- Agent routing logic
- Memory management
- RAG retrieval accuracy
- HITL approval workflows
- Orchestrator coordination

## 📚 Project Structure

```
src/
├── agents/
│   └── base_agent.ts          # Agent definitions and factory
├── workflows/
│   ├── orchestrator.ts        # Multi-agent orchestrator
│   └── langgraph_workflow.ts  # LangGraph workflow
├── memory/
│   └── memory_manager.ts      # Short/long-term memory
├── rag/
│   └── rag_system.ts          # RAG system
├── hitl/
│   └── hitl_manager.ts        # Human-in-the-loop manager
├── mcp_servers/
│   ├── knowledge_server.ts    # Knowledge base MCP
│   └── tickets_server.ts      # Tickets MCP
└── main.ts                    # Entry point

data/
├── knowledge_base/            # Knowledge articles
└── tickets/                   # Support tickets

docs/
├── ARCHITECTURE.md            # Detailed architecture
└── REPORT.md                 # Performance report

config/
├── agents.json               # Agent configurations
└── workflows.json            # Workflow definitions
```

## 🎓 Key Concepts Demonstrated

1. **Multi-Framework Integration**: LangGraph-inspired workflow + LangChain
2. **Agentic Patterns**: Routing, Parallelization, Evaluation-Optimization
3. **Custom MCP Implementation**: Simplified knowledge base and ticket server stubs
4. **RAG Integration**: In-memory retrieval with keyword-based similarity
5. **Memory Management**: Short-term and long-term memory storage
6. **Human-in-the-Loop**: Approval simulation for reviewable actions
7. **Error Handling**: Graceful degradation and fallback strategies

## 🚀 Future Enhancements

- [ ] Integration with real customer support platforms (Zendesk, Intercom)
- [ ] Advanced NLP for intent detection
- [ ] Multi-language support
- [ ] Real-time analytics dashboard
- [ ] Integration with Slack/Teams
- [ ] Persistent database backend
- [ ] Advanced RAG with hybrid search
- [ ] Fine-tuning custom models

## 📝 License

This project is provided as-is for educational purposes.

## 🤝 Support

For issues or questions, refer to the detailed documentation in the `docs/` directory.

---

**Last Updated**: May 2026
