import { betterAuth } from "better-auth";

export const auth = betterAuth({
  providers: {
    emailPassword: true, // 👈 habilita login/cadastro com email + senha
  },
} as any);
