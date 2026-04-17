#!/usr/bin/env node

import * as p from "@clack/prompts";
import { readConfig, writeConfig, configExists } from "../src/config.js";
import { runAgent } from "../src/runner.js";
import { sendDigest } from "../src/mailer.js";
import { installCron } from "../src/scheduler.js";
import { config as loadEnv } from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: join(__dirname, "..", "..", ".env") });

const isRunMode = process.argv.includes("--run");
const isHelpMode = process.argv.includes("--help") || process.argv.includes("-h");

async function runMode() {
  const config = readConfig();
  if (!config) {
    console.error("No config found. Run `signal-agent` first to set up.");
    process.exit(1);
  }

  process.env.RESEND_API_KEY =
    config.resend_api_key || process.env.RESEND_API_KEY;

  console.log(`[${new Date().toISOString()}] Signal run starting...`);

  const { observations, vaultPageCount } = await runAgent(config);
  console.log(`Generated ${observations.length} observations from ${vaultPageCount} vault pages`);

  const date = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  await sendDigest({
    to: config.email,
    observations,
    date,
    vault_page_count: vaultPageCount,
  });

  writeConfig({ last_run: new Date().toISOString() });
  console.log(`[${new Date().toISOString()}] Signal run complete.`);
}

async function setupMode() {
  p.intro("Signal");

  p.note(
    "Signal reads your Nia Vault and tells you things about\nyour building patterns you probably haven't noticed."
  );

  const values = await p.group(
    {
      nia_api_key: () =>
        p.text({
          message: "Nia API Key",
          placeholder: "nk_...",
          validate: (v) => {
            if (!v) return "Required";
            if (!v.startsWith("nk_")) return "Should start with nk_";
          },
        }),
      vault_id: () =>
        p.text({
          message: "Vault ID",
          placeholder: "37cda719-8b64-4b4d-97df-aa704fcbbcef",
          validate: (v) => {
            if (!v) return "Required";
            if (
              !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
                v
              )
            )
              return "Should be a UUID";
          },
        }),
      anthropic_api_key: () =>
        p.text({
          message: "Anthropic API Key",
          placeholder: "sk-ant-...",
          validate: (v) => {
            if (!v) return "Required";
          },
        }),
      resend_api_key: () =>
        p.text({
          message: "Resend API Key (free at resend.com)",
          placeholder: "re_...",
          validate: (v) => {
            if (!v) return "Required";
          },
        }),
      email: () =>
        p.text({
          message: "Your email address",
          placeholder: "you@example.com",
          validate: (v) => {
            if (!v) return "Required";
            if (!v.includes("@")) return "Should be an email address";
          },
        }),
    },
    {
      onCancel: () => {
        p.cancel("Setup cancelled.");
        process.exit(0);
      },
    }
  );

  // Save config
  writeConfig({
    ...values,
    created_at: new Date().toISOString(),
    last_run: null,
  });
  p.log.success("Config saved to ~/.config/signal/config.json");

  // Set Resend key for this session
  process.env.RESEND_API_KEY = values.resend_api_key;

  // Run agent
  const s = p.spinner();
  s.start("Running agent — this takes about 60 seconds...");

  let observations, vaultPageCount;
  try {
    const result = await runAgent(values);
    observations = result.observations;
    vaultPageCount = result.vaultPageCount;
    s.stop(`Generated ${observations.length} observations from ${vaultPageCount} vault pages`);
  } catch (err) {
    s.stop("Agent failed");
    p.log.error(err.message);
    process.exit(1);
  }

  // Send email
  const date = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  s.start("Sending email digest...");
  try {
    await sendDigest({
      to: values.email,
      observations,
      date,
      vault_page_count: vaultPageCount,
    });
    s.stop(`Email sent to ${values.email}`);
  } catch (err) {
    s.stop("Email failed");
    p.log.error(err.message);
    process.exit(1);
  }

  // Install cron
  try {
    installCron();
  } catch (err) {
    p.log.warning(`Could not install cron job: ${err.message}`);
    p.log.info(
      "You can run `node cli/bin/signal.js --run` manually or set up your own scheduler."
    );
  }

  writeConfig({ last_run: new Date().toISOString() });

  p.outro("Done. Check your inbox.");
}

if (isHelpMode) {
  console.log(`signal-agent — Daily behavioral observations from your Nia Vault

Usage:
  npx signal-agent          Run the setup wizard (first time)
  npx signal-agent --run    Run the agent, email digest, skip prompts
  npx signal-agent --help   Show this help message

Config is stored at ~/.config/signal/config.json
Logs are written to ~/.config/signal/signal.log`);
} else if (isRunMode) {
  runMode().catch((err) => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  });
} else {
  setupMode().catch((err) => {
    p.log.error(err.message);
    process.exit(1);
  });
}
