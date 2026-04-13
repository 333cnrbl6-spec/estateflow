import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Loader2, Zap, AlertTriangle, CheckCircle2, Upload, X, AlertCircle, Lightbulb, Eye
} from 'lucide-react';

const CATEGORY_COLORS = {
  plumbing: 'bg-blue-100 text-blue-900',
  electrical: 'bg-yellow-100 text-yellow-900',
  structural: 'bg-red-100 text-red-900',
  roofing: 'bg-slate-100 text-slate-900',
  decorating: 'bg-purple-100 text-purple-900',
  landscaping: 'bg-green-100 text-green-900',
  cleaning: 'bg-cyan-100 text-cyan-900',
  fire_safety: 'bg-orange-100 text-orange-900',
  lift: 'bg-indigo-100 text-indigo-900',
  security: 'bg-pink-100 text-pink-900',
  general: 'bg-slate-100 text-slate-900',
  other: 'bg-gray-100 text-gray-900',
};

export default function MaintenanceTriageForm({ onAnalyzed, onCancel }) {
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  const addPhoto = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        // In production, upload to base44 storage
        setPhotos(prev => [...prev, { name: file.name, data: evt.target.result }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const analyzeRequest = async () => {
    if (!description.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('analyzeMaintenanceRequest', {
        description,
        photo_urls: photos.map(p => p.data),
      });
      setAnalysis(res.data.analysis);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (onAnalyzed) {
      onAnalyzed({
        description,
        analysis,
        photos,
      });
    }
  };

  const getPriorityIcon = (priority) => {
    if (priority === 'emergency') return <Zap className="w-4 h-4" />;
    if (priority === 'urgent') return <AlertTriangle className="w-4 h-4" />;
    return <CheckCircle2 className="w-4 h-4" />;
  };

  const getPriorityColor = (priority) => {
    if (priority === 'emergency') return 'bg-red-100 text-red-900 border-red-300';
    if (priority === 'urgent') return 'bg-orange-100 text-orange-900 border-orange-300';
    return 'bg-green-100 text-green-900 border-green-300';
  };

  return (
    <div className="space-y-4">
      {!analysis ? (
        <>
          {/* Description input */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Describe the Issue</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="Describe what's wrong. Include location, what you've noticed, when it started, etc."
              />

              {/* Photo upload */}
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-2">Attach Photos (Optional)</label>
                <label className="flex items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer hover:bg-slate-50 transition">
                  <input type="file" multiple accept="image/*" onChange={addPhoto} className="hidden" />
                  <div className="text-center">
                    <Upload className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Click to upload or drag photos here</p>
                  </div>
                </label>
                {photos.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {photos.map((p, i) => (
                      <div key={i} className="relative group">
                        <img src={p.data} alt="preview" className="w-16 h-16 rounded-lg object-cover border" />
                        <button
                          onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={onCancel}>Cancel</Button>
                <Button onClick={analyzeRequest} disabled={!description.trim() || loading} className="gap-2">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Analyzing…</> : <><Eye className="w-4 h-4" />Get AI Suggestions</>}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {/* AI Analysis Results */}
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-500" /> AI Triage Analysis
                </span>
                <Badge className="bg-slate-100 text-slate-900">{analysis.confidence_score}% confidence</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Priority & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Suggested Priority</p>
                  <Badge className={`gap-1.5 py-1.5 capitalize ${getPriorityColor(analysis.priority)}`}>
                    {getPriorityIcon(analysis.priority)}
                    {analysis.priority}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-2">{analysis.urgency_reason}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Suggested Category</p>
                  <Badge className={`capitalize ${CATEGORY_COLORS[analysis.category]}`}>{analysis.category}</Badge>
                  <p className="text-xs text-muted-foreground mt-2">{analysis.estimated_response_time}</p>
                </div>
              </div>

              {/* Safety Risks */}
              {analysis.safety_risks && analysis.safety_risks.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>
                    <p className="font-semibold mb-1">Safety Risks Identified:</p>
                    <ul className="text-xs space-y-1">
                      {analysis.safety_risks.map((risk, i) => (
                        <li key={i}>• {risk}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* First Response Actions */}
              {analysis.first_response_actions && analysis.first_response_actions.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-blue-900 mb-2">Recommended Immediate Actions for Tenant:</p>
                  <ul className="text-xs space-y-1 text-blue-800">
                    {analysis.first_response_actions.map((action, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">{i + 1}.</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Contractor Needs */}
              {analysis.contractor_specialties_needed && analysis.contractor_specialties_needed.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Contractor Specialties Needed</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {analysis.contractor_specialties_needed.map((spec, i) => (
                      <Badge key={i} variant="secondary" className="text-xs capitalize">{spec}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Clarifying Questions */}
              {analysis.additional_questions && analysis.additional_questions.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-amber-900 mb-2">Follow-up Questions for Tenant:</p>
                  <ul className="text-xs space-y-1 text-amber-800">
                    {analysis.additional_questions.map((q, i) => (
                      <li key={i}>• {q}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end border-t pt-4">
                <Button variant="outline" onClick={() => setAnalysis(null)}>Back to Edit</Button>
                <Button onClick={handleConfirm} className="gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Proceed with These Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}