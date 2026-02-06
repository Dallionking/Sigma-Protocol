---
name: mobile-app-security
description: "OWASP Mobile Top 10 2024 and MASVS security skill. React Native focus with certificate pinning, secure storage, biometric auth, jailbreak detection, deep link validation, and screenshot prevention."
version: "1.0.0"
source: "sigma-security"
triggers:
  - security-audit
  - implement-prd
  - step-8-technical-spec
  - mobile-feature
  - react-native
---

# Mobile App Security Skill

Comprehensive coverage of the **OWASP Mobile Top 10 2024** and **MASVS** with React Native-focused code examples. Use this skill when building, auditing, or reviewing mobile applications.

## When to Invoke

Invoke this skill when:

- Building React Native mobile applications
- Running security audits on mobile apps
- Implementing secure storage, authentication, or network communication
- Reviewing mobile app code for security vulnerabilities
- Designing mobile architecture (Step 2, Step 8)

---

## M1:2024 - Improper Credential Usage

Hardcoded credentials, improper storage of API keys, or misuse of authentication credentials.

### Bad Pattern

```typescript
// VULNERABLE: Hardcoded API keys in source code
const API_KEY = 'sk_live_abc123def456';
const API_SECRET = 'secret_xyz789';

// VULNERABLE: Storing credentials in AsyncStorage (unencrypted)
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.setItem('auth_token', token);
await AsyncStorage.setItem('refresh_token', refreshToken);
```

### Good Pattern

```typescript
// SECURE: Use react-native-keychain for credential storage
import * as Keychain from 'react-native-keychain';

async function storeCredentials(token: string, refreshToken: string) {
  await Keychain.setGenericPassword('auth', JSON.stringify({
    accessToken: token,
    refreshToken: refreshToken,
  }), {
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    securityLevel: Keychain.SECURITY_LEVEL.SECURE_HARDWARE,
  });
}

async function getCredentials(): Promise<{ accessToken: string; refreshToken: string } | null> {
  const credentials = await Keychain.getGenericPassword();
  if (credentials) {
    return JSON.parse(credentials.password);
  }
  return null;
}

async function clearCredentials() {
  await Keychain.resetGenericPassword();
}

// SECURE: API keys from build-time environment variables
// Use react-native-config, not hardcoded strings
import Config from 'react-native-config';

const apiClient = axios.create({
  baseURL: Config.API_BASE_URL,
  headers: { 'X-API-Key': Config.API_KEY },
});
```

### Remediation Checklist

- [ ] Never hardcode API keys, secrets, or credentials in source code
- [ ] Use `react-native-keychain` for secure credential storage (not AsyncStorage)
- [ ] Use `react-native-config` for build-time environment variables
- [ ] Set `ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY` for keychain items
- [ ] Clear credentials on logout

---

## M2:2024 - Inadequate Supply Chain Security

Vulnerable or malicious third-party libraries, SDK integrations, and build pipeline compromises.

### Good Pattern

```json
// package.json - Dependency security practices
{
  "scripts": {
    "audit": "npm audit --production",
    "audit:fix": "npm audit fix",
    "verify-pods": "cd ios && pod audit",
    "check-native": "npx react-native-integrity-check"
  },
  "resolutions": {
    // Force secure versions of transitive dependencies
    "minimist": ">=1.2.8",
    "json5": ">=2.2.3"
  }
}
```

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
  - package-ecosystem: "gradle"
    directory: "/android"
    schedule:
      interval: "weekly"
  - package-ecosystem: "cocoapods"
    directory: "/ios"
    schedule:
      interval: "weekly"
```

### Remediation Checklist

- [ ] Run `npm audit` and `pod audit` in CI
- [ ] Use Dependabot for npm, CocoaPods, and Gradle
- [ ] Pin native SDK versions (no floating versions)
- [ ] Review native module permissions before adding

---

## M3:2024 - Insecure Authentication/Authorization

Weak authentication, missing server-side validation, or client-side-only authorization.

### Bad Pattern

```typescript
// VULNERABLE: Client-side only role check
function AdminScreen() {
  const { user } = useAuth();
  // Attacker can modify the app to bypass this check
  if (user.role !== 'admin') return <Redirect to="/home" />;
  return <AdminPanel />;
}
```

### Good Pattern

```typescript
// SECURE: Biometric authentication with react-native-biometrics
import ReactNativeBiometrics from 'react-native-biometrics';

