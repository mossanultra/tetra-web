import { User } from "../types/user";

export const getMyself = async (): Promise<User> => {
  const res = await fetch(`/api/user`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch user (${res.status})`);
  }

  const data = await res.json();
  return data;
};
