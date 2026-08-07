import axios from "axios";
import { cookies } from "next/headers";

export async function createServerAxios() {
  const backendUrl = process.env.BACKEND_URL;

  if (!backendUrl) {
    throw new Error("BACKEND_URL must be configured on the server.");
  }

  const accessToken = (await cookies()).get("accessToken")?.value;

  return axios.create({
    baseURL: backendUrl,
    headers: accessToken
      ? {
          Authorization: `Bearer ${accessToken}`,
        }
      : undefined,
  });
}
