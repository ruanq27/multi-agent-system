import 'dotenv/config';
import { MemoryManager } from './memory/memory_manager.js';
import { RAGSystem } from './rag/rag_system.js';
import { HITLManager } from './hitl/hitl_manager.js';
import { MultiAgentOrchestrator } from './workflows/orchestrator.js';
import { LangGraphWorkflow } from './workflows/langgraph_workflow.js';

/**
 * Main entry point for the multi-agent customer support system
 */
async function main(): Promise<void> {
  console.log('=== Multi-Agent Customer Support System ===\n');

  try {
    // Initialize core components
    console.log('Initializing core components...');

    const memory = new MemoryManager(
      parseInt(process.env.SHORT_TERM_MEMORY_SIZE || '10'),
      parseInt(process.env.LONG_TERM_MEMORY_SIZE || '1000')
    );

    const rag = new RAGSystem();

    // Index sample knowledge base
    console.log('Indexing knowledge base...');
    await rag.indexDocument(
      'How to reset password: Click "Forgot Password", enter your email, follow the link sent to your email, and create a new password.',
      'kb-password-reset',
      { category: 'Account' }
    );

    await rag.indexDocument(
      'Our billing plans: Monthly ($9.99), Quarterly ($24.99), or Annual ($89.99). All plans include 24/7 support and automatic backups.',
      'kb-billing',
      { category: 'Billing' }
    );

    await rag.indexDocument(
      'API documentation: Base URL https://api.example.com/v1. Authenticate with API key in headers. See full docs for endpoints.',
      'kb-api',
      { category: 'Technical' }
    );

    const hitl = new HITLManager();

    // Initialize orchestrator (uses multiple agents and agentic patterns)
    console.log('Initializing multi-agent orchestrator...');
    const orchestrator = new MultiAgentOrchestrator(memory, rag, hitl);

    // Initialize LangGraph workflow (advanced state management)
    console.log('Initializing LangGraph workflow...');
    const langGraphWorkflow = new LangGraphWorkflow(memory, rag, hitl);

    console.log('\n✓ System initialized successfully\n');

    // Example: Process customer queries
    const customerQueries = [
      "I can't login to my account and keep getting error 401",
      'I was charged twice this month and need a refund',
      'How do I integrate your API into my application?',
    ];

    console.log('=== Processing Customer Queries ===\n');

    for (const query of customerQueries) {
      console.log(`\n📩 Customer Query: "${query}"`);
      console.log('---');

      try {
        const response = await orchestrator.routeQuery(query);
        console.log(`\n✓ Response:\n${response}`);
      } catch (error) {
        console.error(`✗ Error processing query: ${error}`);
      }
    }

    // Display system statistics
    console.log('\n\n=== System Statistics ===');
    const stats = orchestrator.getStats();
    console.log(JSON.stringify(stats, null, 2));

    // Demonstrate parallelization
    console.log('\n\n=== Parallelization Example ===');
    console.log('Processing 3 queries in parallel...');
    const parallelQueries = [
      'What is your refund policy?',
      'How do I change my password?',
      'What are your API rate limits?',
    ];

    const startTime = Date.now();
    const parallelResponses = await orchestrator.processQueriesParallel(parallelQueries);
    const endTime = Date.now();

    console.log(`✓ Processed ${parallelResponses.length} queries in ${endTime - startTime}ms`);

    // Demonstrate optimization
    console.log('\n=== Running Optimizer ===');
    await orchestrator.optimizeResponses();

    console.log('\n✓ System demonstration complete');
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run main function
main().catch(console.error);
