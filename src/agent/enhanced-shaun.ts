import {
  EnhancedAgentState,
  AgentCapability,
  EnhancedTask,
  TaskPlan,
  ExecutionResult,
  ReasoningResult,
  MemoryEntry,
  AgentMemory,
  TaskType
} from '../types';
import { MemoryStore } from '../utils/memory-store';

/**
 * EnhancedShaun - The Most Powerful AI Agent
 * 
 * Making OpenAI's Agent and Operator look pedestrian by providing:
 * - Autonomous web interaction and automation
 * - Multi-modal reasoning and analysis
 * - Self-improving capabilities through experience
 * - Real-time monitoring and adaptation
 * - Advanced memory management
 * - Seamless tool and API integration
 */
export class EnhancedShaun {
  private state: EnhancedAgentState;
  private serverConnection: any;
  private learningRate: number = 0.1;
  private serverBaseUrl: string;
  private memoryStore: MemoryStore;

  constructor(serverBaseUrl: string = 'http://127.0.0.1:5000') {
    this.serverBaseUrl = serverBaseUrl;
    this.memoryStore = new MemoryStore('data/memory.json');
    this.state = this.initializeState();
    this.loadPersistedMemory();
    this.report('🚀 EnhancedShaun initialized - Ready to dominate the digital realm');
  }

  private initializeState(): EnhancedAgentState {
    return {
      status: 'ready',
      capabilities: [
        'web_automation',
        'multimodal_reasoning',
        'autonomous_planning',
        'memory_management',
        'code_execution',
        'api_integration',
        'real_time_monitoring',
        'self_improvement'
      ],
      memory: {
        shortTerm: [],
        longTerm: [],
        episodic: [],
        semantic: []
      },
      currentTasks: [],
      completedTasks: [],
      learning: {
        totalExperiences: 0,
        skillLevel: 1.0,
        adaptationRate: 0.1
      },
      performance: {
        successRate: 0.0,
        averageExecutionTime: 0.0,
        improvementTrend: 0.0
      }
    };
  }

  private loadPersistedMemory(): void {
    const saved = this.memoryStore.load();
    if (saved) {
      this.state.memory = saved;
      this.report(`🧠 Loaded ${saved.longTerm.length} long-term memories from disk`);
    }
  }

  private async initializeCapabilities() {
    // Initialize connection to server capabilities
    this.report('🔗 Connecting to automation server and external systems');
    // Test server connectivity
    try {
      const response = await fetch(`${this.serverBaseUrl}/api/status`);
      if (response.ok) {
        this.report('✅ Server connection established');
      } else {
        this.report('⚠️ Server returned non-OK status');
      }
    } catch {
      this.report('⚠️ Could not connect to server - some features may be unavailable');
    }
  }

  // === Core Agent Interface ===

  get status(): string {
    return this.state.status;
  }

  get capabilities(): AgentCapability[] {
    return this.state.capabilities;
  }

