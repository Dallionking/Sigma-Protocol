/**
 * Vitest Test Setup
 *
 * This file runs before each test file and sets up:
 * - Global mocks for browser APIs
 * - Common test utilities
 * - Mock implementations for external dependencies
 */

import { vi, beforeAll, afterAll, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";

// ============================================================================
// Browser API Mocks
// ============================================================================

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock sessionStorage
Object.defineProperty(window, "sessionStorage", {
  value: localStorageMock,
});

// Mock matchMedia for responsive design tests
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

Object.defineProperty(window, "ResizeObserver", {
  writable: true,
  value: ResizeObserverMock,
});

// Mock IntersectionObserver
class IntersectionObserverMock {
  root = null;
  rootMargin = "";
  thresholds = [];
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
}

Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  value: IntersectionObserverMock,
});

// Mock requestAnimationFrame
Object.defineProperty(window, "requestAnimationFrame", {
  writable: true,
  value: vi.fn((callback: FrameRequestCallback) => {
    return setTimeout(() => callback(Date.now()), 16) as unknown as number;
  }),
});

Object.defineProperty(window, "cancelAnimationFrame", {
  writable: true,
  value: vi.fn((id: number) => clearTimeout(id)),
});

// Mock scrollTo
Object.defineProperty(window, "scrollTo", {
  writable: true,
  value: vi.fn(),
});

// ============================================================================
// Canvas/WebGL Mocks (for Phaser)
// ============================================================================

HTMLCanvasElement.prototype.getContext = vi.fn(function (
  this: HTMLCanvasElement,
  contextId: string
) {
  if (contextId === "2d") {
    return {
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      getImageData: vi.fn(() => ({
        data: new Uint8ClampedArray(4),
      })),
      putImageData: vi.fn(),
      createImageData: vi.fn(() => ({
        data: new Uint8ClampedArray(4),
      })),
      setTransform: vi.fn(),
      drawImage: vi.fn(),
      save: vi.fn(),
      fillText: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      rotate: vi.fn(),
      arc: vi.fn(),
      measureText: vi.fn(() => ({ width: 0 })),
      transform: vi.fn(),
      rect: vi.fn(),
      clip: vi.fn(),
      canvas: this,
    } as unknown as CanvasRenderingContext2D;
  }

  if (contextId === "webgl" || contextId === "webgl2") {
    return {
      getExtension: vi.fn(),
      getParameter: vi.fn(() => 16384),
      createTexture: vi.fn(),
      bindTexture: vi.fn(),
      texImage2D: vi.fn(),
      texParameteri: vi.fn(),
      createBuffer: vi.fn(),
      bindBuffer: vi.fn(),
      bufferData: vi.fn(),
      createShader: vi.fn(),
      shaderSource: vi.fn(),
      compileShader: vi.fn(),
      getShaderParameter: vi.fn(() => true),
      createProgram: vi.fn(),
      attachShader: vi.fn(),
      linkProgram: vi.fn(),
      getProgramParameter: vi.fn(() => true),
      useProgram: vi.fn(),
      getAttribLocation: vi.fn(() => 0),
      enableVertexAttribArray: vi.fn(),
      vertexAttribPointer: vi.fn(),
      getUniformLocation: vi.fn(() => ({})),
      uniform1f: vi.fn(),
      uniform2f: vi.fn(),
      uniform3f: vi.fn(),
      uniform4f: vi.fn(),
      uniform1i: vi.fn(),
      uniformMatrix4fv: vi.fn(),
      drawArrays: vi.fn(),
      drawElements: vi.fn(),
      viewport: vi.fn(),
      clearColor: vi.fn(),
      clear: vi.fn(),
      enable: vi.fn(),
      disable: vi.fn(),
      blendFunc: vi.fn(),
      canvas: this,
    } as unknown as WebGLRenderingContext;
  }

  return null;
}) as unknown as typeof HTMLCanvasElement.prototype.getContext;

// ============================================================================
// Audio Mocks
// ============================================================================

Object.defineProperty(window, "AudioContext", {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    createGain: vi.fn(() => ({
      connect: vi.fn(),
      gain: { value: 1 },
    })),
    createOscillator: vi.fn(() => ({
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      type: "sine",
      frequency: { value: 440 },
    })),
    createBufferSource: vi.fn(() => ({
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      buffer: null,
    })),
    decodeAudioData: vi.fn(),
    destination: {},
    currentTime: 0,
  })),
});

// Mock HTMLMediaElement.play
Object.defineProperty(HTMLMediaElement.prototype, "play", {
  writable: true,
  value: vi.fn(() => Promise.resolve()),
});

Object.defineProperty(HTMLMediaElement.prototype, "pause", {
  writable: true,
  value: vi.fn(),
});

// ============================================================================
// Fetch Mock
// ============================================================================

const originalFetch = global.fetch;

export const mockFetch = vi.fn();

beforeAll(() => {
  global.fetch = mockFetch;
});

afterAll(() => {
  global.fetch = originalFetch;
});

// ============================================================================
// Clean up after each test
// ============================================================================

afterEach(() => {
  vi.clearAllMocks();
  localStorageMock.clear();
});

// ============================================================================
// Test Utilities
// ============================================================================

/**
 * Wait for a condition to be true
 */
export async function waitFor(
  condition: () => boolean,
  timeout = 5000
): Promise<void> {
  const start = Date.now();
  while (!condition()) {
    if (Date.now() - start > timeout) {
      throw new Error("waitFor timeout");
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

/**
 * Create a mock agent for testing
 */
export function createMockAgent(overrides: Partial<MockAgent> = {}): MockAgent {
  return {
    id: "agent-1",
    name: "Test Agent",
    role: "developer",
    status: "idle",
    provider: "claude-code",
    model: "claude-sonnet-4-20250514",
    x: 100,
    y: 100,
    currentTask: null,
    ...overrides,
  };
}

interface MockAgent {
  id: string;
  name: string;
  role: string;
  status: string;
  provider: string;
  model: string;
  x: number;
  y: number;
  currentTask: string | null;
}

/**
 * Create a mock message for testing
 */
export function createMockMessage(
  overrides: Partial<MockMessage> = {}
): MockMessage {
  return {
    id: "msg-1",
    content: "Test message",
    sender: "user",
    timestamp: Date.now(),
    type: "chat",
    ...overrides,
  };
}

interface MockMessage {
  id: string;
  content: string;
  sender: string;
  timestamp: number;
  type: string;
}

/**
 * Create a mock task for testing
 */
export function createMockTask(overrides: Partial<MockTask> = {}): MockTask {
  return {
    id: "task-1",
    title: "Test Task",
    description: "Test task description",
    status: "todo",
    priority: "medium",
    assignee: null,
    createdAt: Date.now(),
    ...overrides,
  };
}

interface MockTask {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignee: string | null;
  createdAt: number;
}

/**
 * Mock console methods for cleaner test output
 */
export function silenceConsole(): void {
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
}

/**
 * Restore console methods
 */
export function restoreConsole(): void {
  vi.restoreAllMocks();
}
