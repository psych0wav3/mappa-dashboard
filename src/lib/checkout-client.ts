export async function startCheckout(plan: string, email: string) {
  const res = await fetch("/api/billing/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan, email }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error);

  window.location.href = data.url;
}
