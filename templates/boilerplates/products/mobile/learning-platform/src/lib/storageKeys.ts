export const STORAGE_KEYS = {
  hasLaunched: "@app/hasLaunched",
  onboardingComplete: "@app/onboardingComplete",
  hasSession: "@app/hasSession",

  // Demo overrides / stubs for routing gate behavior
  maintenance: "@app/dev/maintenance",
  forceUpdate: "@app/dev/forceUpdate",
  networkOverride: "@app/dev/hasNetwork", // "true" | "false" | unset (auto)
  demoMode: "@app/dev/demoMode", // When true, reset state on every app launch
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];




