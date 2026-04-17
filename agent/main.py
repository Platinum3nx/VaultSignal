import sys
import os

# Load env vars from .env at repo root
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

from vault_reader import read_vault
from observation_generator import generate_observations
from db_writer import save_observations


def main():
    try:
        # Step 1: Read vault
        print("Reading Vault...")
        vault_content, page_count = read_vault()
        print(f"Read {page_count} pages from Vault")

        # Step 2: Generate observations
        print("Generating observations...")
        observations = generate_observations(vault_content)

        for i, obs in enumerate(observations, 1):
            print(f"[{i}] {obs}")

        # Step 3: Save to database
        print("Saving to database...")
        run_id = save_observations(observations, page_count)

        print(f"Run {run_id} complete. {len(observations)} observations saved.")

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
