import { betterAuthHandler } from "better-auth";
import { auth } from "@/lib/better-auth-server";

export const { GET, POST } = betterAuthHandler(auth);
