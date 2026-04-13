import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, Wand2, Copy, Check, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { TRIGGER_TYPES, ACTION_TYPES, CONDITION_FIELDS } from './WorkflowFormDialog';

const SUGGESTION_MODES = [
  { id: 'suggest',   icon: '🎯', label: 'Suggest',   desc: 'Get template & setup suggestions based on your trigger' },
  { id: 'copy',      icon: '✍️', label: 'Write Copy', desc: 'Generate email or SMS content with placeholders' },
  { id: 'conditions',icon: '🔍', label: 'Conditions', desc: 'Get smart condition recommendations for this trigger' },
  { id: 'optimise',  icon: '⚡', label: 'Optimise',   desc: 'Review and improve an existing workflow' },
];

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1800); }}
      className="text-xs flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
      {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function ResultBlock({ text, onApply, applyLabel }) {
  return (
    <div className="bg-white rounded-lg border p-3 text-xs leading-relaxed whitespace-pre-wrap text-slate-700 relative group">
      {text}
      <div className="flex items-center justify-between mt-2 pt-2 border-t">
        <CopyButton text={text} />
        {onApply && (
          <button onClick={() => onApply(text)}
            className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded hover:bg-primary/90 transition-colors">
            {applyLabel || 'Use this'}
          </button>
        )}
      </div>
    </div>
  );
}

export default function WorkflowAIAssistant({ formData, onApplySuggestion }) {
  const [mode, setMode] = useState('suggest');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [userPrompt, setUserPrompt] = useState('');
  const [expanded, setExpanded] = useState(true);

  const triggerDef = TRIGGER_TYPES.find(t => t.value === formData.trigger_type);
  const availableConditions = CONDITION_FIELDS[formData.trigger_type] || [];
  const currentActions = (formData.actions || []).map(a => ACTION_TYPES.find(x => x.value === a.action_type)?.label || a.action_type).join(', ');

  const buildPrompt = () => {
    const base = `
You are an expert UK property management automation consultant helping build workflow rules in "Premiso" — a property management platform.

Current workflow state:
- Name: "${formData.name || '(not set)'}"
- Trigger: "${triggerDef?.label || formData.trigger_type || '(not selected)'}" — ${triggerDef?.desc || ''}
- Days before/after: ${formData.days_before ?? 'N/A'}
- Current conditions: ${JSON.stringify(formData.conditions || [])}
- Current actions: ${currentActions || '(none yet)'}
- Condition logic: ${formData.condition_logic || 'AND'}

Available condition fields for this trigger: ${availableConditions.map(f => `${f.label} (${f.type})`).join(', ') || 'none'}
Available action types: ${ACTION_TYPES.map(a => a.label).join(', ')}
`;

    if (mode === 'suggest') return base + `
User context: "${userPrompt || 'No extra context provided'}"

Suggest how to complete or improve this workflow. Provide:
1. A recommended workflow name (if not set or generic)
2. 2-3 recommended conditions to add with operator and value
3. 2-3 recommended actions in order
4. A brief explanation of why this setup makes business sense for a UK property manager

Be specific to the trigger type. Reference UK legislation where relevant (e.g. Landlord & Tenant Act, Gas Safety Regulations, Building Safety Act 2023).
Format your response clearly with sections: NAME SUGGESTION, CONDITIONS, ACTIONS, RATIONALE.`;

    if (mode === 'copy') return base + `
Generate professional UK property management communications for this workflow trigger.

User notes: "${userPrompt || 'Standard professional tone'}"

Produce ALL of the following:

1. EMAIL SUBJECT LINE — concise, professional
2. EMAIL BODY — formal but approachable, 3-4 short paragraphs. Use these placeholders where appropriate: {{tenant_name}}, {{property_name}}, {{property_address}}, {{company_name}}, {{expiry_date}}, {{due_date}}, {{arrears_amount}}, {{days_until_expiry}}, {{tenancy_end_date}}. Sign off as {{company_name}}.
3. SMS MESSAGE — max 160 characters, friendly, uses key placeholder only

Label each section clearly. Do not use markdown — plain text only.`;

    if (mode === 'conditions') return base + `
Recommend the most useful and targeted conditions for this trigger type. Think about what would make this automation fire at exactly the right time — not too broadly, not too narrowly.

User notes: "${userPrompt || ''}"

For each suggested condition provide:
- Field name (from the available list above)
- Recommended operator
- Recommended value
- Why this condition adds value

Then suggest whether AND or OR logic is more appropriate and why.
Format: CONDITION 1, CONDITION 2, CONDITION 3, LOGIC RECOMMENDATION.`;

    if (mode === 'optimise') return base + `
Analyse this workflow and suggest improvements for better targeting, reliability, and cost efficiency.

User notes: "${userPrompt || ''}"

Review:
1. Are the conditions specific enough to avoid false positives?
2. Are there missing conditions that would improve targeting?
3. Is the action sequence logical — are there redundant actions?
4. Are there timing improvements (days_before/after)?
5. Any UK compliance considerations for this trigger type?

Be direct and practical. Flag any potential issues. Format: ISSUES FOUND, RECOMMENDED CHANGES, COMPLIANCE NOTES.`;

    return base;
  };

  const run = async () => {
    if (!formData.trigger_type && mode !== 'suggest') return;
    setLoading(true);
    setResult(null);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: buildPrompt(),
        add_context_from_internet: false,
      });
      setResult(typeof res === 'string' ? res : JSON.stringify(res));
    } catch (e) {
      setResult('Error: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  // Parse email/SMS from copy result and allow one-click apply
  const applyCopy = (text) => {
    const subjectMatch = text.match(/EMAIL SUBJECT[^\n]*\n([^\n]+)/i);
    const bodyMatch = text.match(/EMAIL BODY[^\n]*\n([\s\S]+?)(?=\nSMS|$)/i);
    const smsMatch = text.match(/SMS[^\n]*\n([^\n]+)/i);
    if (onApplySuggestion && (subjectMatch || bodyMatch)) {
      onApplySuggestion({
        type: 'copy',
        email_subject: subjectMatch?.[1]?.trim() || '',
        email_body: bodyMatch?.[1]?.trim() || '',
        sms: smsMatch?.[1]?.trim() || '',
      });
    }
  };

  return (
    <div className="border rounded-xl overflow-hidden bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
      {/* Header */}
      <button onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-violet-100/50 transition-colors">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-600" />
          <span className="text-sm font-semibold text-violet-900">AI Workflow Assistant</span>
          <span className="text-xs bg-violet-200 text-violet-700 px-2 py-0.5 rounded-full font-medium">Beta</span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-violet-400" /> : <ChevronDown className="w-4 h-4 text-violet-400" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Mode tabs */}
          <div className="grid grid-cols-4 gap-1 bg-violet-100 rounded-lg p-1">
            {SUGGESTION_MODES.map(m => (
              <button key={m.id} onClick={() => { setMode(m.id); setResult(null); }}
                className={`text-xs py-1.5 px-1 rounded-md font-medium transition-all text-center ${
                  mode === m.id ? 'bg-white text-violet-900 shadow-sm' : 'text-violet-600 hover:text-violet-900'
                }`}>
                <div>{m.icon}</div>
                <div>{m.label}</div>
              </button>
            ))}
          </div>

          <p className="text-xs text-violet-700">{SUGGESTION_MODES.find(m => m.id === mode)?.desc}</p>

          {/* Context input */}
          <Textarea
            placeholder={
              mode === 'suggest' ? 'Optional: describe your portfolio or what you want to achieve…' :
              mode === 'copy' ? 'Optional: tone notes, e.g. "formal", "friendly", specific legal wording…' :
              mode === 'conditions' ? 'Optional: describe edge cases or when NOT to fire this workflow…' :
              'Optional: describe any issues you\'ve noticed or goals to optimise for…'
            }
            rows={2}
            value={userPrompt}
            onChange={e => setUserPrompt(e.target.value)}
            className="text-xs bg-white border-violet-200 resize-none"
          />

          <Button onClick={run} disabled={loading} size="sm"
            className="w-full bg-violet-600 hover:bg-violet-700 text-white gap-2">
            {loading
              ? <><Loader2 className="w-3 h-3 animate-spin" />Thinking…</>
              : <><Wand2 className="w-3 h-3" />{SUGGESTION_MODES.find(m => m.id === mode)?.label}</>}
          </Button>

          {/* Result */}
          {result && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-violet-800">AI Suggestion</span>
                <div className="flex items-center gap-2">
                  {mode === 'copy' && (
                    <button onClick={() => applyCopy(result)}
                      className="text-xs bg-violet-600 text-white px-2 py-1 rounded hover:bg-violet-700 transition-colors">
                      Apply to form
                    </button>
                  )}
                  <button onClick={run} className="text-xs text-violet-600 hover:text-violet-800 flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" /> Regenerate
                  </button>
                </div>
              </div>
              <ResultBlock text={result} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}