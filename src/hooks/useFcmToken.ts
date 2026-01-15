import { useEffect, useState } from "react";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { app } from "@/src/lib/firebase";
import { deviceTokenApi } from "@/src/services/deviceToken";

const useFcmToken = () => {
  const [token, setToken] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>("default");

  useEffect(() => {
    const retrieveToken = async () => {
      try {
        if (typeof window !== "undefined" && "serviceWorker" in navigator) {
          const messaging = getMessaging(app);

          // Handle foreground messages
          onMessage(messaging, (payload) => {
            console.log("Message received. ", payload);
            if (payload.notification) {
              const title = payload.notification.title || "Notification";
              const body = payload.notification.body || "";

              // Simple foreground notification
              if (Notification.permission === "granted") {
                new Notification(title, { body, icon: "/icon.png" });
              }
            }
          });

          const permission = await Notification.requestPermission();
          setNotificationPermission(permission);

          if (permission === "granted") {
            const currentToken = await getToken(messaging, {
              vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
            });
            if (currentToken) {
              setToken(currentToken);
              console.log("FCM Token:", currentToken);

              // Register token with backend
              await deviceTokenApi.registerDeviceToken(currentToken);
            } else {
              console.log(
                "No registration token available. Request permission to generate one."
              );
            }
          }
        }
      } catch (error) {
        console.error("An error occurred while retrieving token:", error);
      }
    };

    retrieveToken();
  }, []);

  return { token, notificationPermission };
};

export default useFcmToken;
