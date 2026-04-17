import os
import subprocess


def _run_nia(args: list[str], timeout: int = 60) -> str:
    """Run a nia CLI command and return stdout."""
    api_key = os.environ.get("NIA_API_KEY")
    cmd = ["nia"] + args
    if api_key:
        cmd += ["--api-key", api_key]
    result = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        timeout=timeout,
    )
    if result.returncode != 0:
        raise RuntimeError(f"nia {' '.join(args)} failed: {result.stderr}")
    return result.stdout


def _vault_search(vault_id: str, query: str, top_k: int = 30) -> list[dict]:
    """Search the vault and return parsed results."""
    output = _run_nia(
        ["vault", "search", vault_id, query,
         "--top-k", str(top_k), "--no-color"],
        timeout=45,
    )

    results = []
    current_path = None
    current_content = None

    for line in output.split("\n"):
        stripped = line.strip()
        if stripped.startswith("file_path:"):
            # Save previous result
            if current_path and current_content:
                results.append({"path": current_path, "content": current_content})
            current_path = stripped.split("file_path:", 1)[1].strip()
            current_content = None
        elif stripped.startswith("content:"):
            current_content = stripped.split("content:", 1)[1].strip()
        elif stripped.startswith(("line_number:", "score:", "vault_id:", "query:", "matches:", "[")):
            continue

    # Capture last entry
    if current_path and current_content:
        results.append({"path": current_path, "content": current_content})

    return results


def read_vault() -> tuple[str, int]:
    """Reads vault content via Nia CLI and returns concatenated content and page count."""
    vault_id = os.environ["NIA_VAULT_ID"]

    # Step 1: Get vault metadata
    print("  Fetching vault metadata...")
    meta_output = _run_nia(["vault", "get", vault_id, "--no-color"], timeout=60)
    page_count = 0
    for line in meta_output.split("\n"):
        if "total_pages" in line.lower() or "page" in line.lower():
            # Try to extract page count from metadata
            pass

    # Step 2: Search with diverse queries to gather comprehensive content
    search_queries = [
        "all projects repositories overview",
        "architecture technical decisions design patterns",
        "abandoned unfinished incomplete projects",
        "authentication API backend infrastructure setup",
        "frontend UI React Next.js components design",
        "testing verification deployment CI CD",
        "tools frameworks libraries stack choices",
        "goals focus shift changed direction pivot",
        "medical billing healthcare analysis",
        "poker game theory AI agent",
        "formal verification proof Lean Dafny",
        "mobile app Expo React Native",
    ]

    all_snippets = []
    seen = set()

    for query in search_queries:
        print(f"  Searching: {query}")
        try:
            results = _vault_search(vault_id, query, top_k=30)
            for r in results:
                key = (r["path"], r["content"][:80])
                if key not in seen:
                    seen.add(key)
                    all_snippets.append(r)
        except Exception as e:
            print(f"  Warning: search failed for '{query}': {e}")

    page_count = len(set(r["path"] for r in all_snippets))
    print(f"  Gathered {len(all_snippets)} snippets from {page_count} unique pages")

    # Step 3: Build the vault content string
    # Group snippets by page for better context
    pages = {}
    for s in all_snippets:
        path = s["path"]
        if path not in pages:
            pages[path] = []
        pages[path].append(s["content"])

    sections = []
    for path, contents in sorted(pages.items()):
        sections.append(f"=== {path} ===\n" + "\n".join(contents))

    vault_content = "\n\n".join(sections)

    # Also include the raw metadata for context
    vault_content = f"""# VAULT METADATA
{meta_output}

# VAULT CONTENT ({page_count} pages, {len(all_snippets)} content snippets)

{vault_content}
"""

    return vault_content, page_count
