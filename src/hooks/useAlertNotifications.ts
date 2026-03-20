import { useEffect, useRef, useCallback } from "react";

const ALERT_SOUND_URL = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbsGczJliCqN3LfUA3WX2m19W9b0tGZYSdtM++b0tGZoqjrdHBdFBOa5GnrM7CdFBOcJitqc7BdFBOcZmtqM7BdFBOcpqtqM7BdFBOc5utqM7A";

export function useAlertNotifications(alerts: any[], enabled: boolean = true) {
  const lastAlertRef = useRef<string>("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(ALERT_SOUND_URL);
    audioRef.current.volume = 0.3;
  }, []);

  const playAlert = useCallback(() => {
    try {
      audioRef.current?.play().catch(() => {});
    } catch {}
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!enabled || !alerts?.length) return;

    const criticalAlerts = alerts.filter(
      (a) => a.level === "critical" || a.level === "high"
    );
    if (!criticalAlerts.length) return;

    const alertKey = criticalAlerts.map((a) => a.title).join("|");
    if (alertKey === lastAlertRef.current) return;
    lastAlertRef.current = alertKey;

    // Play sound
    playAlert();

    // Browser notification
    if ("Notification" in window && Notification.permission === "granted") {
      const top = criticalAlerts[0];
      new Notification(`⚠️ Maverick alert`, {
        body: `${top.title}\n${top.detail || ""}`,
        icon: "/favicon.svg",
        tag: "maverick-alert",
      });
    }
  }, [alerts, enabled, playAlert]);

  return { requestNotificationPermission };
}
