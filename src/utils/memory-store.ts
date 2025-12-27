import * as fs from 'fs';
import * as path from 'path';
import { MemoryEntry, AgentMemory } from '../types';

/**
 * Persistent Memory Store for EnhancedShaun
 * 
 * Saves and loads agent memory to/from disk for persistence across restarts.
 */
export class MemoryStore {
    private filePath: string;

    constructor(filePath: string = 'data/memory.json') {
        this.filePath = filePath;
        this.ensureDirectory();
    }

    private ensureDirectory(): void {
        const dir = path.dirname(this.filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }

    /**
     * Save memory state to disk
     */
    save(memory: AgentMemory): void {
        try {
            const data = JSON.stringify(memory, null, 2);
            fs.writeFileSync(this.filePath, data, 'utf-8');
        } catch (error) {
            console.error(`[MemoryStore] Failed to save memory: ${error}`);
        }
    }

    /**
     * Load memory state from disk
     */
    load(): AgentMemory | null {
        try {
            if (!fs.existsSync(this.filePath)) {
                return null;
            }
            const data = fs.readFileSync(this.filePath, 'utf-8');
            return JSON.parse(data) as AgentMemory;
        } catch (error) {
            console.error(`[MemoryStore] Failed to load memory: ${error}`);
            return null;
        }
    }

    /**
     * Append a single entry to memory and save
     */
    appendEntry(memory: AgentMemory, entry: MemoryEntry): AgentMemory {
        memory.shortTerm.push(entry);

        // Move important memories to long-term
        if (entry.importance > 0.7) {
            memory.longTerm.push(entry);
        }

        // Add to appropriate memory type
        if (entry.type === 'experience') {
            memory.episodic.push(entry);
        } else if (entry.type === 'knowledge') {
            memory.semantic.push(entry);
        }

        // Prune if too large (keep most recent)
        if (memory.shortTerm.length > 1000) {
            memory.shortTerm = memory.shortTerm.slice(-500);
        }
        if (memory.longTerm.length > 500) {
            memory.longTerm = memory.longTerm.slice(-250);
        }
        if (memory.episodic.length > 500) {
            memory.episodic = memory.episodic.slice(-250);
        }
        if (memory.semantic.length > 500) {
            memory.semantic = memory.semantic.slice(-250);
        }

        this.save(memory);
        return memory;
    }

    /**
     * Create empty memory structure
     */
    static createEmpty(): AgentMemory {
        return {
            shortTerm: [],
            longTerm: [],
            episodic: [],
            semantic: []
        };
    }
}

export default MemoryStore;
