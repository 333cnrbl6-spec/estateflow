import React, { useState } from 'react';
import { ChevronDown, HelpCircle, AlertCircle, CheckCircle2 } from 'lucide-react';

const FAQ_DATA = [
  {
    category: 'Rent & Payments',
    questions: [
      {
        q: 'How do I pay my rent online?',
        a: 'You can pay rent securely via Stripe using the "Pay Rent" section in your tenant portal. Simply select your unit, enter the amount, and follow the payment process. Your payment will be confirmed immediately.',
      },
      {
        q: 'What payment methods do you accept?',
        a: 'We accept all major credit and debit cards (Visa, Mastercard, American Express) through our secure Stripe payment system. You can also set up recurring payments for convenience.',
      },
      {
        q: 'What should I do if my payment fails?',
        a: 'If your payment fails, please try again with a different card or contact your bank to ensure the card is not blocked. If the issue persists, reach out to your property manager directly.',
      },
      {
        q: 'Can I request a rent receipt?',
        a: 'Yes! After making a payment through the portal, a receipt is automatically generated and sent to your email. You can also request receipts from previous payments from your payment history.',
      },
    ],
  },
  {
    category: 'Maintenance & Repairs',
    questions: [
      {
        q: 'How do I report a maintenance issue?',
        a: 'Use the "Maintenance Requests" section in your portal to submit an issue. Provide details, your preferred category, and upload photos if possible. Your property manager will review and assign a contractor.',
      },
      {
        q: 'How long does it take to get repairs done?',
        a: 'Response times depend on the priority level. Standard requests are typically addressed within 5-7 days, while urgent or emergency issues are prioritized within 24 hours.',
      },
      {
        q: 'Can I track the status of my repair request?',
        a: 'Yes! You can view the status of all your maintenance requests in the portal. You\'ll receive SMS notifications when a contractor is assigned and when work is scheduled.',
      },
      {
        q: 'What counts as an emergency maintenance issue?',
        a: 'Emergency issues include gas leaks, electrical hazards, flooding, heating failures in winter, and any safety concerns. These are prioritized immediately.',
      },
    ],
  },
  {
    category: 'Documents & Inspections',
    questions: [
      {
        q: 'Where can I find my tenancy agreement?',
        a: 'Your tenancy agreement and all other important documents are available in the "Documents" section of your portal. You can view and download them at any time.',
      },
      {
        q: 'What should I expect during an inspection?',
        a: 'Inspections typically take 30-60 minutes. Your property manager will check the condition of all rooms, appliances, and fixtures. You\'re welcome to be present. A report will be sent to you afterwards.',
      },
      {
        q: 'How often will my property be inspected?',
        a: 'Standard routine inspections are typically conducted annually, though this may vary based on your tenancy agreement. You\'ll receive at least 24 hours notice before any inspection.',
      },
    ],
  },
  {
    category: 'Communication & Support',
    questions: [
      {
        q: 'How do I contact my property manager?',
        a: 'Use the "Messages" section in your portal to send direct messages to your property manager. For urgent matters, call the emergency hotline number provided in your welcome pack.',
      },
      {
        q: 'What are your business hours?',
        a: 'We\'re available Monday-Friday, 9am-5pm for routine matters. For emergencies outside these hours, please call our 24/7 emergency line.',
      },
      {
        q: 'How do I update my contact information?',
        a: 'Contact your property manager directly with any changes to your phone number, email, or other contact details. This helps us reach you quickly for important matters.',
      },
    ],
  },
];

export default function TenantFAQSection() {
  const [expandedCategory, setExpandedCategory] = useState('Rent & Payments');
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  return (
    <div className="space-y-6">
      {/* FAQ Header */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <HelpCircle className="w-6 h-6 text-primary shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-foreground">Frequently Asked Questions</h3>
            <p className="text-sm text-muted-foreground mt-1">Find answers to common tenant questions and issues</p>
          </div>
        </div>
      </div>

      {/* FAQ Sections */}
      <div className="space-y-4">
        {FAQ_DATA.map((section) => (
          <div key={section.category} className="space-y-2">
            {/* Category Header */}
            <button
              onClick={() => setExpandedCategory(expandedCategory === section.category ? null : section.category)}
              className="w-full flex items-center justify-between p-4 bg-card rounded-lg border border-border hover:bg-muted/50 transition-colors font-semibold text-foreground"
            >
              {section.category}
              <ChevronDown className={`w-5 h-5 transition-transform ${expandedCategory === section.category ? 'rotate-180' : ''}`} />
            </button>

            {/* Questions */}
            {expandedCategory === section.category && (
              <div className="space-y-2 ml-2">
                {section.questions.map((qa, idx) => (
                  <div key={idx} className="rounded-lg border border-border overflow-hidden bg-card">
                    <button
                      onClick={() => setExpandedQuestion(expandedQuestion === `${section.category}-${idx}` ? null : `${section.category}-${idx}`)}
                      className="w-full flex items-start justify-between p-4 hover:bg-muted/50 transition-colors text-left gap-3"
                    >
                      <span className="font-semibold text-foreground text-sm">{qa.q}</span>
                      <ChevronDown className={`w-4 h-4 shrink-0 mt-1 transition-transform ${expandedQuestion === `${section.category}-${idx}` ? 'rotate-180' : ''}`} />
                    </button>

                    {expandedQuestion === `${section.category}-${idx}` && (
                      <div className="px-4 py-3 bg-muted/30 border-t border-border text-sm text-muted-foreground leading-relaxed">
                        {qa.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Support CTA */}
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Can't find what you're looking for?</h4>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Use the "Messages" section to contact your property manager directly, or call our support team for assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}