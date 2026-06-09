import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  try {
    const response = await fetch(`${request.nextUrl.origin}/api/auth/get-session`, {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    });
    
    let session = null;
    if (response.ok) {
      session = await response.json();
    }

    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  } catch (error) {
    console.error("Middleware session check failed:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
