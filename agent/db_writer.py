import os
from datetime import datetime, timezone
from supabase import create_client


def save_observations(observations: list[str], page_count: int) -> str:
    """Saves observations to Supabase and returns the run_id."""
    url = os.environ["NEXT_PUBLIC_SUPABASE_URL"]
    key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
    client = create_client(url, key)

    run_id = f"run_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}"

    for i, obs in enumerate(observations):
        row = {
            "content": obs,
            "run_id": run_id,
            "vault_page_count": page_count,
            "model_used": "claude-sonnet-4-5",
        }
        client.table("observations").insert(row).execute()
        print(f"  Saved observation {i + 1}/{len(observations)}")

    return run_id
