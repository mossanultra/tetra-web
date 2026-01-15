import { auth } from "@/src/services/auth"; // If used in server actions or route handlers, but here we are client side mostly?
// Wait, client side service calling BFF.

export interface DeviceTokenRequest {
  token: string;
  platform: "web" | "ios" | "android";
}

const registerDeviceToken = async (token: string): Promise<void> => {
  const response = await fetch("/api/user/device-token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token, platform: "web" }),
  });

  if (!response.ok) {
    console.error("Failed to register device token");
  }
};

const deleteDeviceToken = async (token: string): Promise<void> => {
  const response = await fetch("/api/user/device-token", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    console.error("Failed to delete device token");
  }
};

export const deviceTokenApi = {
  registerDeviceToken,
  deleteDeviceToken,
};
