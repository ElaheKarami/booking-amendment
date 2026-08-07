import type { AxiosResponse } from "axios";

export type Transformer<ServerData, ClientData> = (
  data: ServerData,
) => ClientData;

export interface ApiResponse<ClientData> {
  success: boolean;
  data: ClientData;
  totalElements?: number;
  totalPages?: number;
  errorReasons?: string[];
}

interface PaginatedResponse<ServerData> {
  items?: ServerData[];
  content?: ServerData[];
  totalElements?: number;
  totalPages?: number;
  errorReasons?: string[];
}

export function convertToLocalData<ServerData, ClientData = ServerData>(
  response: AxiosResponse<ServerData | PaginatedResponse<ServerData>>,
  transformer?: Transformer<ServerData, ClientData>,
): ApiResponse<ClientData | ClientData[]> {
  const payload = response.data;
  const transform = (value: ServerData): ClientData =>
    transformer ? transformer(value) : (value as unknown as ClientData);

  if (Array.isArray(payload)) {
    return {
      success: true,
      data: payload.map(transform),
    };
  }

  if (typeof payload === "object" && payload !== null) {
    const page = payload as PaginatedResponse<ServerData>;
    const items = page.items ?? page.content;

    if (items) {
      return {
        success: true,
        data: items.map(transform),
        totalElements: page.totalElements,
        totalPages: page.totalPages,
      };
    }
  }

  return {
    success: true,
    data: transform(payload as ServerData),
  };
}
