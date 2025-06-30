import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Web Audio API for testing
Object.defineProperty(window, 'AudioContext', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    createGain: vi.fn(() => ({
      connect: vi.fn(),
      disconnect: vi.fn(),
      gain: { value: 1 }
    })),
    createMediaElementSource: vi.fn(() => ({
      connect: vi.fn(),
      disconnect: vi.fn()
    })),
    destination: {}
  }))
});

// Mock HTMLAudioElement for testing
Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
  writable: true,
  value: vi.fn(() => Promise.resolve())
});

Object.defineProperty(window.HTMLMediaElement.prototype, 'pause', {
  writable: true,
  value: vi.fn()
});

Object.defineProperty(window.HTMLMediaElement.prototype, 'load', {
  writable: true,
  value: vi.fn()
});

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
});

// Mock matchMedia for responsive testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});