import { execSync } from "child_process";
import { writeFileSync, unlinkSync } from "fs";
import { tmpdir } from "os";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..", "..");
const SIGNAL_COMMENT = "# signal-agent";

function getCurrentCrontab() {
  try {
    return execSync("crontab -l 2>/dev/null", { encoding: "utf-8" });
  } catch {
    return "";
  }
}

function writeCrontab(content) {
  const tmpFile = join(tmpdir(), `signal-crontab-${Date.now()}`);
  writeFileSync(tmpFile, content);
  try {
    execSync(`crontab ${tmpFile}`, { encoding: "utf-8" });
  } finally {
    try { unlinkSync(tmpFile); } catch {}
  }
}

export function cronInstalled() {
  return getCurrentCrontab().includes(SIGNAL_COMMENT);
}

export function installCron() {
  if (cronInstalled()) {
    console.log("Cron job already installed");
    return;
  }

  const existing = getCurrentCrontab().trimEnd();
  const nodePath = process.execPath;
  const entry = `0 2 * * * cd ${REPO_ROOT} && ${nodePath} cli/bin/signal.js --run >> ~/.config/signal/signal.log 2>&1 ${SIGNAL_COMMENT}`;

  const newCrontab = existing ? `${existing}\n${entry}\n` : `${entry}\n`;
  writeCrontab(newCrontab);

  console.log("Cron job installed — Signal will run every night at 2am");
}

export function removeCron() {
  const existing = getCurrentCrontab();
  if (!existing.includes(SIGNAL_COMMENT)) {
    console.log("No Signal cron job found");
    return;
  }

  const filtered = existing
    .split("\n")
    .filter((line) => !line.includes(SIGNAL_COMMENT))
    .join("\n");

  writeCrontab(filtered);
  console.log("Cron job removed");
}
