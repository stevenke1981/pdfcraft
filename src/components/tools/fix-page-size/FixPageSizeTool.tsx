'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { FileUploader } from '../FileUploader';
import { ProcessingProgress, ProcessingStatus } from '../ProcessingProgress';
import { DownloadButton } from '../DownloadButton';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  fixPageSize,
  PAGE_SIZES,
  type FixPageSizeOptions,
  type PageSizePreset,
  type ScaleMode,
} from '@/lib/pdf/processors/fix-page-size';
import type { ProcessOutput } from '@/types/pdf';

export interface FixPageSizeToolProps {
  /** Custom class name */
  className?: string;
}

/**
 * FixPageSizeTool Component
 * Requirements: 5.1, 5.2
 * 
 * Provides the UI for standardizing PDF page sizes.
 */
export function FixPageSizeTool({ className = '' }: FixPageSizeToolProps) {
  const tUi = useTranslations();
  const tFeedback = useTranslations('common.toolFeedback');
  const t = useTranslations('common');
  const tTools = useTranslations('tools');
  
  // State
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Options
  const [sizePreset, setSizePreset] = useState<PageSizePreset>('a4');
  const [customWidth, setCustomWidth] = useState(595.28);
  const [customHeight, setCustomHeight] = useState(841.89);
  const [scaleMode, setScaleMode] = useState<ScaleMode>('fit');
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape' | 'auto'>('auto');
  
  // Ref for cancellation
  const cancelledRef = useRef(false);


  /**
   * Handle file selected from uploader
   */
  const handleFilesSelected = useCallback((files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setError(null);
      setResult(null);
    }
  }, []);

  /**
   * Handle file upload error
   */
  const handleUploadError = useCallback((errorMessage: string) => {
    setError(errorMessage);
  }, []);

  /**
   * Clear file
   */
  const handleClear = useCallback(() => {
    setFile(null);
    setResult(null);
    setError(null);
    setStatus('idle');
    setProgress(0);
  }, []);

  /**
   * Handle fix page size operation
   */
  const handleFixPageSize = useCallback(async () => {
    if (!file) {
      setError(tFeedback('selectPdf'));
      return;
    }

    cancelledRef.current = false;
    setStatus('processing');
    setProgress(0);
    setError(null);
    setResult(null);

    const options: FixPageSizeOptions = {
      sizePreset,
      customWidth: sizePreset === 'custom' ? customWidth : undefined,
      customHeight: sizePreset === 'custom' ? customHeight : undefined,
      scaleMode,
      maintainAspectRatio,
      orientation,
    };

    try {
      const output: ProcessOutput = await fixPageSize(
        file,
        options,
        (prog, message) => {
          if (!cancelledRef.current) {
            setProgress(prog);
            setProgressMessage(message || '');
          }
        }
      );

      if (cancelledRef.current) {
        setStatus('idle');
        return;
      }

      if (output.success && output.result) {
        setResult(output.result as Blob);
        setStatus('complete');
      } else {
        setError(output.error?.message || tUi('interfaceFeedback.failedToFixPageSizes'));
        setStatus('error');
      }
    } catch (err) {
      if (!cancelledRef.current) {
        setError(err instanceof Error ? err.message : tUi('interfaceFeedback.anUnexpectedErrorOccurred'));
        setStatus('error');
      }
    }
  }, [tUi, file, sizePreset, customWidth, customHeight, scaleMode, maintainAspectRatio, orientation, tFeedback]);

  /**
   * Handle cancel operation
   */
  const handleCancel = useCallback(() => {
    cancelledRef.current = true;
    setStatus('idle');
    setProgress(0);
  }, []);

  /**
   * Format file size
   */
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const isProcessing = status === 'processing';
  const canProcess = file && !isProcessing;

  return (
    <div className={`space-y-6 ${className}`.trim()}>
      {/* File Upload Area */}
      <FileUploader
        accept={['application/pdf', '.pdf']}
        multiple={false}
        maxFiles={1}
        onFilesSelected={handleFilesSelected}
        onError={handleUploadError}
        disabled={isProcessing}
        label={tTools('fixPageSize.uploadLabel')}
        description={tTools('fixPageSize.uploadDescription')}
      />

      {/* Error Message */}
      {error && (
        <div 
          className="p-4 rounded-[var(--radius-md)] bg-red-50 border border-red-200 text-red-700"
          role="alert"
        >
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Selected File */}
      {file && (
        <Card variant="outlined" size="lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <svg className="w-10 h-10 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                  <path d="M14 2v6h6" fill="white" />
                  <text x="7" y="17" fontSize="6" fill="white" fontWeight="bold">PDF</text>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-[hsl(var(--color-foreground))]">
                  {file.name}
                </p>
                <p className="text-xs text-[hsl(var(--color-muted-foreground))]">
                  {formatSize(file.size)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={isProcessing}
            >
              {t('buttons.remove')}
            </Button>
          </div>
        </Card>
      )}


      {/* Options */}
      {file && (
        <Card variant="outlined">
          <h3 className="text-lg font-medium text-[hsl(var(--color-foreground))] mb-4">
            {tTools('fixPageSize.optionsTitle')}
          </h3>
          
          <div className="space-y-6">
            {/* Page Size Selection */}
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--color-foreground))] mb-2">
                {tTools('fixPageSize.targetSize')}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {(Object.keys(PAGE_SIZES) as PageSizePreset[]).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setSizePreset(preset)}
                    disabled={isProcessing}
                    className={`
                      px-3 py-2 rounded-[var(--radius-md)] border text-sm font-medium
                      transition-colors duration-200
                      ${sizePreset === preset 
                        ? 'border-[hsl(var(--color-primary))] bg-[hsl(var(--color-primary))] text-[hsl(var(--color-primary-foreground))]' 
                        : 'border-[hsl(var(--color-border))] hover:bg-[hsl(var(--color-muted)/0.5)]'
                      }
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                  >
                    {preset === 'custom' ? (tTools('fixPageSize.custom')) : preset.toUpperCase()}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-xs text-[hsl(var(--color-muted-foreground))]">
                {PAGE_SIZES[sizePreset].label}
              </p>
            </div>

            {/* Custom Dimensions */}
            {sizePreset === 'custom' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[hsl(var(--color-foreground))] mb-1">
                    {tTools('fixPageSize.width')}
                  </label>
                  <input
                    type="number"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(Number(e.target.value))}
                    disabled={isProcessing}
                    min={72}
                    max={3000}
                    className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] text-[hsl(var(--color-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary))]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[hsl(var(--color-foreground))] mb-1">
                    {tTools('fixPageSize.height')}
                  </label>
                  <input
                    type="number"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(Number(e.target.value))}
                    disabled={isProcessing}
                    min={72}
                    max={3000}
                    className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] text-[hsl(var(--color-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary))]"
                  />
                </div>
              </div>
            )}

            {/* Scale Mode */}
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--color-foreground))] mb-2">
                {tTools('fixPageSize.scaleMode')}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {(['fit', 'fill', 'stretch', 'center'] as ScaleMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setScaleMode(mode)}
                    disabled={isProcessing}
                    className={`
                      px-3 py-2 rounded-[var(--radius-md)] border text-sm font-medium
                      transition-colors duration-200
                      ${scaleMode === mode 
                        ? 'border-[hsl(var(--color-primary))] bg-[hsl(var(--color-primary))] text-[hsl(var(--color-primary-foreground))]' 
                        : 'border-[hsl(var(--color-border))] hover:bg-[hsl(var(--color-muted)/0.5)]'
                      }
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                  >
                    {mode === 'fit' && (tTools('fixPageSize.scaleFit'))}
                    {mode === 'fill' && (tTools('fixPageSize.scaleFill'))}
                    {mode === 'stretch' && (tTools('fixPageSize.scaleStretch'))}
                    {mode === 'center' && (tTools('fixPageSize.scaleCenter'))}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-xs text-[hsl(var(--color-muted-foreground))]">
                {scaleMode === 'fit' && (tTools('fixPageSize.scaleFitDesc'))}
                {scaleMode === 'fill' && (tTools('fixPageSize.scaleFillDesc'))}
                {scaleMode === 'stretch' && (tTools('fixPageSize.scaleStretchDesc'))}
                {scaleMode === 'center' && (tTools('fixPageSize.scaleCenterDesc'))}
              </p>
            </div>

            {/* Orientation */}
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--color-foreground))] mb-2">
                {tTools('fixPageSize.orientation')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['auto', 'portrait', 'landscape'] as const).map((orient) => (
                  <button
                    key={orient}
                    type="button"
                    onClick={() => setOrientation(orient)}
                    disabled={isProcessing}
                    className={`
                      px-3 py-2 rounded-[var(--radius-md)] border text-sm font-medium
                      transition-colors duration-200
                      ${orientation === orient 
                        ? 'border-[hsl(var(--color-primary))] bg-[hsl(var(--color-primary))] text-[hsl(var(--color-primary-foreground))]' 
                        : 'border-[hsl(var(--color-border))] hover:bg-[hsl(var(--color-muted)/0.5)]'
                      }
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                  >
                    {orient === 'auto' && (tTools('fixPageSize.orientAuto'))}
                    {orient === 'portrait' && (tTools('fixPageSize.orientPortrait'))}
                    {orient === 'landscape' && (tTools('fixPageSize.orientLandscape'))}
                  </button>
                ))}
              </div>
            </div>

            {/* Maintain Aspect Ratio */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={maintainAspectRatio}
                onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                disabled={isProcessing || scaleMode === 'stretch' || scaleMode === 'center'}
                className="w-4 h-4 rounded border-[hsl(var(--color-border))] text-[hsl(var(--color-primary))] focus:ring-[hsl(var(--color-primary))]"
              />
              <span className="text-sm text-[hsl(var(--color-foreground))]">
                {tTools('fixPageSize.maintainAspectRatio')}
              </span>
            </label>
          </div>
        </Card>
      )}

      {/* Processing Progress */}
      {isProcessing && (
        <ProcessingProgress
          progress={progress}
          status={status}
          message={progressMessage}
          onCancel={handleCancel}
          showPercentage
        />
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-4">
        <Button
          variant="primary"
          size="lg"
          onClick={handleFixPageSize}
          disabled={!canProcess}
          loading={isProcessing}
        >
          {isProcessing 
            ? (t('status.processing'))
            : (tTools('fixPageSize.applyButton'))
          }
        </Button>

        {result && (
          <DownloadButton
            file={result}
            filename={file ? `${file.name.replace('.pdf', '')}_fixed.pdf` : 'fixed.pdf'}
            variant="secondary"
            size="lg"
            showFileSize
          />
        )}
      </div>

      {/* Success Message */}
      {status === 'complete' && result && (
        <div 
          className="p-4 rounded-[var(--radius-md)] bg-green-50 border border-green-200 text-green-700"
          role="status"
        >
          <p className="text-sm font-medium">
            {tTools('fixPageSize.successMessage')}
          </p>
        </div>
      )}
    </div>
  );
}

export default FixPageSizeTool;
