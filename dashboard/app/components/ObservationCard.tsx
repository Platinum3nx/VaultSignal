interface ObservationCardProps {
  observation: string;
  index: number;
}

export default function ObservationCard({
  observation,
  index,
}: ObservationCardProps) {
  return (
    <div className="group border border-zinc-800 rounded-lg p-6 transition-colors hover:border-zinc-600">
      <span className="block text-4xl font-light text-zinc-700 mb-3 font-mono">
        {String(index + 1).padStart(2, "0")}
      </span>
      <p className="text-zinc-300 leading-relaxed text-[15px]">{observation}</p>
    </div>
  );
}
