import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Home, X, Send, Sparkles, Lightbulb, BookOpen, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { APP_KNOWLEDGE, getModuleByRoute, searchKnowledge } from "@/lib/app-knowledge";

// Get current module from URL
function getCurrentModule() {
  const path = window.location.pathname;
  const modulePath = path.split('/').filter(p => p)[0] || 'dashboard';
  return modulePath.toLowerCase();
}

// Get module-specific help
function getModuleHelp(moduleName) {
  return APP_KNOWLEDGE.modules[moduleName] || APP_KNOWLEDGE.modules.dashboard;
}

export default function HelperBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const scrollRef = useRef(null);

  const currentModule = getCurrentModule();
  const moduleInfo = getModuleHelp(currentModule);

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = {
        role: "assistant",
        content: `Hello! I'm your Premiso assistant. I can help you navigate the ${moduleInfo.name} module or answer any questions about the platform. What would you like to do today?`,
        timestamp: new Date(),
        isWelcome: true
      };
      setMessages([welcomeMessage]);
      updateSuggestions();
    }
  }, [isOpen]);

  // Update suggestions when module changes
  useEffect(() => {
    if (isOpen) {
      updateSuggestions();
    }
  }, [currentModule]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const updateSuggestions = () => {
    const moduleSuggestions = moduleInfo?.suggestions || [];
    const commonTasks = APP_KNOWLEDGE.commonTasks
      .filter(t => !moduleSuggestions.some(s => s.toLowerCase().includes(t.task.toLowerCase())))
      .slice(0, 3)
      .map(t => t.task);
    setSuggestions([...moduleSuggestions.slice(0, 3), ...commonTasks]);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: "user",
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Search knowledge base first
      const searchResults = searchKnowledge(input.trim());
      
      // Use AI to generate response with search context
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a helpful assistant for Premiso, a comprehensive UK property management platform.

CURRENT CONTEXT:
- User is viewing: ${moduleInfo.name} module
- Module description: ${moduleInfo.description}
- Module features: ${moduleInfo.features.join(', ')}

RELEVANT KNOWLEDGE FOUND:
${searchResults.modules.length > 0 ? `\nRelated Modules:\n${searchResults.modules.map(m => `- ${m.name}: ${m.description}`).join('\n')}` : ''}
${searchResults.faqs.length > 0 ? `\nRelevant FAQs:\n${searchResults.faqs.map(f => `Q: ${f.question}\nA: ${f.answer}`).join('\n')}` : ''}
${searchResults.tasks.length > 0 ? `\nRelated Tasks:\n${searchResults.tasks.map(t => `- ${t.task} → ${t.action}`).join('\n')}` : ''}

ALL AVAILABLE MODULES:
${Object.entries(APP_KNOWLEDGE.modules).map(([key, mod]) => `- ${mod.name} (${mod.route}): ${mod.description}`).join('\n')}

COMMON TASKS:
${APP_KNOWLEDGE.commonTasks.map(t => `- ${t.task} → Go to: ${t.action}`).join('\n')}

USER QUESTION: "${input.trim()}"

INSTRUCTIONS:
1. Provide a clear, helpful answer
2. If the question matches a FAQ, use that answer
3. If asking about a module, explain its features and provide the route
4. If asking how to do something, provide step-by-step guidance
5. Always mention which module/route to use for specific tasks
6. Be friendly, professional, and concise
7. Suggest related actions if relevant

ANSWER:`,
        model: "gpt_5_mini",
        add_context_from_internet: false
      });

      // Check if we should suggest navigation
      const shouldSuggestNavigation = searchResults.tasks.length > 0 || searchResults.modules.length > 0;
      
      const assistantMessage = {
        role: "assistant",
        content: response,
        timestamp: new Date(),
        suggestedActions: shouldSuggestNavigation ? [
          ...searchResults.tasks.slice(0, 2).map(t => ({ label: t.task, action: t.action })),
          ...searchResults.modules.slice(0, 1).map(m => ({ label: `Go to ${m.name}`, action: m.route }))
        ] : []
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Bot error:', error);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I apologize, but I'm having trouble processing your request right now. Please try again or contact support for assistance.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
  };

  const handleQuickAction = (action) => {
    window.location.href = action;
  };

  return (
    <>
      {/* Floating House Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110",
          isOpen 
            ? "bg-primary text-primary-foreground rotate-0" 
            : "bg-gradient-to-br from-blue-600 to-blue-700 text-white hover:shadow-xl"
        )}
        style={{
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)"
        }}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Home className="w-6 h-6" />
        )}
        {/* Pulse effect */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-20 right-6 z-50 w-96 max-h-[600px] flex flex-col shadow-2xl border-2 border-blue-200">
          {/* Header */}
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                <CardTitle className="text-lg">Premiso Assistant</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-blue-100 mt-1">
              Currently viewing: {moduleInfo.name}
            </p>
          </CardHeader>

          {/* Suggestions */}
          <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-3 h-3 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">Quick Suggestions</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {suggestions.map((suggestion, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 bg-white hover:bg-blue-50 border-blue-200"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <ScrollArea ref={scrollRef} className="flex-1 p-4 min-h-[300px]">
            <div className="space-y-4">
              {messages.map((message, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex gap-2",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                      message.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-900"
                    )}
                  >
                    {message.isWelcome && (
                      <div className="flex items-center gap-2 mb-2 text-blue-600">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-xs font-semibold">Welcome to Premiso Assistant</span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    
                    {/* Suggested Actions */}
                    {message.suggestedActions && message.suggestedActions.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <p className="text-xs font-medium text-gray-600">Quick Actions:</p>
                        <div className="flex flex-wrap gap-1">
                          {message.suggestedActions.map((action, idx) => (
                            <Button
                              key={idx}
                              variant="outline"
                              size="sm"
                              className="text-xs h-7 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
                              onClick={() => handleQuickAction(action.action)}
                            >
                              <MessageSquare className="w-3 h-3 mr-1" />
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <p className={cn(
                      "text-xs mt-1",
                      message.role === "user" ? "text-blue-100" : "text-gray-500"
                    )}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2 justify-start">
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
                  </div>
                  <div className="bg-gray-100 rounded-lg px-3 py-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Module-Specific Help */}
          <div className="px-4 py-2 border-t bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-3 h-3 text-blue-600" />
              <span className="text-xs font-semibold text-blue-800">
                {moduleInfo.name} Tips
              </span>
            </div>
            <p className="text-xs text-blue-700 mb-2">{moduleInfo.description}</p>
            <div className="flex flex-wrap gap-1">
              {moduleInfo.suggestions?.slice(0, 3).map((suggestion, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 bg-white hover:bg-blue-50 border-blue-200"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>

          {/* Input */}
          <CardContent className="p-3 border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1 text-sm"
                disabled={isLoading}
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}