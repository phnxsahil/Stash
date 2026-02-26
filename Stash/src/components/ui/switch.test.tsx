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

    it('applies custom background color for visibility', () => {
        render(<Switch />);
        const switchElement = screen.getByRole('switch');
        // Check if our high-contrast fix class is present
        expect(switchElement).toHaveClass('data-[state=unchecked]:bg-[#525252]');
    });
});