const rnBiometrics = new ReactNativeBiometrics();

async function authenticateWithBiometrics(): Promise<boolean> {
  const { available, biometryType } = await rnBiometrics.isSensorAvailable();
  if (!available) return false;

  const { success } = await rnBiometrics.simplePrompt({
    promptMessage: 'Confirm your identity',
    cancelButtonText: 'Cancel',
  });

  return success;
}

// SECURE: Server-validated authorization
async function fetchAdminData() {
  const credentials = await getCredentials();
  if (!credentials) throw new Error('Not authenticated');

  // Server validates the token and role - client check is just UX
  const response = await fetch('/api/admin/dashboard', {
    headers: { Authorization: `Bearer ${credentials.accessToken}` },
  });

  if (response.status === 403) {
    throw new Error('Not authorized');
  }

  return response.json();
}

// SECURE: Biometric-gated sensitive operations
async function confirmPayment(paymentId: string) {
  const authenticated = await authenticateWithBiometrics();
  if (!authenticated) {
    Alert.alert('Authentication required', 'Please verify your identity');
    return;
  }

  // Proceed with server-validated payment
  const response = await apiClient.post(`/payments/${paymentId}/confirm`, {
    biometricVerified: true,
  });
  return response.data;
}
```

---

## M4:2024 - Insufficient Input/Output Validation

Missing validation of data from servers, deep links, intents, and user input.

### Bad Pattern

```typescript
// VULNERABLE: Deep link without validation
// Linking config: myapp://product/:id
function DeepLinkHandler({ url }: { url: string }) {
  const productId = url.split('/').pop();
  // No validation - attacker can inject malicious IDs
  navigation.navigate('Product', { id: productId });
}
```

### Good Pattern

```typescript
// SECURE: Deep link validation
import { z } from 'zod';
import { Linking } from 'react-native';

const deepLinkSchema = z.object({
  productId: z.string().uuid(),
});

function useDeepLinks() {
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      try {
        const url = new URL(event.url);

        // Validate scheme
        if (url.protocol !== 'myapp:') return;

        // Validate path and parameters
        const match = url.pathname.match(/^\/product\/(.+)$/);
        if (!match) return;

        const result = deepLinkSchema.safeParse({ productId: match[1] });
        if (!result.success) {
          console.warn('Invalid deep link parameters');
          return;
        }

        navigation.navigate('Product', { id: result.data.productId });
      } catch (error) {
        console.warn('Invalid deep link URL');
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription.remove();
  }, []);
}

// SECURE: Server response validation
const productSchema = z.object({
  id: z.string().uuid(),
  name: z.string().max(200),
  price: z.number().min(0),
  description: z.string().max(5000),
});

async function fetchProduct(id: string) {
  const response = await apiClient.get(`/products/${id}`);
  const result = productSchema.safeParse(response.data);
  if (!result.success) {
    throw new Error('Invalid server response');
  }
  return result.data;
}
```

---

## M5:2024 - Insecure Communication

Unencrypted network traffic, missing certificate pinning, and TLS misconfigurations.

### Good Pattern - Certificate Pinning

```typescript
// SECURE: Certificate pinning with react-native-ssl-pinning
import { fetch as pinnedFetch } from 'react-native-ssl-pinning';

async function secureApiCall(endpoint: string, options: RequestInit = {}) {
  const response = await pinnedFetch(`https://api.example.com${endpoint}`, {
    ...options,
    sslPinning: {
      certs: ['api_cert'], // Certificate in app bundle
    },
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
    },
    timeoutInterval: 10000,
  });

  return response.json();
}

