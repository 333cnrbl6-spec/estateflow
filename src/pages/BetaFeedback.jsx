import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, MessageSquare, Star, ThumbsUp } from 'lucide-react';

const BRAND = { navy: '#0A1E3F', blue: '#007BFF', orange: '#FF7A00' };

export default function BetaFeedback() {
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const categories = ['Usability', 'Performance', 'Features', 'Compliance', 'Reporting', 'Other'];

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#f8faff' }}>
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#e8f5e9' }}>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: BRAND.navy }}>Thank You!</h2>
          <p className="text-sm text-slate-600 mb-6">Your feedback has been submitted. It helps shape the next generation of SynergyFlow Group tools.</p>
          <Button onClick={() => setSubmitted(false)} style={{ background: BRAND.blue, color: '#fff' }}>Submit More Feedback</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ background: '#f8faff', fontFamily: 'Poppins, Inter, sans-serif' }}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: BRAND.navy }}>Premiso BETA Feedback</h1>
          <p className="text-sm text-slate-600">Thank you for participating in the Premiso BETA programme. Your insights help shape the next generation of SynergyFlow Group tools.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8" style={{ border: '1px solid #e8eef8' }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-semibold mb-3" style={{ color: BRAND.navy }}>Overall Experience</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} type="button" onClick={() => setRating(n)}
                    className="w-10 h-10 rounded-lg flex items-center justify-center transition-all"
                    style={{ background: rating >= n ? BRAND.orange : '#f1f5f9', color: rating >= n ? '#fff' : '#94a3b8' }}>
                    <Star className="w-5 h-5" fill={rating >= n ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold mb-3" style={{ color: BRAND.navy }}>What would you like to share?</label>
              <div className="flex flex-wrap gap-2">
                {['Usability feedback', 'Workflow issues', 'Feature requests', 'Performance concerns', 'Suggestions for improvement'].map(c => (
                  <button key={c} type="button" onClick={() => setCategory(c)}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                    style={category === c
                      ? { background: BRAND.blue, color: '#fff' }
                      : { background: '#f1f5f9', color: '#374151', border: '1px solid #e2e8f0' }}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: BRAND.navy }}>Your Feedback</label>
              <Textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Describe your experience, any issues encountered, or features you'd like to see..."
                className="min-h-[140px]"
                required
              />
            </div>

            <Button type="submit" className="w-full py-3 font-bold text-white" style={{ background: BRAND.blue }}>
              <ThumbsUp className="w-4 h-4 mr-2" /> Submit Feedback
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}