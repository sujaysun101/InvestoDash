import { NextResponse } from "next/server";

import {
  DEMO_COOKIE_NAME,
  DEMO_COOKIE_VALUE,
  isInternalDemoEnabled,
} from "@/lib/demo-auth";

export async function POST() {
  if (!isInternalDemoEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const response = NextResponse.json({
    redirectTo: "/pipeline",
  });

  response.cookies.set({
    name: DEMO_COOKIE_NAME,
    value: DEMO_COOKIE_VALUE,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
