import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { X, ChevronRight, ChevronLeft, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Premiso',
    description: 'Your complete property management suite. Let\'s show you around in 60 seconds.',
    target: '.dashboard-header',
    highlight: true
  },
  {
    id: 'companies',
    title: 'Manage Companies',
    description: 'Add and manage all your registered companies. We auto-sync compliance data from Companies House.',
    target: '[href="/companies"]',
    highlight: false
  },
  {
    id: 'compliance',
    title: 'Compliance Dashboard',
    description: 'Track filing deadlines, director changes, and critical alerts in one place.',
    target: '[href="/compliance"]',
    highlight: false
  },
  {
    id: 'alerts',
    title: 'Active Alerts',
    description: 'See upcoming deadlines and compliance issues at a glance. You\'ll get email digests too.',
    target: '.compliance-alerts-widget',
    highlight: true
  },
  {
    id: 'done',
    title: 'You\'re All Set!',
    description: 'Explore at your own pace. Visit Help (?) anytime for more guidance.',
    target: null,
    highlight: true
  }
];

export default function DashboardTutorial({ onComplete }) {
  const [step, setStep] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [visible, setVisible] = useState(true);
  const currentStep = TUTORIAL_STEPS[step];

  useEffect(() => {
    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [step]);

  const updatePosition = () => {
    if (!currentStep.target) return;

    const element = document.querySelector(currentStep.target);
    if (!element) return;

    const rect = element.getBoundingClientRect();
    setPosition({
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
      height: rect.height
    });
  };

  const handleNext = () => {
    if (step < TUTORIAL_STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      setVisible(false);
      // Mark tutorial as completed
      localStorage.setItem('premiso_tutorial_completed', 'true');
      onComplete?.();
    }
  };

  const handlePrev = () => {
    if (step > 0) setStep(s => s - 1);
  };

  const handleClose = () => {
    setVisible(false);
    localStorage.setItem('premiso_tutorial_completed', 'true');
    onComplete?.();
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Overlay with highlight */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40 pointer-events-none"
            style={{
              clipPath: currentStep.highlight && position.top 
                ? `polygon(0% 0%, 0% 100%, 100% 100%, 100% 0%, 0% 0%, 
                    ${position.left - 8}px ${position.top - 8}px, 
                    ${position.left - 8}px ${position.top + position.height + 8}px, 
                    ${position.left + position.width + 8}px ${position.top + position.height + 8}px, 
                    ${position.left + position.width + 8}px ${position.top - 8}px, 
                    ${position.left - 8}px ${position.top - 8}px)`
                : 'none'
            }}
          />

          {/* Highlight box */}
          {currentStep.highlight && position.top && (
            <motion.div
              key={`highlight-${step}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed border-2 border-primary/50 rounded-lg pointer-events-none z-40"
              style={{
                top: position.top - 8,
                left: position.left - 8,
                width: position.width + 16,
                height: position.height + 16,
                boxShadow: '0 0 30px rgba(34, 31, 46, 0.5)'
              }}
            />
          )}

          {/* Tooltip */}
          <motion.div
            key={`tooltip-${step}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed bg-white rounded-xl shadow-2xl p-6 z-50 max-w-xs"
            style={{
              top: Math.max(20, position.top ? position.top - 150 : 100),
              left: Math.max(20, Math.min(position.left || 50, window.innerWidth - 360))
            }}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="bg-primary/10 p-2 rounded-lg shrink-0">
                <Lightbulb className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900">{currentStep.title}</h3>
                <p className="text-sm text-slate-600 mt-1">{currentStep.description}</p>
              </div>
              <button
                onClick={handleClose}
                className="text-slate-400 hover:text-slate-600 shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Progress */}
            <div className="flex gap-1 mb-4">
              {TUTORIAL_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    i === step ? 'bg-primary' : i < step ? 'bg-primary/50' : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex gap-2">
              {step > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrev}
                  className="gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Back
                </Button>
              )}
              <div className="flex-1" />
              <Button
                variant="outline"
                size="sm"
                onClick={handleClose}
              >
                Skip
              </Button>
              <Button
                size="sm"
                onClick={handleNext}
                className="gap-1"
              >
                {step === TUTORIAL_STEPS.length - 1 ? 'Done' : 'Next'}
                {step < TUTORIAL_STEPS.length - 1 && <ChevronRight className="w-3.5 h-3.5" />}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}