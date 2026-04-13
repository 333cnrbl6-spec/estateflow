import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Upload, FileText, FileSpreadsheet, File, X, Loader2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FILE_ICONS = {
  'application/pdf': <FileText className="w-5 h-5 text-red-500" />,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': <FileSpreadsheet className="w-5 h-5 text-green-600" />,
  'application/vnd.ms-excel': <FileSpreadsheet className="w-5 h-5 text-green-600" />,
  'text/csv': <FileSpreadsheet className="w-5 h-5 text-green-600" />,
};

const CLASSIFY_SCHEMA = {
  type: 'object',
  properties: {
    document_type: { type: 'string', enum: ['tenancy_agreement','property_list','tenant_list','landlord_list','rent_ledger','bank_statement','invoice','contractor_list','maintenance_history','company_document','unknown'] },
    confidence: { type: 'number' },
    summary: { type: 'string' },
    detected_records: { type: 'array', items: { type: 'object' } },
    suggested_entity: { type: 'string' },
    key_fields: { type: 'array', items: { type: 'string' } },
  },
};

function FileItem({ item, onRemove }) {
  const icon = FILE_ICONS[item.file.type] || <File className="w-5 h-5 text-slate-400" />;
  return (
    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border group">
      <div className="shrink-0 mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-slate-800 truncate">{item.file.name}</p>
          <button onClick={() => onRemove(item.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
            <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground">{(item.file.size / 1024).toFixed(0)} KB</p>

        {item.status === 'uploading' && (
          <div className="flex items-center gap-1 mt-1 text-xs text-blue-600">
            <Loader2 className="w-3 h-3 animate-spin" /> Uploading…
          </div>
        )}
        {item.status === 'classifying' && (
          <div className="flex items-center gap-1 mt-1 text-xs text-violet-600">
            <Sparkles className="w-3 h-3 animate-pulse" /> AI classifying…
          </div>
        )}
        {item.status === 'done' && item.classification && (
          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              <span className="text-xs font-semibold text-green-700 capitalize">
                {item.classification.document_type?.replace(/_/g, ' ')}
              </span>
              <span className="text-xs text-muted-foreground">
                ({Math.round((item.classification.confidence || 0) * 100)}% confidence)
              </span>
            </div>
            <p className="text-xs text-slate-600">{item.classification.summary}</p>
            {item.classification.key_fields?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {item.classification.key_fields.slice(0, 6).map(f => (
                  <span key={f} className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{f}</span>
                ))}
              </div>
            )}
          </div>
        )}
        {item.status === 'error' && (
          <div className="flex items-center gap-1 mt-1 text-xs text-red-500">
            <AlertCircle className="w-3 h-3" /> {item.error}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SmartDropZone({ onFilesClassified, hint }) {
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const processFile = async (file) => {
    const id = Math.random().toString(36).slice(2);
    const item = { id, file, status: 'uploading', classification: null };
    setFiles(prev => [...prev, item]);

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'classifying' } : f));

      const classification = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a UK property management data expert. Analyse this file and classify it. Extract key records if possible (up to 10 sample rows). File name: "${file.name}". Identify: document type, summary of contents, key column/field names present, and what Premiso entity this maps to (Property, Tenant, Landlord/Contact, FinancialTransaction, MaintenanceOrder, Company, or unknown).`,
        file_urls: [file_url],
        response_json_schema: CLASSIFY_SCHEMA,
      });

      setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'done', classification, file_url } : f));
      onFilesClassified && onFilesClassified({ id, file, file_url, classification });
    } catch (e) {
      setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'error', error: e.message } : f));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    Array.from(e.dataTransfer.files).forEach(processFile);
  };

  const handleInput = (e) => {
    Array.from(e.target.files).forEach(processFile);
    e.target.value = '';
  };

  const removeFile = (id) => setFiles(prev => prev.filter(f => f.id !== id));

  return (
    <div className="space-y-3">
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          dragging ? 'border-violet-400 bg-violet-50' : 'border-slate-300 hover:border-violet-300 hover:bg-violet-50/40'
        }`}>
        <input ref={inputRef} type="file" multiple accept=".pdf,.xlsx,.xls,.csv,.doc,.docx,.txt" className="hidden" onChange={handleInput} />
        <div className="flex flex-col items-center gap-2">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${dragging ? 'bg-violet-100' : 'bg-slate-100'}`}>
            <Upload className={`w-6 h-6 ${dragging ? 'text-violet-600' : 'text-slate-400'}`} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">Drop files here or <span className="text-violet-600">browse</span></p>
            <p className="text-xs text-muted-foreground mt-0.5">{hint || 'Excel, CSV, PDF, Word documents — AI will classify and extract data'}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-1 mt-1">
            {['Excel (.xlsx)', 'CSV', 'PDF', 'Word (.docx)'].map(t => (
              <span key={t} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{t}</span>
            ))}
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-700">{files.length} file{files.length > 1 ? 's' : ''} added</p>
            <button onClick={() => setFiles([])} className="text-xs text-muted-foreground hover:text-destructive">Clear all</button>
          </div>
          {files.map(item => <FileItem key={item.id} item={item} onRemove={removeFile} />)}
        </div>
      )}
    </div>
  );
}