import { useEffect, useRef } from 'react';
import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

// Inject custom styles once
let stylesInjected = false;
function injectTourStyles() {
  if (stylesInjected || typeof document === 'undefined') return;
  stylesInjected = true;
  const style = document.createElement('style');
  style.textContent = `
    .shepherd-modal-overlay-container { z-index: 9000; }
    .shepherd-element { z-index: 9100; border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.25); max-width: 360px; }
    .shepherd-has-title .shepherd-content .shepherd-header { background: hsl(221,55%,20%); border-radius: 12px 12px 0 0; padding: 16px 20px 12px; }
    .shepherd-has-title .shepherd-content .shepherd-title { color: #fff; font-size: 15px; font-weight: 700; font-family: 'Inter',sans-serif; letter-spacing: -0.01em; }
    .shepherd-cancel-icon { color: rgba(255,255,255,0.6) !important; }
    .shepherd-cancel-icon:hover { color: #fff !important; }
    .shepherd-text { padding: 16px 20px; font-size: 13.5px; line-height: 1.6; color: #374151; font-family: 'Inter',sans-serif; }
    .shepherd-footer { padding: 0 20px 16px; gap: 8px; display: flex; justify-content: flex-end; }
    .shepherd-button { border-radius: 8px; font-size: 13px; font-weight: 600; padding: 7px 16px; cursor: pointer; transition: all 0.15s; font-family: 'Inter',sans-serif; border: none; }
    .shepherd-button-primary { background: hsl(221,65%,28%); color: #fff; }
    .shepherd-button-primary:hover { background: hsl(221,65%,23%); }
    .shepherd-button-secondary { background: transparent; color: #6b7280; border: 1px solid #e5e7eb !important; }
    .shepherd-button-secondary:hover { background: #f9fafb; color: #374151; }
    .shepherd-arrow:before { background: white; }
    .shepherd-element[data-popper-placement^='bottom'] .shepherd-arrow:before { background: hsl(221,55%,20%); }
  `;
  document.head.appendChild(style);
}

const TOUR_KEY = 'premiso_founder_tour_v1';

const STEPS = [
  {
    id: 'welcome',
    attachTo: { element: '.dashboard-header', on: 'bottom' },
    title: 'Welcome to Premiso',
    text: `You're now part of the Premiso Founder Partner Programme.<br/><br/>
           This quick tour takes about 2 minutes and covers the three areas
           you'll use most: your <strong>dashboard</strong>,
           <strong>compliance tracking</strong>, and <strong>document generation</strong>.`,
    buttons: ['skip', 'next'],
  },
  {
    id: 'dashboard-kpis',
    attachTo: { element: '.portfolio-kpis', on: 'bottom' },
    title: 'Portfolio at a Glance',
    text: `Your top-line numbers live here — properties, units, occupancy, rent
           collection, and open maintenance. These update in real time as you add data.`,
    buttons: ['back', 'next'],
  },
  {
    id: 'smart-alerts',
    attachTo: { element: '.compliance-alerts-widget', on: 'top' },
    title: 'Smart Compliance Alerts',
    text: `Premiso watches your compliance calendar for you. Gas certs, EICRs, EPCs,
           HMO licences — you'll see amber warnings 90 days before expiry and red
           alerts when action is urgent. <strong>Nothing slips through.</strong>`,
    buttons: ['back', 'next'],
  },
  {
    id: 'nav-compliance',
    attachTo: { element: '[href="/compliance-hub"]', on: 'right' },
    title: 'Compliance Hub',
    text: `The Compliance Hub gives you a full RAG (Red / Amber / Green) view across
           every property and every certificate type. Filter by property, sort by
           urgency, and take action from one screen.`,
    buttons: ['back', 'next'],
  },
  {
    id: 'nav-certificates',
    attachTo: { element: '[href="/certificate-management"]', on: 'right' },
    title: 'Certificate Management',
    text: `Upload gas certs, EICRs, fire risk assessments, and EPCs here. Premiso
           reads the expiry date automatically and sets the alert for you. You can
           also bulk-upload to catch up on your whole portfolio in one go.`,
    buttons: ['back', 'next'],
  },
  {
    id: 'nav-documents',
    attachTo: { element: '[href="/document-templates"]', on: 'right' },
    title: 'Document Templates',
    text: `Build a library of templated letters, notices, and agreements. Every
           template can be populated with live tenant, property, and date data —
           no copy-pasting.`,
    buttons: ['back', 'next'],
  },
  {
    id: 'nav-doc-automation',
    attachTo: { element: '[href="/document-automation"]', on: 'right' },
    title: 'AI Document Generation',
    text: `Need a Section 21, tenancy agreement, or inspection report? Our AI drafter
           generates legally compliant UK documents in seconds, pre-filled with your
           property and tenant data. <strong>Review, edit, download, send.</strong>`,
    buttons: ['back', 'next'],
  },
  {
    id: 'nav-tenants',
    attachTo: { element: '[href="/tenants"]', on: 'right' },
    title: 'Tenant Management',
    text: `Add tenants, track tenancy dates, manage deposits, run Right-to-Rent checks,
           and screen applicants — all linked automatically to the right property and unit.`,
    buttons: ['back', 'next'],
  },
  {
    id: 'nav-maintenance',
    attachTo: { element: '[href="/maintenance"]', on: 'right' },
    title: 'Maintenance & Contractors',
    text: `Log jobs, assign contractors, track progress, and close tickets. Tenants
           can submit requests through their own portal, and you get notified instantly.`,
    buttons: ['back', 'next'],
  },
  {
    id: 'finish',
    attachTo: { element: '.dashboard-header', on: 'bottom' },
    title: "You're all set.",
    text: `That's the core of Premiso. You can restart this tour anytime from the
           <strong>Help menu</strong> in the top bar.<br/><br/>
           As a Founder Partner, your feedback shapes what we build next. Hit us up
           any time — we're here.`,
    buttons: ['back', 'done'],
  },
];

