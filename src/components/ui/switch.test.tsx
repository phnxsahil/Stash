import { render, screen, fireEvent } from '@testing-library/react';
import { Switch } from '@/components/ui/switch';
import { describe, it, expect, vi } from 'vitest';

describe('Switch Component', () => {
    it('renders correctly', () => {
        render(<Switch />);
        const switchElement = screen.getByRole('switch');
        expect(switchElement).toBeInTheDocument();
    });

    it('toggles state on click', () => {
        const handleChange = vi.fn();
        render(<Switch onCheckedChange={handleChange} />);

        const switchElement = screen.getByRole('switch');
        fireEvent.click(switchElement);

        expect(handleChange).toHaveBeenCalledWith(true);
    });

    it('has correct accessibility attributes', () => {
        render(<Switch checked={true} />);
        const switchElement = screen.getByRole('switch');
        expect(switchElement).toHaveAttribute('data-state', 'checked');
        expect(switchElement).toHaveAttribute('aria-checked', 'true');
    });

    it('keeps unavailable controls disabled without changing state', () => {
        const handleChange = vi.fn();
        render(<Switch disabled checked={false} onCheckedChange={handleChange} />);
        const switchElement = screen.getByRole('switch');
        expect(switchElement).toBeDisabled();
        fireEvent.click(switchElement);
        expect(handleChange).not.toHaveBeenCalled();
        expect(switchElement).toHaveAttribute('aria-checked', 'false');
    });
});

