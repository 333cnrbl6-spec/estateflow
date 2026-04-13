# Premiso Helper Bot - AI-Powered Assistant

## Overview

The Helper Bot is an intelligent, context-aware assistant that helps users navigate the Premiso property management platform. It features a floating house icon that provides module-specific suggestions, answers questions, and guides users through complex workflows.

## Features

### 🏠 **Floating Presence**
- Always-accessible floating house icon (bottom-right corner)
- Animated pulse effect when idle
- Smooth open/close transitions
- Non-intrusive design

### 🧠 **AI-Powered Intelligence**
- Trained on complete app documentation and codebase
- Context-aware responses based on current module
- Natural language understanding
- Smart suggestions and recommendations

### 📍 **Module-Specific Assistance**
- Detects current page/module automatically
- Provides relevant suggestions for current context
- Shows module-specific tips and features
- Offers quick actions related to current task

### 💬 **Interactive Chat**
- Real-time conversation interface
- Quick suggestion buttons
- Actionable recommendations with direct navigation
- Timestamped message history
- Loading indicators

### 🎯 **Smart Features**
- **Quick Suggestions**: Context-aware action buttons
- **Quick Actions**: Direct navigation to common tasks
- **FAQ Integration**: Answers to common questions
- **Search Capability**: Finds relevant modules and features
- **AI Responses**: Intelligent answers using LLM

## Architecture

### Components

#### `HelperBot.jsx`
Main bot component with:
- Chat interface
- Message handling
- Suggestion management
- AI integration
- Navigation helpers

#### `app-knowledge.js`
Comprehensive knowledge base containing:
- All module definitions
- Features and capabilities
- Common tasks and routes
- FAQs with answers
- Getting started guide
- Search functionality

### Integration

The bot is integrated into `AppLayout.jsx` and appears on all authenticated pages:

```jsx
<HelperBot />
```

## Usage

### Opening the Bot
1. Click the floating house icon (bottom-right)
2. Chat window opens with welcome message
3. View module-specific suggestions

### Asking Questions
1. Type your question in the input field
2. Press Enter or click Send
3. AI provides intelligent response
4. Click suggested actions for direct navigation

### Quick Actions
- **Suggestion Buttons**: Click any suggestion to auto-fill question
- **Quick Actions**: Direct navigation to common tasks
- **Module Tips**: Context-specific recommendations

## Knowledge Base

### Module Coverage

The bot has complete knowledge of all 20+ modules:

| Module | Route | Key Features |
|--------|-------|--------------|
| Dashboard | `/` | Portfolio overview, metrics, alerts |
| Companies | `/companies` | Company management, Companies House |
| Properties | `/properties` | Property profiles, unit management |
| Tenants | `/tenants` | Tenant profiles, lease tracking |
| Financials | `/financials` | Rent collection, reporting, Stripe |
| Maintenance | `/maintenance` | Request tracking, contractors |
| Compliance | `/compliance` | Certificates, expiry tracking |
| Sales | `/sales` | Leads, listings, valuations, pipeline |
| Workflows | `/workflows` | AI automation, triggers |
| Out of Hours | `/out-of-hours` | 24/7 call handling, emergencies |
| ... and more | | |

### Common Tasks

Pre-configured quick actions:
- Add a new property
- Create a sales listing
- Process rent payment
- Upload compliance certificate
- Create maintenance request
- Generate tenancy agreement
- View financial reports
- Schedule property viewing
- Add new tenant
- Set up workflow automation

### FAQs

Built-in answers to common questions:
- How do I add a new property?
- How do I generate a property valuation?
- How do I process rent payments?
- How do I track compliance certificates?
- How do I create a maintenance request?
- Can I automate document generation?
- How do I set up workflows?
- What is the Out of Hours service?

## AI Integration

### Model Configuration

Uses Base44's InvokeLLM integration:
- **Model**: `gpt_5_mini` (fast, efficient)
- **Context**: App knowledge + current module + search results
- **Response Format**: Natural, helpful, actionable

### Prompt Engineering

The bot constructs intelligent prompts with:
1. Current module context
2. Relevant search results
3. Complete module directory
4. Common tasks mapping
5. FAQ database
6. Specific instructions

### Search Enhancement

Before AI invocation, the bot:
1. Searches knowledge base for matches
2. Finds related modules
3. Identifies relevant FAQs
4. Locates common tasks
5. Provides context to AI

## UI/UX Design

### Visual Elements

**Floating Icon**:
- House icon (Home from Lucide)
- Gradient blue background
- Pulse animation when idle
- Rotates to X when open
- Shadow for depth

**Chat Window**:
- Fixed position (bottom-right)
- Card-based design
- Blue gradient header
- Scrollable message area
- Suggestion chips
- Quick action buttons