function buildButton(type, tour) {
  if (type === 'skip') {
    return {
      text: 'Skip tour',
      classes: 'shepherd-button-secondary',
      action() { tour.cancel(); },
    };
  }
  if (type === 'back') {
    return {
      text: '← Back',
      classes: 'shepherd-button-secondary',
      action() { tour.back(); },
    };
  }
  if (type === 'next') {
    return {
      text: 'Next →',
      classes: 'shepherd-button-primary',
      action() { tour.next(); },
    };
  }
  if (type === 'done') {
    return {
      text: 'Start exploring',
      classes: 'shepherd-button-primary',
      action() { tour.complete(); },
    };
  }
}

export function useFounderTour({ enabled = true, forceShow = false } = {}) {
  const tourRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;
    injectTourStyles();
    const alreadySeen = localStorage.getItem(TOUR_KEY);
    if (alreadySeen && !forceShow) return;

    // Small delay so the page has rendered its DOM targets
    const timer = setTimeout(() => {
      const tour = new Shepherd.Tour({
        useModalOverlay: true,
        defaultStepOptions: {
          cancelIcon: { enabled: true },
          classes: 'premiso-tour-step',
          scrollTo: { behavior: 'smooth', block: 'center' },
          modalOverlayOpeningPadding: 8,
          modalOverlayOpeningRadius: 8,
          popperOptions: {
            modifiers: [{ name: 'offset', options: { offset: [0, 16] } }],
          },
        },
      });

      STEPS.forEach((s) => {
        tour.addStep({
          id: s.id,
          // Only attach if the element is present in the DOM
          attachTo: s.attachTo && document.querySelector(s.attachTo.element)
            ? s.attachTo
            : undefined,
          title: s.title,
          text: s.text,
          buttons: s.buttons.map((b) => buildButton(b, tour)),
        });
      });

      tour.on('complete', () => {
        localStorage.setItem(TOUR_KEY, 'true');
      });
      tour.on('cancel', () => {
        localStorage.setItem(TOUR_KEY, 'true');
      });

      tourRef.current = tour;
      tour.start();
    }, 800);

    return () => {
      clearTimeout(timer);
      tourRef.current?.cancel();
    };
  }, [enabled, forceShow]);

  // Expose a manual start function so e.g. a "Restart tour" button can call it
  const startTour = () => {
    localStorage.removeItem(TOUR_KEY);
    tourRef.current?.cancel();
    const newTimer = setTimeout(() => {
      tourRef.current?.start();
    }, 100);
    return () => clearTimeout(newTimer);
  };

  return { startTour };
}

export function clearTourHistory() {
  localStorage.removeItem(TOUR_KEY);
}