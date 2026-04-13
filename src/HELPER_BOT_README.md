# Premiso Assistant Implementation Guide

## Architecture

### Components

1. **HelperBot.jsx** - Main UI component
   - Floating chat interface in bottom-right corner
   - Message history display
   - Real-time query input
   - Page context awareness via React Router

2. **helperBotQuery.js** - Backend function
   - Processes user queries with LLM
   - Provides contextual responses based on current page
   - Suggests actions and related modules
   - Uses app knowledge base for context

3. **app-knowledge.js** - Knowledge base
   - Complete module documentation
   - Common tasks and workflows
   - Integration details
   - FAQs and glossary

### Integration Points

#### In AppLayout.jsx
```jsx
import HelperBot from '@/components/HelperBot';

// In component:
<HelperBot />
```

The bot is automatically available on all authenticated pages via the main layout.

## Features

### Contextual Awareness
- Detects current page/module from React Router location
- Provides page-specific guidance
- Suggests relevant features based on context

### Conversation Features
- Multi-turn conversation support
- Suggested actions for quick navigation
- Related module suggestions
- Smooth message scrolling

### Smart Responses
- Formatted text with bullet points
- Action-oriented guidance
- Brief summaries with link options
- Error handling with helpful fallbacks

## Customization

### Adding Module-Specific Knowledge

Edit `lib/app-knowledge.js`:

```javascript
modules: {
  your_module: {
    name: 'Module Name',
    description: 'Description',
    features: [
      'Feature 1',
      'Feature 2',
    ],
    entities: ['Entity1', 'Entity2'],
  },
}
```

### Adding Common Tasks

```javascript
common_tasks: {
  'Task Name': {
    module: 'module_name',
    steps: [
      'Step 1',
      'Step 2',
      'Step 3',
    ],
  },
}
```

### Adding FAQs

```javascript
faqs: {
  'Question?': 'Answer with guidance and next steps.',
}
```

## Training Data

The bot is trained on:

- **Module Descriptions** - Purpose and scope of each feature area
- **Features List** - Available functionality in each module
- **Common Tasks** - Step-by-step walkthroughs
- **Entity Overview** - What each data type represents
- **Glossary** - Technical terms and definitions
- **FAQs** - Common questions and answers
- **Integration Guide** - Connected systems and capabilities

## Page Context Mapping

```javascript
const pathMap = {
  '/': 'dashboard',
  '/properties': 'properties',
  '/tenants': 'tenancies',
  '/maintenance': 'maintenance',
  '/compliance': 'compliance',
  '/financials': 'financials',
  '/sales': 'sales',
  '/block-management': 'block_management',
};
```

Add new mappings when new pages are created.

## Usage Examples

### Simple Question
**User:** "How do I create a tenancy?"

**Bot Response:** Provides step-by-step guide including tenant creation, agreement setup, deposit protection, and prescribed information.

### Compliance Question
**User:** "What certificates do I need?"

**Bot Response:** Lists all required certificates (Gas, EICR, EPC), renewal frequencies, and links to Compliance module for tracking.

### Contextual Help
**User:** (On Maintenance page) "How do I assign a contractor?"

**Bot Response:** Recognizes maintenance context and provides specific guidance for contractor assignment on that page.

### Suggested Actions
**User:** "How do I get started?"

**Bot Response:** Shows suggested actions like "Create a property", "Add a tenant", "Schedule maintenance" based on app setup stage.

## LLM Integration

The bot uses the base44 InvokeLLM integration:

```javascript
await base44.integrations.Core.InvokeLLM({
  prompt: systemPrompt + userMessage,
  response_json_schema: {
    // Structured response format
  },
});
```

This enables:
- Natural language understanding
- Context-aware responses
- Suggested next steps
- Multi-topic conversations

## Performance Considerations

- Bot loads after initial app render
- Uses React Router location for zero-latency context detection
- Message history stored in component state (session-based)
- LLM calls cached by message hash in production

## Analytics & Improvements

Track bot usage through:
- Query topics and frequencies
- User satisfaction (add rating feature)
- Suggested action click-through rates
- Common unanswered questions

Use this data to improve training data and identify missing features.

## Future Enhancements

1. **Multi-language support** - Translate responses based on user locale
2. **Video tutorials** - Link to tutorial videos from responses
3. **Live agent escalation** - Transfer to human support if needed
4. **Feedback collection** - Rate response helpfulness
5. **Custom knowledge** - Company-specific policies and procedures
6. **Document search** - Index and search uploaded documents
7. **API documentation** - Help developers integrate with Premiso

## Troubleshooting

### Bot not responding
- Check network connectivity
- Verify backend function is deployed
- Check browser console for errors
- Try refreshing the page

### Generic responses
- Check knowledge base is complete
- Verify current page context is detected
- Review LLM prompt in backend function
- Test with specific, detailed questions

### Missing information
- Update knowledge base with new modules
- Add common tasks as features are added
- Include glossary terms for technical concepts
- Update page context mapping for new routes