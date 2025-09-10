// Type definitions for Shaun agent

export type AgentState = {
  status: string;
  lastAction?: string;
};

// Enhanced Agent Types
export type AgentCapability = 
  | 'web_automation'
  | 'multimodal_reasoning'
  | 'autonomous_planning'
  | 'memory_management'
  | 'code_execution'
  | 'api_integration'
  | 'real_time_monitoring'
  | 'self_improvement';

export type TaskType = 
  | 'web_automation'
  | 'content_generation'
  | 'data_analysis'
  | 'code_generation'
  | 'system_monitoring'
  | 'learning_task'
  | 'integration_task';

export interface EnhancedTask {
  id: string;
  type: TaskType;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  estimatedTime?: number;
  dependencies?: string[];
  context?: any;
  payload?: any;
  metadata?: {
    created: string;
    updatedAt?: string;
    attempts?: number;
    lastError?: string;
  };
}

export interface TaskPlan {
  tasks: EnhancedTask[];
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  estimatedTime: number;
  strategy: string;
  reasoning: string;
}

export interface ExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
  artifacts?: string[];
  nextActions?: string[];
  learnings?: string[];
}

export interface ReasoningResult {
  analysis: string;
  recommendations: string[];
  nextActions: string[];
  confidence: number;
  context: any;
}

export interface MemoryEntry {
  id: string;
  type: 'experience' | 'knowledge' | 'skill' | 'pattern';
  content: any;
  importance: number;
  timestamp: string;
  tags: string[];
}

export interface AgentMemory {
  shortTerm: MemoryEntry[];
  longTerm: MemoryEntry[];
  episodic: MemoryEntry[];
  semantic: MemoryEntry[];
}

export interface EnhancedAgentState extends AgentState {
  capabilities: AgentCapability[];
  memory: AgentMemory;
  currentTasks: EnhancedTask[];
  completedTasks: EnhancedTask[];
  learning: {
    totalExperiences: number;
    skillLevel: number;
    adaptationRate: number;
  };
  performance: {
    successRate: number;
    averageExecutionTime: number;
    improvementTrend: number;
  };
}
