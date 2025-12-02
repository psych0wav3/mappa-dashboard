// src/app/api/auth/[...better-auth]/route.ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// expõe GET e POST pro Next App Router
export const { GET, POST } = toNextJsHandler(auth.handler);