// SECURE: Network security config for Android
// android/app/src/main/res/xml/network_security_config.xml
/*
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
  <domain-config>
    <domain includeSubdomains="true">api.example.com</domain>
    <pin-set expiration="2025-06-01">
      <pin digest="SHA-256">AABBCC...</pin>
      <pin digest="SHA-256">DDEEFF...</pin> <!-- Backup pin -->
    </pin-set>
  </domain-config>
  <!-- Block cleartext (HTTP) traffic -->
  <base-config cleartextTrafficPermitted="false" />
</network-security-config>
*/

// SECURE: App Transport Security for iOS
// ios/Info.plist
/*
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsArbitraryLoads</key>
  <false/> <!-- Never set to true in production -->
</dict>
*/
```

---

## M6:2024 - Inadequate Privacy Controls

Exposing PII, insufficient data minimization, missing consent management.

### Good Pattern

```typescript
// SECURE: Data minimization in API requests
async function fetchUserProfile(userId: string) {
  // Request only needed fields
  const response = await apiClient.get(`/users/${userId}`, {
    params: { fields: 'name,avatar,preferences' },
    // Exclude: email, phone, address, payment methods
  });
  return response.data;
}

// SECURE: Clipboard security - clear sensitive data
import Clipboard from '@react-native-clipboard/clipboard';

function SensitiveField({ value }: { value: string }) {
  const handleCopy = () => {
    Clipboard.setString(value);
    // Auto-clear clipboard after 30 seconds
    setTimeout(() => Clipboard.setString(''), 30000);
  };

  return (
    <TouchableOpacity onPress={handleCopy}>
      <Text>{maskSensitiveData(value)}</Text>
    </TouchableOpacity>
  );
}

