# Quick Start Guide

## 5-Minute Setup

### Step 1: Prerequisites
- Node.js 18+ installed
- OpenAI API key from https://platform.openai.com/api-keys

### Step 2: Configure Environment
```bash
cd c:\Users\ruanq\multi-agent-system
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:
```
OPENAI_API_KEY=sk-your-key-here
```

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Run the System
```bash
npm run dev
```

You should see output like:
```
=== Multi-Agent Customer Support System ===

Initializing core components...
Indexing knowledge base...
Initializing multi-agent orchestrator...
Initializing LangGraph workflow...

✓ System initialized successfully

=== Processing Customer Queries ===

📩 Customer Query: "I can't login to my account..."
---
✓ Response: Here's how to resolve your login issue...
```

## What Just Happened?

1. **Initialization**: System loaded 5 specialized agents
2. **Knowledge Base**: Indexed 4 knowledge articles
3. **Agent Coordination**: Created orchestrator with all agents
4. **Query Processing**: Processed sample customer queries
5. **Results**: Displayed responses from each specialist

## Try It Yourself

### Edit the Sample Queries
Open `src/main.ts` and modify:
```typescript
const customerQueries = [
  "Your custom question here?",
  "Another question?",
  "Third question?",
];
```

### See What's Happening
Add logging to see the workflow:
```bash
LOG_LEVEL=DEBUG npm run dev
```

## Explore the System

### Check the Agents
- Open `src/agents/base_agent.ts`
- See 5 specialized agent types:
  - Triage (routing)
  - Technical (API issues)
  - Billing (payments)
  - Account (access)
  - QA (evaluation)

### View the Workflow
- Open `src/workflows/orchestrator.ts`
- See how queries are routed and processed

### Review the Documentation
- `docs/ARCHITECTURE.md` - System design
- `docs/REPORT.md` - Performance metrics
- `docs/DEVELOPMENT.md` - Advanced setup

## Next Steps

### Run MCP Servers (Optional)
Terminal 1:
```bash
npm run mcp:knowledge
```

Terminal 2 (new window):
```bash
npm run mcp:tickets
```

Terminal 3 (new window):
```bash
npm run dev
```

### View Configuration
- `config/agents.json` - Agent definitions
- `config/workflows.json` - Workflow definitions
- `data/knowledge_base/` - Sample articles
- `data/tickets/` - Sample tickets

### Understand the Flow

```
Your Query
    ↓
Triage Agent (analyzes your question)
    ↓
Knowledge Base (finds relevant info)
    ↓
Specialist Agent (processes solution)
    ↓
Quality Agent (evaluates response)
    ↓
Your Response
```

## Troubleshooting

### Issue: "OPENAI_API_KEY not found"
**Solution**: Make sure `.env` file exists with your API key
```bash
cat .env  # Verify file exists
```

### Issue: Module not found errors
**Solution**: Reinstall dependencies
```bash
rm -r node_modules
npm install
```

### Issue: Timeout errors
**Solution**: Increase timeout in environment:
```bash
timeout=30000 npm run dev
```

## Key Features to Notice

✓ **Intelligent Routing**: Triage agent directs queries to specialists
✓ **RAG Integration**: Knowledge base retrieval for context
✓ **Multiple Agents**: Each specialist focuses on their domain
✓ **Quality Assurance**: QA agent evaluates responses
✓ **Memory System**: Both short and long-term memory
✓ **Human Approval**: High-risk decisions can be escalated

## Files to Explore

| File | Purpose |
|------|---------|
| `src/main.ts` | Entry point, runs the demo |
| `src/agents/base_agent.ts` | Agent definitions |
| `src/workflows/orchestrator.ts` | Coordinator logic |
| `src/memory/memory_manager.ts` | Memory system |
| `src/rag/rag_system.ts` | Document retrieval |
| `src/hitl/hitl_manager.ts` | Approval system |
| `config/agents.json` | Agent config |

## Real-World Usage

To integrate into your application:

```typescript
import { MultiAgentOrchestrator } from './src/workflows/orchestrator';

// Initialize
const orchestrator = new MultiAgentOrchestrator(memory, rag, hitl);

// Process query
const response = await orchestrator.routeQuery(userQuery);

// Get results
console.log(response);
```

## Performance

Typical metrics on first run:
- System initialization: ~2 seconds
- Per query processing: 2-3 seconds
- 3 queries in parallel: ~2.5 seconds

## What's Next?

1. **Add more knowledge articles** in `data/knowledge_base/`
2. **Customize agents** in `src/agents/base_agent.ts`
3. **Add approval checkpoints** in `src/hitl/hitl_manager.ts`
4. **Integrate with your API** - Use MCP servers in `src/mcp_servers/`
5. **Scale the system** - See `docs/REPORT.md` for scaling guidance

## Support

- **Architecture Questions**: See `docs/ARCHITECTURE.md`
- **Performance Details**: See `docs/REPORT.md`
- **Development Help**: See `docs/DEVELOPMENT.md`
- **Code Examples**: Check `src/main.ts`

## Key Takeaways

This system demonstrates:
- ✓ Multi-agent orchestration with specialized agents
- ✓ Intelligent routing using LLM analysis
- ✓ RAG-enhanced responses with document retrieval
- ✓ Continuous quality improvement via QA agent
- ✓ Human-in-the-loop for high-risk decisions
- ✓ Memory management for context awareness

**You now have a production-grade multi-agent AI system!**

---

**Ready to get started?** Run `npm run dev` now!
