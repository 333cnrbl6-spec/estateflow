import React, { useState } from 'react';
import { ChevronDown, TrendingDown, CheckCircle2, AlertCircle } from 'lucide-react';
import { PREMISO_TIERS, COMPETITOR_COSTS, recommendTier } from '@/lib/pricingConfig';

/**
 * Smart subscription recommendation based on demo data
 * Shows recommended tier + detailed competitor cost comparison
 */
export default function SubscriptionRecommendation({ demoData, onChooseTier }) {
  const [expandedTier, setExpandedTier] = useState(null);
  const [showComparison, setShowComparison] = useState(false);

  if (!demoData?.portfolioSize) {
    return null;
  }

  const recommendation = recommendTier(
    demoData.portfolioSize,
    demoData.propertyTypes,
    demoData.currentSoftware,
    demoData.painPoints
  );

  const recommendedTierObj = PREMISO_TIERS.find(t => t.id === recommendation.recommendedTier);

  // Determine competitor scenario
  const unitCount = parseInt(demoData.portfolioSize) || 50;
  let scenarioKey = 'smallPortfolio';
  if (unitCount > 250) scenarioKey = 'largePortfolio';
  else if (unitCount > 50) scenarioKey = 'mediumPortfolio';

  const competitors = COMPETITOR_COSTS[scenarioKey] || {};

  // Calculate annual savings vs competitors
  const premisoCost = recommendedTierObj.annualPrice;
  const savingsCalc = Object.entries(competitors)
    .filter(([k]) => k !== 'note')
    .map(([platform, cost]) => ({
      platform: platform.replace(/_/g, ' ').toUpperCase(),
      cost: cost * 12,
      saving: (cost * 12) - premisoCost,
    }))
    .filter(item => item.cost > 0);

  const avgCompetitorCost = savingsCalc.length > 0
    ? savingsCalc.reduce((sum, item) => sum + item.cost, 0) / savingsCalc.length
    : 0;

  return (
    <div className="space-y-8">
      {/* Recommendation banner */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 rounded-xl p-8">
        <div className="flex items-start gap-4">
          <CheckCircle2 className="w-8 h-8 text-green-600 shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              Recommended: <span className="text-green-700">{recommendedTierObj.name} Tier</span>
            </h3>
            <p className="text-slate-700 text-lg mb-4">{recommendation.reason}</p>
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <p className="text-xs text-slate-500 uppercase font-semibold">Monthly Cost</p>
                <p className="text-3xl font-bold text-green-700">£{recommendedTierObj.monthlyPrice}</p>
                <p className="text-xs text-slate-400 mt-1">Billed annually @ £{recommendedTierObj.annualPrice}/yr</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <p className="text-xs text-slate-500 uppercase font-semibold">What's Included</p>
                <p className="text-sm font-bold text-slate-800 mt-2">{recommendedTierObj.maxUnits || 'Unlimited'} units</p>
                <p className="text-xs text-slate-500">{recommendedTierObj.maxCompanies || 'Unlimited'} companies</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <p className="text-xs text-slate-500 uppercase font-semibold">Annual Savings</p>
                <p className="text-3xl font-bold text-green-700">£{recommendedTierObj.annualSavings}</p>
                <p className="text-xs text-slate-400 mt-1">vs. monthly billing</p>
              </div>
            </div>
            <button onClick={() => onChooseTier?.(recommendedTierObj.id)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold text-lg transition">
              Start {recommendedTierObj.name} Plan →
            </button>
          </div>
        </div>
      </div>

      {/* Competitor cost comparison */}
      <div>
        <button
          onClick={() => setShowComparison(!showComparison)}
          className="flex items-center justify-between w-full mb-4 p-4 bg-slate-100 hover:bg-slate-200 rounded-xl transition">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-amber-600" />
            <h4 className="text-lg font-bold text-slate-900">Competitor Cost Comparison</h4>
            <span className="text-sm bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-semibold">
              Save up to £{Math.max(...savingsCalc.map(s => s.saving))}/yr
            </span>
          </div>
          <ChevronDown className={`w-5 h-5 transition ${showComparison ? 'rotate-180' : ''}`} />
        </button>

        {showComparison && (
          <div className="space-y-3 mb-6">
            {savingsCalc.map((item, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">{item.platform}</p>
                  <p className="text-sm text-slate-500">Annual cost: £{item.cost.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    Save £{item.saving.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500">vs. Premiso</p>
                </div>
              </div>
            ))}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-slate-700">
                <strong>Average competitor cost:</strong> £{Math.round(avgCompetitorCost).toLocaleString()}/yr
              </p>
              <p className="text-sm font-bold text-blue-700 mt-1">
                Premiso saves you £{(avgCompetitorCost - premisoCost).toLocaleString()}/yr on average
              </p>
            </div>
          </div>
        )}
      </div>

      {/* All tier details */}
      <div className="space-y-3">
        <h4 className="text-lg font-bold text-slate-900 mb-4">All Tier Details</h4>
        {PREMISO_TIERS.map((tier) => (
          <div key={tier.id} className={`border-2 rounded-xl overflow-hidden transition ${
            tier.id === recommendation.recommendedTier
              ? 'bg-green-50 border-green-400'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}>
            <button
              onClick={() => setExpandedTier(expandedTier === tier.id ? null : tier.id)}
              className="w-full p-4 flex items-center justify-between hover:bg-opacity-75 transition">
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h5 className="text-lg font-bold text-slate-900">{tier.name}</h5>
                  {tier.id === recommendation.recommendedTier && (
                    <span className="text-xs bg-green-600 text-white px-2 py-1 rounded font-semibold">RECOMMENDED</span>
                  )}
                  {tier.highlight && (
                    <span className="text-xs bg-amber-600 text-white px-2 py-1 rounded font-semibold">MOST POPULAR</span>
                  )}
                </div>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  £{tier.monthlyPrice}<span className="text-sm text-slate-500">/month</span>
                </p>
                <p className="text-sm text-slate-600 mt-1">{tier.description}</p>
              </div>
              <ChevronDown className={`w-5 h-5 text-slate-400 transition shrink-0 ${expandedTier === tier.id ? 'rotate-180' : ''}`} />
            </button>

            {expandedTier === tier.id && (
              <div className="border-t border-slate-200 p-4 bg-slate-50/50 space-y-4">
                <div>
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">For:</p>
                  <div className="flex flex-wrap gap-2">
                    {tier.audience.map((aud, i) => (
                      <span key={i} className="text-sm bg-white border border-slate-200 px-3 py-1 rounded-full">
                        {aud}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">✓ Included:</p>
                  <ul className="space-y-1">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="text-sm text-slate-700 flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {tier.notIncluded && tier.notIncluded.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">✗ Not Included:</p>
                    <ul className="space-y-1">
                      {tier.notIncluded.map((feature, i) => (
                        <li key={i} className="text-sm text-slate-500 flex gap-2">
                          <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <button onClick={() => onChooseTier?.(tier.id)}
                  className={`w-full py-2 rounded-lg font-bold transition ${
                    tier.id === recommendation.recommendedTier
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-slate-200 hover:bg-slate-300 text-slate-900'
                  }`}>
                  Choose {tier.name}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}