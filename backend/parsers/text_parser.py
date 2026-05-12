import re
LOG_PATTERN = re.compile(
    r"\[?(\d{4}-\d{2}-\d{2}[\sT]\d{2}:\d{2})\]?\s+"
    r"(INFO|WARN|ERROR|DEBUG)\s+"
    r"([\w\-]+):\s+(.+)"
)
def parse_text_logs(filepath: str) -> list:
    """Parse a plain text or .log file"""
    parsed_logs = []
    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        for line in f:
            match = LOG_PATTERN.search(line.strip())
            if match:
                ts, level, service, message = match.groups()
                parsed_logs.append({
                    "ts": ts,
                    "level": level,
                    "service": service,
                    "message": message.strip(),
                    "source": "text-file"
                })
    return parsed_logs