import { User } from "../types/user";

type FetchArgs = {
  idToken?: string;
  baseUrl?: string;
};

export const fetchUser = async ({
  idToken,
  baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
}: FetchArgs): Promise<User> => {
  const res = await fetch(`${baseUrl}/user`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(idToken ? { Authorization: idToken } : {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Timeline API error: ${res.status}`);
  }

  const data = await res.json();
  return data;
};
