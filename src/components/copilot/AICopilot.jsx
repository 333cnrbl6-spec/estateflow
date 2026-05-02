import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send, MessageCircle, X } from 'lucide-react';

export default function AICopilot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m your Premiso copilot. I can help with property management, compliance, reports, and more. What do you need?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEnd = useRef(null);

  const scrollToBottom = () => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async () => {
    if (!input.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    setLoading(true);

    try {
      const response = await base44.functions.invoke('helperBotQuery', {
        query: input,
        context: 'property_management'
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response.data.answer || 'I couldn\'t process that. Try asking about properties, tenants, maintenance, or reports.' }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error processing request. Please try again.' }]);
    }

    setLoading(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center z-40"
        title="Open Premiso Copilot"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl z-50 flex flex-col">
      <CardHeader className="bg-primary text-white flex-shrink-0 flex items-center justify-between">
        <CardTitle className="text-white flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Premiso Copilot
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(false)}
          className="text-white hover:bg-primary/80"
        >
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs px-4 py-2 rounded-lg ${
              msg.role === 'user'
                ? 'bg-primary text-white'
                : 'bg-white text-slate-900 border border-slate-200'
            }`}>
              <p className="text-sm">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white text-slate-900 px-4 py-2 rounded-lg border border-slate-200">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEnd} />
      </CardContent>

      <div className="border-t p-3 bg-white flex-shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSubmit()}
            placeholder="Ask me anything..."
            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            disabled={loading}
          />
          <Button
            onClick={handleSubmit}
            disabled={loading || !input.trim()}
            size="sm"
            className="gap-1"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}