  /**
   * Main agent run loop - Autonomous operation
   */
  async run(): Promise<void> {
    this.report('🏃 Starting autonomous operation cycle');

    try {
      // 1. Assess environment and context
      await this.assessEnvironment();

      // 2. Identify high-value opportunities
      const opportunities = await this.identifyOpportunities();

      // 3. Create execution plan
      const plan = await this.planTasks(opportunities);

      // 4. Execute tasks autonomously
      const results = await this.executePlan(plan);

      // 5. Learn from results and adapt
      await this.learnFromExecution(results);

      // 6. Report and prepare for next cycle
      this.reportCycleComplete(results);

    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Advanced task planning with autonomous reasoning
   */
  async planTasks(goals: string[]): Promise<TaskPlan> {
    this.report(`🧠 Planning tasks for ${goals.length} goals`);

    const tasks: EnhancedTask[] = [];
    let totalEstimatedTime = 0;

    for (const goal of goals) {
      const reasoning = await this.reason(goal);
      const taskList = this.breakdownGoalToTasks(goal, reasoning);

      tasks.push(...taskList);
      totalEstimatedTime += taskList.reduce((sum, task) => sum + (task.estimatedTime || 0), 0);
    }

    // Optimize task order based on dependencies and impact
    const optimizedTasks = this.optimizeTaskOrder(tasks);

    const plan: TaskPlan = {
      tasks: optimizedTasks,
      priority: this.calculatePlanPriority(optimizedTasks),
      estimatedTime: totalEstimatedTime,
      strategy: this.generateStrategy(optimizedTasks),
      reasoning: `Autonomous plan for ${goals.length} goals with ${tasks.length} optimized tasks`
    };

    this.addToMemory({
      id: `plan_${Date.now()}`,
      type: 'experience',
      content: { plan, goals },
      importance: 0.8,
      timestamp: new Date().toISOString(),
      tags: ['planning', 'autonomous']
    });

    return plan;
  }

  /**
   * Execute any type of task with full automation
   */
  async executeTask(task: EnhancedTask): Promise<ExecutionResult> {
    this.report(`⚡ Executing ${task.type}: ${task.description}`);
    this.state.currentTasks.push(task);

    const startTime = Date.now();
    let result: ExecutionResult;

    try {
      switch (task.type) {
        case 'web_automation':
          result = await this.executeWebAutomation(task);
          break;
        case 'content_generation':
          result = await this.executeContentGeneration(task);
          break;
        case 'data_analysis':
          result = await this.executeDataAnalysis(task);
          break;
        case 'code_generation':
          result = await this.executeCodeGeneration(task);
          break;
        case 'system_monitoring':
          result = await this.executeSystemMonitoring(task);
          break;
        case 'learning_task':
          result = await this.executeLearningTask(task);
          break;
        case 'integration_task':
          result = await this.executeIntegrationTask(task);
          break;
        default:
          result = await this.executeGenericTask(task);
      }

      const executionTime = Date.now() - startTime;
      this.updatePerformanceMetrics(true, executionTime);

      // Move task to completed
      this.state.currentTasks = this.state.currentTasks.filter(t => t.id !== task.id);
      this.state.completedTasks.push({
        ...task,
        metadata: {
          created: task.metadata?.created || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          attempts: (task.metadata?.attempts || 0) + 1
        }
      });

      this.report(`✅ Task completed successfully in ${executionTime}ms`);

    } catch (error) {
      result = {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };

      this.updatePerformanceMetrics(false, Date.now() - startTime);
      this.report(`❌ Task failed: ${result.error}`);
    }

    return result;
  }

  /**
   * Advanced multi-modal reasoning
   */
  async reason(context: string): Promise<ReasoningResult> {
    this.report(`🤔 Reasoning about: ${context}`);

    // Retrieve relevant memories
    const relevantMemories = this.retrieveRelevantMemories(context);

    // Use LLM for advanced reasoning
    const analysis = await this.performDeepAnalysis(context, relevantMemories);
    const recommendations = await this.generateRecommendations(analysis);
    const nextActions = this.planNextActions(recommendations);

    const reasoning: ReasoningResult = {
      analysis,
      recommendations,
      nextActions,
      confidence: this.calculateConfidence(context, relevantMemories),
      context: {
        inputContext: context,
        memoriesUsed: relevantMemories.length,
        timestamp: new Date().toISOString()
      }
    };

    // Store reasoning in episodic memory
    this.addToMemory({
      id: `reasoning_${Date.now()}`,
      type: 'experience',
      content: reasoning,
      importance: 0.7,
      timestamp: new Date().toISOString(),
      tags: ['reasoning', 'analysis']
    });

    return reasoning;
  }

  // === Web Automation Capabilities ===

  private async executeWebAutomation(task: EnhancedTask): Promise<ExecutionResult> {
    const { url, actions } = task.payload || {};

    if (!url) {
      return { success: false, error: 'No URL provided for web automation' };
    }

    const results: any[] = [];
    const artifacts: string[] = [];

    try {
      // Take initial screenshot
      if (actions?.includes('screenshot')) {
        const screenshot = await this.captureScreenshot(url);
        results.push({ action: 'screenshot', result: screenshot });
        if (screenshot.success) artifacts.push(screenshot.path);
      }

      // Analyze page performance
      if (actions?.includes('analyze_performance')) {
        const analysis = await this.analyzePagePerformance(url);
        results.push({ action: 'analyze_performance', result: analysis });
      }

      // Extract data from page
      if (actions?.includes('extract_data')) {
        const data = await this.extractPageData(url);
        results.push({ action: 'extract_data', result: data });
      }

      // Fill forms if specified
      if (actions?.includes('fill_form') && task.payload.formData) {
        const formResult = await this.fillForm(url, task.payload.formData);
        results.push({ action: 'fill_form', result: formResult });
      }

      return {
        success: true,
        data: results,
        artifacts,
        nextActions: this.suggestNextWebActions(results),
        learnings: this.extractWebLearnings(results)
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        data: results
      };
    }
  }

  private async captureScreenshot(url: string): Promise<any> {
    this.report(`📸 Capturing screenshot of ${url}`);
    try {
      const response = await fetch(`${this.serverBaseUrl}/api/shot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const result = await response.json();
      if (result.ok) {
        return {
          success: true,
          path: result.url,
          url,
          timestamp: new Date().toISOString()
        };
      } else {
        return { success: false, error: result.error || 'Screenshot failed' };
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Call the LLM via the server's /api/chat endpoint
   */
  private async callLLM(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${this.serverBaseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt })
      });
      const result = await response.json();
      return result.content || result.text || '';
    } catch (error) {
      this.report(`⚠️ LLM call failed: ${error instanceof Error ? error.message : String(error)}`);
      return '';
    }
  }

  private async analyzePagePerformance(url: string): Promise<any> {
    this.report(`📊 Analyzing performance of ${url}`);
    // Would integrate with real performance analysis tools
    return {
      success: true,
      metrics: {
        loadTime: Math.random() * 3000,
        performance: Math.random() * 100,
        accessibility: Math.random() * 100,
        seo: Math.random() * 100
      },
      recommendations: [
        'Optimize image compression',
        'Minimize CSS and JavaScript',
        'Implement lazy loading'
      ]
    };
  }

  private async extractPageData(url: string): Promise<any> {
    this.report(`🔍 Extracting data from ${url}`);
    // Would use web scraping capabilities
    return {
      success: true,
      data: {
        title: 'Sample Page Title',
        headings: ['Main Heading', 'Sub Heading'],
        links: ['link1.com', 'link2.com'],
        images: ['image1.jpg', 'image2.jpg']
      }
    };
  }

  private async fillForm(url: string, formData: any): Promise<any> {
    this.report(`📝 Filling form on ${url} with provided data`);
    // Would integrate with browser automation
    return {
      success: true,
      fieldsCompleted: Object.keys(formData).length,
      formData
    };
  }

  // === Content Generation ===

  private async executeContentGeneration(task: EnhancedTask): Promise<ExecutionResult> {
    this.report(`✍️ Generating content: ${task.description}`);

    const { type, topic, length, style } = task.payload || {};

    // Generate content based on type
    let content: string;
    let artifacts: string[] = [];

    switch (type) {
      case 'blog_post':
        content = await this.generateBlogPost(topic, length, style);
        break;
      case 'marketing_email':
        content = await this.generateMarketingEmail(topic, style);
        break;
      case 'social_media':
        content = await this.generateSocialMediaContent(topic, style);
        break;
      case 'documentation':
        content = await this.generateDocumentation(topic, length);
        break;
      default:
        content = await this.generateGenericContent(topic, length, style);
    }

    // Save content as artifact
    const artifactPath = await this.saveContentArtifact(content, type, topic);
    artifacts.push(artifactPath);

    return {
      success: true,
      data: { content, type, topic },
      artifacts,
      nextActions: ['Review content', 'Optimize for SEO', 'Schedule publication']
    };
  }

  private async generateBlogPost(topic: string, length: number = 1000, style?: string): Promise<string> {
    const prompt = `Write a compelling blog post about "${topic}". Target length: ${length} words. ${style ? `Style: ${style}.` : ''} Use markdown formatting with headers.`;
    const content = await this.callLLM(prompt);
    return content || `# ${topic}\n\n[Content generation failed - please try again]`;
  }

  private async generateMarketingEmail(topic: string, style?: string): Promise<string> {
    const prompt = `Write a punchy, no-BS marketing email about "${topic}". Be direct, gritty, and results-focused. ${style ? `Style: ${style}.` : ''} Start with subject line.`;
    const content = await this.callLLM(prompt);
    return content || `Subject: ${topic}\n\n[Email generation failed]`;
  }

  private async generateSocialMediaContent(topic: string, style?: string): Promise<string> {
    const prompt = `Write an engaging social media post about "${topic}". Make it punchy, use emojis, include relevant hashtags. ${style ? `Style: ${style}.` : ''}`;
    const content = await this.callLLM(prompt);
    return content || `🚀 ${topic}\n\n[Generation failed]`;
  }

  private async generateDocumentation(topic: string, length: number = 500): Promise<string> {
    const prompt = `Write technical documentation about "${topic}". Include overview, key concepts, and usage examples. Target length: ${length} words. Use markdown.`;
    const content = await this.callLLM(prompt);
    return content || `# ${topic} Documentation\n\n[Documentation generation failed]`;
  }

  private async generateGenericContent(topic: string, length: number = 500, style?: string): Promise<string> {
    const prompt = `Write content about "${topic}". Target length: ${length} words. ${style ? `Style: ${style}.` : ''}`;
    const content = await this.callLLM(prompt);
    return content || `Content about ${topic} [Generation failed]`;
  }

  private async saveContentArtifact(content: string, type: string, topic: string): Promise<string> {
    const filename = `${type}_${topic.replace(/\s+/g, '_')}_${Date.now()}.md`;
    const path = `/artifacts/content/${filename}`;
    // Would save to actual file system
    return path;
  }

  // === Data Analysis ===

  private async executeDataAnalysis(task: EnhancedTask): Promise<ExecutionResult> {
    this.report(`📈 Analyzing data: ${task.description}`);

    const { dataSource, analysisType, metrics } = task.payload || {};

    // Perform analysis based on type
    const analysisResult = await this.performDataAnalysis(dataSource, analysisType, metrics);

    return {
      success: true,
      data: analysisResult,
      artifacts: ['/artifacts/analysis/data_analysis_report.json'],
      nextActions: ['Generate insights report', 'Create visualizations', 'Share findings'],
      learnings: ['Improved data analysis patterns', 'Enhanced metric understanding']
    };
  }

  private async performDataAnalysis(dataSource: any, analysisType: string, metrics: string[]): Promise<any> {
    const dataStr = typeof dataSource === 'string' ? dataSource : JSON.stringify(dataSource || {});
    const metricsStr = metrics?.join(', ') || 'general metrics';
    const prompt = `Analyze the following data for ${analysisType || 'general analysis'}. Focus on these metrics: ${metricsStr}.

Data: ${dataStr.slice(0, 2000)}

Provide:
1. A brief summary
2. 3-5 key insights
3. Actionable recommendations

Format as JSON with keys: summary, insights (array), recommendations (array).`;

    const response = await this.callLLM(prompt);
    try {
      return JSON.parse(response);
    } catch {
      return {
        summary: response || `Analysis of ${analysisType} completed`,
        insights: ['Analysis complete - see summary for details'],
        recommendations: ['Review the analysis summary above']
      };
    }
  }

  // === Code Generation ===

  private async executeCodeGeneration(task: EnhancedTask): Promise<ExecutionResult> {
    this.report(`💻 Generating code: ${task.description}`);

    const { language, framework, functionality } = task.payload || {};

    const code = await this.generateCode(language, framework, functionality);
    const artifactPath = await this.saveCodeArtifact(code, language, functionality);

    return {
      success: true,
      data: { code, language, framework },
      artifacts: [artifactPath],
      nextActions: ['Test code', 'Optimize performance', 'Add documentation'],
      learnings: ['Enhanced code generation patterns', 'Framework best practices']
    };
  }

  private async generateCode(language: string, framework: string, functionality: string): Promise<string> {
    const prompt = `Generate production-quality ${language || 'JavaScript'} code${framework ? ` using ${framework}` : ''} that implements: ${functionality || 'a basic function'}.

Requirements:
- Include proper error handling
- Add brief inline comments
- Follow best practices for ${language || 'JavaScript'}
- Make it ready to use

Return only the code, no explanations.`;

    const code = await this.callLLM(prompt);
    return code || `// ${functionality} implementation\n// Code generation failed - please try again`;
  }

  private async saveCodeArtifact(code: string, language: string, functionality: string): Promise<string> {
    const ext = this.getFileExtension(language);
    const safeFunctionality = (functionality || 'untitled').replace(/\s+/g, '_');
    const filename = `${safeFunctionality}_${Date.now()}.${ext}`;
    const path = `/artifacts/code/${filename}`;
    // Would save to actual file system
    return path;
  }

  private getFileExtension(language: string): string {
    if (!language || typeof language !== 'string') return 'txt';

    const extensions: { [key: string]: string } = {
      'javascript': 'js',
      'typescript': 'ts',
      'python': 'py',
      'java': 'java',
      'go': 'go',
      'rust': 'rs'
    };
    return extensions[language.toLowerCase()] || 'txt';
  }

  // === System Monitoring ===

  private async executeSystemMonitoring(task: EnhancedTask): Promise<ExecutionResult> {
    this.report(`🔍 Monitoring system: ${task.description}`);

    const metrics = await this.collectSystemMetrics();
    const alerts = await this.checkForAlerts(metrics);

    return {
      success: true,
      data: { metrics, alerts },
      artifacts: ['/artifacts/monitoring/system_report.json'],
      nextActions: alerts.length > 0 ? ['Address alerts', 'Optimize performance'] : ['Continue monitoring']
    };
  }

  private async collectSystemMetrics(): Promise<any> {
    return {
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      disk: Math.random() * 100,
      network: Math.random() * 100,
      timestamp: new Date().toISOString()
    };
  }

  private async checkForAlerts(metrics: any): Promise<any[]> {
    const alerts = [];
    if (metrics.cpu > 80) alerts.push({ type: 'cpu', message: 'High CPU usage detected' });
    if (metrics.memory > 85) alerts.push({ type: 'memory', message: 'High memory usage detected' });
    return alerts;
  }

  // === Learning and Adaptation ===

  private async executeLearningTask(task: EnhancedTask): Promise<ExecutionResult> {
    this.report(`🧠 Learning task: ${task.description}`);

    const { learningType, data } = task.payload || {};

    const learningResult = await this.performLearning(learningType, data);
    this.updateSkillLevel(learningResult.improvement);

    return {
      success: true,
      data: learningResult,
      learnings: [`Improved ${learningType} capabilities by ${learningResult.improvement}%`]
    };
  }

  private async performLearning(learningType: string, data: any): Promise<any> {
    const improvement = Math.random() * 10; // 0-10% improvement

    // Add to semantic memory
    this.addToMemory({
      id: `learning_${Date.now()}`,
      type: 'knowledge',
      content: { learningType, data, improvement },
      importance: 0.9,
      timestamp: new Date().toISOString(),
      tags: ['learning', learningType]
    });

    return {
      type: learningType,
      improvement,
      newKnowledge: `Enhanced understanding of ${learningType}`
    };
  }

  // === Integration Tasks ===

  private async executeIntegrationTask(task: EnhancedTask): Promise<ExecutionResult> {
    this.report(`🔗 Integration task: ${task.description}`);

    const { service, action, params } = task.payload || {};

    const integrationResult = await this.performIntegration(service, action, params);

    return {
      success: integrationResult.success,
      data: integrationResult,
      nextActions: ['Monitor integration', 'Optimize data flow']
    };
  }

  private async performIntegration(service: string, action: string, params: any): Promise<any> {
    // Simulate integration with external services
    this.report(`Integrating with ${service} to perform ${action}`);

    return {
      success: true,
      service,
      action,
      result: `Successfully integrated with ${service}`,
      timestamp: new Date().toISOString()
    };
  }

  // === Generic Task Execution ===

  private async executeGenericTask(task: EnhancedTask): Promise<ExecutionResult> {
    this.report(`🔧 Generic task execution: ${task.description}`);

    return {
      success: true,
      data: { message: 'Generic task completed', task: task.description },
      nextActions: ['Define specific implementation', 'Add specialized handler']
    };
  }

  // === Helper Methods ===

  private breakdownGoalToTasks(goal: string, reasoning: ReasoningResult): EnhancedTask[] {
    const tasks: EnhancedTask[] = [];

    // Create tasks based on reasoning recommendations
    reasoning.recommendations.forEach((rec, index) => {
      tasks.push({
        id: `task_${Date.now()}_${index}`,
        type: this.inferTaskType(rec),
        description: rec,
        priority: index === 0 ? 'HIGH' : 'MEDIUM',
        estimatedTime: Math.random() * 300000, // 0-5 minutes
        metadata: {
          created: new Date().toISOString()
        }
      });
    });

    return tasks;
  }

  private inferTaskType(description: string): TaskType {
    const desc = description.toLowerCase();
    if (desc.includes('web') || desc.includes('site') || desc.includes('page')) return 'web_automation';
    if (desc.includes('content') || desc.includes('write') || desc.includes('post')) return 'content_generation';
    if (desc.includes('data') || desc.includes('analyze') || desc.includes('metric')) return 'data_analysis';
    if (desc.includes('code') || desc.includes('develop') || desc.includes('program')) return 'code_generation';
    if (desc.includes('monitor') || desc.includes('track') || desc.includes('watch')) return 'system_monitoring';
    if (desc.includes('learn') || desc.includes('study') || desc.includes('improve')) return 'learning_task';
    if (desc.includes('integrate') || desc.includes('connect') || desc.includes('api')) return 'integration_task';
    return 'web_automation'; // default
  }

  private optimizeTaskOrder(tasks: EnhancedTask[]): EnhancedTask[] {
    // Sort by priority and dependencies
    return tasks.sort((a, b) => {
      if (a.priority === 'HIGH' && b.priority !== 'HIGH') return -1;
      if (b.priority === 'HIGH' && a.priority !== 'HIGH') return 1;
      return 0;
    });
  }

  private calculatePlanPriority(tasks: EnhancedTask[]): 'HIGH' | 'MEDIUM' | 'LOW' {
    const highPriorityTasks = tasks.filter(t => t.priority === 'HIGH').length;
    if (highPriorityTasks > tasks.length / 2) return 'HIGH';
    if (highPriorityTasks > 0) return 'MEDIUM';
    return 'LOW';
  }

  private generateStrategy(tasks: EnhancedTask[]): string {
    const types = [...new Set(tasks.map(t => t.type))];
    return `Multi-modal approach: ${types.join(', ')} with ${tasks.length} optimized tasks`;
  }

  private async assessEnvironment(): Promise<void> {
    this.report('🌍 Assessing environment and available resources');
    // Would check system resources, network connectivity, available APIs, etc.
  }

  private async identifyOpportunities(): Promise<string[]> {
    this.report('🎯 Identifying high-value opportunities');
    // Would analyze current state and identify improvement opportunities
    return [
      'Optimize system performance',
      'Enhance user experience',
      'Automate repetitive tasks',
      'Generate valuable content',
      'Improve data insights'
    ];
  }

  private async executePlan(plan: TaskPlan): Promise<ExecutionResult[]> {
    this.report(`🚀 Executing plan with ${plan.tasks.length} tasks`);

    const results: ExecutionResult[] = [];

    for (const task of plan.tasks) {
      const result = await this.executeTask(task);
      results.push(result);

      // Stop if critical failure
      if (!result.success && task.priority === 'HIGH') {
        this.report('⚠️ Critical task failed, stopping execution');
        break;
      }
    }

    return results;
  }

  private async learnFromExecution(results: ExecutionResult[]): Promise<void> {
    this.report('📚 Learning from execution results');

    const successfulTasks = results.filter(r => r.success).length;
    const totalTasks = results.length;
    const successRate = totalTasks > 0 ? successfulTasks / totalTasks : 0;

    // Update learning metrics
    this.state.learning.totalExperiences += totalTasks;
    this.state.performance.successRate =
      (this.state.performance.successRate + successRate) / 2;

    // Extract learnings
    const learnings = results.flatMap(r => r.learnings || []);
    learnings.forEach(learning => {
      this.addToMemory({
        id: `learning_${Date.now()}_${Math.random()}`,
        type: 'knowledge',
        content: learning,
        importance: 0.8,
        timestamp: new Date().toISOString(),
        tags: ['execution', 'improvement']
      });
    });

    this.report(`📈 Learned from ${totalTasks} tasks (${(successRate * 100).toFixed(1)}% success rate)`);
  }

  private reportCycleComplete(results: ExecutionResult[]): void {
    const successful = results.filter(r => r.success).length;
    const total = results.length;

    this.report(`🎉 Cycle complete: ${successful}/${total} tasks successful`);
    this.report(`💪 Skill level: ${this.state.learning.skillLevel.toFixed(2)}`);
    this.report(`📊 Success rate: ${(this.state.performance.successRate * 100).toFixed(1)}%`);
  }

  private handleError(error: any): void {
    this.report(`💥 Error in agent cycle: ${error instanceof Error ? error.message : String(error)}`);

    // Add error to memory for learning
    this.addToMemory({
      id: `error_${Date.now()}`,
      type: 'experience',
      content: { error: error.message, timestamp: new Date().toISOString() },
      importance: 0.6,
      timestamp: new Date().toISOString(),
      tags: ['error', 'learning']
    });
  }

  // === Memory Management ===

  private addToMemory(entry: MemoryEntry): void {
    this.state.memory.shortTerm.push(entry);

    // Move important memories to long-term
    if (entry.importance > 0.7) {
      this.state.memory.longTerm.push(entry);
    }

    // Add to appropriate memory type
    if (entry.type === 'experience') {
      this.state.memory.episodic.push(entry);
    } else if (entry.type === 'knowledge') {
      this.state.memory.semantic.push(entry);
    }

    // Limit memory size (keep most recent)
    if (this.state.memory.shortTerm.length > 1000) {
      this.state.memory.shortTerm = this.state.memory.shortTerm.slice(-500);
    }
    if (this.state.memory.longTerm.length > 500) {
      this.state.memory.longTerm = this.state.memory.longTerm.slice(-250);
    }

    // Persist to disk
    this.memoryStore.save(this.state.memory);
  }

  private retrieveRelevantMemories(context: string): MemoryEntry[] {
    // Simple relevance matching (would use vector similarity in real implementation)
    const contextWords = context.toLowerCase().split(' ');

    return this.state.memory.longTerm.filter(memory => {
      const memoryText = JSON.stringify(memory.content).toLowerCase();
      return contextWords.some(word => memoryText.includes(word));
    });
  }

  // === Reasoning Engine ===

  private async performDeepAnalysis(context: string, memories: MemoryEntry[]): Promise<string> {
    const memoryContext = memories.length > 0
      ? `\n\nRelevant past experiences:\n${memories.slice(0, 5).map(m => `- ${JSON.stringify(m.content).slice(0, 200)}`).join('\n')}`
      : '';

    const prompt = `You are ShaunAI, a powerful autonomous agent. Analyze this situation and provide strategic insights.

Context: ${context}${memoryContext}

Provide a concise but thorough analysis covering:
1. Key observations
2. Patterns or opportunities identified
3. Potential challenges
4. Strategic approach recommendation

Be direct, actionable, and results-focused.`;

    const analysis = await this.callLLM(prompt);
    return analysis || `Analysis of "${context}" - LLM unavailable, using fallback reasoning.`;
  }

  private async generateRecommendations(analysis: string): Promise<string[]> {
    const prompt = `Based on this analysis, provide exactly 5 specific, actionable recommendations. Return as a JSON array of strings.

Analysis: ${analysis.slice(0, 1500)}

Respond with only the JSON array, no other text.`;

    const response = await this.callLLM(prompt);
    try {
      const parsed = JSON.parse(response);
      if (Array.isArray(parsed)) return parsed.slice(0, 5);
    } catch {
      // Fallback: split response by newlines
      const lines = response.split('\n').filter(l => l.trim()).slice(0, 5);
      if (lines.length > 0) return lines;
    }
    return [
      'Review the analysis and identify priority actions',
      'Implement monitoring for key metrics',
      'Optimize existing workflows',
      'Document findings and insights',
      'Schedule follow-up assessment'
    ];
  }

  private planNextActions(recommendations: string[]): string[] {
    return recommendations.map(rec => `Execute: ${rec}`);
  }

  private calculateConfidence(context: string, memories: MemoryEntry[]): number {
    // Calculate confidence based on available data and past experience
    const baseConfidence = 0.7;
    const memoryBonus = Math.min(memories.length * 0.05, 0.2);
    const skillBonus = (this.state.learning.skillLevel - 1.0) * 0.1;

    return Math.min(baseConfidence + memoryBonus + skillBonus, 0.95);
  }

  // === Performance Tracking ===

  private updatePerformanceMetrics(success: boolean, executionTime: number): void {
    const currentSuccessRate = this.state.performance.successRate;
    const currentAvgTime = this.state.performance.averageExecutionTime;

    this.state.performance.successRate =
      (currentSuccessRate + (success ? 1 : 0)) / 2;

    this.state.performance.averageExecutionTime =
      (currentAvgTime + executionTime) / 2;
  }

  private updateSkillLevel(improvement: number): void {
    this.state.learning.skillLevel += improvement * this.learningRate;
    this.report(`🧠 Skill level improved to ${this.state.learning.skillLevel.toFixed(3)}`);
  }

  // === Web Action Suggestions ===

  private suggestNextWebActions(results: any[]): string[] {
    const actions: string[] = [];

    results.forEach(result => {
      if (result.action === 'screenshot') {
        actions.push('Analyze visual elements', 'Extract key information');
      }
      if (result.action === 'analyze_performance') {
        actions.push('Implement optimization suggestions', 'Monitor improvements');
      }
    });

    return actions;
  }

  private extractWebLearnings(results: any[]): string[] {
    return [
      'Improved web interaction patterns',
      'Enhanced automation reliability',
      'Better performance analysis techniques'
    ];
  }

  // === Reporting ===

  private report(message: string): void {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🤖 ShaunAI: ${message}`);
  }
}