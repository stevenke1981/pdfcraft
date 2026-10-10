'use client';

import { useTranslations } from 'next-intl';
import React, { useState, useCallback, useRef } from 'react';
import { FileUploader } from '../FileUploader';
import { ProcessingProgress, ProcessingStatus } from '../ProcessingProgress';
import { DownloadButton } from '../DownloadButton';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { fillForm, getFormFields, FormFieldValue } from '@/lib/pdf/processors/form-filler';
import type { ProcessOutput } from '@/types/pdf';

export interface FormFillerToolProps { className?: string; }

export function FormFillerTool({ className = '' }: FormFillerToolProps) {
  const tFeedback = useTranslations('common.toolFeedback');
  const t = useTranslations('common');
  const tTools = useTranslations('tools.formFiller');
  const tErrors = useTranslations('errors');
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<{ name: string; type: string; value: string }[]>([]);
  const [flatten, setFlatten] = useState(false);
  const cancelledRef = useRef(false);

  const handleFilesSelected = useCallback(async (files: File[]) => {
    if (files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile); setError(null); setResult(null);
      try {
        const formFields = await getFormFields(selectedFile);
        setFields(formFields.map(f => ({ ...f, value: '' })));
      } catch (err) { setError(tFeedback('readForm')); }
    }
  }, [tFeedback]);

  const handleFieldChange = useCallback((index: number, value: string) => {
    setFields(prev => prev.map((f, i) => i === index ? { ...f, value } : f));
  }, []);

  const handleProcess = useCallback(async () => {
    if (!file) return;
    cancelledRef.current = false;
    setStatus('processing'); setProgress(0); setError(null); setResult(null);
    try {
      const fieldValues: FormFieldValue[] = fields.filter(f => f.value).map(f => ({ fieldName: f.name, value: f.value }));
      const output: ProcessOutput = await fillForm(file, { fields: fieldValues, flatten }, (prog) => { if (!cancelledRef.current) setProgress(prog); });
      if (output.success && output.result) { setResult(output.result as Blob); setStatus('complete'); }
      else { setError(tErrors('processingFailed')); setStatus('error'); }
    } catch { setError(tErrors('processingFailed')); setStatus('error'); }
  }, [file, fields, flatten, tErrors]);

  const isProcessing = status === 'processing';

  return (
    <div className={`space-y-6 ${className}`.trim()}>
      {!file && <FileUploader accept={['application/pdf', '.pdf']} multiple={false} maxFiles={1} onFilesSelected={handleFilesSelected} onError={setError} disabled={isProcessing} label={tTools('uploadLabel')} description={tTools('uploadDescription')} />}
      {error && <div className="p-4 rounded bg-red-50 border border-red-200 text-red-700" role="alert"><p className="text-sm">{error}</p></div>}
      {file && (
        <>
          <Card variant="outlined"><div className="flex items-center justify-between"><p className="font-medium">{file.name}</p><Button variant="ghost" size="sm" onClick={() => { setFile(null); setResult(null); setFields([]); }} disabled={isProcessing}>{t('buttons.remove')}</Button></div></Card>
          {fields.length > 0 ? (
            <Card variant="outlined" size="lg">
              <h3 className="text-lg font-medium mb-4">{tTools('fieldsHeading', { count: fields.length })}</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {fields.map((field, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <label htmlFor={`form-field-${idx}`} className="w-1/3 text-sm font-medium truncate" title={field.name}>{field.name}</label>
                    <input id={`form-field-${idx}`} type="text" value={field.value} onChange={(e) => handleFieldChange(idx, e.target.value)} placeholder={tTools('enterField', { type: field.type })} className="flex-1 min-w-0 px-3 py-2 border rounded" disabled={isProcessing} />
                  </div>
                ))}
              </div>
              <label className="flex items-center gap-2 mt-4"><input type="checkbox" checked={flatten} onChange={(e) => setFlatten(e.target.checked)} disabled={isProcessing} className="w-4 h-4" /><span>{tTools('flattenOption')}</span></label>
            </Card>
          ) : (
            <Card variant="outlined"><p className="text-gray-500">{tTools('emptyFields')}</p></Card>
          )}
        </>
      )}
      {isProcessing && <ProcessingProgress progress={progress} status={status} onCancel={() => { cancelledRef.current = true; setStatus('idle'); }} showPercentage />}
      {file && fields.length > 0 && <div className="flex flex-wrap items-center gap-4"><Button variant="primary" size="lg" onClick={handleProcess} disabled={!file || isProcessing} loading={isProcessing}>{isProcessing ? t('status.processing') : tTools('fillButton')}</Button>{result && <DownloadButton file={result} filename={file.name.replace('.pdf', '_filled.pdf')} variant="secondary" size="lg" showFileSize />}</div>}
      {status === 'complete' && result && <div className="p-4 rounded bg-green-50 border border-green-200 text-green-700"><p className="text-sm font-medium">{tTools('filledMessage')}</p></div>}
    </div>
  );
}

export default FormFillerTool;
