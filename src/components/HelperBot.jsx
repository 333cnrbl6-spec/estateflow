import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, X, Loader2, ChevronDown, Lightbulb, AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import { PAGE_HINTS } from '@/lib/app-knowledge';
import { audioNotifications, isAudioEnabled } from '@/lib/audioNotifications';
import { getGreeting, PERSONALITY_RESPONSES, getFlourish } from '@/lib/premiso-personality';

const PremisoBotIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    {/* House base */}
    <path d="M12 2L4 8v12h16V8l-8-6z" fill="currentColor" opacity="0.3"/>
    <path d="M12 2L4 8v12h16V8l-8-6z" fill="none" stroke="currentColor" strokeWidth="1.5"/>
    {/* Simple human figure */}
    <circle cx="12" cy="9" r="1.5" fill="currentColor"/>
    <path d="M12 11v2M10 12h4M10.5 14v2M13.5 14v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

export default function HelperBot() {
  const [open, setOpen] = useState(false);
  const [showBubble, setShowBubble] = useState(true);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: `${getGreeting()}\n\nI'm **Premiso**, your property compliance & operations guide. I can help with:\n• Step-by-step guidance on any task\n• Compliance & legal requirements\n• Feature explanations & best practices\n\nWhat would you like to know?`,
      personality: true,
    },
  ]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getPageContext = () => {
    const pathMap = {
      '/': 'dashboard',
      '/dashboard': 'dashboard',
      '/properties': 'properties',
      '/units': 'units',
      '/tenants': 'tenancies',
      '/maintenance': 'maintenance',
      '/compliance': 'compliance',
      '/financials': 'financials',
      '/sales': 'sales',
      '/block-management': 'block_management',
      '/workflows': 'automation',
      '/documents': 'documents',
    };
    return pathMap[location.pathname] || 'general';
  };

  const getContextHints = () => {
    const hints = PAGE_HINTS[location.pathname] || PAGE_HINTS['default'];
    return hints || [];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Add user message
    const userMsg = {
      id: messages.length + 1,
      type: 'user',
      text: query,
    };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const response = await base44.functions.invoke('helperBotQuery', {
        query: query.trim(),
        current_page: getPageContext(),
        context: `User is viewing: ${location.pathname}`,
      });

      const botMsg = {
        id: messages.length + 2,
        type: 'bot',
        text: response.data?.answer || 'I couldn\'t generate a response. Please try again.',
        suggested_actions: response.data?.suggested_actions || [],
        related_modules: response.data?.related_modules || [],
        compliance_level: response.data?.compliance_level,
        compliance_note: response.data?.compliance_note,
      };
      setMessages(prev => [...prev, botMsg]);
      
      // Play audio feedback based on compliance level
      if (isAudioEnabled()) {
        if (response.data?.compliance_level === 'threat') {
          audioNotifications.threat();
        } else if (response.data?.compliance_level === 'compliance') {
          audioNotifications.complianceAlert();
        } else {
          audioNotifications.success();
        }
      }
    } catch (error) {
      const randomError = PERSONALITY_RESPONSES.error[Math.floor(Math.random() * PERSONALITY_RESPONSES.error.length)];
      const errorMsg = {
        id: messages.length + 2,
        type: 'bot',
        text: randomError,
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestedAction = async (action) => {
    setQuery(action);
    setLoading(true);

    try {
      const response = await base44.functions.invoke('helperBotQuery', {
        query: action,
        current_page: getPageContext(),
        context: 'User clicked suggested action',
      });

      const botMsg = {
        id: messages.length + 1,
        type: 'bot',
        text: response.data?.answer || 'I couldn\'t generate a response.',
        suggested_actions: response.data?.suggested_actions || [],
        compliance_level: response.data?.compliance_level,
        compliance_note: response.data?.compliance_note,
      };
      setMessages(prev => [...prev, botMsg]);
      
      if (isAudioEnabled()) {
        if (response.data?.compliance_level === 'threat') {
          audioNotifications.threat();
        } else if (response.data?.compliance_level === 'compliance') {
          audioNotifications.complianceAlert();
        } else {
          audioNotifications.success();
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] max-w-sm">
      {open ? (
        <Card className="shadow-2xl border-slate-200">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 text-primary">
                <PremisoBotIcon />
              </div>
              <CardTitle className="text-base">Premiso Assistant</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="h-6 w-6"
            >
              <X className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBubble(!showBubble)}
              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              {showBubble ? 'Hide tip' : 'Show tip'}
            </Button>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Messages */}
            <div className="h-96 overflow-y-auto border rounded-lg bg-slate-50 p-3 space-y-3">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-white border border-slate-200 text-slate-900'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap prose prose-sm max-w-none">{msg.text}</p>

                    {msg.type === 'bot' && msg.suggested_actions && msg.suggested_actions.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {msg.suggested_actions.slice(0, 2).map((action, i) => (
                          <button
                            key={i}
                            onClick={() => handleSuggestedAction(action)}
                            className="block text-xs text-primary hover:underline text-left"
                          >
                            → {action}
                          </button>
                        ))}
                      </div>
                    )}

                    {msg.type === 'bot' && msg.compliance_level && (
                      <div className={`mt-2 px-2 py-1.5 rounded text-xs flex items-start gap-2 ${
                        msg.compliance_level === 'threat' ? 'bg-red-50 text-red-700' :
                        msg.compliance_level === 'compliance' ? 'bg-blue-50 text-blue-700' :
                        'bg-amber-50 text-amber-700'
                      }`}>
                        {msg.compliance_level === 'threat' && <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />}
                        {msg.compliance_level === 'compliance' && <CheckCircle className="w-3 h-3 shrink-0 mt-0.5" />}
                        {msg.compliance_level === 'warning' && <Zap className="w-3 h-3 shrink-0 mt-0.5" />}
                        <span>{msg.compliance_note}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-lg px-4 py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Ask me anything..."
                className="text-sm"
                disabled={loading}
              />
              <Button
                type="submit"
                size="icon"
                disabled={loading || !query.trim()}
                className="shrink-0"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </form>

            {/* Page-specific hints with type indicators */}
            {getContextHints().length > 0 && (
              <div className="space-y-3 border-t pt-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  Guidance for this page
                </div>
                <ul className="text-xs space-y-2">
                  {getContextHints().slice(0, 3).map((hint, i) => {
                    const typeColors = {
                      compliance: 'text-blue-700 bg-blue-50',
                      threat: 'text-red-700 bg-red-50',
                      warning: 'text-amber-700 bg-amber-50',
                      tip: 'text-slate-700 bg-slate-50',
                    };
                    const typeIcons = {
                      compliance: '🛡️',
                      threat: '⚠️',
                      warning: '⚡',
                      tip: '💡',
                    };
                    return (
                      <li key={i} className={`flex gap-2 p-1.5 rounded ${typeColors[hint.type] || typeColors.tip}`}>
                        <span className="shrink-0">{typeIcons[hint.type]}</span>
                        <span>{hint.hint}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* General tips */}
            <div className="border-t pt-3 text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">How to use</p>
              <ul className="space-y-0.5">
                <li>• "How do I...?" for step-by-step guides</li>
                <li>• Ask about compliance or legal requirements</li>
                <li>• "What does [feature] do?"</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="relative flex flex-col items-end gap-3">
          {/* Floating tip bubble */}
          {showBubble && (
           <div className="bg-white border-2 border-primary rounded-2xl px-4 py-3 shadow-lg max-w-xs animate-bounce" style={{ animationDuration: '3s' }}>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 text-primary shrink-0 mt-0.5">
                  <PremisoBotIcon />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">💡 {getFlourish('tips')}</p>
                  <p className="text-xs text-muted-foreground mt-1.5">{getContextHints()[0]?.hint || 'Ask me about compliance, features, or best practices'}</p>
                </div>
              </div>
              {/* Bubble tail */}
              <div className="absolute bottom-0 right-0 transform translate-x-3 translate-y-full w-0 h-0 border-l-8 border-t-8 border-l-transparent border-t-white border-r-8 border-r-transparent"></div>
            </div>
          )}
          
          {/* Bot button */}
          <Button
            onClick={() => setOpen(true)}
            className="rounded-full shadow-lg h-14 w-14 p-0 bg-primary hover:bg-primary/90"
          >
            <PremisoBotIcon />
          </Button>
        </div>
      )}
    </div>
  );
}