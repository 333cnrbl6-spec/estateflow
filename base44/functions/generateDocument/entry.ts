import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { template_id, data, document_title } = await req.json();

    // Fetch template
    const template = await base44.entities.DocumentTemplate.get(template_id);
    if (!template) {
      return Response.json({ error: 'Template not found' }, { status: 404 });
    }

    // Replace placeholders in template content
    let content = template.template_content;
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      content = content.replace(new RegExp(placeholder, 'g'), value || '');
    });

    // Create document record
    const document = await base44.entities.Document.create({
      title: document_title || template.name,
      template_id: template_id,
      document_type: template.category,
      content: content,
      status: 'generated',
      generated_date: new Date().toISOString().split('T')[0],
      ...data,
    });

    return Response.json({ document, content });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});