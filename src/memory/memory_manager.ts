import { v4 as uuidv4 } from 'uuid';

/**
 * Short-term memory: Recent interactions and context
 */
export interface ShortTermMemory {
  id: string;
  type: 'interaction' | 'decision' | 'context';
  content: string;
  timestamp: Date;
  agent: string;
  ttl?: number; // Time to live in minutes
}

/**
 * Long-term memory: Persistent knowledge and patterns
 */
export interface LongTermMemory {
  id: string;
  type: 'pattern' | 'resolution' | 'knowledge';
  content: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  lastAccessed: Date;
  accessCount: number;
}

/**
 * Memory Manager for handling both short and long-term memory
 */
export class MemoryManager {
  private shortTermMemory: Map<string, ShortTermMemory[]> = new Map();
  private longTermMemory: Map<string, LongTermMemory> = new Map();
  private maxShortTermSize: number;
  private maxLongTermSize: number;

  constructor(shortTermSize: number = 10, longTermSize: number = 1000) {
    this.maxShortTermSize = shortTermSize;
    this.maxLongTermSize = longTermSize;
  }

  /**
   * Store short-term memory (conversation context)
   */
  addShortTermMemory(
    content: string,
    agent: string,
    type: 'interaction' | 'decision' | 'context' = 'interaction',
    ttl?: number
  ): ShortTermMemory {
    const memory: ShortTermMemory = {
      id: uuidv4(),
      type,
      content,
      timestamp: new Date(),
      agent,
      ttl,
    };

    if (!this.shortTermMemory.has(agent)) {
      this.shortTermMemory.set(agent, []);
    }

    const agentMemory = this.shortTermMemory.get(agent)!;
    agentMemory.push(memory);

    // Maintain size limit
    if (agentMemory.length > this.maxShortTermSize) {
      agentMemory.shift();
    }

    return memory;
  }

  /**
   * Retrieve short-term memory for an agent
   */
  getShortTermMemory(agent: string, limit: number = 5): ShortTermMemory[] {
    const memories = this.shortTermMemory.get(agent) || [];
    return memories.slice(-limit);
  }

  /**
   * Store long-term memory (persistent patterns and resolutions)
   */
  addLongTermMemory(
    content: string,
    type: 'pattern' | 'resolution' | 'knowledge',
    metadata: Record<string, unknown> = {}
  ): LongTermMemory {
    const memory: LongTermMemory = {
      id: uuidv4(),
      type,
      content,
      metadata,
      createdAt: new Date(),
      lastAccessed: new Date(),
      accessCount: 0,
    };

    this.longTermMemory.set(memory.id, memory);

    // Maintain size limit - remove least accessed
    if (this.longTermMemory.size > this.maxLongTermSize) {
      const leastAccessedId = Array.from(this.longTermMemory.entries())
        .sort(([, a], [, b]) => a.accessCount - b.accessCount)[0][0];
      this.longTermMemory.delete(leastAccessedId);
    }

    return memory;
  }

  /**
   * Search long-term memory by pattern
   */
  searchLongTermMemory(query: string, type?: string): LongTermMemory[] {
    const results: LongTermMemory[] = [];

    for (const [, memory] of this.longTermMemory) {
      if (type && memory.type !== type) continue;

      if (memory.content.toLowerCase().includes(query.toLowerCase())) {
        memory.lastAccessed = new Date();
        memory.accessCount++;
        results.push(memory);
      }
    }

    return results.sort((a, b) => b.accessCount - a.accessCount);
  }

  /**
   * Clear expired short-term memory
   */
  clearExpiredMemory(): void {
    const now = new Date();

    for (const [agent, memories] of this.shortTermMemory) {
      const filtered = memories.filter((m) => {
        if (!m.ttl) return true;
        const expirationTime = new Date(m.timestamp.getTime() + m.ttl * 60000);
        return expirationTime > now;
      });

      this.shortTermMemory.set(agent, filtered);
    }
  }

  /**
   * Get memory statistics
   */
  getStats(): Record<string, unknown> {
    return {
      shortTermMemorySize: Array.from(this.shortTermMemory.values()).flat().length,
      longTermMemorySize: this.longTermMemory.size,
      agents: Array.from(this.shortTermMemory.keys()),
    };
  }
}
