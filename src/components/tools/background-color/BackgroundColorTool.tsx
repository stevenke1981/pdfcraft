'use client';

import { useTranslations } from 'next-intl';
import React, { useState, useCallback, useRef } from 'react';
import { FileUploader } from '../FileUploader';
import { ProcessingProgress, ProcessingStatus } from '../ProcessingProgress';
import { DownloadButton } from '../DownloadButton';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { addBackgroundColor } from '@/lib/pdf/processors/background-color';
import type { ProcessOutput } from '@/types/pdf';

export interface BackgroundColorToolProps { className?: string; }

export function BackgroundColorTool({ className = '' }: BackgroundColorToolProps) {
  const tUi = useTranslations();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [color, setColor] = useState('#fffde7');
  const cancelledRef = useRef(false);

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? { r: parseInt(result[1], 16) / 255, g: parseInt(result[2], 16) / 255, b: parseInt(result[3], 16) / 255 } : { r: 1, g: 1, b: 0.9 };
  };

  const handleProcess = useCallback(async () => {
    if (!file) return;
    cancelledRef.current = false;
    setStatus('processing'); setProgress(0); setError(null); setResult(null);
    try {
      const output: ProcessOutput = await addBackgroundColor(file, { color: hexToRgb(color), pages: 'all' }, (prog) => { if (!cancelledRef.current) setProgress(prog); });
      if (output.success && output.result) { setResult(output.result as Blob); setStatus('complete'); }
      else { setError(output.error?.message || tUi('interfaceFeedback.failed')); setStatus('error'); }
    } catch (err) { setError(err instanceof Error ? err.message : tUi('common.status.error')); setStatus('error'); }
  }, [tUi, file, color]);

  const isProcessing = status === 'processing';

  return (
    <div className={`space-y-6 ${className}`.trim()}>
      {!file && <FileUploader accept={['application/pdf', '.pdf']} multiple={false} maxFiles={1} onFilesSelected={(files) => { if (files.length > 0) { setFile(files[0]); setError(null); setResult(null); } }} onError={setError} disabled={isProcessing} label={tUi('interfaceText.uploadPdfFile')} description={tUi('tools.headerFooter.uploadDescription')} />}
      {error && <div className="p-4 rounded bg-red-50 border border-red-200 text-red-700"><p className="text-sm">{error}</p></div>}
      {file && (
        <>
          <Card variant="outlined"><div className="flex items-center justify-between"><p className="font-medium">{file.name}</p><Button variant="ghost" size="sm" onClick={() => { setFile(null); setResult(null); }} disabled={isProcessing}>{tUi('common.buttons.remove')}</Button></div></Card>
          <Card variant="outlined" size="lg">
            <label className="block text-sm font-medium mb-2">{tUi('tools.combineSinglePage.backgroundColor')}</label>
            <div className="flex items-center gap-4">
              <input type="color" aria-label={tUi('tools.combineSinglePage.backgroundColor')} value={color} onChange={(e) => setColor(e.target.value)} className="w-16 h-10 border rounded cursor-pointer" disabled={isProcessing} />
              <input type="text" aria-label={tUi('interfaceText.backgroundHex')} value={color} onChange={(e) => setColor(e.target.value)} className="px-3 py-2 border rounded w-32" disabled={isProcessing} />
            </div>
          </Card>
        </>
      )}
      {isProcessing && <ProcessingProgress progress={progress} status={status} onCancel={() => { cancelledRef.current = true; setStatus('idle'); }} showPercentage />}
      {file && <div className="flex flex-wrap items-center gap-4"><Button variant="primary" size="lg" onClick={handleProcess} disabled={!file || isProcessing} loading={isProcessing}>{isProcessing ? tUi('common.status.processing') : tUi('interfaceText.addBackground')}</Button>{result && <DownloadButton file={result} filename={file.name.replace('.pdf', '_background.pdf')} variant="secondary" size="lg" showFileSize />}</div>}
      {status === 'complete' && result && <div className="p-4 rounded bg-green-50 border border-green-200 text-green-700"><p className="text-sm font-medium">{tUi('interfaceText.backgroundColorAdded')}</p></div>}
    </div>
  );
}

export default BackgroundColorTool;
