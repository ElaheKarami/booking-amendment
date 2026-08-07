import { cookies } from "next/headers";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const token = (await cookies()).get("accessToken")?.value;

  const path = (await params).path.join("/");

  const response = await fetch(`${process.env.BACKEND_URL}/${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response;
}
