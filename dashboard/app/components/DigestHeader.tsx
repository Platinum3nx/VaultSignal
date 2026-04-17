interface DigestHeaderProps {
  date: string;
  observationCount: number;
  vaultPageCount: number;
}

export default function DigestHeader({
  date,
  observationCount,
  vaultPageCount,
}: DigestHeaderProps) {
  const formatted = new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="mb-12">
      <h1 className="text-3xl font-light tracking-tight text-zinc-100">
        {formatted}
      </h1>
      <p className="mt-2 text-sm text-zinc-500">
        {observationCount} observations from {vaultPageCount} vault pages
      </p>
    </header>
  );
}
