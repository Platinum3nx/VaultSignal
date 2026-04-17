import { spawnSync } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const AGENT_DIR = join(__dirname, "..", "..", "agent");

export async function runAgent(config) {
  const env = {
    ...process.env,
    NIA_API_KEY: config.nia_api_key,
    NIA_VAULT_ID: config.vault_id,
    ANTHROPIC_API_KEY: config.anthropic_api_key,
  };

  // Add Supabase vars if available (for DB writes)
  if (config.supabase_url) env.NEXT_PUBLIC_SUPABASE_URL = config.supabase_url;
  if (config.supabase_service_key)
    env.SUPABASE_SERVICE_ROLE_KEY = config.supabase_service_key;

  const result = spawnSync("python", ["main.py"], {
    cwd: AGENT_DIR,
    env,
    encoding: "utf-8",
    timeout: 300_000, // 5 min max
  });

  if (result.status !== 0) {
    const err = (result.stderr || result.stdout || "Unknown error").trim();
    throw new Error(`Agent failed: ${err}`);
  }

  const stdout = result.stdout || "";
  const observations = [];
  let vaultPageCount = 0;

  for (const line of stdout.split("\n")) {
    // Parse observation lines: [1] ..., [2] ..., etc.
    const match = line.match(/^\[(\d+)\]\s+(.+)$/);
    if (match) {
      observations.push(match[2]);
    }
    // Parse vault page count: "Read N pages from Vault"
    const pageMatch = line.match(/Read (\d+) pages from Vault/);
    if (pageMatch) {
      vaultPageCount = parseInt(pageMatch[1], 10);
    }
  }

  if (observations.length === 0) {
    throw new Error(
      `Agent produced no observations. Output:\n${stdout.slice(0, 500)}`
    );
  }

  return { observations, vaultPageCount };
}
