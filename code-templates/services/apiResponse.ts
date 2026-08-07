import type { TransformerFn } from "./types.js";

interface Props {
  data: any;
  success: boolean;
  transformer?: TransformerFn;
}

// Normalizes the many backend list/object shapes into a stable frontend model.
const formatResponse = (data: any, transformer?: TransformerFn) => {
  if (data?.items) {
    return {
      items: transformer
        ? data.items.map((item: any) => transformer(item))
        : data.items,
      totalElements: data?.totalElements,
      totalPages: data?.totalPages,
      ...(data?.pageData?.extraFields
        ? { extraFields: data.pageData.extraFields }
        : {}),
    };
  }

  if ((data?.content && Array.isArray(data.content)) || Array.isArray(data)) {
    return {
      items: transformer
        ? Array.isArray(data)
          ? data.map((item: any) => transformer(item))
          : data.content.map((item: any) => transformer(item))
        : data?.content || data,
      totalElements: data?.totalElements,
      totalPages: data?.totalPages,
    };
  }

  return transformer ? { ...transformer(data) } : data;
};

export function convertToLocalData({ data, success, transformer }: Props): any {
  return {
    success,
    ...formatResponse(data, transformer),
    errorReasons: data?.errorReasons,
  };
}
