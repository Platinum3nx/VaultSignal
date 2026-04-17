import { Resend } from "resend";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_PATH = join(__dirname, "..", "templates", "email.html");

export async function sendDigest({ to, observations, date, vault_page_count }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY environment variable is not set");
  }

  const resend = new Resend(apiKey);

  let html = readFileSync(TEMPLATE_PATH, "utf-8");
  html = html.replace("{{DATE}}", date);
  html = html.replace("{{VAULT_PAGES}}", String(vault_page_count));
  for (let i = 0; i < 5; i++) {
    html = html.replace(`{{OBS_${i + 1}}}`, observations[i] || "—");
  }

  const { data, error } = await resend.emails.send({
    from: "Signal <onboarding@resend.dev>",
    to: [to],
    subject: `Signal — ${date}`,
    html,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }

  console.log(`Email sent to ${to}`);
  return { success: true, message_id: data.id };
}
