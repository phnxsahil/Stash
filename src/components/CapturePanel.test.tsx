import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { CapturePanel } from './CapturePanel';
import { ProcessingOverlay } from './ProcessingOverlay';

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {writable:true, value: vi.fn().mockImplementation(() => ({matches:true, addListener:vi.fn(), removeListener:vi.fn(), addEventListener:vi.fn(), removeEventListener:vi.fn()}))});
});

describe('Capture interactions', () => {
  it('submits once while busy and retains the link if submission fails', async () => {
    let rejectRequest!: (error: Error) => void;
    const submit = vi.fn(() => new Promise<void>((_, reject) => { rejectRequest = reject; }));
    render(<CapturePanel connected onSubmit={submit} />);
    const input = screen.getByRole('textbox', {name:'Music source URL'});
    fireEvent.change(input, {target:{value:'https://youtu.be/test'}});
    fireEvent.click(screen.getByRole('button', {name:'Stash this song'}));
    expect(screen.getByRole('button', {name:'Finding your song…'})).toBeDisabled();
    expect(submit).toHaveBeenCalledTimes(1);
    rejectRequest(new Error('Offline'));
    await screen.findByText('That didn’t go through. Your link is still here — try again.');
    expect(input).toHaveValue('https://youtu.be/test');
    expect(screen.getByRole('button', {name:'Stash this song'})).toBeEnabled();
  });

  it('clipboard denial explains the manual fallback', async () => {
    Object.defineProperty(navigator, 'clipboard', {configurable:true, value:{readText:vi.fn().mockRejectedValue(new Error('Denied'))}});
    render(<CapturePanel onSubmit={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', {name:'Paste'}));
    await screen.findByText('Tap the field and paste your link manually. Clipboard access isn’t available.');
    expect(screen.getByRole('textbox')).toHaveFocus();
  });

  it('pasting extracts the link without submitting and preserves destination controls', async () => {
    Object.defineProperty(navigator, 'clipboard', {configurable:true, value:{readText:vi.fn().mockResolvedValue('Found this https://youtu.be/test.')}});
    const submit = vi.fn();
    const change = vi.fn();
    render(<CapturePanel connected onSubmit={submit} destinationName="Liked Songs" onChangeDestination={change} />);
    fireEvent.click(screen.getByRole('button', {name:'Paste'}));
    await waitFor(() => expect(screen.getByRole('textbox')).toHaveValue('https://youtu.be/test'));
    expect(submit).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', {name:'Change'}));
    expect(change).toHaveBeenCalledOnce();
  });

  it('processing exposes real stages and error retry without a fabricated percentage', () => {
    const retry = vi.fn();
    const close = vi.fn();
    const {rerender} = render(<ProcessingOverlay isVisible stage={2} onRetry={retry} onClose={close} />);
    expect(screen.getByRole('dialog')).toHaveAccessibleName('Finding your song');
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
    rerender(<ProcessingOverlay isVisible stage="error" errorMessage="No match found" onRetry={retry} onClose={close} />);
    fireEvent.click(screen.getByRole('button', {name:'Try again'}));
    expect(retry).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', {name:'Close and edit link'}));
    expect(close).toHaveBeenCalledOnce();
  });
});
