#!/usr/bin/env node

import { EnhancedShaun } from './agent/enhanced-shaun';
import { ShaunServerIntegration } from './utils/server-integration';

/**
 * ShaunAI Ultimate Integration Script
 * 
 * This script creates the most powerful AI agent by:
 * 1. Starting the enhanced autonomous agent
 * 2. Integrating with the server's web automation capabilities
 * 3. Enabling real-time operation and monitoring
 * 4. Providing a seamless "user behind the computer" experience
 */

async function main() {
  console.log('🚀 Starting ShaunAI - The Most Powerful Agent');
  console.log('   Making OpenAI Agent and Operator look pedestrian...');
  
  try {
    // Initialize the enhanced agent
    console.log('\n📡 Initializing Enhanced ShaunAI Agent...');
    const agent = new EnhancedShaun();
    
    // Set up server integration
    console.log('🔗 Setting up server integration...');
    const integration = new ShaunServerIntegration(agent);
    await integration.initialize();
    
    // Display capabilities
    console.log('\n🎯 ShaunAI Capabilities Loaded:');
    agent.capabilities.forEach((capability: string) => {
      console.log(`   ✅ ${capability.replace('_', ' ').toUpperCase()}`);
    });
    
    console.log('\n🌟 ShaunAI is now operational!');
    console.log('   - Autonomous task execution: ACTIVE');
    console.log('   - Web automation: ENABLED');
    console.log('   - Multi-modal reasoning: ONLINE');
    console.log('   - Self-improvement: ENGAGED');
    console.log('   - Real-time monitoring: RUNNING');
    
    // Demonstrate initial autonomous operation
    console.log('\n🎬 Starting demonstration...');
    await demonstrateCapabilities(agent);
    
    console.log('\n💪 ShaunAI ready for autonomous operation!');
    console.log('   Access the web interface at: http://localhost:3000');
    console.log('   Agent will continue operating autonomously...');
    
    // Keep the process alive
    process.on('SIGINT', () => {
      console.log('\n👋 Shutting down ShaunAI gracefully...');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Failed to initialize ShaunAI:', error);
    process.exit(1);
  }
}

/**
 * Demonstrate the enhanced agent's capabilities
 */
async function demonstrateCapabilities(agent: EnhancedShaun) {
  console.log('\n🎯 Demonstrating Autonomous Capabilities...\n');
  
  // 1. Autonomous reasoning
  console.log('1️⃣ Autonomous Reasoning Test...');
  const reasoning = await agent.reason('Optimize a high-traffic website for better performance');
  console.log(`   📊 Analysis: ${reasoning.analysis.substring(0, 100)}...`);
  console.log(`   🎯 Recommendations: ${reasoning.recommendations.length} generated`);
  console.log(`   ✅ Confidence: ${(reasoning.confidence * 100).toFixed(1)}%\n`);
  
  // 2. Task planning
  console.log('2️⃣ Autonomous Task Planning...');
  const goals = [
    'Analyze competitor websites',
    'Generate marketing content',
    'Monitor system performance'
  ];
  const plan = await agent.planTasks(goals);
  console.log(`   📋 Tasks planned: ${plan.tasks.length}`);
  console.log(`   ⏱️  Estimated time: ${Math.round(plan.estimatedTime / 1000)}s`);
  console.log(`   🎯 Strategy: ${plan.strategy}\n`);
  
  // 3. Execute a sample task
  console.log('3️⃣ Task Execution Demo...');
  const sampleTask = {
    id: 'demo_task_1',
    type: 'web_automation' as const,
    description: 'Capture and analyze a website',
    priority: 'HIGH' as const,
    payload: {
      url: 'https://example.com',
      actions: ['screenshot', 'analyze_performance']
    }
  };
  
  const result = await agent.executeTask(sampleTask);
  console.log(`   ✅ Task executed: ${result.success ? 'SUCCESS' : 'FAILED'}`);
  if (result.artifacts) {
    console.log(`   📁 Artifacts created: ${result.artifacts.length}`);
  }
  if (result.nextActions) {
    console.log(`   ➡️  Next actions: ${result.nextActions.length} suggested`);
  }
  
  console.log('\n🎉 Demonstration complete! ShaunAI is ready for real-world operation.');
}

// Run the integration
main().catch(console.error);