import { convertToLocalData } from "./apiResponse.js";
import {
  get,
  post,
  put,
  remove,
  upload,
  fetcher,
  getBlob,
} from "./axios-template.js";
import type { RequestConfig, TransformerFn } from "./types.js";

export const REQUEST_TYPE = {
  GET: "get",
  POST: "post",
  PUT: "put",
  REMOVE: "remove",
  UPLOAD: "upload",
  FETCHER: "fetcher",
  IMAGE_FETCHER: "imageFetcher",
} as const;

export type RequestType = (typeof REQUEST_TYPE)[keyof typeof REQUEST_TYPE];

interface Props {
  url: string;
  type?: RequestType;
  transformer?: TransformerFn;
  inputTransformer?: TransformerFn;
  body?: unknown;
  config?: RequestConfig;
}

const isSuccess = (status?: number | string) =>
  !!status && status.toString().startsWith("2");

// Single place that shapes every transport response into the frontend contract.
function shapeResponse(res: any, transformer?: TransformerFn) {
  const success = isSuccess(res?.status);

  if (transformer) {
    return {
      success,
      ...(!success && {
        errorReasons: res?.data?.errorReasons,
        apiStatus: res?.status,
      }),
      ...convertToLocalData({ data: res?.data, success, transformer }),
    };
  }

  return { ...res?.data, success, apiStatus: res?.status };
}

export function apiRequestObject({
  url,
  type = REQUEST_TYPE.GET,
  transformer,
  inputTransformer,
  body,
  config,
}: Props) {
  // Apply an outgoing (request) transformer when the backend contract differs.
  const transformedData = inputTransformer ? inputTransformer(body) : body;

  switch (type) {
    case REQUEST_TYPE.FETCHER:
      return fetcher(url, config).then((res: any) =>
        shapeResponse(res, transformer),
      );
    case REQUEST_TYPE.GET:
      return get(url, config).then((res: any) =>
        shapeResponse(res, transformer),
      );
    case REQUEST_TYPE.POST:
      return post(url, transformedData, config).then((res: any) =>
        shapeResponse(res, transformer),
      );
    case REQUEST_TYPE.PUT:
      return put(url, transformedData, config).then((res: any) =>
        shapeResponse(res, transformer),
      );
    case REQUEST_TYPE.UPLOAD:
      return upload(url, transformedData, config).then((res: any) =>
        shapeResponse(res, transformer),
      );
    case REQUEST_TYPE.REMOVE:
      return remove(url, config).then((res: any) =>
        shapeResponse(res, transformer),
      );
    case REQUEST_TYPE.IMAGE_FETCHER:
      return getBlob(url, config).then((res: any) => res);
    default:
      return Promise.resolve(null);
  }
}

// Convenience wrapper for data-fetching hooks (e.g. React Query / SWR key fns).
export function fetcherWrapper({
  url,
  transformer,
  config,
}: {
  url: string;
  transformer?: TransformerFn;
  config?: RequestConfig;
}) {
  return () =>
    apiRequestObject({
      url,
      config,
      type: REQUEST_TYPE.FETCHER,
      transformer,
    });
}
