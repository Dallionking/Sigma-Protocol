/**
 * Biometric Authentication Utilities
 * 
 * Handles Face ID, Touch ID, and fingerprint authentication
 * with platform-specific detection and secure preference storage.
 */

import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { BiometricType, BiometricStatus, BiometricAuthResult } from '@/lib/types/auth';

// SecureStore keys
export const BIOMETRIC_KEYS = {
  ENABLED: 'biometric_enabled',
  SETUP_DATE: 'biometric_setup_date',
  TYPE: 'biometric_type',
} as const;

/**
 * Check if device has biometric hardware and user has enrolled biometrics
 */
export async function checkBiometricHardware(): Promise<BiometricStatus> {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    const biometricType = await getBiometricType();
    const isEnabled = await getBiometricPreference();

    return {
      isAvailable: hasHardware,
      isEnrolled,
      biometricType,
      isEnabled,
    };
  } catch (error) {
    console.error('Error checking biometric hardware:', error);
    return {
      isAvailable: false,
      isEnrolled: false,
      biometricType: BiometricType.NONE,
      isEnabled: false,
    };
  }
}

/**
 * Get the specific biometric type available on the device
 */
export async function getBiometricType(): Promise<BiometricType> {
  try {
    const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
    
    // iOS Face ID
    if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return Platform.OS === 'ios' ? BiometricType.FACE_ID : BiometricType.FINGERPRINT;
    }
    
    // iOS Touch ID or Android Fingerprint
    if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return Platform.OS === 'ios' ? BiometricType.TOUCH_ID : BiometricType.FINGERPRINT;
    }
    
    // Android Iris
    if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return BiometricType.IRIS;
    }
    
    return BiometricType.NONE;
  } catch (error) {
    console.error('Error getting biometric type:', error);
    return BiometricType.NONE;
  }
}

/**
 * Get user-friendly label for biometric type
 */
export function getBiometricLabel(type: BiometricType): string {
  switch (type) {
    case BiometricType.FACE_ID:
      return 'Face ID';
    case BiometricType.TOUCH_ID:
      return 'Touch ID';
    case BiometricType.FINGERPRINT:
      return 'Fingerprint';
    case BiometricType.IRIS:
      return 'Iris';
    default:
      return 'Biometric';
  }
}

/**
 * Authenticate user with biometrics
 */
export async function authenticateBiometric(
  promptMessage: string = 'Authenticate to continue',
  fallbackLabel: string = 'Use passcode'
): Promise<BiometricAuthResult> {
  try {
    const status = await checkBiometricHardware();
    
    if (!status.isAvailable) {
      return {
        success: false,
        error: 'Biometric authentication is not available on this device',
      };
    }
    
    if (!status.isEnrolled) {
      return {
        success: false,
        error: 'No biometrics enrolled. Please set up biometrics in device settings.',
      };
    }
    
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      fallbackLabel,
      disableDeviceFallback: false,
      cancelLabel: 'Cancel',
    });
    
    if (result.success) {
      return { success: true };
    }
    
    // Handle specific error types
    if (result.error === 'user_cancel') {
      return {
        success: false,
        error: 'Authentication cancelled',
      };
    }
    
    if (result.error === 'system_cancel') {
      return {
        success: false,
        error: 'Authentication cancelled by system',
      };
    }
    
    if (result.error === 'lockout') {
      return {
        success: false,
        error: 'Too many failed attempts. Please try again later.',
      };
    }
    
    return {
      success: false,
      error: result.error || 'Authentication failed',
    };
  } catch (error) {
    console.error('Biometric authentication error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred during authentication',
    };
  }
}

/**
 * Save biometric preference to secure storage
 */
export async function saveBiometricPreference(enabled: boolean): Promise<void> {
  try {
    await SecureStore.setItemAsync(
      BIOMETRIC_KEYS.ENABLED,
      enabled ? 'true' : 'false'
    );
    
    if (enabled) {
      const now = new Date().toISOString();
      await SecureStore.setItemAsync(BIOMETRIC_KEYS.SETUP_DATE, now);
      
      const type = await getBiometricType();
      await SecureStore.setItemAsync(BIOMETRIC_KEYS.TYPE, type);
    }
  } catch (error) {
    console.error('Error saving biometric preference:', error);
    throw error;
  }
}

/**
 * Get biometric preference from secure storage
 */
export async function getBiometricPreference(): Promise<boolean> {
  try {
    const enabled = await SecureStore.getItemAsync(BIOMETRIC_KEYS.ENABLED);
    return enabled === 'true';
  } catch (error) {
    console.error('Error getting biometric preference:', error);
    return false;
  }
}

/**
 * Clear biometric preferences
 */
export async function clearBiometricPreferences(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(BIOMETRIC_KEYS.ENABLED);
    await SecureStore.deleteItemAsync(BIOMETRIC_KEYS.SETUP_DATE);
    await SecureStore.deleteItemAsync(BIOMETRIC_KEYS.TYPE);
  } catch (error) {
    console.error('Error clearing biometric preferences:', error);
  }
}

/**
 * Get biometric setup date
 */
export async function getBiometricSetupDate(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(BIOMETRIC_KEYS.SETUP_DATE);
  } catch (error) {
    console.error('Error getting biometric setup date:', error);
    return null;
  }
}

/**
 * Prompt user to enable biometrics with authentication
 */
export async function enableBiometric(): Promise<BiometricAuthResult> {
  const status = await checkBiometricHardware();
  
  if (!status.isAvailable) {
    return {
      success: false,
      error: 'Biometric authentication is not available on this device',
    };
  }
  
  if (!status.isEnrolled) {
    return {
      success: false,
      error: 'Please set up biometrics in your device settings first',
    };
  }
  
  const biometricLabel = getBiometricLabel(status.biometricType);
  const result = await authenticateBiometric(
    `Enable ${biometricLabel}`,
    'Use passcode'
  );
  
  if (result.success) {
    await saveBiometricPreference(true);
  }
  
  return result;
}

/**
 * Disable biometric authentication
 */
export async function disableBiometric(): Promise<void> {
  await saveBiometricPreference(false);
}

/**
 * Mock biometric authentication for development
 */
export async function mockBiometricAuth(
  shouldSucceed: boolean = true
): Promise<BiometricAuthResult> {
  // Simulate async delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (shouldSucceed) {
    return { success: true };
  }
  
  return {
    success: false,
    error: 'Mock authentication failed',
  };
}

