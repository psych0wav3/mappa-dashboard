import { NextResponse } from "next/server";
// TODO: substituir por query no seu DB (Client)
const MOCK = [
  { id: "c1", name: "Ana Silva", address: "Rua Dois, 3", lat: -23.55, lng: -46.63 },
  { id: "c2", name: "Cliente Sete", address: "Av. ABC, 1234", lat: -23.57, lng: -46.65 },
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").toLowerCase();
  const items = MOCK.filter(
    (c) => c.name.toLowerCase().includes(q) || c.address.toLowerCase().includes(q)
  );
  return NextResponse.json({ items });
}
