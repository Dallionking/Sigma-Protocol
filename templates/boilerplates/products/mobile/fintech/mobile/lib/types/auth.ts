/**
 * Authentication & Security Types
 * 
 * Core interfaces for user authentication, sessions, and security features.
 */

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  avatar?: string;
}

export interface Session {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuthState {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  
  // Security preferences
  biometricEnabled: boolean;
  
  // Sessions
  sessions: Session[];
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setBiometric: (enabled: boolean) => Promise<void>;
  setSessions: (sessions: Session[]) => void;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  endSession: (sessionId: string) => Promise<void>;
  endAllSessions: () => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetError: () => void;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword?: string;
}

export interface PasswordChangeResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface SessionEndResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface AccountDeletionResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export enum BiometricType {
  FACE_ID = 'face_id',
  TOUCH_ID = 'touch_id',
  FINGERPRINT = 'fingerprint',
  IRIS = 'iris',
  NONE = 'none',
}

export interface BiometricStatus {
  isAvailable: boolean;
  isEnrolled: boolean;
  biometricType: BiometricType;
  isEnabled: boolean; // User preference
}

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  warning?: string;
}

export interface SecuritySettings {
  biometricEnabled: boolean;
  sessionTimeout: number; // minutes
  requirePasswordFor: {
    brokerConnection: boolean;
    largeTransactions: boolean;
    accountDeletion: boolean;
  };
  twoFactorEnabled: boolean;
}

// API request/response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  token?: string;
  refreshToken?: string;
  error?: string;
}

export interface LogoutResponse {
  success: boolean;
  message?: string;
}

