import { Shaun } from './agent/shaun';
import { EnhancedShaun } from './agent/enhanced-shaun';

// Choose between basic and enhanced agent
const useEnhanced = process.env.ENHANCED_MODE !== 'false';

console.log(`🚀 Starting ShaunAI in ${useEnhanced ? 'ENHANCED' : 'BASIC'} mode`);

if (useEnhanced) {
  const enhancedAgent = new EnhancedShaun();
  enhancedAgent.run().catch(console.error);
} else {
  const basicAgent = new Shaun();
  basicAgent.run();
}
