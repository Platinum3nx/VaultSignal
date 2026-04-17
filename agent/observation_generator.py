import json
import os
import re
import anthropic


def _extract_json(text: str) -> str:
    """Strip markdown code fences if present and return raw JSON."""
    # Remove ```json ... ``` wrapping
    match = re.search(r"```(?:json)?\s*\n?(.*?)\n?\s*```", text, re.DOTALL)
    if match:
        return match.group(1).strip()
    return text.strip()


SYSTEM_PROMPT = """You are a behavioral analyst studying a developer's building history.
You have access to a knowledge base derived from their GitHub repositories.
Your job is to find patterns, contradictions, and insights the developer
probably hasn't noticed about themselves.

You are looking for:
- Repeated patterns across projects (technical choices, architectural decisions,
  what they build vs what they abandon)
- Contradictions between stated goals and actual behavior
- Open loops (things started but never finished, problems encountered repeatedly)
- Inflection points (where their skills or focus shifted noticeably)
- Blind spots (areas they avoid, problems they repeatedly encounter)

Rules:
- Be specific. Reference actual repo names, file patterns, or code patterns you see.
- Be honest. Don't flatter. If there's a pattern of abandonment, say so.
- Be concise. Each observation is 2-3 sentences maximum.
- Do not be generic. "You like to build" is not an observation.
- Return ONLY a JSON array of observation strings. No preamble, no markdown, no explanation.
- Generate exactly 5 observations per run.

Example of a good observation:
"You've built 4 separate authentication systems across different projects but never
reused any of them. Each time you start a new project you rebuild auth from scratch,
suggesting either a distrust of your own previous implementations or a tendency to
treat each project as completely isolated."

Example of a bad observation:
"You are a passionate developer who loves building things."
"""


def generate_observations(vault_content: str) -> list[str]:
    """Sends vault content to Claude and returns a list of 5 observations."""
    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

    user_prompt = f"""Here is the complete knowledge base derived from my GitHub repositories:

{vault_content}

Generate 5 observations about my building patterns. Return only a JSON array of strings."""

    message = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=2000,
        temperature=0,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_prompt}],
    )

    response_text = _extract_json(message.content[0].text)

    try:
        observations = json.loads(response_text)
    except json.JSONDecodeError:
        # Retry once with explicit JSON instruction
        retry_message = client.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=2000,
            temperature=0,
            system=SYSTEM_PROMPT,
            messages=[
                {"role": "user", "content": user_prompt},
                {"role": "assistant", "content": response_text},
                {
                    "role": "user",
                    "content": "That was not valid JSON. Please return ONLY a JSON array of 5 strings, nothing else.",
                },
            ],
        )
        observations = json.loads(_extract_json(retry_message.content[0].text))

    return observations
