import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, Upload, X, AlertCircle, CheckCircle2 } from 'lucide-react';

const ISSUE_TYPES = [
  'structural', 'electrical', 'plumbing', 'heating', 'decoration',
  'safety', 'pest', 'damp_mould', 'other'
];

const SEVERITIES = ['low', 'medium', 'high', 'critical'];

export default function InspectionReportForm({ propertyId, unitId, onReportSubmitted }) {
  const [overallCondition, setOverallCondition] = useState('good');
  const [inspectionType, setInspectionType] = useState('routine');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [findings, setFindings] = useState([]);
  const [newFinding, setNewFinding] = useState({
    issue_type: 'other',
    description: '',
    severity: 'medium',
    location: '',
    photo_urls: [],
    requires_maintenance: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setPhotos(prev => [...prev, { url: result.file_url, caption: file.name }]);
      setMessage('Photo uploaded successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const addFinding = () => {
    if (!newFinding.description || !newFinding.location) {
      setMessage('Please fill in description and location');
      return;
    }
    setFindings(prev => [...prev, { ...newFinding }]);
    setNewFinding({
      issue_type: 'other',
      description: '',
      severity: 'medium',
      location: '',
      photo_urls: [],
      requires_maintenance: false,
    });
    setMessage('Finding added');
    setTimeout(() => setMessage(''), 2000);
  };

  const removeFinding = (idx) => {
    setFindings(prev => prev.filter((_, i) => i !== idx));
  };

  const submitReport = async () => {
    if (!propertyId || !unitId) {
      setMessage('Property and unit required');
      return;
    }

    setSubmitting(true);
    try {
      const report = await base44.entities.InspectionReport.create({
        property_id: propertyId,
        unit_id: unitId,
        inspector_id: 'current_user_id',
        inspector_name: 'Inspector',
        inspection_date: new Date().toISOString(),
        inspection_type: inspectionType,
        overall_condition: overallCondition,
        findings: findings,
        photos: photos,
        notes: notes,
        status: 'submitted',
        submitted_date: new Date().toISOString(),
      });

      setMessage('Report submitted successfully');
      if (onReportSubmitted) onReportSubmitted(report);

      // Reset form
      setFindings([]);
      setPhotos([]);
      setNotes('');
      setNewFinding({
        issue_type: 'other',
        description: '',
        severity: 'medium',
        location: '',
        photo_urls: [],
        requires_maintenance: false,
      });
    } catch (error) {
      setMessage(`Submission failed: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Property Inspection Report</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Document site conditions and flag maintenance issues</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* General Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Inspection Type</label>
              <select
                value={inspectionType}
                onChange={e => setInspectionType(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
              >
                {['routine', 'pre_tenancy', 'post_tenancy', 'complaint', 'safety'].map(t => (
                  <option key={t} value={t}>{t.replace(/_/g, ' ').toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Overall Condition</label>
              <select
                value={overallCondition}
                onChange={e => setOverallCondition(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
              >
                {['excellent', 'good', 'fair', 'poor', 'critical'].map(c => (
                  <option key={c} value={c}>{c.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Photos */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-2">Upload Photos</label>
            <div className="border-2 border-dashed rounded-lg p-4">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={uploading}
                className="hidden"
                id="photo-input"
              />
              <label htmlFor="photo-input" className="flex items-center justify-center cursor-pointer">
                {uploading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Upload className="w-4 h-4" /> Click to upload photos
                  </div>
                )}
              </label>
            </div>
            {photos.length > 0 && (
              <div className="mt-2 grid grid-cols-3 gap-2">
                {photos.map((photo, i) => (
                  <div key={i} className="relative group">
                    <img src={photo.url} alt="inspection" className="w-full h-24 object-cover rounded" />
                    <button
                      onClick={() => setPhotos(prev => prev.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Finding */}
          <div className="border rounded-lg p-4 bg-slate-50">
            <p className="text-sm font-semibold mb-3">Add a Finding</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs font-semibold">Issue Type</label>
                <select
                  value={newFinding.issue_type}
                  onChange={e => setNewFinding(prev => ({ ...prev, issue_type: e.target.value }))}
                  className="w-full mt-1 px-2 py-1.5 border rounded text-sm"
                >
                  {ISSUE_TYPES.map(t => (
                    <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold">Severity</label>
                <select
                  value={newFinding.severity}
                  onChange={e => setNewFinding(prev => ({ ...prev, severity: e.target.value }))}
                  className="w-full mt-1 px-2 py-1.5 border rounded text-sm"
                >
                  {SEVERITIES.map(s => (
                    <option key={s} value={s}>{s.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>
            <input
              type="text"
              placeholder="Location (e.g., Kitchen, Bedroom)"
              value={newFinding.location}
              onChange={e => setNewFinding(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-2 py-1.5 border rounded text-sm mb-2"
            />
            <textarea
              placeholder="Describe the issue..."
              value={newFinding.description}
              onChange={e => setNewFinding(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-2 py-1.5 border rounded text-sm mb-2 h-20"
            />
            <label className="flex items-center gap-2 text-sm mb-3">
              <input
                type="checkbox"
                checked={newFinding.requires_maintenance}
                onChange={e => setNewFinding(prev => ({ ...prev, requires_maintenance: e.target.checked }))}
              />
              <span>Requires maintenance action</span>
            </label>
            <Button size="sm" onClick={addFinding} className="w-full">
              Add Finding
            </Button>
          </div>

          {/* Findings List */}
          {findings.length > 0 && (
            <div>
              <p className="text-sm font-semibold mb-2">Findings ({findings.length})</p>
              <div className="space-y-2">
                {findings.map((finding, idx) => (
                  <div key={idx} className="border rounded p-3 bg-blue-50">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="text-sm font-medium">{finding.location}</p>
                        <p className="text-xs text-muted-foreground">{finding.issue_type}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={finding.severity === 'critical' ? 'destructive' : 'outline'}>
                          {finding.severity}
                        </Badge>
                        {finding.requires_maintenance && <Badge className="bg-amber-600">Maintenance</Badge>}
                        <button onClick={() => removeFinding(idx)} className="text-red-600 hover:text-red-700">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-slate-700">{finding.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Additional Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any additional observations..."
              className="w-full mt-1 px-3 py-2 border rounded-md text-sm h-20"
            />
          </div>

          {/* Messages */}
          {message && (
            <div className={`p-3 rounded text-sm flex items-center gap-2 ${
              message.includes('failed') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
            }`}>
              {message.includes('failed') ? (
                <AlertCircle className="w-4 h-4" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              {message}
            </div>
          )}

          {/* Submit */}
          <Button
            onClick={submitReport}
            disabled={submitting || findings.length === 0}
            className="w-full gap-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Submit Inspection Report
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}