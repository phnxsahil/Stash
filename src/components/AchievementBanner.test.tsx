import { render, screen } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { AchievementBanner } from './AchievementBanner';

beforeEach(() => {
  localStorage.clear();
  window.matchMedia = vi.fn().mockReturnValue({ matches: true, addListener: vi.fn(), removeListener: vi.fn() });
});

it.each([[1, 'First Stash!'], [10, 'Collector'], [25, 'Music Lover'], [50, 'Curator']] as const)('celebrates crossing %i saves once', (target, title) => {
  const { rerender } = render(<AchievementBanner totalSongs={target - 1} />);
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  rerender(<AchievementBanner totalSongs={target} />);
  expect(screen.getByRole('status')).toHaveTextContent(title);
  expect(localStorage.getItem(`achievement-${({ 1: 'first-stash', 10: 'collector', 25: 'music-lover', 50: 'curator' })[target]}-shown`)).toBe('true');
});

it('does not celebrate existing history on mount', () => {
  render(<AchievementBanner totalSongs={25} />);
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  expect(screen.getByText('25 of 50 songs. Keep following your ears.')).toBeVisible();
});
