import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

import { STORAGE_KEYS } from "@/lib/storageKeys";

export type GateTarget =
  | "/error-offline"
  | "/maintenance"
  | "/update-required"
  | "/welcome"
  | "/signin-credentials"
  | "/(tabs)/home";

type GateSnapshot = {
  target: GateTarget;
  // Useful for debugging / future deferred deep-linking.
  finalHasNetwork: boolean;
  maintenance: boolean;
  forceUpdate: boolean;
  isFirstLaunch: boolean;
  onboardingComplete: boolean;
  hasSession: boolean;
};

export function computeGateTarget(input: {
  finalHasNetwork: boolean;
  maintenance: boolean;
  forceUpdate: boolean;
  isFirstLaunch: boolean;
  onboardingComplete: boolean;
  hasSession: boolean;
}): GateTarget {
  const { finalHasNetwork, maintenance, forceUpdate, isFirstLaunch, onboardingComplete, hasSession } = input;

  if (!finalHasNetwork) return "/error-offline";
  if (maintenance) return "/maintenance";
  if (forceUpdate) return "/update-required";
  if (isFirstLaunch || !onboardingComplete) return "/welcome";
  if (hasSession) return "/(tabs)/home";
  return "/signin-credentials";
}

/**
 * Resolves the app “gate” decision used by Splash.
 * This is shared so deep links can’t bypass maintenance/update/offline checks.
 */
export async function resolveGateTarget(): Promise<GateSnapshot> {
  // Network
  const net = await NetInfo.fetch();
  const hasNetwork = net.isConnected && net.isInternetReachable !== false;

  const pairs = await AsyncStorage.multiGet([
    STORAGE_KEYS.hasLaunched,
    STORAGE_KEYS.onboardingComplete,
    STORAGE_KEYS.hasSession,
    STORAGE_KEYS.maintenance,
    STORAGE_KEYS.forceUpdate,
    STORAGE_KEYS.networkOverride,
  ]);

  const map = Object.fromEntries(pairs);

  const networkOverride = map[STORAGE_KEYS.networkOverride];
  const finalHasNetwork =
    networkOverride === "true" ? true : networkOverride === "false" ? false : !!hasNetwork;

  // Remote config stub (overridable via demo flags)
  const maintenance = map[STORAGE_KEYS.maintenance] === "true";
  const forceUpdate = map[STORAGE_KEYS.forceUpdate] === "true";

  // Launch flags
  const hasLaunched = map[STORAGE_KEYS.hasLaunched] === "true";
  const isFirstLaunch = !hasLaunched;
  const onboardingComplete = map[STORAGE_KEYS.onboardingComplete] === "true";
  const hasSession = map[STORAGE_KEYS.hasSession] === "true";

  if (isFirstLaunch) {
    // Set once so future boots follow normal logic.
    await AsyncStorage.setItem(STORAGE_KEYS.hasLaunched, "true");
  }

  const target = computeGateTarget({
    finalHasNetwork,
    maintenance,
    forceUpdate,
    isFirstLaunch,
    onboardingComplete,
    hasSession,
  });

  return {
    target,
    finalHasNetwork,
    maintenance,
    forceUpdate,
    isFirstLaunch,
    onboardingComplete,
    hasSession,
  };
}



