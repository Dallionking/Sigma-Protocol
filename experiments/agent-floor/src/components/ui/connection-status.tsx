"use client";

import { useEffect, useState } from "react";
import { Wifi, WifiOff, RefreshCw, AlertCircle, Loader2 } from "lucide-react";
import { useFloorStore, type ConnectionStatus } from "@/lib/store/floor-store";

interface ConnectionStatusIndicatorProps {
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

const statusConfig: Record<
  ConnectionStatus,
  {
    color: string;
    bgColor: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    animate?: boolean;
  }
> = {
  disconnected: {
    color: "text-red-400",
    bgColor: "bg-red-400",
    icon: WifiOff,
    label: "Disconnected",
  },
  connecting: {
    color: "text-yellow-400",
    bgColor: "bg-yellow-400",
    icon: Loader2,
    label: "Connecting...",
    animate: true,
  },
  connected: {
    color: "text-green-400",
    bgColor: "bg-green-400",
    icon: Wifi,
    label: "Connected",
  },
  reconnecting: {
    color: "text-orange-400",
    bgColor: "bg-orange-400",
    icon: RefreshCw,
    label: "Reconnecting...",
    animate: true,
  },
  failed: {
    color: "text-red-500",
    bgColor: "bg-red-500",
    icon: AlertCircle,
    label: "Connection Failed",
  },
};

const sizeClasses = {
  sm: { dot: "w-2 h-2", icon: "w-3 h-3", text: "text-xs" },
  md: { dot: "w-2.5 h-2.5", icon: "w-4 h-4", text: "text-sm" },
  lg: { dot: "w-3 h-3", icon: "w-5 h-5", text: "text-base" },
};

export function ConnectionStatusIndicator({
  showLabel = true,
  size = "md",
}: ConnectionStatusIndicatorProps) {
  const { connectionStatus, reconnectAttempts, lastError } = useFloorStore();
  const config = statusConfig[connectionStatus];
  const sizes = sizeClasses[size];

  const Icon = config.icon;

  return (
    <div className="flex items-center gap-2">
      <span
        className={`${sizes.dot} rounded-full ${config.bgColor} ${
          config.animate ? "animate-pulse" : ""
        }`}
      />
      {showLabel && (
        <span className={`${sizes.text} text-floor-muted flex items-center gap-1.5`}>
          <Icon
            className={`${sizes.icon} ${config.color} ${
              config.animate ? "animate-spin" : ""
            }`}
          />
          <span>
            {config.label}
            {connectionStatus === "reconnecting" && reconnectAttempts > 0 && (
              <span className="ml-1 opacity-70">
                (attempt {reconnectAttempts}/5)
              </span>
            )}
          </span>
        </span>
      )}
    </div>
  );
}

interface ConnectionOverlayProps {
  onRetry?: () => void;
  onCancel?: () => void;
}

export function ConnectionOverlay({ onRetry, onCancel }: ConnectionOverlayProps) {
  const { connectionStatus, reconnectAttempts, lastError, reconnect, cancelReconnect } =
    useFloorStore();
  const [countdown, setCountdown] = useState<number | null>(null);

  // Calculate countdown for next retry
  useEffect(() => {
    if (connectionStatus !== "reconnecting") {
      setCountdown(null);
      return;
    }

    // Calculate delay based on exponential backoff
    const baseDelay = 1000;
    const maxDelay = 30000;
    const multiplier = 2;
    const delay = Math.min(baseDelay * Math.pow(multiplier, reconnectAttempts - 1), maxDelay);
    const seconds = Math.ceil(delay / 1000);

    setCountdown(seconds);

    const interval = setInterval(() => {
      setCountdown((prev) => (prev !== null && prev > 0 ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(interval);
  }, [connectionStatus, reconnectAttempts]);

  // Only show overlay for reconnecting or failed states
  if (connectionStatus !== "reconnecting" && connectionStatus !== "failed") {
    return null;
  }

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      reconnect();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      cancelReconnect();
    }
  };

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-floor-panel border border-floor-accent rounded-xl p-6 max-w-md mx-4 text-center shadow-2xl">
        {connectionStatus === "reconnecting" ? (
          <>
            <div className="flex justify-center mb-4">
              <RefreshCw className="w-12 h-12 text-orange-400 animate-spin" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Reconnecting...</h3>
            <p className="text-floor-muted mb-4">
              Connection lost. Attempting to reconnect.
              {countdown !== null && countdown > 0 && (
                <span className="block mt-1">
                  Next attempt in <strong>{countdown}</strong> second
                  {countdown !== 1 ? "s" : ""}
                </span>
              )}
            </p>
            <p className="text-sm text-floor-muted mb-4">
              Attempt {reconnectAttempts} of 5
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded-lg bg-floor-accent hover:bg-floor-accent/80 transition-colors text-floor-text"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-center mb-4">
              <AlertCircle className="w-12 h-12 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Connection Failed</h3>
            <p className="text-floor-muted mb-2">
              Unable to connect to the server after multiple attempts.
            </p>
            {lastError && (
              <p className="text-sm text-red-400 mb-4 font-mono bg-red-400/10 rounded p-2">
                {lastError}
              </p>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleRetry}
                className="px-4 py-2 rounded-lg bg-floor-highlight hover:bg-floor-highlight/80 transition-colors text-white flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded-lg bg-floor-accent hover:bg-floor-accent/80 transition-colors text-floor-text"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Toast-style notification for connection events
export function ConnectionToast() {
  const { connectionStatus, reconnectAttempts } = useFloorStore();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (connectionStatus === "connected" && reconnectAttempts === 0) {
      // Don't show toast on initial connection
      return;
    }

    if (connectionStatus === "connected") {
      setMessage("Reconnected successfully!");
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(timer);
    }

    if (connectionStatus === "reconnecting" && reconnectAttempts === 1) {
      setMessage("Connection lost. Reconnecting...");
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [connectionStatus, reconnectAttempts]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="bg-floor-panel border border-floor-accent rounded-lg px-4 py-3 shadow-lg flex items-center gap-3">
        {connectionStatus === "connected" ? (
          <>
            <Wifi className="w-5 h-5 text-green-400" />
            <span className="text-green-400">{message}</span>
          </>
        ) : (
          <>
            <RefreshCw className="w-5 h-5 text-orange-400 animate-spin" />
            <span className="text-orange-400">{message}</span>
          </>
        )}
      </div>
    </div>
  );
}
