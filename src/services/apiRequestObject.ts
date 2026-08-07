import type { AxiosRequestConfig } from "axios";
import { clientAxios } from "@/services/axios";
import {
  convertToLocalData,
  type ApiResponse,
  type Transformer,
} from "./apiResponse";

export const REQUEST_TYPE = {
  GET: "get",
  POST: "post",
  PUT: "put",
  REMOVE: "delete",
  UPLOAD: "upload",
} as const;

type RequestType = (typeof REQUEST_TYPE)[keyof typeof REQUEST_TYPE];

interface ApiRequestOptions<ServerData, ClientData, Input> {
  url: string;
  type?: RequestType;
  transformer?: Transformer<ServerData, ClientData>;
  inputTransformer?: (data: Input) => unknown;
  body?: Input;
  config?: AxiosRequestConfig;
}

export async function apiRequestObject<
  ServerData,
  ClientData = ServerData,
  Input = never,
>({
  url,
  type = REQUEST_TYPE.GET,
  transformer,
  inputTransformer,
  body,
  config,
}: ApiRequestOptions<ServerData, ClientData, Input>): Promise<
  ApiResponse<ClientData | ClientData[]>
> {
  const requestBody =
    inputTransformer && body !== undefined ? inputTransformer(body) : body;

  const response = await (type === REQUEST_TYPE.GET
    ? clientAxios.get<ServerData>(url, config)
    : type === REQUEST_TYPE.POST
      ? clientAxios.post<ServerData>(url, requestBody, config)
      : type === REQUEST_TYPE.PUT
        ? clientAxios.put<ServerData>(url, requestBody, config)
        : type === REQUEST_TYPE.REMOVE
          ? clientAxios.delete<ServerData>(url, config)
          : clientAxios.post<ServerData>(url, requestBody, {
              ...config,
              headers: {
                "Content-Type": "multipart/form-data",
                ...config?.headers,
              },
            }));

  return convertToLocalData(response, transformer);
}
