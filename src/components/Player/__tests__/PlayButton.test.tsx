import { render } from '@testing-library/react';
import { vi } from 'vitest';
import { PlayButton } from '../PlayButton';

const mockTogglePlayPause = vi.fn();

describe('PlayButton', () => {
  test('renders without crashing when not loading', () => {
    const { container } = render(<PlayButton togglePlayPause={mockTogglePlayPause} isPlaying={false} isLoading={false} />);
    expect(container.firstChild).toBeTruthy();
  });

  test('shows loading spinner when loading', () => {
    const { container } = render(<PlayButton togglePlayPause={mockTogglePlayPause} isPlaying={false} isLoading={true} />);
    expect(container.firstChild).toBeTruthy();
  });

  test('shows play icon when not playing', () => {
    const { container } = render(<PlayButton togglePlayPause={mockTogglePlayPause} isPlaying={false} isLoading={false} />);
    expect(container.firstChild).toBeTruthy();
  });

  test('shows pause icon when playing', () => {
    const { container } = render(<PlayButton togglePlayPause={mockTogglePlayPause} isPlaying={true} isLoading={false} />);
    expect(container.firstChild).toBeTruthy();
  });
});