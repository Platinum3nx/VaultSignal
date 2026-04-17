# Signal

Signal watches your GitHub history and tells you things about yourself you didn't notice.

## What it does

- Reads your indexed GitHub repos via a Nia Vault, which contains AI-generated wiki pages about your code
- Runs a nightly agent that sends your vault content to Claude and asks it to find patterns, contradictions, and blind spots
- Displays 5 observations each morning in a minimal dark digest UI

![Signal digest](screenshot.png)

## Setup

```bash
git clone <repo-url> && cd signal

# Add env vars
cp .env.example .env
# Fill in: NIA_API_KEY, ANTHROPIC_API_KEY, NEXT_PUBLIC_SUPABASE_URL,
#          NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

# Run the agent
cd agent
pip install -r requirements.txt
python main.py

# Run the dashboard
cd ../dashboard
npm install
npm run dev
# Open http://localhost:3000
```

## How it works

Nia Vault (pre-indexed GitHub repos) → Python agent searches vault via CLI → Claude analyzes patterns and generates observations → Supabase stores results → Next.js dashboard reads and displays them.

The agent runs nightly via Railway cron. The dashboard is deployed on Vercel.
