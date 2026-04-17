# Signal

Signal reads your Nia Vault and tells you things about your building patterns you probably haven't noticed.

## Quick start

```bash
npx signal-agent@latest
```

That's it. Signal will run every night and email you 5 observations.

## What it does

- Reads your indexed GitHub repos via Nia Vault
- Finds patterns, contradictions, and open loops across your projects
- Emails you a digest every morning at 2am

## Requirements

- A Nia account with a Vault set up ([trynia.ai](https://trynia.ai))
- An Anthropic API key
- A Resend API key (free at [resend.com](https://resend.com))

## Web dashboard

The dashboard is also available at [dashboard-three-henna-13.vercel.app](https://dashboard-three-henna-13.vercel.app) if you want to browse observations in a browser.

## How it works

Nia Vault (pre-indexed GitHub repos) → Python agent searches vault via CLI → Claude analyzes patterns → email digest via Resend.

![Signal digest](screenshot.png)

## Manual setup

If you want to run the agent and dashboard locally instead of using the CLI:

```bash
git clone <repo-url> && cd signal

cp .env.example .env
# Fill in: NIA_API_KEY, ANTHROPIC_API_KEY, RESEND_API_KEY,
#          NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
#          SUPABASE_SERVICE_ROLE_KEY

# Run the agent
cd agent && pip install -r requirements.txt && python main.py

# Run the dashboard
cd ../dashboard && npm install && npm run dev
```