function maskSensitiveData(value: string): string {
  if (value.length <= 4) return '****';
  return '****' + value.slice(-4);
}
```

---

## M7:2024 - Insufficient Binary Protections

Lack of code obfuscation, anti-tampering, and reverse engineering protection.

### Good Pattern

```javascript
// metro.config.js - Enable Hermes bytecode compilation
module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};
```

```groovy
// android/app/build.gradle - Enable ProGuard/R8
android {
    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

```typescript
// SECURE: Jailbreak/root detection
import JailMonkey from 'jail-monkey';

function SecurityGate({ children }: { children: React.ReactNode }) {
  const [isSecure, setIsSecure] = useState(true);

  useEffect(() => {
    const checkSecurity = async () => {
      const isJailbroken = JailMonkey.isJailBroken();
      const isDebugged = JailMonkey.isDebuggedMode();
      const canMockLocation = JailMonkey.canMockLocation();

      if (isJailbroken || isDebugged) {
        setIsSecure(false);
        // Log security event
        await apiClient.post('/api/security/device-check', {
          jailbroken: isJailbroken,
          debugged: isDebugged,
          mockLocation: canMockLocation,
        });
      }
    };

    checkSecurity();
  }, []);

  if (!isSecure) {
    return (
      <SafeAreaView>
        <Text>This app cannot run on compromised devices for security reasons.</Text>
      </SafeAreaView>
    );
  }

  return <>{children}</>;
}
```

---

## M8:2024 - Security Misconfiguration

Debug settings in production, excessive permissions, insecure default configurations.

### Remediation Checklist

- [ ] Disable debug logging in production builds
- [ ] Remove `android:debuggable="false"` verification in release
- [ ] Set `NSAllowsArbitraryLoads` to false in iOS Info.plist
- [ ] Enable Android `cleartextTrafficPermitted="false"`
- [ ] Request only necessary permissions (camera, location, etc.)
- [ ] Remove unused permissions from AndroidManifest.xml
- [ ] Disable backup of sensitive data (`android:allowBackup="false"`)

---

## M9:2024 - Insecure Data Storage

Storing sensitive data in unprotected locations (SharedPreferences, UserDefaults, SQLite).

### Good Pattern

```typescript
// SECURE: Encrypted storage for sensitive data
import EncryptedStorage from 'react-native-encrypted-storage';

async function storeSecureData(key: string, value: string) {
  await EncryptedStorage.setItem(key, value);
  // Uses Android EncryptedSharedPreferences / iOS Keychain
}

async function getSecureData(key: string): Promise<string | null> {
  return EncryptedStorage.getItem(key);
}

// SECURE: Data classification for storage decisions
type DataClassification = 'public' | 'internal' | 'sensitive' | 'restricted';

const STORAGE_MAP: Record<DataClassification, 'memory' | 'asyncStorage' | 'encrypted' | 'keychain'> = {
  public: 'asyncStorage',        // Theme, language preferences
  internal: 'asyncStorage',      // App state, non-sensitive settings
  sensitive: 'encrypted',        // User profile, preferences with PII
  restricted: 'keychain',        // Tokens, passwords, biometric keys
};

async function storeData(key: string, value: string, classification: DataClassification) {
  const storage = STORAGE_MAP[classification];

  switch (storage) {
    case 'keychain':
      await Keychain.setGenericPassword(key, value, {
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
      break;
    case 'encrypted':
      await EncryptedStorage.setItem(key, value);
      break;
    case 'asyncStorage':
      await AsyncStorage.setItem(key, value);
      break;
    case 'memory':
      // In-memory only, not persisted
      break;
  }
}
```

---

## M10:2024 - Insufficient Cryptography

Using weak algorithms, hardcoded keys, or improper crypto implementations.

### Good Pattern

```typescript
// SECURE: Use platform crypto, not custom implementations
import { NativeModules } from 'react-native';
import crypto from 'react-native-quick-crypto';

// Generate secure random values
function generateSecureRandom(length: number): string {
  const bytes = crypto.randomBytes(length);
  return bytes.toString('hex');
}

// SECURE: Derive encryption key from user credentials
async function deriveKey(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 100000, 32, 'sha256', (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });
}
```

---

## Screenshot Prevention

```typescript
// SECURE: Prevent screenshots on sensitive screens
import { useIsFocused } from '@react-navigation/native';
import { Platform, NativeModules } from 'react-native';

function usePreventScreenCapture(enabled: boolean = true) {
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!enabled || !isFocused) return;

    if (Platform.OS === 'android') {
      NativeModules.FlagSecure?.enable();
    }
    // iOS: Use UIScreen.main.isCaptured observer

    return () => {
      if (Platform.OS === 'android') {
        NativeModules.FlagSecure?.disable();
      }
    };
  }, [enabled, isFocused]);
}

// Usage in sensitive screens
function PaymentScreen() {
  usePreventScreenCapture(true);

  return (
    <View>
      <Text>Payment Details</Text>
      {/* Sensitive content */}
    </View>
  );
}
```

---

## Mobile Security Audit Checklist

### Storage
- [ ] Credentials stored in Keychain (not AsyncStorage)
- [ ] Sensitive data encrypted at rest
- [ ] No sensitive data in app logs
- [ ] Clipboard auto-cleared for sensitive data

### Network
- [ ] Certificate pinning implemented
- [ ] No cleartext (HTTP) traffic allowed
- [ ] API responses validated with schemas
- [ ] TLS 1.2+ enforced

### Authentication
- [ ] Biometric authentication for sensitive operations
- [ ] Tokens stored in secure storage
- [ ] Session timeout implemented
- [ ] Server-side authorization (not client-only)

### Binary
- [ ] Hermes bytecode compilation enabled
- [ ] ProGuard/R8 enabled for Android release
- [ ] Jailbreak/root detection active
- [ ] Debug mode disabled in production

### Input
- [ ] Deep links validated against schemas
- [ ] Server responses validated
- [ ] User input sanitized

---

## Integration with Sigma Protocol

### /security-audit
Use the mobile-specific checklist when auditing React Native apps.

### Step 8 (Technical Spec)
Reference mobile security requirements for app architecture.

### /implement-prd
Check mobile implementations against M1-M10 before marking complete.

---

_Mobile apps are distributed to untrusted devices. Every piece of data stored locally and every network call must be treated as potentially interceptable._
