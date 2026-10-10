import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import en from '../../../../messages/en.json';
import ja from '../../../../messages/ja.json';
import zhTW from '../../../../messages/zh-TW.json';
import { FileUploader } from '@/components/tools/FileUploader';
import { ProcessingProgress } from '@/components/tools/ProcessingProgress';
import { DownloadButton } from '@/components/tools/DownloadButton';
import { EditPDFTool } from '@/components/tools/edit-pdf/EditPDFTool';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Modal } from '@/components/ui/Modal';
import { FormField } from '@/components/ui/FormField';

const catalogs = { en, ja, 'zh-TW': zhTW };
describe.each(['en', 'ja', 'zh-TW'] as const)('shared UI in %s', (locale) => {
  const messages = catalogs[locale];
  it('localizes modal close and required field accessibility labels', () => {
    render(<NextIntlClientProvider locale={locale} messages={messages}>
      <Modal isOpen onClose={() => {}} title="Synthetic">
        <FormField label="Synthetic field" required error="Synthetic error"><input /></FormField>
      </Modal>
    </NextIntlClientProvider>);
    expect(screen.getByRole('button', { name: messages.interfaceText.closeModal })).toBeVisible();
    expect(screen.getByRole('textbox')).toHaveAccessibleName('Synthetic field ' + messages.interfaceText.required);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('textbox')).toHaveAccessibleDescription('Synthetic error');
  });
  it('localizes theme button actions and accessibility labels', () => {
    document.documentElement.classList.remove('dark');
    render(<NextIntlClientProvider locale={locale} messages={messages}><ThemeToggle /></NextIntlClientProvider>);
    fireEvent.click(screen.getByRole('button', { name: messages.common.accessibility.switchToDark }));
    expect(screen.getByRole('button', { name: messages.common.accessibility.switchToLight })).toBeVisible();
    document.documentElement.classList.remove('dark');
  });
  it('localizes PDF editor mode buttons and upload instructions', () => {
    render(<NextIntlClientProvider locale={locale} messages={messages}><EditPDFTool /></NextIntlClientProvider>);
    expect(screen.getByRole('button', { name: new RegExp(messages.tools.editPdf.directMode) })).toBeVisible();
    expect(screen.getByRole('button', { name: new RegExp(messages.tools.editPdf.annotatorMode) })).toBeVisible();
    expect(screen.getByText(messages.tools.editPdf.uploadLabel)).toBeInTheDocument();
  });
  it('localizes upload instructions, file limits and invalid-file errors with values', async () => {
    const onError = vi.fn();
    const onFilesSelected = vi.fn();
    const result = render(<NextIntlClientProvider locale={locale} messages={messages}>
      <FileUploader multiple maxFiles={2} onError={onError} onFilesSelected={onFilesSelected} />
    </NextIntlClientProvider>);
    expect(screen.getByText(messages.common.fileUploader.dragDrop)).toBeInTheDocument();
    expect(screen.getByText(messages.common.fileUploader.maxFiles.replace('{count}', '2'))).toBeInTheDocument();
    const input = result.container.querySelector('input[type=file]')!;
    fireEvent.change(input, { target: { files: [new File(['synthetic'], 'invalid.txt', { type: 'text/plain' })] } });
    await waitFor(() => expect(onError).toHaveBeenCalledWith(messages.errors.fileTypeInvalid.replace('{acceptedTypes}', 'application/pdf')));
    expect(onFilesSelected).not.toHaveBeenCalled();
  });
  it('localizes dynamic remaining time and downloadable-file accessibility text', () => {
    render(<NextIntlClientProvider locale={locale} messages={messages}>
      <ProcessingProgress status="processing" progress={25} estimatedTime={125} />
      <DownloadButton file={new Blob(['synthetic'])} filename="synthetic.pdf" showFileSize={false} />
    </NextIntlClientProvider>);
    expect(screen.getByText(messages.common.progress.minutesRemaining.replace('{minutes}', '2').replace('{seconds}', '5'))).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAccessibleName(messages.common.status.processing + ': 25%');
    expect(screen.getByRole('button', { name: messages.common.buttons.download })).toBeEnabled();
  });
});