**Messages**:
- User: Blue bubbles (right-aligned)
- Assistant: Gray bubbles with avatar (left-aligned)
- Timestamps
- Suggested action buttons
- Welcome message styling

**Suggestions**:
- Chip buttons
- Module-specific tips section
- Quick actions grid
- Context-aware ordering

### Responsive Design

- Fixed width: 384px (w-96)
- Max height: 600px
- Scrollable content
- Mobile-friendly positioning

## Customization

### Adding New Modules

Edit `lib/app-knowledge.js`:

```javascript
modules: {
  newModule: {
    name: "Module Name",
    route: "/route",
    description: "What it does",
    features: ["Feature 1", "Feature 2"],
    useCases: ["Use case 1"],
    suggestions: ["Suggestion 1", "Suggestion 2"]
  }
}
```

### Adding FAQs

```javascript
faqs: [
  {
    question: "How do I...?",
    answer: "Step-by-step answer...",
    relatedModules: ["module1", "module2"]
  }
]
```

### Adding Common Tasks

```javascript
commonTasks: [
  { 
    task: "Do something", 
    module: "module-name", 
    action: "/route" 
  }
]
```

### Styling

Edit `components/HelperBot.jsx`:
- Change colors in className
- Adjust positioning (bottom, right)
- Modify card size
- Update animations

## Performance

### Optimizations

1. **Lazy Loading**: Bot loads on demand
2. **Cached Knowledge**: In-memory knowledge base
3. **Efficient Search**: Fast text matching
4. **AI Caching**: Similar questions get cached responses
5. **Debounced Input**: Prevents rapid-fire requests

### Loading States

- Spinner during AI response
- Disabled input while processing
- Visual feedback for all actions

## Accessibility

### Features

- Keyboard navigation support
- ARIA labels on buttons
- High contrast colors
- Clear focus indicators
- Screen reader friendly

### Keyboard Shortcuts

- `Enter`: Send message
- `Escape`: Close bot
- `Tab`: Navigate buttons

## Testing

### Manual Testing Checklist

- [ ] Icon appears on all pages
- [ ] Click opens chat window
- [ ] Welcome message shows
- [ ] Suggestions are relevant
- [ ] AI responses are helpful
- [ ] Quick actions navigate correctly
- [ ] Messages scroll properly
- [ ] Loading states work
- [ ] Error handling works
- [ ] Close button works

### Test Scenarios

1. **Basic Chat**
   - Open bot
   - Send message
   - Receive AI response
   - Click suggested action

2. **Module Navigation**
   - Visit different modules
   - Check suggestions update
   - Verify module tips change

3. **Quick Actions**
   - Click common task buttons
   - Verify navigation
   - Check correct routes

4. **AI Questions**
   - Ask FAQ questions
   - Verify accurate answers
   - Check module recommendations

## Troubleshooting

### Common Issues

**Bot doesn't appear**:
- Check AppLayout import
- Verify component rendering
- Check z-index conflicts

**AI not responding**:
- Verify integration credentials
- Check network connection
- Review error logs

**Wrong module detected**:
- Check URL parsing logic
- Verify route matching
- Update module mapping

**Suggestions not showing**:
- Check knowledge base data
- Verify module configuration
- Review updateSuggestions logic

## Future Enhancements

### Planned Features

1. **Conversation History**
   - Persist chat across sessions
   - Searchable history
   - Export conversations

2. **Voice Input**
   - Speech-to-text
   - Voice commands
   - Audio responses

3. **Advanced AI**
   - Multi-turn conversations
   - Context retention
   - Personalized responses
   - Learning from interactions

4. **Proactive Assistance**
   - Detect user confusion
   - Offer help automatically
   - Suggest workflows
   - Highlight features

5. **Analytics**
   - Track common questions
   - Monitor usage patterns
   - Identify knowledge gaps
   - Improve responses

6. **Multi-language**
   - Internationalization
   - Language detection
   - Translation support

7. **Custom Workflows**
   - Guided wizards
   - Step-by-step tutorials
   - Interactive onboarding

## Support

For issues or questions about the Helper Bot:
- Check this documentation
- Review code comments
- Contact development team
- Submit bug report

## Credits

**Developed by**: Premiso AI Team  
**Date**: April 2026  
**Version**: 1.0  
**License**: Proprietary

---

## Quick Reference

### Icon States
- 🏠 **House**: Bot closed (idle)
- ❌ **X**: Bot open (active)

### Message Types
- 💬 **User messages**: Blue, right-aligned
- 🤖 **Bot messages**: Gray, left-aligned
- ✨ **Welcome**: Special styling with icon

### Button Types
- **Suggestions**: Blue outline, auto-fill question
- **Quick Actions**: Gray outline, direct navigation
- **Module Tips**: Context-specific recommendations

### Color Scheme
- Primary: Blue (#2563eb)
- Background: White/Gray
- Accent: Blue gradient
- Text: High contrast