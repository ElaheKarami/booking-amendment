// lib/backendApi.ts
import {
  apiRequestObject,
  REQUEST_TYPE,
} from "@/services/apiRequestObject-template";
import { cookies } from "next/headers";

export async function backendGet({
  url,
  transformer,
}: {
  url: string;
  transformer?: (data: any) => any;
}) {
  const token = (await cookies()).get("accessToken")?.value;

  return apiRequestObject({
    url: url,
    type: REQUEST_TYPE.GET,
    transformer,
    config: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}
