import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import OnboardingStep1Coverage from '@/components/onboarding/OnboardingStep1Coverage';
import OnboardingStep2Contacts from '@/components/onboarding/OnboardingStep2Contacts';
import OnboardingStep3ServiceTier from '@/components/onboarding/OnboardingStep3ServiceTier';
import OnboardingStep4Review from '@/components/onboarding/OnboardingStep4Review';

const STEPS = [
  {
    id: 1,
    title: 'Coverage Hours',
    description: 'Define when you need out-of-hours support',
  },
  {
    id: 2,
    title: 'Escalation Contacts',
    description: 'Who should handle urgent situations',
  },
  {
    id: 3,
    title: 'Service Tier',
    description: 'Choose your support level',
  },
  {
    id: 4,
    title: 'Review & Confirm',
    description: 'Confirm your settings',
  },
];

export default function OutOfHoursOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: '',
    // Step 1: Coverage
    coverageStartTime: '18:00',
    coverageEndTime: '08:00',
    coverageDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    holidaysCovered: true,
    // Step 2: Contacts
    primaryContact: {
      name: '',
      phone: '',
      email: '',
      role: '',
    },
    secondaryContact: {
      name: '',
      phone: '',
      email: '',
      role: '',
    },
    emergencyContactPhone: '',
    // Step 3: Service Tier
    selectedTier: 'standard',
    billingCycle: 'monthly',
  });

  const updateFormData = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    // Here you would submit the formData to your backend
    console.log('Onboarding complete:', formData);
    // Redirect to dashboard or confirmation page
  };

  const progressPercent = (currentStep / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-serif mb-2 text-foreground">
            Welcome to EstateFlow
          </h1>
          <p className="text-lg text-muted-foreground">
            Let's set up your out-of-hours support in just a few minutes
          </p>
        </div>

        {/* Progress Bar */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">
                  Step {currentStep} of {STEPS.length}
                </span>
                <span className="text-sm text-muted-foreground">{Math.round(progressPercent)}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Step Indicators */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {STEPS.map((step, idx) => (
            <div key={step.id} className="relative">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                  currentStep === step.id
                    ? 'border-primary bg-primary text-primary-foreground'
                    : currentStep > step.id
                      ? 'border-green-600 bg-green-600 text-white'
                      : 'border-muted bg-muted text-muted-foreground'
                }`}
              >
                {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
              </div>
              <div className="mt-2 text-center">
                <p className="text-xs font-semibold text-foreground hidden sm:block">{step.title}</p>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={`absolute left-10 -right-4 top-5 h-0.5 -z-10 ${
                    currentStep > step.id ? 'bg-green-600' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Form Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
            <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep === 1 && (
              <OnboardingStep1Coverage formData={formData} updateFormData={updateFormData} />
            )}
            {currentStep === 2 && (
              <OnboardingStep2Contacts formData={formData} updateFormData={updateFormData} />
            )}
            {currentStep === 3 && (
              <OnboardingStep3ServiceTier formData={formData} updateFormData={updateFormData} />
            )}
            {currentStep === 4 && <OnboardingStep4Review formData={formData} />}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-4">
          <Button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="text-sm text-muted-foreground text-center flex-1">
            Step {currentStep} of {STEPS.length}
          </div>

          {currentStep < STEPS.length ? (
            <Button onClick={handleNext} className="flex items-center gap-2">
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
              <Check className="w-4 h-4" />
              Complete Setup
            </Button>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-8 p-4 bg-secondary/50 rounded-lg text-center text-sm text-muted-foreground">
          Need help? Contact our onboarding team at <span className="font-semibold">support@estateflow.co.uk</span>
        </div>
      </div>
    </div>
  );
}