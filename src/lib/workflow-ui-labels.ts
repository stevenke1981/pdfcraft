type Translator = (key: string, values?: Record<string, string | number>) => string;

/** Display summaries only: never mutate workflow settings or document content. */
export function getNodeSettingsSummary(toolId: string, settings: Record<string, unknown> | undefined, t: Translator): string | null {
  const label = (key: string, values?: Record<string, string | number>) => t('workflowSummary.' + key, values);
  if (!settings || Object.keys(settings).length === 0) {
    if (toolId === 'rotate-pdf') return label('defaultRotation');
    if (toolId === 'compress-pdf') return label('defaultCompression');
    if (toolId === 'split-pdf') return label('singlePage');
    if (toolId === 'download-pdf') return label('save', { filename: 'output.pdf' });
    if (toolId === 'download-zip') return label('archive', { filename: 'output.zip' });
    return null;
  }
  switch (toolId) {
    case 'rotate-pdf': return label('rotation', { angle: String(settings.angle ?? 90) });
    case 'add-watermark': {
      const repeat = Boolean(settings.repeat);
      if (settings.watermarkType === 'image') return label(repeat ? 'tiledImageWatermark' : 'imageWatermark');
      return label(repeat ? 'tiledWatermark' : 'watermark', { text: String(settings.text || 'CONFIDENTIAL') });
    }
    case 'compress-pdf': {
      const quality = String(settings.quality || 'medium');
      const qualities: Record<string, string> = { low: 'lowQuality', medium: 'mediumQuality', high: 'highQuality', maximum: 'maximumQuality' };
      const algorithm = String(settings.algorithm || 'standard');
      return label('compression', { quality: qualities[quality] ? label(qualities[quality]) : quality, algorithm: algorithm === 'standard' ? label('standardAlgorithm') : algorithm });
    }
    case 'split-pdf':
      if (settings.splitMode === 'every-n-pages') return label('everyNPages', { count: String(settings.pagesPerSplit || 1) });
      if (settings.splitMode === 'ranges' && settings.pageRanges) return label('range', { range: String(settings.pageRanges) });
      return label('singlePage');
    case 'page-numbers': {
      const position = String(settings.position || 'bottom-center');
      const positions: Record<string, string> = { 'top-left': 'topLeft', 'top-center': 'topCenter', 'top-right': 'topRight', 'bottom-left': 'bottomLeft', 'bottom-center': 'bottomCenter', 'bottom-right': 'bottomRight' };
      return label('pageNumbers', { position: positions[position] ? t('dynamicUi.' + positions[position]) : position, start: String(settings.startNumber || 1) });
    }
    case 'download-pdf': return label('save', { filename: String(settings.filename || 'output.pdf') });
    case 'download-zip': return label('archive', { filename: String(settings.filename || 'output.zip') });
    case 'djvu-to-pdf': return `DPI: ${settings.dpi || 150}`;
    case 'condition-gateway': {
      const type = String(settings.conditionType || 'file-count'), operator = String(settings.operator || 'greater-than');
      const operators: Record<string, string> = { 'greater-than': '>', 'less-than': '<', equals: '=', 'not-equals': '!=', contains: label('contains'), 'ends-with': label('endsWith') };
      const types: Record<string, string> = { 'file-count': label('fileCount'), 'file-size': label('size'), 'file-format': label('format') };
      return `${types[type] || type} ${operators[operator] || operator} ${settings.value ?? 1}${type === 'file-size' ? (settings.sizeUnit || 'MB') : ''}`;
    }
    case 'n-up-pdf': return label('nUp', { count: String(settings.pagesPerSheet || 4), size: String(settings.pageSize || 'A4') });
    case 'extract-pages':
    case 'delete-pages': return label('pages', { range: String(settings.pageRange || '1') });
    case 'ocr-pdf': return `OCR: ${settings.language || settings.languages || 'eng'}`;
    case 'encrypt-pdf': return label(settings.userPassword ? 'passwordProtected' : 'encryption');
    case 'flatten-pdf': return label('flatten');
    case 'table-of-contents': return label('toc', { title: String(settings.title || 'Table of Contents') });
    case 'header-footer': {
      const parts = [];
      if (settings.headerText) parts.push(label('header', { text: String(settings.headerText) }));
      if (settings.footerText) parts.push(label('footer', { text: String(settings.footerText) }));
      return parts.join(' | ') || label('headerFooter');
    }
    case 'background-color': return label('background', { color: String(settings.color || '#FFFFFF') });
    case 'text-color': return label('textColor', { color: String(settings.color || '#000000') });
    default:
      if (settings.filename) return String(settings.filename);
      if (settings.quality) return label('quality', { quality: String(settings.quality) });
      if (settings.color) return label('color', { color: String(settings.color) });
      return null;
  }
}
