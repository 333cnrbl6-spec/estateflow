import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const APP_KNOWLEDGE = {
  platform_name: 'Premiso',
  modules: {
    properties: { name: 'Properties', description: 'Manage property portfolios, buildings, and units' },
    tenancies: { name: 'Tenancies & Lettings', description: 'Complete tenant lifecycle management' },
    financials: { name: 'Financials & Accounting', description: 'Complete financial management and reporting' },
    maintenance: { name: 'Maintenance & Repairs', description: 'Track and manage all maintenance work' },
    compliance: { name: 'Compliance & Safety', description: 'Automated compliance monitoring and alerts' },
    block_management: { name: 'Block Management', description: 'Manage buildings, service charges, and leaseholders' },
    sales: { name: 'Property Sales', description: 'Sales pipeline and transaction management' },
    communications: { name: 'Communications', description: 'Integrated messaging and notifications' },
  },
  features: {
    maintenance: ['Create maintenance requests', 'Assign contractors', 'Track status', 'Digital inspection reports'],
    compliance: ['Gas safety certificates', 'EICR electrical certificates', 'EPC tracking', 'Automatic expiry alerts'],
    financials: ['Rent tracking', 'Expense management', 'Accounting integrations', 'Financial reporting'],
    tenancies: ['Tenant management', 'Deposit protection', 'Right to Rent checks', 'Tenant portal'],
  },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query, current_page, context } = await req.json();

    // Build knowledge context for LLM
    const knowledgeContext = JSON.stringify(APP_KNOWLEDGE, null, 2);
    const currentPageInfo = APP_KNOWLEDGE.modules[current_page] || { name: current_page, description: 'App module' };

    const systemPrompt = `You are Premiso Assistant, an expert AI helper trained on the complete Premiso property management platform.

Your role is to:
1. Provide contextual help based on what the user is viewing
2. Answer questions about features and how to use them
3. Guide users through common tasks
4. Suggest relevant features they might not know about
5. Provide compliance and best practice advice

Current page: ${current_page || 'Dashboard'}
Current module: ${currentPageInfo.name || 'Unknown'}

Always be:
- Friendly and professional
- Concise but thorough
- Action-oriented with specific steps
- Proactive in suggesting relevant features

Format responses in a conversational way. Use bullet points for steps or lists. Keep responses under 400 words unless the user asks for more detail.`;

    const userMessage = `User query: ${query}
${context ? `Additional context: ${context}` : ''}

Available knowledge base:
${knowledgeContext}`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `${systemPrompt}\n\n${userMessage}`,
      response_json_schema: {
        type: 'object',
        properties: {
          answer: { type: 'string' },
          suggested_actions: {
            type: 'array',
            items: { type: 'string' },
          },
          related_modules: {
            type: 'array',
            items: { type: 'string' },
          },
          helpful: { type: 'boolean' },
        },
      },
    });

    return Response.json({
      success: true,
      answer: response.answer,
      suggested_actions: response.suggested_actions || [],
      related_modules: response.related_modules || [],
      user_query: query,
      page: current_page,
    });
  } catch (error) {
    console.error('Error in helperBotQuery:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});