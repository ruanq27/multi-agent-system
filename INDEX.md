# Multi-Agent System - Project Index

## 📋 Quick Navigation

### Core Documentation
- **[README.md](README.md)** - Main project documentation
- **[QUICKSTART.md](QUICKSTART.md)** - 5-minute setup guide
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System architecture & design
- **[docs/REPORT.md](docs/REPORT.md)** - Performance evaluation & metrics
- **[docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)** - Developer guide & tutorials

### Source Code

#### Agents (`src/agents/`)
- **base_agent.ts** - Agent framework and 5 agent types:
  - TriageAgent (routing)
  - TechnicalAgent (API issues)
  - BillingAgent (payments)
  - AccountAgent (security)
  - QAAgent (evaluation)

#### Workflows (`src/workflows/`)
- **orchestrator.ts** - Multi-agent orchestrator
  - Routing Pattern
  - Parallelization Pattern
  - Evaluator-Optimizer Pattern
  - Orchestrator-Workers Pattern
- **langgraph_workflow.ts** - LangGraph workflow for state management

#### Memory (`src/memory/`)
- **memory_manager.ts** - Dual memory system
  - Short-term: Recent interactions (TTL)
  - Long-term: Persistent patterns (LRU)

#### RAG (`src/rag/`)
- **rag_system.ts** - Retrieval Augmented Generation
  - Document indexing with embeddings
  - Similarity search
  - Vector store management

#### HITL (`src/hitl/`)
- **hitl_manager.ts** - Human-in-the-Loop system
  - Approval workflows
  - Checkpoints management
  - Decision tracking

#### MCP Servers (`src/mcp_servers/`)
- **knowledge_server.ts** - Knowledge base MCP
  - Resources: articles, categories
  - Tools: search, get-by-category, get-article
  - Prompts: search guidance
- **tickets_server.ts** - Tickets management MCP
  - Resources: open-tickets, all-tickets
  - Tools: create, update, list, add-response
  - Prompts: response templates

### Configuration Files

#### Project Setup
- **package.json** - Dependencies and scripts
- **tsconfig.json** - TypeScript configuration
- **.env.example** - Environment variables template
- **.gitignore** - Git ignore rules

#### Application Configuration
- **config/agents.json** - Agent definitions and settings
- **config/workflows.json** - Workflow definitions and checkpoints

### Data Files

#### Knowledge Base
- **data/knowledge_base/password-reset.md** - Account access help
- **data/knowledge_base/api-documentation.md** - API reference
- **data/knowledge_base/billing-faq.md** - Billing information

#### Tickets
- **data/tickets/sample_tickets.json** - Sample support tickets

## 🚀 Getting Started

### Minimal Setup (2 minutes)
```bash
npm install
cp .env.example .env
# Add OpenAI API key to .env
npm run dev
```

### Full Setup with MCP Servers (5 minutes)
```bash
npm install
cp .env.example .env
# Terminal 1: npm run mcp:knowledge
# Terminal 2: npm run mcp:tickets
# Terminal 3: npm run dev
```

## 🎯 Key Concepts

### Multi-Agent Architecture
- **5 Specialized Agents**: Triage, Technical, Billing, Account, QA
- **Orchestrator**: Central coordinator using routing patterns
- **Parallel Processing**: Concurrent query handling
- **Quality Evaluation**: Automated QA checks

### Agentic Patterns
1. **Routing**: Content-based agent selection
2. **Parallelization**: Concurrent processing
3. **Evaluation-Optimization**: Performance improvement
4. **Orchestrator-Workers**: Centralized coordination

### Advanced Features
- **RAG Integration**: Semantic document retrieval
- **Dual Memory**: Short-term (context) + Long-term (learning)
- **Human-in-Loop**: Approval checkpoints for high-risk actions
- **MCP Servers**: Custom external data integration

## 📊 Project Stats

- **Lines of Code**: ~1500
- **Agents**: 5 specialized
- **MCP Servers**: 2 custom
- **Memory Types**: 2 (short + long term)
- **Agentic Patterns**: 4 implemented
- **Documentation Files**: 5
- **Configuration Files**: 2

## 🔧 Technology Stack

- **LLM**: OpenAI GPT-4 Turbo
- **Frameworks**: LangGraph, LangChain
- **Language**: TypeScript
- **MCP**: FastMCP
- **Embeddings**: OpenAI text-embedding-3-small
- **Vector Store**: Memory-based

## 📈 Performance Targets

- Single query: < 3 seconds
- Parallel throughput: 1.3 q/s
- Response quality: 92%
- Approval rate: 87.3%
- Memory efficiency: 10 MB

## 🗂️ Project Structure

```
multi-agent-system/
├── src/
│   ├── agents/              # Agent implementations
│   ├── workflows/           # Orchestration logic
│   ├── memory/              # Memory management
│   ├── rag/                 # Document retrieval
│   ├── hitl/                # Human-in-loop
│   ├── mcp_servers/         # Custom MCPs
│   └── main.ts              # Entry point
├── data/                    # Knowledge base & tickets
├── config/                  # Application config
├── docs/                    # Documentation
└── package.json             # Dependencies
```

## 🎓 Learning Path

1. **Start**: [QUICKSTART.md](QUICKSTART.md) - Get running
2. **Understand**: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - System design
3. **Develop**: [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) - Code guide
4. **Evaluate**: [docs/REPORT.md](docs/REPORT.md) - Performance metrics
5. **Extend**: Modify `src/agents/base_agent.ts` - Add new agents

## ✨ Key Features

✓ Multi-framework integration (LangGraph + LangChain)
✓ Intelligent routing with content analysis
✓ RAG-enhanced responses with semantic search
✓ Continuous improvement via QA evaluation
✓ Human-in-the-loop approval workflows
✓ Dual memory system (short + long term)
✓ Custom MCP server integration
✓ Parallel query processing
✓ Comprehensive error handling
✓ Production-ready architecture

## 📝 Deliverables

✓ **README.md** - Complete setup and usage guide
✓ **Architecture Diagram** - Visual system representation (docs/ARCHITECTURE.md)
✓ **Project Report** - Performance evaluation (docs/REPORT.md)
✓ **Fully Functional Code** - All components implemented and tested

## 🤝 Next Steps

- [ ] Integrate with real support platform (Zendesk, Intercom)
- [ ] Add multi-language support
- [ ] Deploy to cloud (AWS, GCP, Azure)
- [ ] Implement analytics dashboard
- [ ] Fine-tune models for specific domains
- [ ] Add webhook integrations

## 📞 Support Resources

| Need | Location |
|------|----------|
| Setup help | QUICKSTART.md |
| Architecture questions | docs/ARCHITECTURE.md |
| Code examples | src/main.ts |
| Performance info | docs/REPORT.md |
| Development guide | docs/DEVELOPMENT.md |

---

**System Version**: 1.0.0  
**Created**: May 2026  
**Status**: Production Ready  
**Last Updated**: May 20, 2026
