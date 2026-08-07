import axios, { AxiosResponse } from "axios";
import { v7 as uuidv7 } from "uuid";
import errorHandling from "./errorHandling.js";
import { getApiCoreConfig } from "./config.js";
import type { RequestConfig } from "./types.js";

export const baseURL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
export const baseUrlGateway = process.env.NEXT_PUBLIC_BACKEND_BASE_URL_GATEWAY;

const headers: Record<string, string> = {};

const axiosApiInstance = axios.create({ baseURL, headers });

axiosApiInstance.interceptors.request.use((req) => {
  req.headers = req.headers || {};

  // Reuse an inbound correlation id when present, otherwise mint a UUID v7.
  if (!req.headers["X-CORRELATION-ID"]) {
    req.headers["X-CORRELATION-ID"] = uuidv7();
  }

  return req;
});

axiosApiInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;

    if (error?.response?.status === 401) {
      // Browser-only cleanup + app-defined sign-out; never runs on the server.
      if (typeof window !== "undefined") {
        localStorage.removeItem("requestedSchedule");
      }
      await getApiCoreConfig().onUnauthorized();
      return Promise.reject(error);
    }

    if (
      error?.code !== "ERR_CANCELED" &&
      originalRequest?.responseType !== "blob"
    ) {
      errorHandling(
        error,
        ["post", "put", "delete"].includes(
          originalRequest?.method?.toLowerCase(),
        ),
      );
    }

    return Promise.reject(error.response);
  },
);

export async function post(
  url: string,
  body: unknown,
  config: RequestConfig = {},
) {
  return axiosApiInstance
    .post(url, body, config)
    .then((res) => res)
    .catch((error) => error);
}

export async function get(url: string, config: RequestConfig = {}) {
  return axiosApiInstance
    .get(url, config)
    .then((res) => res)
    .catch((error) => error);
}

export async function getBlob(url: string, config: RequestConfig = {}) {
  return axiosApiInstance
    .get(url, { responseType: "blob", ...config })
    .then((res) => ({
      success: res?.status?.toString().startsWith("2"),
      data: URL.createObjectURL(res.data),
    }))
    .catch((error) => error);
}

export async function put(
  url: string,
  body: unknown,
  config: RequestConfig = {},
) {
  return axiosApiInstance
    .put(url, body, config)
    .then((res) => res)
    .catch((error) => error);
}

export async function upload(
  url: string,
  body: unknown,
  config: RequestConfig = {},
) {
  return axiosApiInstance
    .post(url, body, {
      ...config,
      headers: { "Content-Type": "multipart/form-data", ...config.headers },
    })
    .then((res) => res)
    .catch((error) => error);
}

export async function remove(url: string, config: RequestConfig = {}) {
  return axiosApiInstance
    .delete(url, config)
    .then((res) => res)
    .catch((error) => error);
}

export function fetcher(url: string, config: RequestConfig = {}) {
  return axiosApiInstance
    .get(url, config)
    .then((res: AxiosResponse) => res)
    .catch((error) => error);
}

export default axiosApiInstance;
