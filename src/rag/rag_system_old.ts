import { OpenAIEmbeddings } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitters';
import { v4 as uuidv4 } from 'uuid';

export interface Document {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
  source: string;
}

export interface RetrievalResult {
  document: Document;
  score: number;
}

/**
 * RAG System for document retrieval and embedding
 */
export class RAGSystem {
  private vectorStore: MemoryVectorStore | null = null;
  private documents: Map<string, Document> = new Map();
  private splitter: RecursiveCharacterTextSplitter;
  private embeddings: OpenAIEmbeddings;

  constructor() {
    this.embeddings = new OpenAIEmbeddings({
      modelName: process.env.EMBEDDING_MODEL || 'text-embedding-3-small',
    });

    this.splitter = new RecursiveCharacterTextSplitter({
      chunkSize: parseInt(process.env.CHUNK_SIZE || '500'),
      chunkOverlap: parseInt(process.env.CHUNK_OVERLAP || '100'),
    });
  }

  /**
   * Index a document for retrieval
   */
  async indexDocument(content: string, source: string, metadata: Record<string, unknown> = {}): Promise<string> {
    const docId = uuidv4();
    const doc: Document = {
      id: docId,
      content,
      metadata,
      source,
    };

    this.documents.set(docId, doc);

    // Split document into chunks
    const chunks = await this.splitter.createDocuments([content], [
      {
        source,
        docId,
        ...metadata,
      },
    ]);

    // Initialize vector store if needed
    if (!this.vectorStore) {
      this.vectorStore = new MemoryVectorStore(this.embeddings);
    }

    // Add to vector store
    await this.vectorStore.addDocuments(chunks);

    return docId;
  }

  /**
   * Retrieve relevant documents
   */
  async retrieve(query: string, limit: number = 5): Promise<RetrievalResult[]> {
    if (!this.vectorStore) {
      return [];
    }

    const results = await this.vectorStore.similaritySearchWithScore(query, limit);

    return results
      .map(([doc, score]: [any, number]) => {
        const docId = (doc.metadata?.docId as string) || 'unknown';
        const originalDoc = this.documents.get(docId);

        return {
          document: originalDoc || {
            id: docId,
            content: doc.pageContent,
            metadata: doc.metadata,
            source: (doc.metadata?.source as string) || 'unknown',
          },
          score: 1 - score, // Convert distance to similarity
        };
      })
      .sort((a: RetrievalResult, b: RetrievalResult) => b.score - a.score);
  }

  /**
   * Get all indexed documents
   */
  getDocuments(): Document[] {
    return Array.from(this.documents.values());
  }

  /**
   * Clear all indexed documents
   */
  clear(): void {
    this.documents.clear();
    this.vectorStore = null;
  }

  /**
   * Get RAG statistics
   */
  getStats(): Record<string, unknown> {
    return {
      totalDocuments: this.documents.size,
      vectorStoreInitialized: this.vectorStore !== null,
    };
  }
}
