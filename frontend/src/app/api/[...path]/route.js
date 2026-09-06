import { NextResponse } from "next/server";

const API_URL = process.env.API_URL || "http://localhost:5000";

async function proxyRequest(request, context) {
  const { path } = await context.params;
  const apiPath = path.join("/");
  const url = `${API_URL}/api/${apiPath}${request.nextUrl.search}`;

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  const cookie = request.headers.get("cookie");
  if (contentType) {
    headers.set("Content-Type", contentType);
  }
  if (cookie) {
    headers.set("Cookie", cookie);
  }

  const fetchOptions = {
    method: request.method,
    headers,
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    fetchOptions.body = await request.text();
  }

  const backendRes = await fetch(url, fetchOptions);
  const responseContentType =
    backendRes.headers.get("content-type") || "application/json";
  const body = await backendRes.text();

  const responseHeaders = new Headers({ "Content-Type": responseContentType });
  const cookies = backendRes.headers.getSetCookie?.() || [];
  for (const setCookie of cookies) {
    responseHeaders.append("Set-Cookie", setCookie);
  }

  const response = new NextResponse(body, {
    status: backendRes.status,
    headers: responseHeaders,
  });

  return response;
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
