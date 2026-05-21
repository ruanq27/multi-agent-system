# Development Guide

## Project Structure

```
multi-agent-system/
├── src/
│   ├── agents/              # Agent implementations
│   ├── workflows/           # Orchestration and workflow logic
│   ├── memory/              # Memory management systems
│   ├── rag/                 # RAG system for document retrieval
│   ├── hitl/                # Human-in-the-loop controls
│   ├── mcp_servers/         # Custom MCP servers
│   └── main.ts              # Entry point
├── data/
│   ├── knowledge_base/      # Sample knowledge articles
│   └── tickets/             # Sample support tickets
├── config/
│   ├── agents.json          # Agent configurations
│   └── workflows.json       # Workflow definitions
├── docs/
│   ├── ARCHITECTURE.md      # System architecture
│   └── REPORT.md            # Project report
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
├── .env.example             # Environment template
└── README.md                # This file
```

## Development Workflow

### 1. Local Setup
```bash
npm install
cp .env.example .env
# Edit .env with your OpenAI API key
```

### 2. Start Development
```bash
npm run dev
```

### 3. Test MCP Servers
```bash
# Terminal 1
npm run mcp:knowledge

# Terminal 2 (new terminal)
npm run mcp:tickets

# Terminal 3 (new terminal)
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

## Key Concepts

### Agents
Each agent specializes in a specific domain:
- **Triage Agent**: Routes queries to specialists
- **Technical Agent**: Handles API and technical issues
- **Billing Agent**: Manages billing and refunds
- **Account Agent**: Handles account and security
- **QA Agent**: Evaluates responses

### Workflows
- **Standard Flow**: Single query → Triage → Specialist → QA → Response
- **Parallel Flow**: Multiple queries processed concurrently
- **Escalation Flow**: High-risk decisions → Human approval → Action

### Memory System
- **Short-Term**: Recent interactions (TTL-based, 10 entries max)
- **Long-Term**: Persistent patterns (LRU eviction, 1000 entries max)

### RAG System
- **Indexing**: Convert documents → chunks → embeddings → vector store
- **Retrieval**: Query → embedding → similarity search → ranked results

### HITL System
- **Checkpoints**: Define high-risk actions requiring approval
- **Approval Process**: Request → Notification → Supervisor Decision → Record
- **Integration**: Query flow pauses, waiting for approval

## Adding New Features

### Add a New Agent Type

1. Create agent class in `src/agents/base_agent.ts`:
```typescript
export class NewAgent extends SupportAgent {
  constructor() {
    super({
      name: 'new-agent',
      role: 'New Agent Role',
      description: 'Description of what this agent does',
      systemPrompt: 'Your instructions...',
      temperature: 0.5,
      model: 'gpt-4-turbo-preview',
    });
  }
}
```

2. Register in `AgentFactory`:
```typescript
case 'new':
  return new NewAgent();
```

3. Update orchestrator routing logic in `src/workflows/orchestrator.ts`:
```typescript
private determineTargetAgent(triageResponse: string, query: string): string {
  // Add condition for new agent
  if (query.includes('new-keyword')) {
    return 'new-agent';
  }
  // ... existing logic
}
```

### Add a New Approval Checkpoint

1. Register in `HITLManager.initializeCheckpoints()`:
```typescript
checkpoints.push({
  id: 'new-checkpoint',
  name: 'New Checkpoint Name',
  description: 'What triggers this approval',
  required: true,
  enabled: true,
});
```

2. Check before action in orchestrator:
```typescript
if (this.hitl.isCheckpointRequired('new-checkpoint')) {
  const approved = await this.requestHumanApproval(...);
  if (!approved) return;
}
```

### Add Knowledge Base Articles

1. Create markdown file in `data/knowledge_base/`:
```markdown
# Article Title

## Section 1
Content...

## Section 2
More content...
```

2. Index in main.ts:
```typescript
await rag.indexDocument(
  'Article content',
  'kb-article-id',
  { category: 'Category Name' }
);
```

## Debugging

### Enable Verbose Logging
```bash
LOG_LEVEL=DEBUG npm run dev
```

### Test Individual Components

**Test Memory System:**
```typescript
const memory = new MemoryManager();
memory.addShortTermMemory('Test content', 'test-agent');
console.log(memory.getStats());
```

**Test RAG System:**
```typescript
const rag = new RAGSystem();
await rag.indexDocument('Content', 'source');
const results = await rag.retrieve('query');
```

**Test HITL System:**
```typescript
const hitl = new HITLManager();
const request = hitl.requestApproval('agent', 'action', 'desc', {});
hitl.approve(request.id, 'reviewer', 'reason');
```

## Performance Optimization Tips

1. **Batch Operations**: Use parallelization for multiple queries
2. **Caching**: Cache frequently accessed documents
3. **Embedding Optimization**: Pre-compute embeddings for common queries
4. **Agent Temperature**: Lower temperature for deterministic tasks, higher for creative

## Common Issues

### Issue: OpenAI API Rate Limit
**Solution**: Implement exponential backoff
```typescript
const delay = Math.pow(2, retryCount) * 1000;
await new Promise(resolve => setTimeout(resolve, delay));
```

### Issue: Memory Running Out
**Solution**: Reduce memory sizes or implement cleanup
```typescript
const memory = new MemoryManager(5, 500); // Smaller sizes
memory.clearExpiredMemory(); // Regular cleanup
```

### Issue: Slow RAG Retrieval
**Solution**: Optimize chunk size and overlap
```typescript
CHUNK_SIZE=250        // Smaller chunks
CHUNK_OVERLAP=50      // Less overlap
```

## Testing

```bash
npm test
```

Test coverage for:
- Agent routing logic
- Memory eviction policies
- RAG similarity search
- HITL approval workflow
- Orchestrator coordination

## Performance Metrics

Track these metrics during development:
- Response latency per agent
- Memory usage trends
- RAG retrieval accuracy
- HITL approval time
- Parallel processing throughput

## Contributing Guidelines

1. **Code Style**: Follow TypeScript strict mode
2. **Comments**: Document complex logic
3. **Testing**: Add tests for new features
4. **Performance**: Profile before optimizing
5. **Documentation**: Update docs with changes

## Resources

- [LangGraph Documentation](https://langchain.com/docs/langgraph)
- [LangChain Documentation](https://langchain.com/docs)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [MCP Specification](https://modelcontextprotocol.io)

---

**Last Updated**: May 2026
