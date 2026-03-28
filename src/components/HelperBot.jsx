import React, { useState } from 'react';
import { MessageCircle, X, ChevronRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getModuleGuide, getEntityInfo, entityKnowledge } from '@/lib/entity-knowledge-base';
import { useLocation } from 'react-router-dom';

export default function HelperBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('guide'); // 'guide' or 'entities'
  const location = useLocation();

  // Infer module name from current path
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const moduleName = pathSegments[0] 
    ? pathSegments[0].split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')
    : 'Dashboard';

  const moduleGuide = getModuleGuide(moduleName);
  const relatedEntities = moduleGuide.relatedEntities || [];

  return (
    <>
      {/* Floating Bot Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 ${
          isOpen 
            ? 'bg-primary text-primary-foreground shadow-lg' 
            : 'bg-primary text-primary-foreground shadow-md hover:shadow-lg'
        }`}
        title="Get help and guidance"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>

      {/* Helper Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-80 max-h-[500px] rounded-xl shadow-2xl border border-border bg-card animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-sm">Helper Guide</h2>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-0 border-b border-border">
            <button
              onClick={() => setActiveTab('guide')}
              className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                activeTab === 'guide'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              This Module
            </button>
            <button
              onClick={() => setActiveTab('entities')}
              className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                activeTab === 'entities'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Entities
            </button>
          </div>

          {/* Content */}
          <ScrollArea className="h-[400px] p-4">
            {activeTab === 'guide' ? (
              <div className="space-y-4 pr-4">
                {/* Module Title and Description */}
                <div>
                  <h3 className="font-semibold text-sm mb-1">{moduleGuide.title}</h3>
                  <p className="text-xs text-muted-foreground">{moduleGuide.description}</p>
                </div>

                {/* Tips */}
                <div>
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Quick Tips</h4>
                  <ul className="space-y-2">
                    {moduleGuide.tips.map((tip, idx) => (
                      <li key={idx} className="flex gap-2 text-xs">
                        <ChevronRight className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                        <span className="text-foreground/80">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Related Entities */}
                {relatedEntities.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Related Entities</h4>
                    <div className="space-y-1">
                      {relatedEntities.map((entityName) => {
                        const entity = getEntityInfo(entityName);
                        return entity ? (
                          <div key={entityName} className="text-xs p-2 bg-muted/50 rounded-md border border-border/50">
                            <p className="font-medium text-foreground">{entityName}</p>
                            <p className="text-muted-foreground text-[11px]">{entity.description}</p>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2 pr-4">
                <p className="text-xs text-muted-foreground mb-3">
                  Backend entities available in EstateFlow:
                </p>
                {Object.entries(entityKnowledge).map(([name, info]) => (
                  <div key={name} className="text-xs p-2 bg-muted/50 rounded-md border border-border/50 hover:border-primary/30 transition-colors">
                    <p className="font-medium text-foreground">{name}</p>
                    <p className="text-muted-foreground text-[11px] mt-0.5">{info.description}</p>
                    {info.actions && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {info.actions.slice(0, 2).map((action, idx) => (
                          <span key={idx} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                            {action}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          <div className="border-t border-border px-4 py-2 text-center">
            <p className="text-xs text-muted-foreground">💡 Tip: Check back for contextual help</p>
          </div>
        </div>
      )}
    </>
  );
}