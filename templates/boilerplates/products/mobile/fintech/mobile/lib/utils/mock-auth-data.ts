/**
 * Mock Authentication Data
 * 
 * Provides mock data for development and testing without backend API.
 */

import { User, Session } from '@/lib/types/auth';

// Mock mode flag
export const MOCK_MODE = __DEV__ || process.env.EXPO_PUBLIC_MOCK_MODE === 'true';

// Mock delay to simulate network latency
export const mockDelay = (ms: number = 1000) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Mock user data
export const MOCK_USER: User = {
  id: 'user-123',
  email: 'demo@example.com',
  name: 'Demo User',
  createdAt: '2024-01-15T08:00:00Z',
  avatar: '👤',
};

// Mock sessions data
export const MOCK_SESSIONS: Session[] = [
  {
    id: 'session-1',
    device: 'iPhone 15 Pro',
    location: 'San Francisco, CA',
    lastActive: 'Now',
    isCurrent: true,
    ipAddress: '192.168.1.100',
    userAgent: 'iOS 17.2',
  },
  {
    id: 'session-2',
    device: 'MacBook Pro',
    location: 'San Francisco, CA',
    lastActive: '2 days ago',
    isCurrent: false,
    ipAddress: '192.168.1.101',
    userAgent: 'macOS 14.2',
  },
  {
    id: 'session-3',
    device: 'iPad Air',
    location: 'New York, NY',
    lastActive: '5 days ago',
    isCurrent: false,
    ipAddress: '10.0.1.50',
    userAgent: 'iOS 17.1',
  },
];

/**
 * Mock password validation
 */
export function mockValidatePassword(password: string): boolean {
  return password.length >= 8;
}

/**
 * Mock password change
 */
export async function mockUpdatePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  await mockDelay(1500);
  
  // Simulate validation
  if (currentPassword !== 'password123') {
    return {
      success: false,
      error: 'Current password is incorrect',
    };
  }
  
  if (newPassword.length < 8) {
    return {
      success: false,
      error: 'New password must be at least 8 characters',
    };
  }
  
  return {
    success: true,
    message: 'Password updated successfully',
  };
}

/**
 * Mock end session
 */
export async function mockEndSession(
  sessionId: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  await mockDelay(800);
  
  const session = MOCK_SESSIONS.find(s => s.id === sessionId);
  
  if (!session) {
    return {
      success: false,
      error: 'Session not found',
    };
  }
  
  if (session.isCurrent) {
    return {
      success: false,
      error: 'Cannot end current session',
    };
  }
  
  return {
    success: true,
    message: 'Session ended successfully',
  };
}

/**
 * Mock end all sessions
 */
export async function mockEndAllSessions(): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  await mockDelay(1200);
  
  return {
    success: true,
    message: 'All other sessions ended',
  };
}

/**
 * Mock logout
 */
export async function mockLogout(): Promise<{
  success: boolean;
  message?: string;
}> {
  await mockDelay(600);
  
  return {
    success: true,
    message: 'Logged out successfully',
  };
}

/**
 * Mock account deletion
 */
export async function mockDeleteAccount(): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  await mockDelay(2000);
  
  return {
    success: true,
    message: 'Account deleted successfully',
  };
}

/**
 * Get device icon based on device name
 */
export function getDeviceIcon(deviceName: string): string {
  const device = deviceName.toLowerCase();
  
  if (device.includes('iphone')) return '📱';
  if (device.includes('ipad')) return '📲';
  if (device.includes('macbook') || device.includes('mac')) return '💻';
  if (device.includes('android')) return '📱';
  if (device.includes('windows')) return '🖥️';
  if (device.includes('tablet')) return '📲';
  
  return '📱'; // Default
}

/**
 * Calculate password strength
 */
export function calculatePasswordStrength(password: string): {
  score: number; // 0-4
  label: string;
  color: string;
} {
  let score = 0;
  
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  
  // Normalize to 0-4 scale
  const normalizedScore = Math.min(4, Math.floor(score * 0.8));
  
  const strengthMap = {
    0: { label: 'Too weak', color: '#FF4136' },
    1: { label: 'Weak', color: '#FF851B' },
    2: { label: 'Fair', color: '#FFDC00' },
    3: { label: 'Good', color: '#2ECC40' },
    4: { label: 'Strong', color: '#22C55E' },
  };
  
  return {
    score: normalizedScore,
    ...strengthMap[normalizedScore as keyof typeof strengthMap],
  };
}

