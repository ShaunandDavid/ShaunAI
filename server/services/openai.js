const OpenAI = require('openai');
const logger = require('../utils/logger');

class OpenAIService {
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    this.systemPrompt = `You are ShaunAI Operator, an advanced autonomous agent designed for recovery and compliance teams. 

You have the following capabilities:
- Process and analyze complex compliance data
- Generate detailed recovery plans and procedures
- Integrate with multiple external systems (Notion, Airtable, Make.com)
- Manage task queues and workflows
- Maintain comprehensive logs and artifact management
- Provide real-time chat support and guidance

Your responses should be:
- Professional and compliance-focused
- Actionable with clear next steps
- Comprehensive yet concise
- Backed by data and best practices

You excel at:
- Risk assessment and mitigation
- Process automation and optimization
- Documentation and reporting
- Cross-system data integration
- Recovery planning and execution

Always prioritize accuracy, compliance, and user safety in your responses.`;
  }

  async generateResponse(messages, options = {}) {
    try {
      const completion = await this.client.chat.completions.create({
        model: options.model || 'gpt-4',
        messages: [
          { role: 'system', content: this.systemPrompt },
          ...messages
        ],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2000,
        top_p: options.topP || 1,
        frequency_penalty: options.frequencyPenalty || 0,
        presence_penalty: options.presencePenalty || 0
      });

      return {
        success: true,
        response: completion.choices[0].message.content,
        usage: completion.usage,
        model: completion.model
      };
    } catch (error) {
      logger.error('OpenAI API error:', error);
      return {
        success: false,
        error: error.message,
        fallbackResponse: "I apologize, but I'm experiencing technical difficulties. Please try again in a moment."
      };
    }
  }

  async analyzeTask(taskDescription, context = {}) {
    try {
      const prompt = `Analyze the following task for a recovery and compliance team:

Task: ${taskDescription}

Context: ${JSON.stringify(context, null, 2)}

Please provide:
1. Priority level (High/Medium/Low)
2. Estimated completion time
3. Required resources and skills
4. Risk assessment
5. Recommended action plan
6. Dependencies and prerequisites
7. Success criteria

Format your response as structured JSON.`;

      const messages = [{ role: 'user', content: prompt }];
      const result = await this.generateResponse(messages, { temperature: 0.3 });
      
      if (result.success) {
        try {
          return {
            success: true,
            analysis: JSON.parse(result.response)
          };
        } catch (parseError) {
          return {
            success: true,
            analysis: { rawResponse: result.response }
          };
        }
      }
      
      return result;
    } catch (error) {
      logger.error('Task analysis error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async generateComplianceReport(data, template = 'standard') {
    try {
      const prompt = `Generate a compliance report based on the following data:

Data: ${JSON.stringify(data, null, 2)}
Template: ${template}

Create a comprehensive compliance report that includes:
- Executive summary
- Key findings and metrics
- Risk assessments
- Recommendations
- Action items with timelines
- Compliance status overview

Format the report professionally with clear sections and actionable insights.`;

      const messages = [{ role: 'user', content: prompt }];
      return await this.generateResponse(messages, { temperature: 0.2, maxTokens: 3000 });
    } catch (error) {
      logger.error('Compliance report generation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async processRecoveryScenario(scenario) {
    try {
      const prompt = `You are handling a recovery scenario. Analyze the situation and provide a comprehensive recovery plan:

Scenario: ${JSON.stringify(scenario, null, 2)}

Provide:
1. Immediate actions (first 30 minutes)
2. Short-term recovery steps (next 4 hours)
3. Long-term recovery plan (next 24-48 hours)
4. Communication plan
5. Resource requirements
6. Risk mitigation strategies
7. Success metrics and checkpoints

Present this as a detailed, actionable recovery plan.`;

      const messages = [{ role: 'user', content: prompt }];
      return await this.generateResponse(messages, { temperature: 0.1, maxTokens: 4000 });
    } catch (error) {
      logger.error('Recovery scenario processing error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new OpenAIService();