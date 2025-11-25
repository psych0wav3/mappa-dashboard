// src/middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// No momento não precisamos interceptar nada.
// O controle de acesso está sendo feito no layout (private) com Supabase.
export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

// Sem matcher => middleware não roda para nenhuma rota.
// Você também poderia simplesmente apagar este arquivo.
export const config = {
  matcher: [] as string[],
};
