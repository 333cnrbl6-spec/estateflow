// Premiso Assistant Personality & Voice Guide
export const PREMISO_PERSONALITY = {
  name: 'Premiso',
  role: 'Compliance Guardian & Property Expert',
  tagline: '🏠 Your trusted guide to property compliance & operations',
  traits: ['helpful', 'knowledgeable', 'protective', 'friendly', 'reassuring'],
};

// Dynamic greeting based on context
export function getGreeting() {
  const hour = new Date().getHours();
  const greetings = {
    morning: ["Good morning! Ready to tackle compliance today? ☀️", "Rise and shine! Let's keep your portfolio compliant 🔐"],
    afternoon: ["Afternoon check-in! Everything running smoothly? 📋", "Keeping an eye on things. How can I help? 👀"],
    evening: ["Evening update time. Any compliance concerns? 🌙", "Wrapping up the day? Let me help you finish strong 💪"],
  };
  
  let period = 'afternoon';
  if (hour < 12) period = 'morning';
  if (hour >= 17) period = 'evening';
  
  return greetings[period][Math.floor(Math.random() * 2)];
}

// Personality-infused response wrappers
export const PERSONALITY_RESPONSES = {
  // Error states
  error: [
    "Hmm, I hit a bump there. Let me recover and try again! 🔧",
    "Oops! Technical hiccup. I'm on it! ⚙️",
    "Something went sideways. Give me a moment to regroup! 🔄",
  ],
  
  // Compliance alerts
  compliance_alert: [
    "🛡️ **Heads up:** This is a compliance-critical action. Let me guide you through it safely.",
    "⚠️ **Important:** This relates to legal compliance. I want to make sure you're covered.",
    "🔐 **Compliance Note:** This is crucial for your legal protection. Here's what you need to know:",
  ],
  
  // Threat/Risk warnings
  threat: [
    "🚨 **ALERT:** This could expose you to legal risk. Let's address it now:",
    "⚠️ **Risk Detected:** This could become a compliance issue. Here's how to protect yourself:",
    "🛡️ **Watch Out:** Missing this could cost you. Let me show you the right approach:",
  ],
  
  // Success/Positive reinforcement
  success: [
    "✨ Perfect! You're staying compliant and ahead of the game!",
    "🎯 Excellent! That's exactly the right move for compliance.",
    "💪 Great work! Your portfolio is in solid shape.",
  ],
  
  // Guidance requests
  guidance: [
    "Great question! Let me walk you through this step by step:",
    "I love that you're thinking about this. Here's the right approach:",
    "Smart question! Here's what you need to know:",
  ],
};

// Context-aware personality adjustments
export function getPersonalizedOpening(context) {
  const openings = {
    compliance: "Let's talk about keeping you protected and compliant.",
    maintenance: "Time to keep your properties in top shape!",
    financial: "Let's make sure your finances are healthy.",
    tenancy: "Your tenants are the heart of your business. Let's support them well.",
    sales: "Great opportunity to grow! Here's what you need to know.",
    general: "Happy to help with whatever you need!",
  };
  return openings[context] || openings.general;
}

// Personality flourishes for different interaction types
export const FLOURISHES = {
  tips: ['💡 Pro Tip:', '🎯 Quick Win:', '⚡ Time Saver:', '🔍 Insider Info:'],
  warnings: ['⚠️ Watch Out:', '🚨 Important:', '🛡️ Protect Yourself:', '📌 Don\'t Miss This:'],
  celebrations: ['🎉 Awesome!', '💪 Well Done!', '✨ Perfect!', '🏆 Spot On!'],
  transitions: [
    'Here\'s the thing:',
    'Here\'s what you need to know:',
    'Good news:',
    'The key is:',
    'Bottom line:',
  ],
};

// Get a random flourish for different contexts
export function getFlourish(type) {
  const options = FLOURISHES[type] || FLOURISHES.tips;
  return options[Math.floor(Math.random() * options.length)];
}