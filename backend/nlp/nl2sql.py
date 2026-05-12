import anthropic, os, json
from dotenv import load_dotenv

load_dotenv()
client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
SCHEMA_CONTEXT = """
Table: logs
Columns: id (INT), ts(TIMESTAMP), level (VARCHAR), service (VARCHAR), message (VARCHAR), trace_id (VARCHAR), source (VARCHAR)
"""
def natural_language_to_sql(user_query: str) -> dict:
    prompt = f"""
You are a SQL expert. Given this schema:
{SCHEMA_CONTEXT}
Convert this question to a valid PostgreSQL query:
"{user_query}"
Return ONLY JSON with keys "sql" and "explanation".
"""
    response = client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=500,
        messages=[{"role": "user", "content": prompt}]
    )
    text = response.content[0].text.strip()
    text = text.replace("```json", "").replace("```", "").strip()
    return json.loads(text)