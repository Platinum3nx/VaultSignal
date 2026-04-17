import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("observations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return Response.json({ today: null, history: [] });
  }

  // Group by run_id
  const runs: Record<
    string,
    { run_id: string; created_at: string; observations: string[]; vault_page_count: number }
  > = {};

  for (const row of data) {
    if (!runs[row.run_id]) {
      runs[row.run_id] = {
        run_id: row.run_id,
        created_at: row.created_at,
        observations: [],
        vault_page_count: row.vault_page_count,
      };
    }
    runs[row.run_id].observations.push(row.content);
  }

  const sortedRuns = Object.values(runs).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const [latest, ...rest] = sortedRuns;

  return Response.json({
    today: {
      run_id: latest.run_id,
      created_at: latest.created_at,
      observations: latest.observations,
      vault_page_count: latest.vault_page_count,
    },
    history: rest.map((r) => ({
      run_id: r.run_id,
      created_at: r.created_at,
      observation_count: r.observations.length,
    })),
  });
}
