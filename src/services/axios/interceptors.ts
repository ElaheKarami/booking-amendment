import type { AxiosInstance } from "axios";
import { normalizeApiError } from "@/services/errorHandling";

export function applyInterceptors(instance: AxiosInstance): AxiosInstance {
  instance.interceptors.response.use(
    (response) => response,
    (error: unknown) => Promise.reject(normalizeApiError(error)),
  );

  return instance;
}
