interface HistoryRun {
  run_id: string;
  created_at: string;
  observation_count: number;
}

interface HistoryListProps {
  history: HistoryRun[];
}

export default function HistoryList({ history }: HistoryListProps) {
  if (history.length === 0) return null;

  return (
    <section className="mt-16 border-t border-zinc-800 pt-8">
      <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-widest mb-4">
        Previous runs
      </h2>
      <ul className="space-y-2">
        {history.map((run) => (
          <li
            key={run.run_id}
            className="flex justify-between text-sm text-zinc-500 py-2 border-b border-zinc-900"
          >
            <span>
              {new Date(run.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span>{run.observation_count} observations</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
