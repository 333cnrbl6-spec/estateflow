/**
 * DemoDataEnrichment
 * Optional file-drop step in the demo wizard — prospects can upload rent rolls,
 * tenancy lists, etc. to make the demo more realistic. All uploads are captured
 * as marketing intelligence for Premiso's sales team.
 */
import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Upload, FileText, X, CheckCircle2, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ACCEPTED_TYPES = [
  { label: 'Rent roll / tenancy list', hint: 'CSV, Excel or PDF' },
  { label: 'Property portfolio list', hint: 'Any format' },
  { label: 'Current software export', hint: 'Reapit, Jupix, etc.' },
  { label: 'Service charge schedules', hint: 'PDF or Excel' },
];

export default function DemoDataEnrichment({ onFilesChange }) {
  const [expanded, setExpanded] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef();

  const uploadFile = async (file) => {
    const entry = { name: file.name, size: file.size, status: 'uploading', url: null };
    setFiles(prev => [...prev, entry]);
    try {
      const res = await base44.integrations.Core.UploadFile({ file });
      const updated = { ...entry, status: 'done', url: res.file_url };
      setFiles(prev => {
        const next = prev.map(f => f.name === file.name && f.status === 'uploading' ? updated : f);
        onFilesChange?.(next.filter(f => f.status === 'done').map(f => ({ name: f.name, url: f.url })));
        return next;
      });
    } catch {
      setFiles(prev => prev.map(f => f.name === file.name && f.status === 'uploading' ? { ...f, status: 'error' } : f));
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files);
    setUploading(true);
    await Promise.all(dropped.map(uploadFile));
    setUploading(false);
  };

  const handleInput = async (e) => {
    const picked = Array.from(e.target.files);
    if (!picked.length) return;
    setUploading(true);
    await Promise.all(picked.map(uploadFile));
    setUploading(false);
    e.target.value = '';
  };

  const removeFile = (name) => {
    setFiles(prev => {
      const next = prev.filter(f => f.name !== name);
      onFilesChange?.(next.filter(f => f.status === 'done').map(f => ({ name: f.name, url: f.url })));
      return next;
    });
  };

  return (
    <div className="border-2 border-dashed rounded-xl overflow-hidden">
      {/* Toggle header */}
      <button
        type="button"
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors text-sm"
      >
        <span className="flex items-center gap-2 text-slate-600 font-medium">
          <Upload className="w-4 h-4 text-slate-400" />
          Optionally upload your data for a more realistic demo
          {files.filter(f => f.status === 'done').length > 0 && (
            <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-semibold">
              {files.filter(f => f.status === 'done').length} file{files.filter(f => f.status === 'done').length !== 1 ? 's' : ''} added
            </span>
          )}
        </span>
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t bg-slate-50/50">
          {/* What to upload */}
          <div className="grid grid-cols-2 gap-1.5 mt-3">
            {ACCEPTED_TYPES.map(t => (
              <div key={t.label} className="text-xs text-slate-500 flex items-start gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span><span className="font-medium text-slate-700">{t.label}</span> — {t.hint}</span>
              </div>
            ))}
          </div>

          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
              dragOver ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-primary/40 bg-white'
            }`}
          >
            <input ref={inputRef} type="file" multiple className="hidden" onChange={handleInput}
              accept=".csv,.xlsx,.xls,.pdf,.doc,.docx" />
            {uploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-1" />
            ) : (
              <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
            )}
            <p className="text-sm text-slate-600 font-medium">Drop files here or click to browse</p>
            <p className="text-xs text-slate-400 mt-0.5">CSV, Excel, PDF, Word — max 20MB each</p>
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="space-y-1.5">
              {files.map((f, i) => (
                <div key={i} className={`flex items-center justify-between p-2.5 rounded-lg text-xs border ${
                  f.status === 'done' ? 'bg-green-50 border-green-200' :
                  f.status === 'error' ? 'bg-red-50 border-red-200' :
                  'bg-white border-slate-200'
                }`}>
                  <span className="flex items-center gap-2 min-w-0">
                    {f.status === 'done' ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" /> :
                     f.status === 'error' ? <span className="text-red-500 text-xs shrink-0">✗</span> :
                     <Loader2 className="w-3.5 h-3.5 animate-spin text-primary shrink-0" />}
                    <span className="truncate text-slate-700">{f.name}</span>
                    <span className="text-slate-400 shrink-0">{(f.size / 1024).toFixed(0)}KB</span>
                  </span>
                  <button onClick={() => removeFile(f.name)} className="text-slate-300 hover:text-red-400 ml-2 shrink-0">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-slate-400">
            Files are stored securely and used only to personalise your demo and improve Premiso for businesses like yours.
            By uploading you confirm you have the right to share this data. See our Privacy Policy.
          </p>
        </div>
      )}
    </div>
  );
}