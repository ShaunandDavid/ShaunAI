import { logger } from '../config/logger';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
  scheduledFor?: Date;
  completedAt?: Date;
}

export class TaskService {
  private tasks: Map<string, Task> = new Map();

  async getAllTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async createTask(taskData: Omit<Task, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const task: Task = {
      id: this.generateId(),
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...taskData
    };

    this.tasks.set(task.id, task);
    logger.info(`Task created: ${task.id} - ${task.title}`);
    
    // TODO: Add to task queue for processing
    return task;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    const task = this.tasks.get(id);
    if (!task) {
      return null;
    }

    const updatedTask = {
      ...task,
      ...updates,
      updatedAt: new Date(),
      id: task.id, // Prevent ID changes
      createdAt: task.createdAt // Prevent creation date changes
    };

    if (updates.status === 'completed' && !task.completedAt) {
      updatedTask.completedAt = new Date();
    }

    this.tasks.set(id, updatedTask);
    logger.info(`Task updated: ${id}`);
    
    return updatedTask;
  }

  async deleteTask(id: string): Promise<boolean> {
    const deleted = this.tasks.delete(id);
    if (deleted) {
      logger.info(`Task deleted: ${id}`);
    }
    return deleted;
  }

  async getTask(id: string): Promise<Task | null> {
    return this.tasks.get(id) || null;
  }

  private generateId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}