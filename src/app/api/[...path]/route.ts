import { NextRequest, NextResponse } from "next/server";
import { createServerAxios } from "@/services/axios";
import { normalizeApiError } from "@/services/errorHandling";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

async function proxyRequest(request: NextRequest, context: RouteContext) {
  if (
    UNSAFE_METHODS.has(request.method) &&
    request.headers.get("origin") !== request.nextUrl.origin
  ) {
    return NextResponse.json(
      { errorReasons: ["Invalid request origin."] },
      { status: 403 },
    );
  }

  try {
    const path = (await context.params).path.join("/");
    const contentType = request.headers.get("content-type");
    const body = UNSAFE_METHODS.has(request.method)
      ? contentType?.includes("application/json")
        ? await request.json()
        : await request.text()
      : undefined;
    const serverAxios = await createServerAxios();
    const response = await serverAxios.request({
      url: path,
      method: request.method,
      data: body,
      headers: contentType ? { "Content-Type": contentType } : undefined,
      signal: request.signal,
      validateStatus: () => true,
    });

    if (response.status === 204) {
      return new NextResponse(null, { status: response.status });
    }

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    const apiError = normalizeApiError(error);

    return NextResponse.json(
      {
        errorReasons: apiError.reasons.length
          ? apiError.reasons
          : [apiError.message],
      },
      { status: apiError.status ?? 502 },
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
