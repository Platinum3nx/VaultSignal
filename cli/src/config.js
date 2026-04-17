import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { homedir } from "os";
import { join } from "path";

const CONFIG_DIR = join(homedir(), ".config", "signal");
const CONFIG_PATH = join(CONFIG_DIR, "config.json");

export function configExists() {
  return existsSync(CONFIG_PATH);
}

export function readConfig() {
  try {
    const raw = readFileSync(CONFIG_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function writeConfig(data) {
  mkdirSync(CONFIG_DIR, { recursive: true });
  const existing = readConfig() || {};
  const merged = { ...existing, ...data };
  writeFileSync(CONFIG_PATH, JSON.stringify(merged, null, 2) + "\n");
  return merged;
}
