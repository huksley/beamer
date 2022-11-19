// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// https://nextjs.org/docs/advanced-features/middleware
export const middleware = async (request: NextRequest) => {
  console.info("Request", request.url);
};
