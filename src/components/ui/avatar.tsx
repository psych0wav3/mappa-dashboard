export function Avatar({ name }: { name?: string }) {
  const initials = (name ?? "U")
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="grid h-8 w-8 place-items-center rounded-full bg-neutral-200 text-xs font-semibold">
      {initials}
    </div>
  );
}
