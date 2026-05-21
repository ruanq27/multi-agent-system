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
 * Simplified version using in-memory storage
 */
export class RAGSystem {
  private documents: Map<string, Document> = new Map();

  constructor() {
    // Simplified constructor - no embeddings needed for MVP
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
    return docId;
  }

  /**
   * Retrieve relevant documents using simple text similarity
   */
  async retrieve(query: string, limit: number = 5): Promise<RetrievalResult[]> {
    if (this.documents.size === 0) {
      return [];
    }

    const results: RetrievalResult[] = [];
    
    // Simple similarity scoring based on keyword overlap
    const queryTokens = query.toLowerCase().split(/\s+/);
    
    for (const doc of this.documents.values()) {
      const docTokens = doc.content.toLowerCase().split(/\s+/);
      const matches = queryTokens.filter(token => docTokens.includes(token)).length;
      const score = queryTokens.length > 0 ? matches / queryTokens.length : 0;
      
      if (score > 0) {
        results.push({ document: doc, score });
      }
    }

    return results.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  /**
   * Clear all documents
   */
  clear(): void {
    this.documents.clear();
  }

  /**
   * Get document by ID
   */
  getDocument(id: string): Document | undefined {
    return this.documents.get(id);
  }

  /**
   * Get all documents
   */
  getAllDocuments(): Document[] {
    return Array.from(this.documents.values());
  }

  /**
   * Get all indexed documents - alias for compatibility
   */
  getDocuments(): Document[] {
    return Array.from(this.documents.values());
  }

  /**
   * Get statistics about the RAG system
   */
  getStats(): Record<string, unknown> {
    return {
      documentCount: this.documents.size,
      documents: Array.from(this.documents.values()).map(d => ({ id: d.id, source: d.source })),
    };
  }
}
